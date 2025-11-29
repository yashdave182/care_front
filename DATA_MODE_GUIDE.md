# Data Mode Guide - Mock vs Real Data

This guide explains how to use the flexible data layer in CareFlow Nexus that supports both mock data (for testing) and real Supabase data (for production).

---

## Overview

CareFlow Nexus includes a **dual-mode data system** that allows you to seamlessly switch between:

1. **Mock Data Mode** - Fast, in-memory data for development and testing
2. **Real Data Mode** - Live Supabase database for production use

---

## Quick Start

### Current Configuration

Your `.env.local` file controls the data mode:

```env
# Set to 'true' for mock data, 'false' for real data
VITE_USE_MOCK_DATA=true
```

### Switching Modes

**Method 1: Environment Variable (Recommended)**

1. Open `.env.local`
2. Change `VITE_USE_MOCK_DATA` to `true` or `false`
3. Restart the dev server

```bash
# Stop the server (Ctrl+C)
npm run dev
# or
bun dev
```

**Method 2: UI Toggle (Runtime)**

Use the `DataModeToggle` component in the Admin Dashboard:

```tsx
import DataModeToggle from "@/components/DataModeToggle";

// In your component
<DataModeToggle />
```

This will show a card with a toggle switch that reloads the page when switched.

---

## Using the Data Service

### Import the Data Service

```tsx
import dataService from "@/services/dataService";
```

### Available Methods

#### Beds

```tsx
// Get all beds
const { data, error } = await dataService.getBeds();

// Get single bed
const { data, error } = await dataService.getBedById("bed-1");

// Update bed status
const { data, error } = await dataService.updateBedStatus("bed-1", "occupied");
```

#### Staff

```tsx
// Get all staff
const { data, error } = await dataService.getStaff();

// Get staff by role
const { data, error } = await dataService.getStaff("nurse");

// Get single staff member
const { data, error } = await dataService.getStaffById("nurse-1");

// Update availability
const { data, error } = await dataService.updateStaffAvailability("nurse-1", true);
```

#### Patients

```tsx
// Get all patients
const { data, error } = await dataService.getPatients();

// Get single patient
const { data, error } = await dataService.getPatientById("patient-1");

// Create new patient
const { data, error } = await dataService.createPatient({
  patient_name: "John Doe",
  age: 45,
  condition: "Cardiac Arrest"
});

// Update patient status
const { data, error } = await dataService.updatePatientStatus("patient-1", "under_care");
```

#### Tasks

```tsx
// Get all tasks
const { data, error } = await dataService.getTasks();

// Get filtered tasks
const { data, error } = await dataService.getTasks({
  status: "pending",
  assigned_to: "nurse-1"
});

// Create task
const { data, error } = await dataService.createTask({
  type: "cleaning",
  bed_id: "bed-5",
  status: "pending"
});

// Update task status
const { data, error } = await dataService.updateTaskStatus("task-1", "completed");
```

---

## Using React Hooks

### Basic Data Fetching

```tsx
import { useBeds, useStaff, usePatients, useTasks } from "@/hooks/useData";

function MyComponent() {
  const { data: beds, loading, error, refetch } = useBeds();
  const { data: nurses } = useStaff("nurse");
  const { data: patients } = usePatients();
  
  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  
  return (
    <div>
      <button onClick={refetch}>Refresh</button>
      {beds?.map(bed => (
        <div key={bed.id}>{bed.bed_number}</div>
      ))}
    </div>
  );
}
```

### Mutations

```tsx
import { useCreatePatient, useUpdateBedStatus } from "@/hooks/useData";

function AdmitPatientForm() {
  const { mutate: createPatient, loading, error } = useCreatePatient();
  const { mutate: updateBedStatus } = useUpdateBedStatus();
  
  const handleSubmit = async (formData) => {
    // Create patient
    const result = await createPatient({
      patient_name: formData.name,
      age: formData.age,
      condition: formData.condition
    });
    
    if (result.success) {
      // Update bed
      await updateBedStatus({
        id: formData.bedId,
        status: "occupied"
      });
    }
  };
  
  return (
    <form onSubmit={handleSubmit}>
      {/* form fields */}
      <button disabled={loading}>
        {loading ? "Admitting..." : "Admit Patient"}
      </button>
    </form>
  );
}
```

### Check Current Data Mode

```tsx
import { useDataMode } from "@/hooks/useData";

function DataModeIndicator() {
  const { mode, isMock, toggleMode } = useDataMode();
  
  return (
    <div>
      <p>Current Mode: {mode}</p>
      {isMock && <Badge>Using Mock Data</Badge>}
      <button onClick={toggleMode}>Switch Mode</button>
    </div>
  );
}
```

### Realtime Subscriptions (Real Data Only)

```tsx
import { useRealtimeSubscription } from "@/hooks/useData";

function RealtimePatients() {
  const [patients, setPatients] = useState([]);
  
  useRealtimeSubscription("patients", (payload) => {
    if (payload.eventType === "INSERT") {
      setPatients(prev => [...prev, payload.new]);
    }
  });
  
  return <div>{/* render patients */}</div>;
}
```

---

## Mock Data vs Real Data

### Mock Data Mode (`VITE_USE_MOCK_DATA=true`)

**Advantages:**
- ✅ No database setup required
- ✅ Instant responses
- ✅ Works offline
- ✅ Perfect for UI development
- ✅ No API rate limits
- ✅ Consistent test data

**Limitations:**
- ❌ Data resets on page reload
- ❌ No persistence
- ❌ No realtime subscriptions
- ❌ Limited to predefined data
- ❌ Can't test actual API integration

**Use Cases:**
- Frontend development
- UI/UX testing
- Demo presentations
- Rapid prototyping

### Real Data Mode (`VITE_USE_MOCK_DATA=false`)

**Advantages:**
- ✅ Persistent data storage
- ✅ Real database operations
- ✅ Realtime subscriptions work
- ✅ Multi-user support
- ✅ Production-ready
- ✅ Full CRUD operations

**Limitations:**
- ❌ Requires Supabase setup
- ❌ Internet connection needed
- ❌ Slower than mock data
- ❌ Subject to API limits
- ❌ Can affect real data

**Use Cases:**
- Production deployment
- Integration testing
- Multi-user scenarios
- Data persistence needs

---

## Mock Data Structure

### Generated Beds (50 beds)

```typescript
{
  id: "bed-1",
  bed_number: "B001",
  floor: 1,
  status: "available" | "occupied" | "cleaning_in_progress" | "pending_cleaning",
  type: "general" | "icu",
  created_at: "2024-..."
}
```

### Generated Staff

**Nurses (20):**
```typescript
{
  id: "nurse-1",
  name: "Nurse A",
  role: "nurse",
  available: true,
  created_at: "2024-..."
}
```

**Doctors (15):**
```typescript
{
  id: "doctor-1",
  name: "Dr. Smith",
  role: "doctor",
  available: true,
  created_at: "2024-..."
}
```

**Cleaners (10):**
```typescript
{
  id: "cleaner-1",
  name: "Cleaner A",
  role: "cleaner",
  available: true,
  created_at: "2024-..."
}
```

### Sample Patients (3)

```typescript
{
  id: "patient-1",
  patient_name: "John Doe",
  age: 45,
  condition: "Cardiac Arrest",
  status: "under_care",
  created_at: "2024-..."
}
```

---

## Adding the Data Mode Toggle to UI

### Compact Mode (Header)

```tsx
import DataModeToggle from "@/components/DataModeToggle";

function Header() {
  return (
    <header>
      <h1>CareFlow Nexus</h1>
      <DataModeToggle compact showLabel />
    </header>
  );
}
```

### Full Card Mode (Settings)

```tsx
import DataModeToggle from "@/components/DataModeToggle";

function SettingsPage() {
  return (
    <div>
      <h1>Settings</h1>
      <DataModeToggle />
    </div>
  );
}
```

---

## Integration Example: Admin Dashboard

```tsx
import { useEffect } from "react";
import { useBeds, useStaff, usePatients, useDataMode } from "@/hooks/useData";
import DataModeToggle from "@/components/DataModeToggle";

const AdminDashboard = () => {
  const { data: beds, loading: bedsLoading, refetch: refetchBeds } = useBeds();
  const { data: staff } = useStaff();
  const { data: patients } = usePatients();
  const { isMock } = useDataMode();
  
  // Auto-refresh every 30 seconds (only in real mode)
  useEffect(() => {
    if (!isMock) {
      const interval = setInterval(() => {
        refetchBeds();
      }, 30000);
      return () => clearInterval(interval);
    }
  }, [isMock, refetchBeds]);
  
  return (
    <div>
      <header>
        <h1>Admin Dashboard</h1>
        <DataModeToggle compact showLabel />
      </header>
      
      {isMock && (
        <div className="bg-yellow-100 p-4 rounded">
          ⚠️ Currently using mock data. Switch to real mode for production.
        </div>
      )}
      
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardHeader>Beds</CardHeader>
          <CardContent>
            {bedsLoading ? "Loading..." : `${beds?.length} beds`}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>Staff</CardHeader>
          <CardContent>{staff?.length} staff members</CardContent>
        </Card>
        
        <Card>
          <CardHeader>Patients</CardHeader>
          <CardContent>{patients?.length} patients</CardContent>
        </Card>
      </div>
    </div>
  );
};
```

---

## Best Practices

### 1. Development Workflow

```bash
# Start with mock data
VITE_USE_MOCK_DATA=true

# Develop UI and interactions
npm run dev

# Switch to real data for testing
VITE_USE_MOCK_DATA=false

# Test with real database
# Then deploy
```

### 2. Error Handling

Always handle both mock and real data errors:

```tsx
const { data, loading, error } = useBeds();

if (loading) {
  return <Spinner />;
}

if (error) {
  return (
    <Alert variant="destructive">
      <AlertTitle>Error loading beds</AlertTitle>
      <AlertDescription>
        {error.message || "Failed to fetch data"}
      </AlertDescription>
    </Alert>
  );
}

return <BedList beds={data} />;
```

### 3. Console Logging

Mock operations log to console:

```
[MOCK] Creating patient: { patient_name: "John Doe", ... }
[MOCK] Updating bed bed-1 status to occupied
[MOCK] Subscription to tasks (not active in mock mode)
```

### 4. Testing Both Modes

```tsx
describe("PatientList", () => {
  it("works with mock data", async () => {
    process.env.VITE_USE_MOCK_DATA = "true";
    // test with mock
  });
  
  it("works with real data", async () => {
    process.env.VITE_USE_MOCK_DATA = "false";
    // test with real Supabase
  });
});
```

---

## Troubleshooting

### Mock Data Not Working

1. Check `.env.local`:
   ```env
   VITE_USE_MOCK_DATA=true
   ```

2. Restart dev server after changing env vars

3. Clear browser cache and localStorage

### Real Data Not Connecting

1. Verify Supabase credentials in `.env.local`:
   ```env
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key
   ```

2. Check Supabase project is active

3. Verify tables exist in Supabase dashboard

4. Check browser console for errors

### Data Not Updating

1. **Mock Mode**: Data resets on page reload (expected)

2. **Real Mode**: Check Supabase connection and permissions

3. Force refetch:
   ```tsx
   const { refetch } = useBeds();
   await refetch();
   ```

### Toggle Not Working

1. Check if `DataModeToggle` is imported correctly

2. Verify localStorage is available

3. Page should reload automatically after toggle

---

## Environment Variables Reference

```env
# Data Mode
VITE_USE_MOCK_DATA=true          # 'true' for mock, 'false' for real

# Supabase (required for real data mode)
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJxxx...

# Backend API (for agents)
VITE_BACKEND_URL=http://localhost:8000

# Polling interval (milliseconds)
VITE_POLL_INTERVAL=5000
```

---

## Migration from Mock to Real

### Step 1: Set Up Supabase Tables

Run the SQL schema from the PDF specification:

```sql
CREATE TABLE beds (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  bed_number TEXT NOT NULL,
  status TEXT NOT NULL,
  type TEXT,
  floor INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add other tables (patients, staff, tasks, admissions, events)
```

### Step 2: Switch Environment

```env
VITE_USE_MOCK_DATA=false
```

### Step 3: Test Basic Operations

1. Load page - should fetch empty arrays (no error)
2. Create a patient
3. Verify in Supabase dashboard
4. Create admission
5. Test realtime updates

### Step 4: Seed Initial Data (Optional)

Use Supabase SQL editor or create a seed script:

```tsx
// seed.ts
import dataService from "@/services/dataService";

async function seedDatabase() {
  // Create beds
  for (let i = 1; i <= 50; i++) {
    await dataService.createBed({
      bed_number: `B${String(i).padStart(3, '0')}`,
      status: 'available',
      type: 'general',
      floor: Math.floor(i / 15) + 1
    });
  }
  
  // Create staff...
  // Create sample patients...
}
```

---

## Summary

- ✅ **Mock Mode**: Fast, offline, perfect for development
- ✅ **Real Mode**: Production-ready with Supabase
- ✅ **Easy Toggle**: Switch anytime via env var or UI
- ✅ **Same API**: Code works identically in both modes
- ✅ **Flexible**: Use mock for testing, real for production

**Recommended Approach:**
1. Develop with mock data
2. Test UI and workflows
3. Switch to real data for integration testing
4. Deploy with real data mode

---

For more information, see:
- `src/services/dataService.ts` - Data service implementation
- `src/hooks/useData.ts` - React hooks
- `src/components/DataModeToggle.tsx` - Toggle component
- `.env.local` - Configuration file