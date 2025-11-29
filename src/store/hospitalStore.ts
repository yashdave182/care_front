import { create } from "zustand";

export interface User {
  id: string;
  email: string;
  role: "admin" | "nurse" | "doctor";
}

export interface Hospital {
  id: string;
  name: string;
  location: string;
  floors: number;
  setup_complete: boolean;
}

export interface Bed {
  id: string;
  bed_number: string;
  floor: number;
  status: "available" | "occupied" | "cleaning" | "icu";
  position: { x: number; y: number; z: number };
  patient?: string;
}

export interface Nurse {
  id: string;
  name: string;
  nurse_id: string;
  specialization: string;
  status: "available" | "busy";
  assignment?: string;
}

export interface Doctor {
  id: string;
  name: string;
  doctor_id: string;
  specialization: string;
  status: "available" | "busy";
  assignment?: string;
}

export interface Emergency {
  id: string;
  emergency_id: string;
  type: string;
  patient_name: string;
  status: string;
  bed?: Bed;
  nurse?: Nurse;
  doctor?: Doctor;
  created_at: string;
}

/**
 * Patient entity used for non-emergency admissions and downstream agent orchestration.
 * Mirrors emerging agent contract while staying simple for the UI.
 */
export interface Patient {
  id: string;
  name?: string; // Actual DB field
  patient_name?: string; // For compatibility with frontend
  age?: number;
  gender?: "male" | "female" | "other" | "unknown";
  phone?: string;
  condition?: string; // e.g. "Cardiac Emergency" or "General Checkup"
  specialty_required?: string;
  severity?: "low" | "medium" | "high" | "critical";
  assigned_bed_id?: string | null;
  assigned_nurse_id?: string | null;
  assigned_doctor_id?: string | null;
  status?: string; // e.g. "admitted", "pre_registered", "discharged"
  admission_time?: string;
  created_at?: string;
  notes?: string;
  reasoning?: string; // optional AI reasoning for assignments
}

interface HospitalStore {
  user: User | null;
  hospital: Hospital | null;
  beds: Bed[];
  nurses: Nurse[];
  doctors: Doctor[];
  emergencies: Emergency[];
  patients: Patient[];
  setUser: (user: User | null) => void;
  setHospital: (hospital: Hospital | null) => void;
  setBeds: (beds: Bed[]) => void;
  setNurses: (nurses: Nurse[]) => void;
  setDoctors: (doctors: Doctor[]) => void;
  setEmergencies: (emergencies: Emergency[]) => void;
  setPatients: (patients: Patient[]) => void;
  addPatient: (patient: Patient) => void;
  updatePatient: (patientId: string, patch: Partial<Patient>) => void;
  removePatient: (patientId: string) => void;
  updateBedStatus: (bedId: string, status: Bed["status"]) => void;
}

export const useHospitalStore = create<HospitalStore>((set) => ({
  user: null,
  hospital: null,
  beds: [],
  nurses: [],
  doctors: [],
  emergencies: [],
  patients: [],
  setUser: (user) => set({ user }),
  setHospital: (hospital) => set({ hospital }),
  setBeds: (beds) => set({ beds }),
  setNurses: (nurses) => set({ nurses }),
  setDoctors: (doctors) => set({ doctors }),
  setEmergencies: (emergencies) => set({ emergencies }),
  setPatients: (patients) => set({ patients }),
  addPatient: (patient) =>
    set((state) => ({
      patients: [patient, ...state.patients],
    })),
  updatePatient: (patientId, patch) =>
    set((state) => ({
      patients: state.patients.map((p) =>
        p.id === patientId ? { ...p, ...patch } : p,
      ),
    })),
  removePatient: (patientId) =>
    set((state) => ({
      patients: state.patients.filter((p) => p.id !== patientId),
    })),
  updateBedStatus: (bedId, status) =>
    set((state) => ({
      beds: state.beds.map((bed) =>
        bed.id === bedId ? { ...bed, status } : bed,
      ),
    })),
}));
