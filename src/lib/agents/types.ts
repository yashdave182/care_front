/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * CareFlow Nexus - Agent API Type Definitions
 *
 * This file defines the shared request/response and domain types for the
 * agentic AI frontend. Your backend agents (running on Hugging Face in Docker)
 * should expose HTTP endpoints that accept/return these shapes, so the UI can
 * be wired end-to-end without coupling.
 */

import type {
  Bed as StoreBed,
  Nurse as StoreNurse,
  Doctor as StoreDoctor,
} from "@/store/hospitalStore";

/* ============================================================================
 * Core Enums / Discriminators
 * ==========================================================================*/

export type AgentName =
  | "admission"
  | "bed_management"
  | "nurse_staff"
  | "pharmacy"
  | "cleaning"
  | "emergency"
  | "radiology"
  | "lab"
  | "surgical"
  | "copilot";

export type TaskStatus =
  | "queued"
  | "running"
  | "waiting"
  | "blocked"
  | "completed"
  | "failed"
  | "cancelled";

export type Priority = "low" | "medium" | "high" | "urgent";

export type PatientSeverity = "low" | "medium" | "high" | "critical";

export type Gender = "male" | "female" | "other" | "unknown";

export type Availability =
  | "available"
  | "busy"
  | "off"
  | "on_break"
  | "on_leave";

/* ============================================================================
 * Base / Common
 * ==========================================================================*/

export type ID = string;

export interface Timestamped {
  createdAt?: string; // ISO string
  updatedAt?: string; // ISO string
}

export interface ApiSuccess<T> {
  ok: true;
  data: T;
  meta?: Record<string, unknown>;
}

export interface ApiError {
  ok: false;
  error: {
    message: string;
    code?: string;
    details?: unknown;
  };
}

export interface ApiPaginated<T> extends ApiSuccess<T[]> {
  page: number;
  pageSize: number;
  total: number;
}

/* ============================================================================
 * Re-exports / Compatibility with existing store types
 * ==========================================================================*/

// Keep UI in sync with store models
export type BedStatus = StoreBed["status"];

export interface Bed extends StoreBed {} // id, bed_number, floor, status, position, patient?

export interface Nurse extends StoreNurse {} // id, name, nurse_id, specialization, status, assignment?

export interface Doctor extends StoreDoctor {} // id, name, doctor_id, specialization, status, assignment?

/* ============================================================================
 * Patient Domain
 * ==========================================================================*/

export interface PatientCore {
  id?: ID;
  name: string;
  age: number | string; // allow string from inputs; backend can normalize
  gender?: Gender;
  phone?: string;
  condition?: string; // e.g., "Cardiac Emergency"
  specialtyRequired?: string; // e.g., "Cardiology"
  notes?: string;
  allergies?: string[];
  severity?: PatientSeverity;
}

export interface PatientRegistrationRequest {
  patient: PatientCore;
  // Optional hints to agents (preselected choices from UI)
  preferNurseId?: ID;
  preferDoctorId?: ID;
  preferBedId?: ID;
  priority?: Priority;
  // Whether to auto-create downstream tasks: bed assignment, staff assignment, etc.
  autoOrchestrate?: boolean;
}

export interface PatientRecord extends PatientCore, Timestamped {
  id: ID;
  status?:
    | "admitted"
    | "pre_registered"
    | "in_diagnostics"
    | "in_surgery"
    | "recovery"
    | "discharged";
  assignedBedId?: ID | null;
  assignedNurseId?: ID | null;
  assignedDoctorId?: ID | null;
  admissionTime?: string; // ISO
}

export interface AssignmentRecommendation {
  recommended_nurse_id: ID | null;
  recommended_doctor_id: ID | null;
  recommended_bed_id: ID | null;
  reasoning: string;
}

export interface PatientAssignmentResponse {
  patientId: ID;
  assignment: AssignmentRecommendation;
}

/* ============================================================================
 * Staff/Resource Refs
 * ==========================================================================*/

export interface StaffRef {
  id: ID;
  role:
    | "nurse"
    | "doctor"
    | "cleaner"
    | "pharmacist"
    | "radiologist"
    | "lab_tech"
    | "surgeon"
    | "admin";
}

export interface BedRef {
  id: ID;
}

/* ============================================================================
 * Emergency Agent
 * ==========================================================================*/

export type EmergencyType =
  | "Cardiac Emergency"
  | "Trauma"
  | "Respiratory Failure"
  | "Stroke"
  | "Poisoning"
  | "Severe Bleeding"
  | "Head Injury"
  | "Burns"
  | "Other";

export interface TriggerEmergencyRequest {
  type: EmergencyType | string;
  patientName: string;
  callerPhone: string;
  notes?: string;
  priority?: Priority;
  // Optionally pre-link to a pre-registered patient ID
  patientId?: ID;
  // If true, orchestrate auto staff/bed prep
  autoOrchestrate?: boolean;
}

export interface EmergencyEvent extends Timestamped {
  id: ID;
  emergency_id: string; // human-friendly code e.g. EMG-*
  type: string;
  patient_name: string;
  status: "active" | "resolved" | "cancelled";
  bed?: Bed;
  nurse?: Nurse;
  doctor?: Doctor;
  created_at: string; // ISO
  meta?: Record<string, unknown>;
}

/* ============================================================================
 * Bed Management Agent
 * ==========================================================================*/

export interface BedConstraint {
  floorPreference?: number[];
  icuRequired?: boolean;
  isolationRequired?: boolean;
  nearDept?: string; // e.g., "Radiology", "ICU", "ER"
}

export interface BedAllocationRequest {
  patientId: ID;
  constraints?: BedConstraint;
  priority?: Priority;
}

export interface BedAllocationResponse {
  patientId: ID;
  allocatedBedId: ID | null;
  reasoning: string;
}

/* ============================================================================
 * Nurse & Staff Agent
 * ==========================================================================*/

export interface NurseAssignmentRequest {
  patientId: ID;
  requiredSpecialty?: string;
  priority?: Priority;
}

export interface NurseAssignmentResponse {
  patientId: ID;
  nurseId: ID | null;
  reasoning: string;
}

export interface DoctorAssignmentRequest {
  patientId: ID;
  requiredSpecialty?: string;
  priority?: Priority;
}

export interface DoctorAssignmentResponse {
  patientId: ID;
  doctorId: ID | null;
  reasoning: string;
}

/* ============================================================================
 * Pharmacy Agent
 * ==========================================================================*/

export interface Medication {
  code: string; // e.g., RxNorm or internal code
  name: string;
  strength?: string; // "75mg"
  form?: string; // "tablet", "solution"
}

export interface InventoryItem extends Medication {
  stock: number;
  minStock?: number;
  maxStock?: number;
  expiresAt?: string; // ISO
}

export interface PrescriptionItem {
  medication: Medication;
  dosage: string; // "75mg"
  frequency: string; // "once", "BID", "TID", "q6h"
  duration?: string; // "5 days"
  route?: string; // "oral", "IV"
  notes?: string;
}

export interface PrescriptionRequest {
  patientId: ID;
  patientName?: string;
  items: PrescriptionItem[];
  allergies?: string[];
  // If true, agent should check for interactions and allergy conflicts
  validateSafety?: boolean;
  priority?: Priority;
}

export interface PrescriptionValidationResult {
  ok: boolean;
  warnings?: string[];
  interactions?: string[];
  allergyFlags?: string[];
}

export interface DispenseResponse {
  prescription_id: string;
  status:
    | "pending"
    | "in_progress"
    | "ready"
    | "dispensed"
    | "cancelled"
    | "out_of_stock";
  patient_id: string;
  patient_name: string;
  medications: Array<{
    name: string;
    dosage: string;
    frequency: string;
    duration: string;
    quantity: number;
  }>;
  estimated_time?: string;
  pharmacist_notes?: string;
  created_at: string;
  updated_at: string;
  // Legacy fields for backward compatibility
  prescriptionId?: ID;
  dispensed?: boolean;
  validation?: PrescriptionValidationResult;
  reasoning?: string;
}

/* ============================================================================
 * Cleaning Agent
 * ==========================================================================*/

export type CleaningType = "standard" | "deep" | "isolation" | "terminal";

export interface CleaningScheduleRequest {
  bedId: ID;
  type: CleaningType;
  // Optional target start time
  scheduledFor?: string; // ISO
  priority?: Priority;
}

export interface CleaningTask extends Timestamped {
  id: ID;
  bedId: ID;
  type: CleaningType;
  status: TaskStatus;
  assignedCleanerId?: ID | null;
  startedAt?: string; // ISO
  completedAt?: string; // ISO
  notes?: string;
}

/* ============================================================================
 * Diagnostics Agents (Radiology & Lab)
 * ==========================================================================*/

export interface RadiologyOrderRequest {
  patientId: ID;
  modality: "CT" | "MRI" | "XRay" | "Ultrasound" | "Other";
  bodyPart?: string;
  clinicalQuestion?: string;
  priority?: Priority;
  // If true, triage queue and auto-bump urgent cases
  autoTriage?: boolean;
}

export interface RadiologyOrderResponse {
  orderId: ID;
  scheduledAt?: string; // ISO
  queuePosition?: number;
  reasoning?: string;
}

export interface LabOrderItem {
  testCode: string; // e.g., LOINC or internal
  name: string;
  priority?: Priority;
}

export interface LabOrderRequest {
  patientId: ID;
  items: LabOrderItem[];
  notes?: string;
}

export interface LabOrderResponse {
  orderId: ID;
  estimatedReadyAt?: string; // ISO
  reasoning?: string;
}

/* ============================================================================
 * Surgical Agent
 * ==========================================================================*/

export interface SurgicalBookingRequest {
  patientId: ID;
  procedure: string;
  surgeonId?: ID;
  requiredTheatre?: string;
  requiredTools?: string[];
  requiredBloodType?: string;
  preOpChecks?: string[]; // e.g., "CBC", "ECG"
  priority?: Priority;
}

export interface SurgicalBookingResponse {
  bookingId: ID;
  theatre?: string;
  scheduledAt?: string; // ISO
  checklist?: string[];
  reasoning?: string;
}

/* ============================================================================
 * Doctor's Co-pilot Agent
 * ==========================================================================*/

export interface CopilotCommandRequest {
  // Natural language command, e.g. "Book an MRI for Mr. Sharma and notify neurology"
  command: string;
  // Who issued the command (for audit)
  issuedBy: StaffRef;
  // Contextual hints to improve grounding
  context?: {
    patientId?: ID;
    location?: string;
    specialty?: string;
  };
  // If true, execute; otherwise return a proposed workflow plan
  execute?: boolean;
}

export interface CopilotCommandPlan {
  steps: Array<{
    agent: AgentName;
    action: string;
    inputs: Record<string, unknown>;
    dependsOn?: ID[]; // Task IDs
  }>;
  reasoning?: string;
}

export interface CopilotCommandResponse {
  mode: "plan" | "executed";
  plan: CopilotCommandPlan;
  workflowRunId?: ID;
  // Optional immediate results from executed tasks
  results?: Record<string, unknown>;
}

/* ============================================================================
 * Workflows & Tasks
 * ==========================================================================*/

export interface AgentTask<I = unknown, O = unknown> extends Timestamped {
  id: ID;
  agent: AgentName;
  name: string; // human readable label
  status: TaskStatus;
  priority?: Priority;
  input: I;
  output?: O;
  error?: {
    message: string;
    code?: string;
    details?: unknown;
  };
  startedAt?: string; // ISO
  finishedAt?: string; // ISO
  // Optional reference to domain objects
  links?: {
    patientId?: ID;
    bedId?: ID;
    staffIds?: ID[];
    resourceIds?: ID[];
  };
}

export interface WorkflowEdge {
  from: ID; // taskId
  to: ID; // taskId
  condition?: string; // e.g. "onSuccess", "onFailure"
}

export interface WorkflowRun extends Timestamped {
  id: ID;
  name: string;
  status: TaskStatus;
  tasks: AgentTask[];
  edges?: WorkflowEdge[];
  // Arbitrary trace/debug info
  trace?: Array<{
    at: string; // ISO
    message: string;
    data?: unknown;
    level?: "info" | "warn" | "error" | "debug";
  }>;
}

/* ============================================================================
 * Streaming / Realtime (SSE/WS)
 * ==========================================================================*/

export type StreamChunkType =
  | "token" // LLM tokens
  | "event" // domain events
  | "status" // task/workflow status updates
  | "final"; // final result

export interface StreamChunk<T = unknown> {
  type: StreamChunkType;
  id?: ID;
  ts?: string; // ISO
  data?: T;
}

/* ============================================================================
 * Events (Typed Event Bus)
 * ==========================================================================*/

export type HospitalChannel =
  | "admissions"
  | "beds"
  | "staff"
  | "pharmacy"
  | "cleaning"
  | "emergency"
  | "diagnostics"
  | "surgery"
  | "system";

export interface HospitalEvent<T = unknown> {
  id: ID;
  channel: HospitalChannel;
  ts: string; // ISO
  actor?: StaffRef | { agent: AgentName };
  payload: T;
}

/* ============================================================================
 * Endpoint Configuration (Optional Frontend Contract)
 * ==========================================================================*/

export interface AgentEndpointConfig {
  baseUrl: string; // e.g., https://api.your-host/agents
  paths?: Partial<{
    admissionRegister: string; // POST   /admission/register
    bedAllocate: string; // POST /bed/allocate
    nurseAssign: string; // POST /nurse/assign
    doctorAssign: string; // POST /doctor/assign
    pharmacyPrescribe: string; // POST /pharmacy/prescriptions
    cleaningSchedule: string; // POST /cleaning/schedule
    emergencyTrigger: string; // POST /emergency/trigger
    radiologyOrder: string; // POST /radiology/order
    labOrder: string; // POST /lab/order
    surgicalBook: string; // POST /surgical/book
    copilotCommand: string; // POST /copilot/command
    // Streaming/status
    taskStatus: string; // GET /tasks/:id
    workflowStatus: string; // GET /workflows/:id
    stream: string; // GET /stream (SSE/WS)
  }>;
}

/* ============================================================================
 * Convenience Type Guards
 * ==========================================================================*/

export const isApiError = (x: unknown): x is ApiError => {
  return (
    typeof x === "object" && x !== null && "ok" in x && (x as any).ok === false
  );
};

export const isApiSuccess = <T>(x: unknown): x is ApiSuccess<T> => {
  return (
    typeof x === "object" && x !== null && "ok" in x && (x as any).ok === true
  );
};
