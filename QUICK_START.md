# CareFlow Nexus - Quick Start Guide

Get up and running with CareFlow Nexus in 5 minutes!

---

## 🚀 Quick Setup

### 1. Install Dependencies

```bash
cd CareFlow_Nexus-main
npm install
# or
bun install
```

### 2. Configure Environment

The `.env.local` file is already set up with:
- ✅ Supabase credentials
- ✅ Mock data mode enabled by default

```env
VITE_SUPABASE_URL=https://mlyigztcpkdxqqbmrbit.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGci...
VITE_USE_MOCK_DATA=true  # Start with mock data
```

### 3. Start Development Server

```bash
npm run dev
# or
bun dev
```

Open [http://localhost:5173](http://localhost:5173)

---

## 🎯 First Steps

### Access the Application

1. **Login Page** (`/`)
   - No authentication required for MVP
   - Select a role to continue

2. **Available Dashboards:**
   - `/admin` - Admin Dashboard
   - `/doctor-dashboard` - Doctor Interface
   - `/nurse-dashboard` - Nurse Interface
   - `/cleaning` - Cleaner Interface

### Test the Workflow

#### As Doctor:
1. Navigate to `/doctor-dashboard`
2. Click "Admit Patient"
3. Enter patient name
4. System automatically assigns bed (MASTER Agent)

#### As Admin:
1. Navigate to `/admin`
2. Monitor bed status
3. View agent activity
4. Trigger scheduled events

#### As Cleaner:
1. Navigate to `/cleaning`
2. View cleaning tasks
3. Mark tasks as completed

---

## 🔄 Mock vs Real Data

### Current Mode: MOCK DATA ✅

**Advantages:**
- Works offline
- Instant responses
- No database setup needed
- Perfect for development

**Switch to Real Data:**

1. Open `.env.local`
2. Change: `VITE_USE_MOCK_DATA=false`
3. Restart dev server

Or use the UI toggle in Admin Dashboard!

---

## 📦 Project Structure

```
CareFlow_Nexus-main/
├── src/
│   ├── pages/              # 8 core pages
│   │   ├── AdminDashboard.tsx
│   │   ├── DoctorDashboard.tsx
│   │   ├── NurseDashboard.tsx
│   │   ├── Cleaning.tsx
│   │   └── ...
│   ├── components/         # Reusable components
│   │   ├── DataModeToggle.tsx  # NEW!
│   │   └── ui/
│   ├── services/           # Data layer
│   │   └── dataService.ts      # NEW!
│   ├── hooks/              # React hooks
│   │   └── useData.ts          # NEW!
│   └── store/              # State management
├── .env.local              # Configuration
└── package.json
```

---

## 🛠️ Using the New Data System

### Option 1: React Hooks (Recommended)

```tsx
import { useBeds, usePatients, useStaff } from "@/hooks/useData";

function MyComponent() {
  const { data: beds, loading, error, refetch } = useBeds();
  const { data: patients } = usePatients();
  const { data: nurses } = useStaff("nurse");
  
  if (loading) return <div>Loading...</div>;
  
  return (
    <div>
      <p>Beds: {beds?.length}</p>
      <button onClick={refetch}>Refresh</button>
    </div>
  );
}
```

### Option 2: Direct Service Calls

```tsx
import dataService from "@/services/dataService";

async function loadData() {
  const { data, error } = await dataService.getBeds();
  if (!error) {
    console.log("Beds:", data);
  }
}
```

### Check Data Mode

```tsx
import { useDataMode } from "@/hooks/useData";

function App() {
  const { mode, isMock, toggleMode } = useDataMode();
  
  return (
    <div>
      <p>Mode: {mode}</p>
      {isMock && <Badge>Using Mock Data</Badge>}
      <button onClick={toggleMode}>Switch Mode</button>
    </div>
  );
}
```

---

## 🎨 Add Data Mode Toggle to UI

### Compact Mode (Header)

```tsx
import DataModeToggle from "@/components/DataModeToggle";

<DataModeToggle compact showLabel />
```

### Full Card Mode

```tsx
<DataModeToggle />
```

---

## 📊 Available Data Hooks

```tsx
// Fetching
import {
  useBeds,          // All beds
  useBed,           // Single bed
  useStaff,         // All staff (or by role)
  usePatients,      // All patients
  useTasks,         // Tasks (with filters)
  useAdmissions,    // Admissions
  useEvents,        // Event log
  useDataMode,      // Current data mode
} from "@/hooks/useData";

// Mutations
import {
  useCreatePatient,
  useUpdateBedStatus,
  useUpdateTaskStatus,
  useCreateAdmission,
} from "@/hooks/useData";
```

---

## 🔥 Common Tasks

### Create a Patient

```tsx
const { mutate: createPatient, loading } = useCreatePatient();

const handleSubmit = async () => {
  const result = await createPatient({
    patient_name: "John Doe",
    age: 45,
    condition: "Emergency"
  });
  
  if (result.success) {
    toast.success("Patient created!");
  }
};
```

### Update Bed Status

```tsx
const { mutate: updateBed } = useUpdateBedStatus();

await updateBed({ id: "bed-1", status: "occupied" });
```

### Filter Tasks

```tsx
const { data: pendingTasks } = useTasks({
  status: "pending",
  assigned_to: "nurse-1"
});
```

---

## 🐛 Troubleshooting

### Mock Data Not Working?

1. Check `.env.local`: `VITE_USE_MOCK_DATA=true`
2. Restart dev server
3. Clear browser cache

### Real Data Connection Failed?

1. Verify Supabase credentials in `.env.local`
2. Check Supabase project is active
3. Ensure tables exist (see schema in PDF)

### Build Errors?

```bash
# Clean install
rm -rf node_modules
npm install
npm run dev
```

---

## 📚 Next Steps

1. **Read Full Documentation:**
   - `DATA_MODE_GUIDE.md` - Complete data system guide
   - `README.md` - Project overview
   - `INTEGRATION_EXAMPLE.tsx` - Code examples

2. **Set Up Supabase (for real data):**
   - Create tables from PDF schema
   - Update policies
   - Test connection

3. **Deploy Agents:**
   - Configure Hugging Face Space
   - Add environment variables
   - Test agent polling

4. **Customize:**
   - Modify mock data in `dataService.ts`
   - Add new data fetching hooks
   - Extend UI components

---

## ⚡ Tips

- Start with **mock data** for fast development
- Switch to **real data** for integration testing
- Use the **DataModeToggle** component for easy switching
- Check console logs for mock operations: `[MOCK]`
- Real data mode enables realtime subscriptions

---

## 🎓 Learning Resources

### Mock Data Examples
All mock data is generated in: `src/services/dataService.ts`

### React Hooks
All data hooks are in: `src/hooks/useData.ts`

### Integration Example
Full working example: `INTEGRATION_EXAMPLE.tsx`

---

## ✅ Checklist

- [ ] Dependencies installed
- [ ] Dev server running
- [ ] Can access login page
- [ ] Can navigate to admin dashboard
- [ ] Mock data loading correctly
- [ ] DataModeToggle component visible
- [ ] Can switch between mock and real data

---

## 🚀 You're Ready!

Your CareFlow Nexus instance is now running with:
- ✅ Mock data mode (fast development)
- ✅ Ability to switch to real Supabase data
- ✅ All 4 core modules (Admin, Doctor, Nurse, Cleaner)
- ✅ 3 AI agents ready to connect
- ✅ Flexible data layer

**Start building! 🎉**

---

**Need Help?**
- Check `DATA_MODE_GUIDE.md` for detailed examples
- Review `INTEGRATION_EXAMPLE.tsx` for code patterns
- See `README.md` for architecture overview

**Happy Coding! 💻**