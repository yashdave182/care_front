// Data Service Layer - Supports both Mock and Real Supabase Data
import { supabase } from "@/integrations/supabase/client";

// Use untyped client to bypass schema restrictions
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const supabaseClient = supabase as any;

// Check if we should use mock data
const useMockData = import.meta.env.VITE_USE_MOCK_DATA === "true";

// Log data mode on initialization
console.log(
  `[DATA SERVICE] Mode: ${useMockData ? "MOCK" : "REAL"} | VITE_USE_MOCK_DATA=${import.meta.env.VITE_USE_MOCK_DATA}`,
);
if (useMockData) {
  console.log("[DATA SERVICE] Using mock data - no Supabase connection needed");
} else {
  console.log(
    "[DATA SERVICE] Using real Supabase data",
    import.meta.env.VITE_SUPABASE_URL ? "✓" : "✗ URL missing",
  );
}

// Mock Data Generators
const generateMockBeds = (count: number = 50) => {
  return Array.from({ length: count }, (_, i) => {
    const floor = Math.floor(i / 15) + 1;
    const statuses = [
      "available",
      "occupied",
      "cleaning_in_progress",
      "pending_cleaning",
    ] as const;
    return {
      id: `bed-${i + 1}`,
      bed_number: `B${String(i + 1).padStart(3, "0")}`,
      floor,
      status: statuses[Math.floor(Math.random() * statuses.length)],
      type: i % 10 === 0 ? "icu" : "general",
      created_at: new Date().toISOString(),
    };
  });
};

const generateMockStaff = () => {
  const nurses = Array.from({ length: 20 }, (_, i) => ({
    id: `nurse-${i + 1}`,
    name: `Nurse ${String.fromCharCode(65 + i)}`,
    role: "nurse" as const,
    available: i % 2 === 0,
    created_at: new Date().toISOString(),
  }));

  const doctors = Array.from({ length: 15 }, (_, i) => ({
    id: `doctor-${i + 1}`,
    name: `Dr. ${["Smith", "Johnson", "Williams", "Brown", "Jones"][i % 5]}`,
    role: "doctor" as const,
    available: i % 3 === 0,
    created_at: new Date().toISOString(),
  }));

  const cleaners = Array.from({ length: 10 }, (_, i) => ({
    id: `cleaner-${i + 1}`,
    name: `Cleaner ${String.fromCharCode(65 + i)}`,
    role: "cleaner" as const,
    available: i % 2 === 0,
    created_at: new Date().toISOString(),
  }));

  return [...nurses, ...doctors, ...cleaners];
};

const generateMockPatients = () => {
  return [
    {
      id: "patient-1",
      patient_name: "John Doe",
      age: 45,
      condition: "Cardiac Arrest",
      status: "under_care",
      created_at: new Date(Date.now() - 86400000).toISOString(),
    },
    {
      id: "patient-2",
      patient_name: "Jane Smith",
      age: 32,
      condition: "Severe Trauma",
      status: "under_care",
      created_at: new Date(Date.now() - 172800000).toISOString(),
    },
    {
      id: "patient-3",
      patient_name: "Bob Johnson",
      age: 67,
      condition: "Pneumonia",
      status: "awaiting_cleaning",
      created_at: new Date(Date.now() - 3600000).toISOString(),
    },
  ];
};

const generateMockTasks = () => {
  return [
    {
      id: "task-1",
      type: "cleaning",
      target_role: "HUMAN",
      agent_role: null,
      assigned_to: "cleaner-1",
      patient_id: "patient-1",
      bed_id: "bed-5",
      status: "pending",
      scheduled_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
    },
    {
      id: "task-2",
      type: "nurse_checkup",
      target_role: "HUMAN",
      agent_role: null,
      assigned_to: "nurse-1",
      patient_id: "patient-2",
      bed_id: "bed-10",
      status: "in_progress",
      scheduled_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
    },
  ];
};

const generateMockAdmissions = () => {
  return [
    {
      id: "admission-1",
      patient_id: "patient-1",
      bed_id: "bed-5",
      admitted_at: new Date(Date.now() - 86400000).toISOString(),
      discharged_at: null,
      status: "active",
    },
    {
      id: "admission-2",
      patient_id: "patient-2",
      bed_id: "bed-10",
      admitted_at: new Date(Date.now() - 172800000).toISOString(),
      discharged_at: null,
      status: "active",
    },
  ];
};

// Data Service Functions
export const dataService = {
  // Get data source mode
  getDataMode: () => (useMockData ? "mock" : "real"),

  // Toggle data mode (for runtime switching)
  toggleDataMode: () => {
    const newMode = !useMockData;
    console.log(`Switching to ${newMode ? "mock" : "real"} data mode`);
    // Note: This requires page reload to take effect with current env var approach
    localStorage.setItem("USE_MOCK_DATA", newMode.toString());
    window.location.reload();
  },

  // Beds
  getBeds: async () => {
    if (useMockData) {
      return { data: generateMockBeds(), error: null };
    }

    const { data, error } = await supabaseClient
      .from("beds")
      .select("*")
      .order("bed_number", { ascending: true });

    return { data: data || [], error };
  },

  getBedById: async (id: string) => {
    if (useMockData) {
      const beds = generateMockBeds();
      return { data: beds.find((b) => b.id === id) || null, error: null };
    }

    const { data, error } = await supabaseClient
      .from("beds")
      .select("*")
      .eq("id", id)
      .single();

    return { data, error };
  },

  updateBedStatus: async (id: string, status: string) => {
    if (useMockData) {
      console.log(`[MOCK] Updating bed ${id} status to ${status}`);
      return { data: { id, status }, error: null };
    }

    const { data, error } = await supabaseClient
      .from("beds")
      .update({ status })
      .eq("id", id)
      .select()
      .single();

    return { data, error };
  },

  // Staff
  getStaff: async (role?: string) => {
    if (useMockData) {
      const staff = generateMockStaff();
      return {
        data: role ? staff.filter((s) => s.role === role) : staff,
        error: null,
      };
    }

    let query = supabaseClient.from("staff").select("*");
    if (role) {
      query = query.eq("role", role);
    }

    const { data, error } = await query.order("name", { ascending: true });

    return { data: data || [], error };
  },

  getStaffById: async (id: string) => {
    if (useMockData) {
      const staff = generateMockStaff();
      return { data: staff.find((s) => s.id === id) || null, error: null };
    }

    const { data, error } = await supabaseClient
      .from("staff")
      .select("*")
      .eq("id", id)
      .single();

    return { data, error };
  },

  updateStaffAvailability: async (id: string, available: boolean) => {
    if (useMockData) {
      console.log(`[MOCK] Updating staff ${id} availability to ${available}`);
      return { data: { id, available }, error: null };
    }

    const { data, error } = await supabaseClient
      .from("staff")
      .update({ available })
      .eq("id", id)
      .select()
      .single();

    return { data, error };
  },

  // Patients
  getPatients: async () => {
    if (useMockData) {
      return { data: generateMockPatients(), error: null };
    }

    const { data, error } = await supabaseClient
      .from("patients")
      .select("*")
      .order("created_at", { ascending: false });

    return { data: data || [], error };
  },

  getPatientById: async (id: string) => {
    if (useMockData) {
      const patients = generateMockPatients();
      return { data: patients.find((p) => p.id === id) || null, error: null };
    }

    const { data, error } = await supabaseClient
      .from("patients")
      .select("*")
      .eq("id", id)
      .single();

    return { data, error };
  },

  createPatient: async (patient: { patient_name: string }) => {
    if (useMockData) {
      console.log("[MOCK] Creating patient:", patient);
      return {
        data: {
          id: `patient-${Date.now()}`,
          ...patient,
          status: "pending_bed",
          created_at: new Date().toISOString(),
        },
        error: null,
      };
    }

    try {
      console.log("[SUPABASE] Creating patient:", patient);

      // Check if Supabase is configured
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

      if (!supabaseUrl || !supabaseKey) {
        console.error("[SUPABASE] Configuration missing!");
        console.error("VITE_SUPABASE_URL:", supabaseUrl ? "Set" : "MISSING");
        console.error(
          "VITE_SUPABASE_ANON_KEY:",
          supabaseKey ? "Set" : "MISSING",
        );
        return {
          data: null,
          error: {
            message:
              "Supabase is not configured. Please check your .env.local file.",
            details: "Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY",
          },
        };
      }

      console.log("[SUPABASE] Configuration OK");
      console.log("[SUPABASE] URL:", supabaseUrl);

      // Only send fields that exist in Supabase patients table
      // Based on the actual schema: id, patient_name, status (that's it!)
      const patientData = {
        patient_name: patient.patient_name,
        emergency_type: "General", // Required field - default to "General"
        status: "pending_bed",
      };

      console.log("[SUPABASE] Sending data:", patientData);
      console.log("[SUPABASE] Starting insert operation...");

      const { data, error } = await supabaseClient
        .from("patients")
        .insert([patientData])
        .select()
        .single();

      if (error) {
        console.error("[SUPABASE] Error creating patient:", error);
        console.error("[SUPABASE] Error code:", error.code);
        console.error("[SUPABASE] Error message:", error.message);
        console.error("[SUPABASE] Error details:", error.details);
        console.error("[SUPABASE] Error hint:", error.hint);
        return {
          data: null,
          error: {
            message: error.message || "Failed to create patient in database",
            code: error.code,
            details: error.details,
            hint: error.hint,
          },
        };
      }

      console.log("[SUPABASE] Patient created successfully:", data);
      return { data, error: null };
    } catch (err) {
      console.error("[SUPABASE] Exception while creating patient:", err);
      return {
        data: null,
        error: {
          message:
            err instanceof Error ? err.message : "Unknown error occurred",
          details: err,
        },
      };
    }
  },

  updatePatientStatus: async (id: string, status: string) => {
    if (useMockData) {
      console.log(`[MOCK] Updating patient ${id} status to ${status}`);
      return { data: { id, status }, error: null };
    }

    const { data, error } = await supabaseClient
      .from("patients")
      .update({ status })
      .eq("id", id)
      .select()
      .single();

    return { data, error };
  },

  // Tasks
  getTasks: async (filters?: {
    role?: string;
    status?: string;
    assigned_to?: string;
  }) => {
    if (useMockData) {
      let tasks = generateMockTasks();
      if (filters?.status) {
        tasks = tasks.filter((t) => t.status === filters.status);
      }
      if (filters?.assigned_to) {
        tasks = tasks.filter((t) => t.assigned_to === filters.assigned_to);
      }
      return { data: tasks, error: null };
    }

    let query = supabaseClient.from("tasks").select("*");

    if (filters?.role) {
      query = query.eq("agent_role", filters.role);
    }
    if (filters?.status) {
      query = query.eq("status", filters.status);
    }
    if (filters?.assigned_to) {
      query = query.eq("assigned_to", filters.assigned_to);
    }

    const { data, error } = await query.order("created_at", {
      ascending: false,
    });

    return { data: data || [], error };
  },

  getTaskById: async (id: string) => {
    if (useMockData) {
      const tasks = generateMockTasks();
      return { data: tasks.find((t) => t.id === id) || null, error: null };
    }

    const { data, error } = await supabaseClient
      .from("tasks")
      .select("*")
      .eq("id", id)
      .single();

    return { data, error };
  },

  createTask: async (task: Record<string, unknown>) => {
    if (useMockData) {
      console.log("[MOCK] Creating task:", task);
      return {
        data: {
          id: `task-${Date.now()}`,
          ...task,
          created_at: new Date().toISOString(),
        },
        error: null,
      };
    }

    const { data, error } = await supabaseClient
      .from("tasks")
      .insert([task])
      .select()
      .single();

    return { data, error };
  },

  updateTaskStatus: async (id: string, status: string) => {
    if (useMockData) {
      console.log(`[MOCK] Updating task ${id} status to ${status}`);
      return { data: { id, status }, error: null };
    }

    const { data, error } = await supabaseClient
      .from("tasks")
      .update({ status })
      .eq("id", id)
      .select()
      .single();

    return { data, error };
  },

  // Admissions
  getAdmissions: async () => {
    if (useMockData) {
      return { data: generateMockAdmissions(), error: null };
    }

    const { data, error } = await supabaseClient
      .from("admissions")
      .select("*, patients(*), beds(*)")
      .order("admitted_at", { ascending: false });

    return { data: data || [], error };
  },

  createAdmission: async (admission: {
    patient_id: string;
    bed_id: string;
  }) => {
    if (useMockData) {
      console.log("[MOCK] Creating admission:", admission);
      return {
        data: {
          id: `admission-${Date.now()}`,
          ...admission,
          admitted_at: new Date().toISOString(),
          discharged_at: null,
          status: "active",
        },
        error: null,
      };
    }

    const { data, error } = await supabaseClient
      .from("admissions")
      .insert([{ ...admission, status: "active" }])
      .select()
      .single();

    return { data, error };
  },

  // Events
  getEvents: async (limit: number = 50) => {
    if (useMockData) {
      return {
        data: [
          {
            id: "event-1",
            type: "admission_requested",
            payload: { patient_id: "patient-1" },
            processed: true,
            created_at: new Date(Date.now() - 3600000).toISOString(),
          },
        ],
        error: null,
      };
    }

    const { data, error } = await supabaseClient
      .from("events")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(limit);

    return { data: data || [], error };
  },

  createEvent: async (event: { type: string; payload: unknown }) => {
    if (useMockData) {
      console.log("[MOCK] Creating event:", event);
      return {
        data: {
          id: `event-${Date.now()}`,
          ...event,
          processed: false,
          created_at: new Date().toISOString(),
        },
        error: null,
      };
    }

    const { data, error } = await supabaseClient
      .from("events")
      .insert([{ ...event, processed: false }])
      .select()
      .single();

    return { data, error };
  },

  // Realtime subscriptions (only works with real data)
  subscribeToTable: (table: string, callback: (payload: unknown) => void) => {
    if (useMockData) {
      console.log(`[MOCK] Subscription to ${table} (not active in mock mode)`);
      return { unsubscribe: () => {} };
    }

    const subscription = supabase
      .channel(`${table}-changes`)
      .on("postgres_changes", { event: "*", schema: "public", table }, callback)
      .subscribe();

    return subscription;
  },
};

export default dataService;
