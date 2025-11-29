# CareFlow Nexus - Admin Dashboard Documentation

## Overview

The Admin Dashboard is the comprehensive control center for CareFlow Nexus, providing hospital administrators with complete visibility and control over all hospital operations, resources, staff, patients, and AI agents.

## Access

**URL:** `/admin`

**Credentials:**
- Email: `admin@hospital.com`
- Password: `admin123`

## Features

### 1. Real-Time System Overview

The dashboard displays 6 primary metrics at the top:

#### Beds Management
- **Total Beds:** Complete count of all hospital beds
- **Available Beds:** Real-time availability tracking
- **Occupancy Status:** Visual breakdown by status (available, occupied, ICU, cleaning)

#### Staff Management
- **Nurses:** Total count with availability status
- **Doctors:** Total count with availability status
- **Specialization tracking:** View staff by specialization

#### Emergency & Patient Tracking
- **Active Emergencies:** Real-time emergency count and status
- **Total Patients:** All admitted patients across the hospital

#### AI Agent System
- **Agent Status:** Online/offline status for all AI agents
- **Active Tasks:** Number of tasks currently being processed
- **System Health:** Overall agent system health monitoring

### 2. Quick Navigation Panel

Direct access to all system modules:
- **Agents Hub** - Centralized AI agent management
- **Patients Directory** - Complete patient records
- **Pharmacy** - Medication management and inventory
- **Diagnostics** - Radiology and laboratory services
- **Surgery** - Surgical scheduling and tracking
- **Cleaning** - Facility maintenance and sanitation
- **Copilot** - Natural language command interface
- **Dashboard** - Legacy dashboard view

### 3. Detailed Information Tabs

The dashboard provides 6 comprehensive tabs:

#### Tab 1: Beds
- **Visual Status Overview:** Color-coded status cards
  - Green: Available beds
  - Red: Occupied beds
  - Purple: ICU beds
  - Yellow: Cleaning/maintenance
- **Complete Bed Table:** Sortable table with:
  - Bed number
  - Floor location
  - Current status
  - Assigned patient (if any)
  - 3D position coordinates (x, y, z)

#### Tab 2: Staff
Split view showing both nurses and doctors:

**Nurses Section:**
- Name and ID
- Specialization (General, ICU, Pediatric, ER)
- Current status (available/busy)
- Assignment tracking

**Doctors Section:**
- Name and ID
- Specialization (Cardiology, Neurology, Orthopedics, General Surgery, Pediatrics)
- Current status (available/busy)
- Assignment tracking

#### Tab 3: Emergencies
- **Active Emergency Cards:** Individual cards for each emergency showing:
  - Emergency ID
  - Patient name
  - Emergency type
  - Status badge
  - Timestamp
  - Quick action button to view details
- **No Emergencies State:** Shows success message when no active emergencies

#### Tab 4: Patients
- **Patient Directory Table:**
  - Patient name
  - Age
  - Medical condition
  - Current status (admitted, pre-registered, discharged)
  - Assigned bed
  - Quick view button to access patient details
- **Empty State:** Navigation to patient directory when no patients are registered

#### Tab 5: AI Agents
Real-time monitoring of all AI agents:
- **Pharmacy Agent** - Medication management
- **Diagnostic Agent** - Lab and radiology coordination
- **Surgery Agent** - Surgical workflow management
- **Cleaning Agent** - Facility maintenance
- **Workflow Orchestrator** - Master coordination agent

For each agent, displays:
- Online/busy/offline status with color coding
- Number of active tasks
- Last update timestamp
- Visual status indicator (checkmark, spinner, or X)

#### Tab 6: Analytics

**Resource Utilization Section:**
- Bed Occupancy: Visual progress bar with percentage
- Nurse Utilization: Visual progress bar with percentage
- Doctor Utilization: Visual progress bar with percentage
- AI Agent Availability: Visual progress bar with percentage

**System Health Section:**
- API Gateway status
- Database connection status
- Agent Network operational status
- Monitoring system status

All services show green status badges when operational.

## Visual Design

### Color Coding System

**Status Colors:**
- 🟢 **Green** - Available, Online, Healthy, Success
- 🔴 **Red** - Occupied, Emergency, Critical, Error
- 🟣 **Purple** - ICU, Special Care
- 🟡 **Yellow** - Cleaning, Maintenance, Warning
- 🔵 **Blue** - General Information, Beds
- 🟠 **Orange** - Busy, In Progress
- 🔵 **Cyan** - AI Agents, Technology

### Cards & Components

**Gradient Cards:** Top-level metrics use gradient backgrounds matching their category
- Blue gradients for beds
- Green gradients for nurses
- Purple gradients for doctors
- Red gradients for emergencies
- Orange gradients for patients
- Cyan gradients for AI agents

**Status Badges:** Color-coded badges for quick status identification

**Progress Bars:** Visual representation of utilization percentages

## Responsive Design

The dashboard is fully responsive:
- **Desktop (1280px+):** Full 6-column grid layout
- **Tablet (768px-1279px):** Adaptive 2-3 column layout
- **Mobile (320px-767px):** Single column stack layout

Navigation elements collapse appropriately for mobile devices.

## Data Sources

### Mock Data (Development)
Currently uses mock data generators for:
- 50 beds across 3 floors
- 20 nurses with various specializations
- 15 doctors with various specializations
- Dynamic emergency generation
- Patient records from store

### Production Integration
Connect to backend APIs by:
1. Replacing mock data with API calls to your backend
2. Using the `agentClient` from `@/lib/agents` for agent-related data
3. Integrating with Supabase or your chosen database for real-time updates

## User Actions

### Available Actions:
- **View Details:** Click on any entity to view detailed information
- **Navigate:** Use quick navigation buttons to access specific modules
- **Monitor:** Real-time status updates for all resources
- **Track:** Follow emergency and patient workflows
- **Analyze:** Review utilization and system health metrics

### Planned Actions (Future Enhancements):
- Edit bed assignments
- Reassign staff
- Trigger emergency protocols
- Export reports
- Configure agent parameters
- View historical analytics

## Integration Points

### 1. Agent System Integration
```typescript
import { agentClient } from "@/lib/agents";

// Fetch real agent statuses
const statuses = await agentClient.getAgentStatuses();
```

### 2. Store Integration
```typescript
import { useHospitalStore } from "@/store/hospitalStore";

// Access global state
const { beds, nurses, doctors, emergencies, patients } = useHospitalStore();
```

### 3. Navigation Integration
```typescript
import { useNavigate } from "react-router-dom";

// Navigate to any module
navigate("/patients");
navigate("/agents");
navigate("/pharmacy");
```

## Performance Considerations

1. **Data Pagination:** Tables support scrolling for large datasets
2. **Lazy Loading:** Tab content only renders when active
3. **Optimized Rendering:** Uses React memoization for large lists
4. **Real-time Updates:** Efficient state management with Zustand

## Security

**Admin-Only Access:**
- Role-based access control checks user role
- Only users with `role: "admin"` can access
- Redirects unauthorized users to login

**Session Management:**
- JWT token stored in localStorage
- Automatic logout on session expiry
- Secure API communication

## Accessibility

- **Keyboard Navigation:** Full keyboard support for all interactive elements
- **Screen Reader Support:** ARIA labels and semantic HTML
- **Color Contrast:** WCAG AA compliant color combinations
- **Focus Indicators:** Clear focus states for navigation

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Troubleshooting

### Issue: No data showing
**Solution:** Check that mock data is initializing in the useEffect hook

### Issue: Navigation not working
**Solution:** Verify routes are properly configured in App.tsx

### Issue: Agent status not updating
**Solution:** Implement real-time WebSocket or SSE connection for live updates

### Issue: Performance issues with large datasets
**Solution:** Implement virtual scrolling or pagination for large tables

## Future Enhancements

1. **Real-time Updates:** WebSocket integration for live data streaming
2. **Advanced Analytics:** Charts and graphs for historical trends
3. **Custom Dashboards:** User-configurable widget layout
4. **Notifications:** Real-time alerts for critical events
5. **Export Functionality:** CSV/PDF export for reports
6. **Filter & Search:** Advanced filtering across all data tables
7. **Audit Logs:** Complete activity tracking and history
8. **Multi-hospital Support:** Dashboard for multiple hospital locations
9. **Mobile App:** Native mobile application for on-the-go access
10. **Voice Commands:** Integration with Copilot for voice-controlled dashboard

## API Endpoints (Backend Integration)

When connecting to your backend, implement these endpoints:

```
GET /api/admin/overview - Get dashboard summary
GET /api/admin/beds - Get all beds with status
GET /api/admin/staff/nurses - Get all nurses
GET /api/admin/staff/doctors - Get all doctors
GET /api/admin/emergencies/active - Get active emergencies
GET /api/admin/patients - Get all patients
GET /api/admin/agents/status - Get AI agent statuses
GET /api/admin/analytics - Get utilization metrics
```

## Contributing

When enhancing the admin dashboard:
1. Maintain the existing color coding system
2. Keep components responsive
3. Add proper loading states
4. Include error boundaries
5. Update this documentation

## Support

For issues or questions about the admin dashboard:
- Check the main README.md
- Review the SRS documentation in `docs/SRS.md`
- Contact the development team

---

**Last Updated:** January 2025
**Version:** 1.0.0
**Maintained by:** CareFlow Nexus Development Team