# CareFlow Nexus - Bed Turnover Automation Prototype

## Overview

CareFlow Nexus is an AI-powered hospital bed turnover automation system that demonstrates how autonomous agents can orchestrate the complete workflow from patient admission to discharge. This prototype showcases minimal human input triggering a full operational sequence using intelligent automation.

**Primary Goal**: Demonstrate a functioning AI-coordinated workflow with observable end-to-end automation of the bed turnover process.

## System Architecture

### Technology Stack

- **Frontend**: Next.js + React + TypeScript (deployed on Vercel)
- **Backend**: FastAPI + Python (deployed on Railway)
- **Database**: Supabase (PostgreSQL)
- **Agents**: Hugging Face Spaces (Python workers)
- **LLM**: Groq API (Llama) or Google Gemini

### Core Modules

1. **Admin Dashboard** (`/admin`) - System overview and control center
2. **Doctor Dashboard** (`/doctor-dashboard`) - Patient admission and discharge
3. **Nurse Dashboard** (`/nurse-dashboard`) - Nurse task management
4. **Cleaner Interface** (`/cleaning`) - Cleaning task management

### AI Agents (3 Autonomous Agents)

1. **MASTER Agent** - Bed assignment and workflow orchestration
2. **NURSE Agent** - Nurse assignment and workload balancing
3. **CLEANER Agent** - Pre-admission, recurring, and post-discharge cleaning

## Bed Turnover Workflow

```
1. Doctor initiates admission
   ↓
2. Backend creates bed_assignment task
   ↓
3. MASTER Agent assigns available bed
   ↓
4. CLEANER Agent performs pre-admission cleaning
   ↓
5. NURSE Agent assigns nurse to patient
   ↓
6. Recurring tasks scheduled (checkups, cleaning)
   ↓
7. Doctor triggers discharge
   ↓
8. CLEANER Agent performs post-discharge cleaning
   ↓
9. Bed becomes available again
```

## Database Schema

### Core Tables

- **patients** - Patient records and status tracking
- **beds** - Bed availability and status
- **admissions** - Links patients to beds (single source of truth)
- **staff** - Doctors, nurses, and cleaners
- **tasks** - Workflow tasks for agents and humans
- **events** - System event log

### Key States

**Bed States:**
- `available`, `pending_cleaning`, `cleaning_in_progress`, `occupied`

**Patient States:**
- `pending_bed`, `awaiting_cleaning`, `assigned`, `under_care`, `discharge_requested`, `discharged`

**Task States:**
- `pending`, `locked`, `assigned`, `accepted`, `in_progress`, `completed`, `failed`

## Project Structure

```
src/
├── pages/
│   ├── AdminDashboard.tsx      # Admin control center
│   ├── DoctorDashboard.tsx     # Doctor workflow interface
│   ├── NurseDashboard.tsx      # Nurse task management
│   ├── Cleaning.tsx            # Cleaner interface
│   ├── Login.tsx               # Role selection
│   ├── Setup.tsx               # Initial configuration
│   └── NotFound.tsx            # 404 handler
├── components/
│   ├── AdminLayout.tsx         # Shared admin layout
│   └── ui/                     # Shadcn UI components
├── lib/
│   ├── agents/                 # Agent client
│   └── utils.ts                # Utilities
├── store/
│   └── hospitalStore.ts        # Zustand state management
└── integrations/
    └── supabase/               # Supabase client

agents/ (separate deployment)
├── app.py                      # Agent polling loops
├── utils/
│   ├── gemini_client.py        # LLM integration
│   └── supabase_client.py      # Database queries
└── requirements.txt
```

## Getting Started

### Prerequisites

- Node.js 18+ and npm/bun
- Python 3.9+
- Supabase account
- Groq API key or Google Gemini API key

### Frontend Setup

1. **Clone and install dependencies:**
   ```bash
   cd CareFlow_Nexus-main
   npm install
   # or
   bun install
   ```

2. **Configure environment variables:**
   Create `.env.local`:
   ```env
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

3. **Run development server:**
   ```bash
   npm run dev
   # or
   bun dev
   ```

4. **Build for production:**
   ```bash
   npm run build
   ```

### Agent Setup

1. **Navigate to agents directory:**
   ```bash
   cd agents
   ```

2. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

3. **Configure environment:**
   Create `.env`:
   ```env
   BACKEND_BASE=https://your-backend.railway.app
   GEMINI_API_KEY=your_gemini_api_key
   # OR
   GROQ_API_KEY=your_groq_api_key
   
   SUPABASE_URL=your_supabase_url
   SUPABASE_KEY=your_supabase_service_key
   POLL_INTERVAL=5
   ```

4. **Run agents:**
   ```bash
   python app.py
   ```

5. **Deploy to Hugging Face Spaces:**
   - Create a new Space (Python SDK)
   - Upload `app.py`, `requirements.txt`, and `utils/`
   - Add environment variables in Space settings
   - Set to run `app.py`

### Backend Setup

Refer to backend repository for FastAPI setup and deployment to Railway.

## API Endpoints

### Frontend-Initiated Actions

- `POST /api/patients` - Create patient
- `POST /api/patients/{id}/admit` - Start admission workflow
- `POST /api/beds/{id}/clean` - Request cleaning
- `POST /api/tasks/{id}/accept` - Staff accepts task
- `POST /api/tasks/{id}/complete` - Staff completes task

### Agent-Facing Endpoints

- `GET /api/tasks/pending?role={ROLE}&include=context` - Poll pending tasks
- `POST /api/agent/tasks/{id}/decision` - Submit agent decision

## Key Features

### ✅ Implemented

- Role-based dashboards (Admin, Doctor, Nurse, Cleaner)
- Real-time bed status visualization
- Autonomous agent task assignment
- Patient admission workflow
- Pre-admission cleaning automation
- Nurse assignment with workload balancing
- Discharge and post-discharge cleaning
- Task tracking and status updates
- Staff management
- Event logging

### 🚧 Out of MVP Scope

- Authentication & user identity management
- Medical diagnosis or treatment decisions
- Billing systems
- Cross-department workflows
- Patient detail pages
- Advanced analytics

## Usage

### As a Doctor:

1. Navigate to `/doctor-dashboard`
2. Click "Admit Patient" and enter patient name
3. System automatically:
   - Creates patient record
   - Assigns bed (MASTER Agent)
   - Schedules cleaning (CLEANER Agent)
   - Assigns nurse (NURSE Agent)
4. When ready, click "Discharge" to trigger post-discharge workflow

### As a Nurse:

1. Navigate to `/nurse-dashboard`
2. View assigned tasks
3. Click "Accept" to start a task
4. Click "Mark Completed" when done
5. Request additional cleaning if needed

### As a Cleaner:

1. Navigate to `/cleaning`
2. View cleaning tasks (pre-admission, recurring, post-discharge)
3. Click "Mark Cleaned" when completed

### As an Admin:

1. Navigate to `/admin`
2. Monitor:
   - Bed occupancy and status
   - Staff availability
   - Agent status and task queue
   - System events
3. Use "Trigger Scheduled Events" to manually generate recurring tasks

## Agent Decision Format

Agents respond with JSON decisions:

```json
{
  "action": "assign_bed",
  "bed_id": 3
}
```

**Standard Actions:**
- `assign_bed` - Assign bed to patient
- `assign_cleaner` - Assign cleaner to task
- `assign_nurse` - Assign nurse to patient
- `defer` - No resources available, retry later

## Workflow Rules (Backend Enforced)

1. **On admission**: Backend creates `bed_assignment` task for MASTER Agent
2. **After bed assignment**: Backend creates `cleaning` task for CLEANER Agent
3. **After cleaning**: Backend creates `nurse_assignment` task for NURSE Agent
4. **After nurse assignment**: Backend schedules recurring tasks
5. **On discharge**: Backend cancels pending tasks and creates `post_discharge_cleaning`

**Important**: Agents do NOT create tasks. All workflow progression is backend-driven.

## Testing Checklist

- [ ] Admit patient → verify bed assignment
- [ ] Complete pre-admission cleaning → verify nurse assignment
- [ ] Trigger recurring tasks → verify scheduled events
- [ ] Discharge patient → verify post-discharge cleaning
- [ ] Check bed becomes available after final cleaning
- [ ] Verify agent status updates in Admin dashboard

## Troubleshooting

**Agents not picking up tasks:**
- Check Hugging Face Space is running (free tier may sleep)
- Verify `BACKEND_BASE` URL is correct
- Check API keys are valid

**Tasks stuck in pending:**
- Verify agents are polling (check logs)
- Ensure backend is reachable
- Check for available resources (beds, staff)

**Frontend not updating:**
- Check Supabase connection
- Verify environment variables
- Check browser console for errors

## Development Notes

- Agents run on Hugging Face Spaces (may sleep on free tier)
- Backend writes all state changes to database
- Frontend reads directly from Supabase
- Agents communicate only via backend APIs
- No direct database access from agents

## Contributing

This is a prototype/MVP for demonstration purposes. For production use, consider:
- Adding authentication
- Implementing proper error handling
- Adding comprehensive logging
- Setting up monitoring and alerts
- Using persistent agent hosting
- Adding data validation and sanitization

## License

MIT License - See LICENSE file for details

## Acknowledgments

Built with:
- React + Next.js
- FastAPI
- Supabase
- Hugging Face
- Groq/Gemini LLM APIs
- Shadcn UI Components

---

**Team**: Team Temp  
**Version**: 1.0  
**Type**: Bed Turnover Automation Prototype