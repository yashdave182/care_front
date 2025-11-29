# CareFlow Nexus – Software Requirements Specification (SRS)
## Version
1.0.0 (Frontend Agentic Architecture)  
Date: 2025-11-22

## 1. Introduction
### 1.1 Purpose
This SRS defines the functional and non‑functional requirements for the CareFlow Nexus frontend: an agent‑enabled hospital operating system UI that orchestrates autonomous backend AI agents (deployed as containerized services / Hugging Face endpoints). It specifies how the React/TypeScript application interacts with the agent gateway, models hospital entities, visualizes operational status, and enables agent-driven workflows.

### 1.2 Scope
Frontend scope includes:
- Role-based interactive dashboards for Admin, Nurse, Doctor
- Agent interaction surfaces (Admission, Bed Management, Staff/Nurse assignment, Pharmacy, Cleaning, Emergency, Diagnostics – Radiology & Lab, Surgical, Co-pilot)
- Patient intake and detailed patient orchestration pages
- 3D bed visualization
- Event/stream integration (SSE/fetch streaming fallback)
- State management (Zustand) + transient caching (React Query)
- Presentation-only logic with strict separation from backend business rules
Backend (out of scope here) supplies REST + streaming endpoints conforming to contracts defined in this SRS.

### 1.3 Definitions / Glossary
| Term | Definition |
|------|------------|
| Agent | Autonomous backend service encapsulating a domain workflow (e.g. Bed Management Agent). |
| Co-pilot | Natural language orchestration agent producing and/or executing multi-step workflow plans. |
| Assignment Recommendation | AI-selected nurse/doctor/bed triple with reasoning metadata. |
| WorkflowRun | Directed graph of AgentTasks produced by orchestration or co-pilot. |
| SSE | Server-Sent Events streaming channel for status/tokens/events. |
| Emergency Episode | Active incident representing a patient arrival scenario (proto-patient). |

### 1.4 References
- Existing repository components (React, Zustand, shadcn/ui)
- Proposed backend endpoints listed in Section 7
- Data type definitions in `src/lib/agents/types.ts`

## 2. Overall Description
### 2.1 System Environment
The frontend runs in a browser (desktop-first responsive design) invoking a configurable agent gateway base URL (environment variable) that routes requests to containerized micro-agents.

### 2.2 User Classes
- Admin: Full orchestration, hospital configuration, global view.
- Nurse: Sees patient assignments, limited action set (read-only for agent orchestration).
- Doctor: Sees assigned patients, can invoke co-pilot / clinical workflows.
- Future Roles: Radiologist, Lab Tech, Cleaner (not yet fully implemented).

### 2.3 Assumptions & Dependencies
- Each agent exposes stable JSON REST endpoints.
- Authentication token is available (mock or real). If not validated, endpoints should still respond gracefully.
- Streaming endpoint supports text/event-stream or is absent (fallback to silent polling).
- Frontend does not persist sensitive PHI beyond in-memory unless backend supplies secure data.

### 2.4 Constraints
- Must not block UI when backend is unreachable; show error toasts and degradations.
- Gemini-based logic (legacy) replaced by agent gateway semantics.
- All agent calls must be cancellable (AbortController) to prevent memory leaks.

## 3. Goals
1. Provide unified, composable agent client for all domains.
2. Deliver real-time operational visibility and manual override points.
3. Maintain clear separation between presentational logic and agent business intelligence.
4. Support incremental addition of new agent domains without refactoring core.

## 4. Non-Goals
- Implement complex clinical decision algorithms client-side.
- Long-term offline caching of sensitive patient data.
- Voice recognition beyond a placeholder (future scope).
- In-browser model inference.

## 5. Functional Requirements
### 5.1 Authentication Shell
- F1: Mock login sets user role and token.
- F2: Redirect unauthorized role access attempts to landing page.

### 5.2 Dashboard (Admin)
- F3: Display KPIs (beds, emergencies, staff availability).
- F4: Trigger emergency creation with minimal form.
- F5: Show Active Emergencies list with resolve action.

### 5.3 Nurse/Doctor Dashboards
- F6: List assignments filtered by nurse_id / doctor_id.
- F7: Provide simple patient summary (bed, type, staff collaboration).

### 5.4 Patient Intake (Advanced)
- F8: Multi-step form captures patient demographics, condition, severity.
- F9: Calls Admission Agent; if assignment recommendation present, displays reasoning.
- F10: Finalization step registers patient episode into local emergency list.

### 5.5 Patient Detail Page
- F11: Re-run nurse/doctor assignment, bed allocation, lab/radiology orders, prescriptions, cleaning schedule, co-pilot commands.
- F12: Display current bed/nurse/doctor and timestamps.
- F13: Support manual override hints (specialty, floor preference, ICU requirement).

### 5.6 Agents Hub
- F14: Show status tiles (online/degraded/offline/initializing) for each agent.
- F15: Provide quick action test calls per agent with standardized payloads.
- F16: Ping gateway health.

### 5.7 Pharmacy
- F17: Compose multi-medication prescription.
- F18: Submit `PrescriptionRequest`; show safety validation (warnings/interactions/allergy flags).
- F19: Record local prescription history.

### 5.8 Diagnostics (Radiology & Lab)
- F20: Radiology order with modality, body part, clinical question, autoTriage flag.
- F21: Lab order multi-test selection with priorities.
- F22: Display recent orders list with reasoning and status placeholders.

### 5.9 Surgery
- F23: Surgical booking form (procedure, surgeon optional, tools, blood type, pre-op checks).
- F24: Display booking result (ID, theatre, scheduled time, checklist, reasoning).

### 5.10 Cleaning
- F25: Bed cleaning scheduling with type & scheduled time.
- F26: Task listing (local until real backend tasks endpoint available).

### 5.11 Co-pilot Console
- F27: Accept natural language command; plan-only mode vs execute mode.
- F28: Show parsed workflow steps and reasoning.
- F29: Stream chunk updates (token/status/event/final).
- F30: Maintain command history.

### 5.12 Patients Directory
- F31: Filter/search/sort patient episodes (emergency-derived).
- F32: Link to Patient Detail page.

## 6. Data Model (Frontend)
(See `types.ts` for canonical definitions)

Key Entities:
- PatientRecord (from Admission agent)
- EmergencyEvent (active episode)
- Nurse / Doctor / Bed (resource references)
- AssignmentRecommendation
- AgentTask (status tracking)
- WorkflowRun (multi-task orchestration)
- PrescriptionRequest / DispenseResponse
- RadiologyOrderRequest / Response
- LabOrderRequest / Response
- CleaningTask
- SurgicalBookingResponse
- CopilotCommandResponse / CopilotCommandPlan

Local Store (Zustand):
```
user: User | null
hospital: Hospital | null
beds: Bed[]
nurses: Nurse[]
doctors: Doctor[]
emergencies: Emergency[]
patients: Patient[] (future decoupling)
```

## 7. API Contracts (Frontend Expectations)
All endpoints return either:
```
Success: { ok: true, data: <payload>, meta?: {...} }
Error:   { ok: false, error: { message: string, code?: string, details?: any } }
```
If backend cannot adopt envelope, raw payload is still parsed; errors throw.

### 7.1 Endpoint Matrix
| Domain | Method | Path | Request | Response (data) | Notes |
|--------|--------|------|---------|-----------------|-------|
| Admission | POST | /admission/register | PatientRegistrationRequest | { patient: PatientRecord, assignment?: AssignmentRecommendation } | AutoOrchestrate triggers internal chain |
| Bed Mgmt | POST | /beds/allocate | BedAllocationRequest | BedAllocationResponse | Constraints support floor/ICU/isolation |
| Nurse Assign | POST | /nurse/assign | NurseAssignmentRequest | { patientId, nurseId, reasoning } | Null nurseId if none found |
| Doctor Assign | POST | /doctor/assign | DoctorAssignmentRequest | { patientId, doctorId, reasoning } | Same pattern |
| Pharmacy | POST | /pharmacy/prescriptions | PrescriptionRequest | DispenseResponse | Safety validation embedded |
| Cleaning | POST | /cleaning/schedule | CleaningScheduleRequest | CleaningTask | Notes not required server-side |
| Emergency | POST | /emergency/trigger | TriggerEmergencyRequest | EmergencyEvent | Accept autoOrchestrate |
| Radiology | POST | /radiology/order | RadiologyOrderRequest | RadiologyOrderResponse | queuePosition optional |
| Lab | POST | /lab/order | LabOrderRequest | LabOrderResponse | items prioritized individually |
| Surgical | POST | /surgical/book | SurgicalBookingRequest | SurgicalBookingResponse | Checklist assembled server-side |
| Co-pilot | POST | /copilot/command | CopilotCommandRequest | CopilotCommandResponse | mode = plan or executed |
| Task Status | GET | /tasks/:id | - | AgentTask | Single task detail |
| Workflow Status | GET | /workflows/:id | - | WorkflowRun | Contains tasks array |
| Stream | GET | /stream | query params (workflowId?) | SSE StreamChunk events | SSE or fetch fallback |

### 7.2 Streaming (SSE)
Event `data:` must serialize:
```
{
  "type": "token" | "status" | "event" | "final",
  "id": "string?",
  "ts": "ISO8601?",
  "data": any
}
```
`final` chunk ends logical stream.

### 7.3 Error Semantics
- HTTP non-2xx AND envelope error → thrown with message.
- Parse failure → thrown with “Failed to parse response”.
- Network abort → thrown with AbortError; UI should show “Request cancelled”.

## 8. State Management & Caching
- Immediate UI state (Zustand) holds locally synthesized resources.
- Agent calls not yet integrated with persistent backend model; once real endpoints exist, React Query caches can wrap agentClient methods.
- Recommended TTL for read queries (when implemented): 30–60s; streaming events refine in-memory state instantly.

## 9. Realtime Strategy
Phases:
1. Basic (current): Manual fetch after actions; optional stream subscription if backend implemented.
2. Intermediate: Single SSE channel with domain-specific events (channel field).
3. Advanced: Workflow-level granular task updates driving animated progress bars.

Client aggregator merges chunk types; dedup by `id` + `type` timestamp.

## 10. Security & Privacy
- Token forwarded via Authorization header (Bearer).
- No PHI persisted beyond memory / transient React state.
- Logging in client should exclude PII (only IDs).
- Future: implement role-based UI gating for each agent action button (current minimal gating only by page).

## 11. Performance Requirements
- Initial load under 2.5s on modern broadband (JS bundle split recommended for advanced pages).
- 3D bed map frame rate > 30fps with <= 300 beds.
- SSE event handling must not block main thread—batch updates (microtask / requestAnimationFrame).
- Maximum recommended simultaneous streaming subscriptions: 1 global + 1 workflow-specific.

## 12. Reliability & Error Handling
- Toast-based immediate feedback; multi-line reasoning preserved.
- Graceful degradation when gateway missing:
  - AgentsHub shows offline statuses.
  - Action buttons disabled or show “Gateway not configured”.
- Automatic abort of pending requests on route change.

## 13. Usability Requirements
- Consistent component styling (shadcn/ui).
- Forms show loading indicators on submission (spinners).
- Reasoning text truncated with ability to expand (future enhancement).
- Accessibility: semantic markup, focusable buttons, ARIA labels (to be audited).

## 14. Extensibility & Modularity
- Add new agent: extend `AgentName`, add endpoint path, optional page component.
- Minimal coupling: UI imports domain types from a single barrel (`lib/agents`).
- Future voice module pluggable via Co-pilot console extras.

## 15. Internationalization (Future)
- Strings centralized optionally; current phase: English only.

## 16. Risks & Mitigations
| Risk | Impact | Mitigation |
|------|--------|-----------|
| Backend latency spike | Degraded UX | Show “Degraded” status, enable manual retry |
| Inconsistent JSON schema | Parsing failures | Envelope + robust JSON extraction with try/catch |
| Streaming disconnect | Missing updates | Auto-reconnect with exponential backoff |
| Overfetching resources | Performance | Introduce query caching layer post-MVP |

## 17. Environment Variables (Frontend)
| Variable | Description | Required |
|----------|-------------|----------|
| VITE_AGENTS_BASE_URL | Base URL for agent gateway | Yes |
| VITE_SUPABASE_URL | Supabase backend URL (future) | Optional |
| VITE_SUPABASE_PUBLISHABLE_KEY | Supabase anon key | Optional |
| VITE_GEMINI_API_KEY | Legacy AI assignment (may be deprecated) | Optional |

## 18. Testing Strategy (Frontend)
- Unit: agent client (mock fetch responses).
- Integration: page forms produce expected payload shapes.
- E2E (future): Cypress scripts for patient intake → assignment → detail actions.
- Contract: JSON schema test harness verifying backend envelope compatibility (developer tool).

## 19. Deployment Considerations
- Build artifact via Vite.
- Use environment injection at build time (no runtime secret exposure).
- Production error boundary logs (to monitoring endpoint) without PHI.

## 20. Future Enhancements
- Unified timeline view: merges tasks, prescriptions, diagnostics into a chronological event stream.
- Role-based granular permissions (RBAC map).
- WebRTC or WebSocket fallback for richer real‑time (bidirectional).
- Voice command ingestion and transcript persistence.
- The “digital twin” spatial interface (extending 3D bed map with staff positions).

## 21. Out of Scope (Current Version)
- Insurance validation flows.
- Predictive analytics dashboards (forecast curves).
- Integrated wearable vitals telemetry.
- Automated scheduling of staff shifts (UI only planned).

## 22. Acceptance Criteria (Key Flows)
1. Patient Intake:
   - User enters required fields → receives assignment recommendation (if backend responds) → new patient appears in directory/emergencies list.
2. Pharmacy:
   - Submitting multi-drug Rx returns validation warnings rendered in panel.
3. Co-pilot:
   - Plan-only command displays steps with reasoning; execute mode streams status chunks.
4. AgentsHub:
   - Ping reflects gateway configured/unconfigured states.

## 23. Open Questions
- Will backend unify agent endpoints under single versioned prefix (e.g. /v1/agents/...)?
- Should workflow/task status endpoints support selective field expansions?
- How will authentication roles map to future specialized staff (cleaner/radiologist) without UI refactor?

## 24. Change Log
| Version | Date | Change |
|---------|------|--------|
| 1.0.0 | 2025-11-22 | Initial SRS creation for agentic frontend design. |

## 25. Approval
Stakeholders will review this SRS before implementing backend adapters. Changes post-approval managed via semantic versioning & addendum sections.

---

End of Document.