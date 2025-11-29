/**
 * CareFlow Nexus - Agent API Client
 *
 * Purpose
 * - Frontend-only TypeScript client for calling your backend Agent endpoints
 *   (deployed on Hugging Face Spaces or any Docker host).
 * - Encapsulates URLs, auth header injection, timeouts, and error handling.
 *
 * Configuration
 * - Agent URLs are configured in @/lib/agents/config.ts
 * - No environment variables needed - URLs are hardcoded
 *
 * Usage
 *   import { agentClient } from "@/lib/agents/client";
 *   await agentClient.emergency.trigger({ type: "Trauma", patientName: "Jane", callerPhone: "999" });
 *
 * Notes
 * - This client assumes standard JSON endpoints and supports Server-Sent Events (SSE) for streams.
 * - It returns typed payloads when possible and throws on non-OK responses.
 */

import {
  ApiError,
  ApiSuccess,
  AssignmentRecommendation,
  BedAllocationRequest,
  BedAllocationResponse,
  CleaningScheduleRequest,
  CleaningTask,
  CopilotCommandRequest,
  CopilotCommandResponse,
  DispenseResponse,
  EmergencyEvent,
  LabOrderRequest,
  LabOrderResponse,
  NurseAssignmentRequest,
  NurseAssignmentResponse,
  DoctorAssignmentRequest,
  DoctorAssignmentResponse,
  PatientRecord,
  PatientRegistrationRequest,
  PrescriptionRequest,
  RadiologyOrderRequest,
  RadiologyOrderResponse,
  WorkflowRun,
  AgentEndpointConfig,
  AgentTask,
  StreamChunk,
  isApiError,
} from "./types";
import { AGENT_URLS } from "./config";

/* =============================================================================
 * Environment & Defaults
 * ========================================================================== */

// Agent URLs are now configured in config.ts
// Using Pharmacy Agent as the default base URL
const AGENTS_BASE_URL: string = AGENT_URLS.PHARMACY;

const DEFAULT_TIMEOUT_MS = 25_000;

const DEFAULT_PATHS: Required<NonNullable<AgentEndpointConfig["paths"]>> = {
  admissionRegister: "/admission/register",
  bedAllocate: "/beds/allocate",
  nurseAssign: "/nurse/assign",
  doctorAssign: "/doctor/assign",
  pharmacyPrescribe: "/api/pharmacy/prescriptions",
  cleaningSchedule: "/cleaning/schedule",
  emergencyTrigger: "/emergency/trigger",
  radiologyOrder: "/radiology/order",
  labOrder: "/lab/order",
  surgicalBook: "/surgical/book",
  copilotCommand: "/copilot/command",
  taskStatus: "/tasks", // GET /tasks/:id
  workflowStatus: "/workflows", // GET /workflows/:id
  stream: "/stream", // GET /stream?sse=1
};

/* =============================================================================
 * Small HTTP helper (fetch-based) with auth + timeout
 * ========================================================================== */

type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

interface HttpOptions {
  baseUrl: string;
  path: string;
  method?: HttpMethod;
  body?: unknown;
  query?: Record<string, unknown>;
  timeoutMs?: number;
  signal?: AbortSignal;
  headers?: Record<string, string>;
  // If backend wraps responses with { ok, data }, unwrap automatically
  unwrapApiEnvelope?: boolean;
}

const getAuthToken = (): string | null => {
  try {
    return localStorage.getItem("token");
  } catch {
    return null;
  }
};

const buildUrl = (
  baseUrl: string,
  path: string,
  query?: Record<string, unknown>,
): string => {
  const url = new URL(path, baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`);
  if (query) {
    Object.entries(query)
      .filter(([, v]) => v !== undefined && v !== null)
      .forEach(([k, v]) => {
        url.searchParams.set(k, String(v));
      });
  }
  return url.toString();
};

async function http<T = unknown>(opts: HttpOptions): Promise<T> {
  const {
    baseUrl,
    path,
    method = "GET",
    body,
    query,
    timeoutMs = DEFAULT_TIMEOUT_MS,
    signal,
    headers,
    unwrapApiEnvelope = true,
  } = opts;

  if (!baseUrl) {
    throw new Error(
      "Agent API base URL is not configured. Set VITE_AGENTS_BASE_URL in your environment.",
    );
  }

  const url = buildUrl(
    baseUrl,
    path.startsWith("/") ? path : `/${path}`,
    query,
  );
  const controller = new AbortController();
  const to = setTimeout(() => controller.abort(), timeoutMs);
  const token = getAuthToken();

  const res = await fetch(url, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(headers || {}),
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
    signal: mergeSignals(signal, controller.signal),
    credentials: "include",
  }).catch((err) => {
    clearTimeout(to);
    throw err;
  });

  clearTimeout(to);

  const contentType = res.headers.get("content-type") || "";
  const isJson = contentType.includes("application/json");

  if (!res.ok) {
    // Try to parse JSON errors from backend
    if (isJson) {
      const json = await res.json().catch(() => undefined);

      // Log detailed error for debugging (especially 422 validation errors)
      if (res.status === 422) {
        console.error(
          "🚨 422 Validation Error:",
          JSON.stringify(json, null, 2),
        );
        console.error("Request URL:", url);
        console.error("Request method:", method);
      }

      if (json && typeof json === "object" && "ok" in json) {
        const maybeErr = json as ApiError | ApiSuccess<unknown>;
        if (!maybeErr.ok) {
          throw new Error(
            maybeErr.error?.message ||
              `Agent request failed with ${res.status}`,
          );
        }
      }

      // FastAPI validation errors have a 'detail' field
      const message =
        (json as any)?.detail ||
        (json as any)?.error?.message ||
        (json as any)?.message ||
        `Agent request failed with ${res.status}`;
      throw new Error(
        typeof message === "string" ? message : JSON.stringify(message),
      );
    }
    const text = await res.text().catch(() => "");
    throw new Error(text || `Agent request failed with ${res.status}`);
  }

  if (!isJson) {
    // For endpoints that return non-JSON (should be rare here)
    // Return as unknown; caller can handle
    return (await res.text()) as unknown as T;
  }

  const parsed = (await res.json()) as ApiSuccess<T> | ApiError | T;

  if (unwrapApiEnvelope && isApiEnvelope(parsed)) {
    if (!parsed.ok) {
      throw new Error(parsed.error?.message || "Agent request failed");
    }
    return parsed.data as T;
  }

  return parsed as T;
}

function isApiEnvelope<T = unknown>(x: unknown): x is ApiSuccess<T> | ApiError {
  return typeof x === "object" && x !== null && "ok" in x;
}

function mergeSignals(
  a?: AbortSignal,
  b?: AbortSignal,
): AbortSignal | undefined {
  if (!a) return b;
  if (!b) return a;
  const controller = new AbortController();
  const onAbort = () => controller.abort();
  a.addEventListener("abort", onAbort);
  b.addEventListener("abort", onAbort);
  // When controller aborts, remove listeners to avoid leaks
  controller.signal.addEventListener("abort", () => {
    a.removeEventListener("abort", onAbort);
    b.removeEventListener("abort", onAbort);
  });
  return controller.signal;
}

/* =============================================================================
 * Client Factory
 * ========================================================================== */

export interface CreateAgentClientOptions {
  baseUrl?: string;
  paths?: Partial<typeof DEFAULT_PATHS>;
  timeoutMs?: number;
}

export function createAgentClient(opts?: CreateAgentClientOptions) {
  const baseUrl = (opts?.baseUrl ?? AGENTS_BASE_URL ?? "").trim();
  const paths = { ...DEFAULT_PATHS, ...(opts?.paths || {}) };
  const timeoutMs = opts?.timeoutMs ?? DEFAULT_TIMEOUT_MS;

  if (!baseUrl) {
    // Helpful error early; callers can also override baseUrl per-call
    // We'll still construct the client, but requests will fail until configured.
    // eslint-disable-next-line no-console
    console.warn(
      "[AgentClient] Missing baseUrl. Set VITE_AGENTS_BASE_URL or pass { baseUrl } when creating the client.",
    );
  }

  return {
    // Low-level helpers
    config: { baseUrl, paths, timeoutMs },

    // Admissions
    admission: {
      register: (payload: PatientRegistrationRequest, signal?: AbortSignal) =>
        http<PatientRecord>({
          baseUrl,
          path: paths.admissionRegister,
          method: "POST",
          body: payload,
          timeoutMs,
          signal,
        }),
    },

    // Emergency
    emergency: {
      trigger: (
        payload: {
          type: string;
          patientName: string;
          callerPhone: string;
          notes?: string;
          priority?: string;
          patientId?: string;
          autoOrchestrate?: boolean;
        },
        signal?: AbortSignal,
      ) =>
        http<EmergencyEvent>({
          baseUrl,
          path: paths.emergencyTrigger,
          method: "POST",
          body: payload,
          timeoutMs,
          signal,
        }),
    },

    // Bed management
    beds: {
      allocate: (payload: BedAllocationRequest, signal?: AbortSignal) =>
        http<BedAllocationResponse>({
          baseUrl,
          path: paths.bedAllocate,
          method: "POST",
          body: payload,
          timeoutMs,
          signal,
        }),
    },

    // Nurse & Doctor assignment
    staff: {
      assignNurse: (payload: NurseAssignmentRequest, signal?: AbortSignal) =>
        http<NurseAssignmentResponse>({
          baseUrl,
          path: paths.nurseAssign,
          method: "POST",
          body: payload,
          timeoutMs,
          signal,
        }),
      assignDoctor: (payload: DoctorAssignmentRequest, signal?: AbortSignal) =>
        http<DoctorAssignmentResponse>({
          baseUrl,
          path: paths.doctorAssign,
          method: "POST",
          body: payload,
          timeoutMs,
          signal,
        }),
    },

    // Pharmacy
    pharmacy: {
      prescribeAndDispense: async (
        payload: PrescriptionRequest,
        signal?: AbortSignal,
      ) => {
        // Transform frontend format to backend format
        const backendPayload = {
          patient_id: payload.patientId || "UNKNOWN",
          patient_name: payload.patientName || "Patient",
          doctor_id: "D001",
          medications: payload.items.map((item) => ({
            name: item.medication.name,
            dosage: item.dosage,
            frequency: item.frequency,
            duration: item.duration || "as needed",
            quantity: 1,
          })),
          priority: payload.priority || "medium",
          notes: payload.allergies?.length
            ? `Allergies: ${payload.allergies.join(", ")}`
            : null,
        };

        // Debug logging
        console.log(
          "🔍 Sending to Pharmacy Agent:",
          JSON.stringify(backendPayload, null, 2),
        );

        return http<DispenseResponse>({
          baseUrl,
          path: paths.pharmacyPrescribe,
          method: "POST",
          body: backendPayload,
          timeoutMs,
          signal,
        });
      },
    },

    // Cleaning
    cleaning: {
      schedule: (payload: CleaningScheduleRequest, signal?: AbortSignal) =>
        http<CleaningTask>({
          baseUrl,
          path: paths.cleaningSchedule,
          method: "POST",
          body: payload,
          timeoutMs,
          signal,
        }),
    },

    // Diagnostics
    diagnostics: {
      radiologyOrder: (payload: RadiologyOrderRequest, signal?: AbortSignal) =>
        http<RadiologyOrderResponse>({
          baseUrl,
          path: paths.radiologyOrder,
          method: "POST",
          body: payload,
          timeoutMs,
          signal,
        }),
      labOrder: (payload: LabOrderRequest, signal?: AbortSignal) =>
        http<LabOrderResponse>({
          baseUrl,
          path: paths.labOrder,
          method: "POST",
          body: payload,
          timeoutMs,
          signal,
        }),
    },

    // Surgical agent
    surgical: {
      book: (
        payload: {
          patientId: string;
          procedure: string;
          surgeonId?: string;
          requiredTheatre?: string;
          requiredTools?: string[];
          requiredBloodType?: string;
          preOpChecks?: string[];
          priority?: string;
        },
        signal?: AbortSignal,
      ) =>
        http<{
          bookingId: string;
          theatre?: string;
          scheduledAt?: string;
          checklist?: string[];
          reasoning?: string;
        }>({
          baseUrl,
          path: paths.surgicalBook,
          method: "POST",
          body: payload,
          timeoutMs,
          signal,
        }),
    },

    // Copilot
    copilot: {
      command: (payload: CopilotCommandRequest, signal?: AbortSignal) =>
        http<CopilotCommandResponse>({
          baseUrl,
          path: paths.copilotCommand,
          method: "POST",
          body: payload,
          timeoutMs,
          signal,
        }),
    },

    // Tasks & Workflow status
    status: {
      getTask: (taskId: string, signal?: AbortSignal) =>
        http<AgentTask>({
          baseUrl,
          path: `${paths.taskStatus}/${encodeURIComponent(taskId)}`,
          method: "GET",
          timeoutMs,
          signal,
        }),
      getWorkflow: (workflowId: string, signal?: AbortSignal) =>
        http<WorkflowRun>({
          baseUrl,
          path: `${paths.workflowStatus}/${encodeURIComponent(workflowId)}`,
          method: "GET",
          timeoutMs,
          signal,
        }),
    },

    // Streaming (SSE) - status/events/tokens
    stream: {
      /**
       * Subscribe to server-sent events. Returns an unsubscribe function.
       *
       * The implementation prefers EventSource (simple SSE) and falls back to fetch streaming
       * when custom headers or bearer auth is required.
       */
      subscribe: (params: {
        path?: string; // defaults to paths.stream
        query?: Record<string, unknown>;
        onChunk: (chunk: StreamChunk) => void;
        onError?: (err: unknown) => void;
        useFetchFallback?: boolean; // force fetch-based streaming (to attach auth headers)
        signal?: AbortSignal;
      }): (() => void) => {
        const path = params.path ?? paths.stream;
        const base = baseUrl || "";
        const token = getAuthToken();

        // If we must send Authorization header, EventSource can't do that; use fetch-streaming.
        const mustUseFetch = params.useFetchFallback || !!token;

        if (!mustUseFetch && typeof EventSource !== "undefined") {
          const url = buildUrl(base, path, params.query);
          const es = new EventSource(url, { withCredentials: true });

          const onMessage = (ev: MessageEvent) => {
            try {
              const parsed = JSON.parse(ev.data) as StreamChunk;
              params.onChunk(parsed);
            } catch {
              // Non-JSON payload; wrap as token chunk
              params.onChunk({
                type: "token",
                data: ev.data,
                ts: new Date().toISOString(),
              });
            }
          };

          const onError = (err: unknown) => {
            params.onError?.(err);
          };

          es.addEventListener("message", onMessage);
          es.addEventListener("error", onError as any);

          const unsubscribe = () => {
            es.removeEventListener("message", onMessage);
            es.removeEventListener("error", onError as any);
            es.close();
          };

          if (params.signal) {
            params.signal.addEventListener("abort", unsubscribe, {
              once: true,
            });
          }

          return unsubscribe;
        }

        // Fetch streaming fallback (supports auth headers)
        const controller = new AbortController();
        const mergedSignal = mergeSignals(params.signal, controller.signal);

        (async () => {
          try {
            const url = buildUrl(base, path, params.query);
            const res = await fetch(url, {
              method: "GET",
              headers: {
                Accept: "text/event-stream",
                ...(token ? { Authorization: `Bearer ${token}` } : {}),
              },
              signal: mergedSignal,
              credentials: "include",
            });

            if (!res.ok || !res.body) {
              throw new Error(`Stream request failed with ${res.status}`);
            }

            const reader = res.body.getReader();
            const decoder = new TextDecoder();

            let pending = "";
            for (;;) {
              const { value, done } = await reader.read();
              if (done) break;

              pending += decoder.decode(value, { stream: true });

              // Simple SSE parser: split by \n\n
              const events = pending.split("\n\n");
              pending = events.pop() ?? "";

              for (const evt of events) {
                // Look for "data:" lines
                const dataLines = evt
                  .split("\n")
                  .filter((l) => l.startsWith("data:"))
                  .map((l) => l.slice(5).trim());

                if (dataLines.length === 0) continue;
                const data = dataLines.join("\n");

                try {
                  const parsed = JSON.parse(data) as StreamChunk;
                  params.onChunk(parsed);
                } catch {
                  params.onChunk({
                    type: "token",
                    data,
                    ts: new Date().toISOString(),
                  });
                }
              }
            }

            // Flush remaining buffer
            if (pending) {
              try {
                const parsed = JSON.parse(pending) as StreamChunk;
                params.onChunk(parsed);
              } catch {
                params.onChunk({
                  type: "token",
                  data: pending,
                  ts: new Date().toISOString(),
                });
              }
            }

            // Finalize
            params.onChunk({ type: "final", ts: new Date().toISOString() });
          } catch (err) {
            params.onError?.(err);
          }
        })();

        // Unsubscribe
        return () => controller.abort();
      },
    },

    // Combined orchestration helper (optional convenience)
    orchestration: {
      /**
       * Register a patient and optionally receive agent recommendations (if your backend does so).
       * This method returns the created patient and any recommendation found in the response.
       */
      registerWithRecommendation: async (req: PatientRegistrationRequest) => {
        const data = await http<any>({
          baseUrl,
          path: paths.admissionRegister,
          method: "POST",
          body: req,
          timeoutMs,
          unwrapApiEnvelope: true,
        });

        // Support multiple backend shapes. Normalize to a stable structure.
        const patient: PatientRecord | undefined =
          data?.patient ?? (data?.id ? data : undefined);

        const assignment: AssignmentRecommendation | undefined =
          data?.assignment ??
          (data?.recommended_nurse_id ||
          data?.recommended_bed_id ||
          data?.recommended_doctor_id
            ? {
                recommended_nurse_id: data?.recommended_nurse_id ?? null,
                recommended_doctor_id: data?.recommended_doctor_id ?? null,
                recommended_bed_id: data?.recommended_bed_id ?? null,
                reasoning: data?.reasoning ?? "",
              }
            : undefined);

        if (!patient) {
          return { patient: data as PatientRecord, assignment: undefined };
        }
        return { patient, assignment };
      },
    },
  };
}

/* =============================================================================
 * Singleton client using env configuration
 * ========================================================================== */

const agentClient = createAgentClient({
  baseUrl: AGENT_URLS.PHARMACY, // Using Pharmacy Agent URL from config
  paths: DEFAULT_PATHS,
  timeoutMs: DEFAULT_TIMEOUT_MS,
});

/* =============================================================================
 * Exports
 * ========================================================================== */

export { agentClient, isApiError };
