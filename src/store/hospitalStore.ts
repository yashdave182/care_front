import { create } from 'zustand';

export interface User {
  id: string;
  email: string;
  role: 'admin' | 'nurse' | 'doctor';
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
  status: 'available' | 'occupied' | 'cleaning' | 'icu';
  position: { x: number; y: number; z: number };
  patient?: string;
}

export interface Nurse {
  id: string;
  name: string;
  nurse_id: string;
  specialization: string;
  status: 'available' | 'busy';
  assignment?: string;
}

export interface Doctor {
  id: string;
  name: string;
  doctor_id: string;
  specialization: string;
  status: 'available' | 'busy';
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

interface HospitalStore {
  user: User | null;
  hospital: Hospital | null;
  beds: Bed[];
  nurses: Nurse[];
  doctors: Doctor[];
  emergencies: Emergency[];
  setUser: (user: User | null) => void;
  setHospital: (hospital: Hospital | null) => void;
  setBeds: (beds: Bed[]) => void;
  setNurses: (nurses: Nurse[]) => void;
  setDoctors: (doctors: Doctor[]) => void;
  setEmergencies: (emergencies: Emergency[]) => void;
  updateBedStatus: (bedId: string, status: Bed['status']) => void;
}

export const useHospitalStore = create<HospitalStore>((set) => ({
  user: null,
  hospital: null,
  beds: [],
  nurses: [],
  doctors: [],
  emergencies: [],
  setUser: (user) => set({ user }),
  setHospital: (hospital) => set({ hospital }),
  setBeds: (beds) => set({ beds }),
  setNurses: (nurses) => set({ nurses }),
  setDoctors: (doctors) => set({ doctors }),
  setEmergencies: (emergencies) => set({ emergencies }),
  updateBedStatus: (bedId, status) =>
    set((state) => ({
      beds: state.beds.map((bed) =>
        bed.id === bedId ? { ...bed, status } : bed
      ),
    })),
}));