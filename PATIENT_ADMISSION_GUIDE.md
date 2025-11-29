# Patient Admission Guide - Admin Feature

## Overview

Admins can now add new patients directly through the AdminDashboard. All patient data is automatically saved to Supabase and can be viewed in real-time.

---

## ✨ Features

- **Full Patient Form** - Capture comprehensive patient information
- **Required Fields** - Name and Condition (mandatory)
- **Optional Fields** - Age, gender, phone, address, blood type, allergies, emergency contact, notes
- **Real-time Save** - Instantly saved to Supabase database
- **Mock/Real Mode Support** - Works in both data modes
- **Validation** - Form validation before submission
- **Success Notifications** - Toast notifications on success/failure
- **Auto-refresh** - Patient list updates automatically after admission

---

## 🚀 How to Use

### Method 1: From Admin Dashboard

1. Login as **Admin**
2. Navigate to **Admin Dashboard** (`/admin`)
3. Click **"Admit New Patient"** button (top right of Quick Actions card)
4. Fill in the form:
   - **Required**: Patient Name, Condition
   - **Optional**: All other fields
5. Click **"Admit Patient"**
6. See success message and new patient in the list

### Method 2: From Patients Tab

1. Go to **Admin Dashboard**
2. Click **"Patients"** tab
3. Click **"Add Patient"** button
4. Fill in form and submit

---

## 📋 Form Fields

### Required Fields

| Field | Type | Description |
|-------|------|-------------|
| **Patient Name** | Text | Full name of the patient |
| **Condition** | Textarea | Reason for admission (e.g., Cardiac Arrest, Pneumonia) |

### Optional Fields

| Field | Type | Options/Format |
|-------|------|----------------|
| **Age** | Number | 0-150 |
| **Gender** | Select | Male, Female, Other, Prefer not to say |
| **Phone** | Text | Contact number |
| **Blood Type** | Select | A+, A-, B+, B-, AB+, AB-, O+, O- |
| **Address** | Text | Residential address |
| **Emergency Contact** | Text | Name and phone number |
| **Known Allergies** | Textarea | List of allergies |
| **Additional Notes** | Textarea | Any extra information |

---

## 💾 Data Storage

### Supabase Table: `patients`

```sql
CREATE TABLE patients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_name TEXT NOT NULL,
  age INTEGER,
  gender TEXT,
  phone TEXT,
  address TEXT,
  condition TEXT,
  emergency_contact TEXT,
  blood_type TEXT,
  allergies TEXT,
  notes TEXT,
  status TEXT DEFAULT 'pending_bed',
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Default Status

All newly admitted patients get status: **`pending_bed`**

This indicates they are waiting for bed assignment by the MASTER Agent.

---

## 🔄 Workflow After Admission

```
1. Admin admits patient → Saved to Supabase with status "pending_bed"
2. Backend creates bed_assignment task
3. MASTER Agent assigns available bed
4. CLEANER Agent performs pre-admission cleaning
5. NURSE Agent assigns nurse
6. Patient status updates to "under_care"
```

---

## 🎨 Component Details

### PatientAdmissionForm Component

**Location**: `src/components/PatientAdmissionForm.tsx`

**Props**:
```typescript
interface PatientAdmissionFormProps {
  onSuccess?: () => void;  // Callback after successful admission
  trigger?: React.ReactNode; // Custom trigger button
}
```

**Usage**:
```tsx
import PatientAdmissionForm from "@/components/PatientAdmissionForm";

// Default trigger (full button)
<PatientAdmissionForm onSuccess={refetchPatients} />

// Custom trigger
<PatientAdmissionForm
  onSuccess={refetchPatients}
  trigger={
    <Button size="sm">Add Patient</Button>
  }
/>
```

---

## 🔧 Technical Implementation

### Data Service Layer

**File**: `src/services/dataService.ts`

```typescript
createPatient: async (patient: {
  patient_name: string;
  age?: number;
  condition?: string;
  gender?: string;
  phone?: string;
  address?: string;
  emergency_contact?: string;
  blood_type?: string;
  allergies?: string;
  notes?: string;
}) => {
  // Mock mode
  if (useMockData) {
    console.log("[MOCK] Creating patient:", patient);
    return { data: mockPatient, error: null };
  }

  // Real mode - Save to Supabase
  const { data, error } = await supabase
    .from("patients")
    .insert([{ ...patient, status: "pending_bed" }])
    .select()
    .single();

  return { data, error };
}
```

### React Hook

**File**: `src/hooks/useData.ts`

```typescript
export const useCreatePatient = () => {
  return useMutation((params) => dataService.createPatient(params));
};

// Usage in component
const { mutate: createPatient, loading } = useCreatePatient();

const handleSubmit = async (formData) => {
  const result = await createPatient(formData);
  if (result.success) {
    toast.success("Patient admitted!");
  }
};
```

### AdminDashboard Integration

**File**: `src/pages/AdminDashboard.tsx`

```tsx
import PatientAdmissionForm from "@/components/PatientAdmissionForm";
import { usePatients } from "@/hooks/useData";

const AdminDashboard = () => {
  const { data: realPatients, refetch: refetchPatients } = usePatients();

  return (
    <div>
      {/* Button in header */}
      <PatientAdmissionForm onSuccess={refetchPatients} />
      
      {/* Patient list displays real data */}
      <Table>
        {realPatients?.map(patient => (
          <TableRow key={patient.id}>
            <TableCell>{patient.patient_name}</TableCell>
            <TableCell>{patient.age}</TableCell>
            <TableCell>{patient.condition}</TableCell>
          </TableRow>
        ))}
      </Table>
    </div>
  );
};
```

---

## 🎯 Validation Rules

### Client-Side Validation

1. **Patient Name**: Required, non-empty after trim
2. **Condition**: Required, non-empty after trim
3. **Age**: If provided, must be 0-150
4. **Phone**: No format validation (flexible for international)
5. **All text fields**: Trimmed before submission

### Error Messages

| Error | Message |
|-------|---------|
| Missing name | "Patient name is required" |
| Missing condition | "Condition/Reason for admission is required" |
| Invalid age | "Please enter a valid age" |
| Network error | "Failed to admit patient - Please try again" |

---

## 🔄 Mock vs Real Data Mode

### Mock Data Mode (`VITE_USE_MOCK_DATA=true`)

- Patient data saved to memory
- Appears in list immediately
- **Data resets on page reload**
- Console log: `[MOCK] Creating patient: {...}`

### Real Data Mode (`VITE_USE_MOCK_DATA=false`)

- Patient data saved to Supabase
- **Persists across sessions**
- Real-time updates
- Accessible from any device

**To Switch Modes:**
```env
# .env.local
VITE_USE_MOCK_DATA=false  # Use real Supabase
```

---

## 📊 Viewing Admitted Patients

### In Admin Dashboard

1. Go to **Admin Dashboard**
2. Click **"Patients"** tab
3. See all admitted patients with:
   - Name, Age, Gender
   - Condition, Status
   - Phone, Blood Type
4. Click **"Refresh"** to reload data

### Patient List Features

- **Real-time data** from Supabase
- **Auto-refresh** after new admission
- **Manual refresh** button available
- **Sortable columns** (future)
- **Search/filter** (future)

---

## 🐛 Troubleshooting

### Patient not appearing in list?

**Solution 1**: Click "Refresh" button in Patients tab

**Solution 2**: Check data mode
```typescript
// In browser console
localStorage.getItem("USE_MOCK_DATA")
```

**Solution 3**: Verify Supabase connection
- Check `.env.local` credentials
- Ensure `VITE_USE_MOCK_DATA=false`
- Check browser Network tab for errors

### Form won't submit?

**Check**:
1. Name field is filled
2. Condition field is filled
3. Age is valid number (if provided)
4. Check browser console for errors

### Success message shows but patient not in Supabase?

- You might be in **Mock Mode**
- Switch to Real Mode: `VITE_USE_MOCK_DATA=false`
- Restart dev server

---

## 📱 Mobile Responsive

The form is fully responsive:
- **Desktop**: Two-column layout for optional fields
- **Tablet**: Single column layout
- **Mobile**: Optimized for small screens with scrollable dialog

---

## 🔒 Security Notes

### For Production:

1. **Add authentication** - Verify admin role before showing form
2. **Input sanitization** - Sanitize all text inputs server-side
3. **Rate limiting** - Prevent spam admissions
4. **Field validation** - Add server-side validation
5. **Audit logging** - Log who admitted which patient

### Current Implementation (MVP):

- Basic client-side validation
- No authentication (demo mode)
- Direct Supabase access (via anon key)

---

## 🎨 Customization

### Change Button Style

```tsx
<PatientAdmissionForm
  trigger={
    <Button variant="default" size="lg" className="bg-gradient-to-r from-blue-500 to-purple-500">
      <UserPlus className="w-5 h-5 mr-2" />
      New Admission
    </Button>
  }
/>
```

### Add Custom Success Handler

```tsx
<PatientAdmissionForm
  onSuccess={() => {
    refetchPatients();
    toast.info("Notifying nursing staff...");
    // Trigger additional workflows
  }}
/>
```

### Modify Form Fields

Edit `src/components/PatientAdmissionForm.tsx`:
- Add new fields to `formData` state
- Add new input components
- Update `patientData` object
- Update type definitions

---

## 📝 Example Usage

### Basic Usage

```tsx
import PatientAdmissionForm from "@/components/PatientAdmissionForm";

function MyComponent() {
  return (
    <div>
      <h1>Patient Management</h1>
      <PatientAdmissionForm />
    </div>
  );
}
```

### With Data Refresh

```tsx
import { usePatients } from "@/hooks/useData";
import PatientAdmissionForm from "@/components/PatientAdmissionForm";

function PatientList() {
  const { data: patients, refetch } = usePatients();

  return (
    <div>
      <PatientAdmissionForm onSuccess={refetch} />
      <Table>
        {patients?.map(p => <Row key={p.id} data={p} />)}
      </Table>
    </div>
  );
}
```

---

## ✅ Testing Checklist

- [ ] Open Admin Dashboard
- [ ] Click "Admit New Patient"
- [ ] Fill only required fields → Submit → Success
- [ ] Fill all fields → Submit → Success
- [ ] Submit without name → See error
- [ ] Submit without condition → See error
- [ ] Enter invalid age (999) → See error
- [ ] Submit valid patient → Check Supabase table
- [ ] Refresh patient list → See new patient
- [ ] Switch to mock mode → Still works
- [ ] Page reload → Real data persists, mock resets

---

## 🚀 Next Steps

### Planned Enhancements:

1. **Patient search** - Search by name, condition, phone
2. **Patient details view** - Click to see full details
3. **Edit patient** - Update patient information
4. **Delete patient** - Remove patient records
5. **Bulk import** - CSV import for multiple patients
6. **Patient photos** - Upload patient photo
7. **Medical history** - Track admission history
8. **Discharge workflow** - Complete discharge process

---

## 📚 Related Documentation

- `DATA_MODE_GUIDE.md` - Understanding mock vs real data
- `QUICK_START.md` - Getting started guide
- `ADMIN_ACCESS_SUMMARY.md` - Admin capabilities overview
- `README.md` - Project overview

---

## 🎉 Summary

**Admin Can Now:**
- ✅ Add new patients with comprehensive details
- ✅ Save directly to Supabase database
- ✅ View all patients in real-time
- ✅ Trigger automated workflows (bed assignment, etc.)
- ✅ Work in both mock and real data modes

**Benefits:**
- Fast patient onboarding
- Centralized patient records
- Integration with AI workflow
- Real-time data synchronization

---

**Ready to use! Start admitting patients now! 🏥**