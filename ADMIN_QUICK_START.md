# CareFlow Nexus - Admin Dashboard Quick Start Guide

## 🚀 Quick Access

**URL:** `http://localhost:5173/admin` (development) or `/admin` (production)

**Login Credentials:**
- Email: `admin@hospital.com`
- Password: `admin123`

## 📊 What You Can See

### At a Glance (Top Cards)
1. **Total Beds** - All hospital beds with availability count
2. **Nurses** - Total nurses with availability status
3. **Doctors** - Total doctors with availability status
4. **Active Emergencies** - Real-time emergency tracking
5. **Total Patients** - All admitted patients
6. **AI Agents** - Online agent count with active tasks

### Quick Navigation
Direct buttons to access:
- 🤖 Agents Hub
- 👥 Patients Directory
- 💊 Pharmacy
- 🔬 Diagnostics (Lab & Radiology)
- ✂️ Surgery
- ✨ Cleaning
- 🎯 Copilot (AI Assistant)
- 📊 Dashboard (Legacy View)

### Detailed Tabs

#### 1️⃣ Beds Tab
- See all 50+ beds across all floors
- Color-coded status: Green (available), Red (occupied), Purple (ICU), Yellow (cleaning)
- View bed location and assigned patients
- Real-time occupancy stats

#### 2️⃣ Staff Tab
**Nurses Section:**
- View all 20 nurses
- See specializations (General, ICU, Pediatric, ER)
- Check availability status
- Track assignments

**Doctors Section:**
- View all 15 doctors
- See specializations (Cardiology, Neurology, Orthopedics, Surgery, Pediatrics)
- Check availability status
- Track assignments

#### 3️⃣ Emergencies Tab
- Real-time active emergency tracking
- Emergency ID, type, and patient name
- Timestamp for each emergency
- Quick action buttons
- Shows success message when no emergencies

#### 4️⃣ Patients Tab
- Complete patient directory
- Patient details: name, age, condition, status
- Assigned bed information
- Click to view full patient profile
- Navigate to patient directory when empty

#### 5️⃣ AI Agents Tab
Monitor all 5 AI agents:
- 💊 **Pharmacy Agent** - Medication management (3 active tasks)
- 🔬 **Diagnostic Agent** - Lab coordination (2 active tasks)
- ✂️ **Surgery Agent** - Surgical workflows (1 active task)
- ✨ **Cleaning Agent** - Facility maintenance (5 active tasks)
- 🎯 **Workflow Orchestrator** - Master coordinator (12 active tasks)

Each agent shows:
- Status: Online (green), Busy (orange), Offline (gray)
- Number of active tasks
- Last update time
- Visual indicator (checkmark/spinner/X)

#### 6️⃣ Analytics Tab
**Resource Utilization (Progress Bars):**
- Bed occupancy percentage
- Nurse utilization percentage
- Doctor utilization percentage
- AI agent availability percentage

**System Health (All Green When Operational):**
- ✅ API Gateway: Online
- ✅ Database: Connected
- ✅ Agent Network: Operational
- ✅ Monitoring: Active

## 🎨 Color Coding Guide

| Color | Meaning | Used For |
|-------|---------|----------|
| 🟢 Green | Available/Online/Healthy | Available beds, online agents, healthy systems |
| 🔴 Red | Occupied/Emergency/Critical | Occupied beds, emergencies, alerts |
| 🟣 Purple | ICU/Special Care | ICU beds, critical patients |
| 🟡 Yellow | Cleaning/Maintenance | Beds being cleaned, warnings |
| 🟠 Orange | Busy/In Progress | Busy staff, agents processing tasks |
| 🔵 Blue | Information | General bed info, system data |
| 🔵 Cyan | Technology/AI | AI agents, automation systems |

## 📱 Responsive Design

- **Desktop (1280px+):** Full 6-column layout with all features
- **Tablet (768px-1279px):** 2-3 column adaptive layout
- **Mobile (320px-767px):** Single column stack, optimized for touch

## 🔐 Admin Privileges

As an admin, you have access to:
- ✅ All hospital data and metrics
- ✅ Complete staff directory
- ✅ Full patient records
- ✅ Emergency management
- ✅ AI agent monitoring
- ✅ System health analytics
- ✅ All departmental views (Pharmacy, Diagnostics, Surgery, Cleaning)
- ✅ Copilot command interface
- ✅ Configuration and settings (coming soon)

## 🚦 Quick Actions

1. **View Bed Status:** Click "Beds" tab → See all beds with status
2. **Check Staff Availability:** Click "Staff" tab → View nurses and doctors
3. **Monitor Emergencies:** Click "Emergencies" tab → Track active cases
4. **View All Patients:** Click "Patients" tab → See complete directory
5. **Check AI Agents:** Click "AI Agents" tab → Monitor system health
6. **Analyze Utilization:** Click "Analytics" tab → View resource usage
7. **Navigate Modules:** Use quick navigation buttons → Access any department
8. **View Patient Details:** Click eye icon in patients table → See full profile

## 📈 Key Metrics to Monitor

### Critical (Check Hourly)
- Active emergencies count
- Available beds for new admissions
- AI agent status (all should be online)
- System health indicators

### Important (Check Daily)
- Bed occupancy rate
- Staff utilization rates
- Total patient count
- Agent task loads

### Strategic (Check Weekly)
- Resource utilization trends
- Staff availability patterns
- System performance metrics

## 🔄 Real-Time Updates

Currently uses mock data. For production:
- Connect to backend APIs for live data
- Implement WebSocket/SSE for real-time updates
- Enable push notifications for critical events
- Add auto-refresh intervals

## 🆘 Troubleshooting

**Problem:** Can't see any data
- **Solution:** Mock data initializes on page load. Refresh the page.

**Problem:** Navigation buttons not working
- **Solution:** Check that all routes are active in App.tsx

**Problem:** Can't access admin dashboard
- **Solution:** Login with admin credentials (admin@hospital.com / admin123)

**Problem:** Agent status not updating
- **Solution:** Currently uses static mock data. Connect to backend for live updates.

**Problem:** Performance slow with large data
- **Solution:** Tables support scrolling. For 1000+ records, implement pagination.

## 🔗 Related Documentation

- **Full Admin Dashboard Docs:** `docs/ADMIN_DASHBOARD.md`
- **System Requirements:** `docs/SRS.md`
- **API Integration:** `docs/SRS.md` (Backend Contracts section)
- **Agent System:** `src/lib/agents/`

## 🎯 Next Steps

1. **Explore the Dashboard:** Login and navigate through all tabs
2. **Test Quick Navigation:** Try accessing different modules
3. **Review Analytics:** Check resource utilization metrics
4. **Monitor Agents:** Ensure all AI agents show as online
5. **Check System Health:** Verify all systems show green status

## 💡 Pro Tips

- Use keyboard shortcuts for faster navigation
- Bookmark `/admin` for quick access
- Check "Emergencies" tab first thing when logging in
- Monitor "Analytics" tab to optimize resource allocation
- Use "Copilot" for natural language queries about hospital status
- Click any patient name to view detailed medical records
- Filter staff by specialization to find available experts
- Watch agent task counts to identify bottlenecks

## 🔮 Coming Soon

- [ ] Real-time WebSocket updates
- [ ] Advanced filtering and search
- [ ] Export reports (CSV/PDF)
- [ ] Custom dashboard layouts
- [ ] Push notifications for critical events
- [ ] Historical data and trends
- [ ] Multi-hospital support
- [ ] Mobile native app
- [ ] Voice command integration

---

**Need Help?** Contact the development team or check the full documentation in `docs/ADMIN_DASHBOARD.md`

**Version:** 1.0.0  
**Last Updated:** January 2025