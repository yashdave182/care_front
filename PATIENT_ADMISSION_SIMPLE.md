# Patient Admission - Simplified Guide

## Overview

Admin can now add new patients to the system. Due to the current Supabase schema, the system accepts only the **patient name** and automatically sets the status to **"pending_bed"**.

---

## ✨ What Works Now

- ✅ **Simple Form** - Only patient name required
- ✅ **Auto Status** - Automatically set to "pending_bed"
- ✅ **Real-time Save** - Instantly saved to Supabase
- ✅ **Auto-refresh** - Patient list updates automatically
- ✅ **No Crashes** - Fixed schema mismatch issue

---

## 🚀 How to Use

### Step 1: Access Admin Dashboard
1. Login as **Admin**
2. Navigate to **Admin Dashboard** (`/admin`)

### Step 2: Add Patient
1. Click **"Admit New Patient"** button (blue button, top right)
2. Enter **Patient Name** (e.g., "John Doe")
3. Click **"Admit Patient"**
4. See success notification
5. Patient appears in the list automatically

---

## 📋 Form Fields

### Current Schema (Supabase)

```sql
CREATE TABLE patients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_name TEXT NOT NULL,
  status TEXT DEFAULT 'pending_bed',
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Form Field

| Field | Type | Required | Default |
|-------|------|----------|---------|
| **Patient Name** | Text | ✅ Yes | - |
| **Status** | Text | Auto-set | "pending_bed" |
| **ID** | UUID | Auto-generated | - |
| **Created At** | Timestamp | Auto-generated | - |

---

## 📊 Patient List Display

The Admin Dashboard shows:

| Column | Description |
|--------|-------------|
| **Name** | Patient's full name |
| **Status** | Current status (pending_bed, under_care, etc.) |
| **Created At** | When patient was admitted |
| **Actions** | View button (future) |

---

## 🔄 Workflow After Admission

```
1. Admin enters patient name → Click "Admit Patient"
   ↓
2. Saved to Supabase with status "pending_bed"
   ↓
3. Backend creates bed_assignment task
   ↓
4. MASTER Agent assigns available bed
   ↓
5. CLEANER Agent schedules pre-admission cleaning
   ↓
6. NURSE Agent assigns nurse
   ↓
7. Patient status updates to "under_care"
```

---

## 🎯 Why Simplified?

**Issue**: The original form included many fields (age, gender, phone, blood type, etc.) but the Supabase `patients` table only has 4 columns:
- `id` (auto-generated)
- `patient_name` (required)
- `status` (auto-set)
- `created_at` (auto-generated)

**Solution**: Simplified the form to match the actual database schema. This prevents crashes and errors.

---

## 🔧 Future Enhancements

To add more patient fields, you need to:

### Step 1: Update Supabase Schema

```sql
ALTER TABLE patients
ADD COLUMN age INTEGER,
ADD COLUMN gender TEXT,
ADD COLUMN phone TEXT,
ADD COLUMN condition TEXT,
ADD COLUMN blood_type TEXT,
ADD COLUMN address TEXT,
ADD COLUMN emergency_contact TEXT,
ADD COLUMN allergies TEXT,
ADD COLUMN notes TEXT;
```

### Step 2: Update Form Component

Edit `src/components/PatientAdmissionForm.tsx`:
- Add new fields to `formData` state
- Add new input components
- Update submission data

### Step 3: Update Data Service

Edit `src/services/dataService.ts`:
- Update `createPatient` type to include new fields
- Update `patientData` object to include new fields

### Step 4: Update Display

Edit `src/pages/AdminDashboard.tsx`:
- Add new table columns
- Display new patient fields

---

## ✅ Testing Checklist

- [x] Open Admin Dashboard
- [x] Click "Admit New Patient"
- [x] Enter patient name (e.g., "Jane Smith")
- [x] Submit form
- [x] See success notification
- [x] Patient appears in list with "pending_bed" status
- [x] Refresh page - patient still there (persisted)
- [x] Check Supabase dashboard - record exists
- [x] No crashes or errors

---

## 🐛 Troubleshooting

### Form not opening?
- Check if you're logged in as Admin
- Try refreshing the page

### Patient not appearing?
1. Click the "Refresh" button in Patients tab
2. Check browser console for errors
3. Verify Supabase connection in `.env.local`

### "Unresponsive" error?
- **Fixed!** This was caused by trying to insert fields that don't exist in Supabase
- Current version only sends `patient_name` and `status`

### Mock data mode?
- Check `.env.local`: Set `VITE_USE_MOCK_DATA=false` for real Supabase
- Restart dev server after changing

---

## 📱 Screenshots Flow

1. **Admin Dashboard** → Click "Admit New Patient" button
2. **Dialog Opens** → Simple form with just name field
3. **Enter Name** → Type patient name
4. **Submit** → Click "Admit Patient"
5. **Success** → Toast notification appears
6. **Patient List** → New patient shows in table

---

## 💡 Tips

### Quick Test
```bash
# 1. Start app
npm run dev

# 2. Login as admin
# 3. Click "Admit New Patient"
# 4. Enter: "Test Patient 1"
# 5. Submit
# 6. Check Patients tab - should appear immediately
```

### Verify in Supabase
1. Go to Supabase dashboard
2. Open `patients` table
3. See new row with:
   - `id`: UUID
   - `patient_name`: "Test Patient 1"
   - `status`: "pending_bed"
   - `created_at`: Current timestamp

---

## 🎨 UI Components Used

### PatientAdmissionForm
- **Location**: `src/components/PatientAdmissionForm.tsx`
- **Type**: Dialog-based form
- **Fields**: 1 input (patient name)
- **Validation**: Name required, non-empty

### AdminDashboard Integration
- **Button**: "Admit New Patient" (Quick Actions)
- **Button**: "Add Patient" (Patients tab)
- **Table**: Displays all admitted patients
- **Refresh**: Manual refresh button

---

## 🔒 Current Limitations

1. **No additional fields** - Only name captured
2. **No patient editing** - Can't modify after creation
3. **No patient deletion** - Can't remove patients
4. **No search/filter** - Must scroll to find patients
5. **No validation** - Accepts any text as name

These will be added in future updates!

---

## 📚 Related Files

| File | Purpose |
|------|---------|
| `PatientAdmissionForm.tsx` | The admission form component |
| `dataService.ts` | Handles Supabase operations |
| `useData.ts` | React hooks for data fetching |
| `AdminDashboard.tsx` | Displays patient list |

---

## 🎉 Summary

**Current Implementation:**
- ✅ Simple, working patient admission
- ✅ No crashes or errors
- ✅ Matches Supabase schema exactly
- ✅ Real-time updates
- ✅ Persistent storage

**What Admin Can Do:**
1. Add new patient by name
2. View all patients in table
3. See patient status and creation date
4. Refresh patient list
5. Trigger automated workflow (bed assignment, etc.)

**Benefits:**
- Fast patient onboarding
- No complex forms
- Zero configuration needed
- Works immediately out of the box

---

**Ready to use! Start admitting patients now! 🏥**

---

## Quick Reference

```tsx
// Add a patient
Admin Dashboard → "Admit New Patient" → Enter Name → Submit

// View patients
Admin Dashboard → Patients Tab → See all patients

// Refresh list
Patients Tab → Click "Refresh" button

// Data location
Supabase → patients table → All records
```

**That's it! Simple and working!** ✨