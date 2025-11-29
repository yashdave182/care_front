// Railway Backend API Service
// Connects to the FastAPI backend deployed on Railway
// Base URL: https://careflownexus-production.up.railway.app

import axios, { AxiosError } from 'axios';

const RAILWAY_API_BASE_URL = import.meta.env.VITE_RAILWAY_API_URL || 'https://careflownexus-production.up.railway.app';

// Create axios instance for Railway API
const railwayApi = axios.create({
  baseURL: RAILWAY_API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 second timeout
});

// Request interceptor for logging and error handling
railwayApi.interceptors.request.use(
  (config) => {
    console.log(`[RAILWAY API] ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('[RAILWAY API] Request error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
railwayApi.interceptors.response.use(
  (response) => {
    console.log(`[RAILWAY API] Response ${response.status} from ${response.config.url}`);
    return response;
  },
  (error: AxiosError) => {
    if (error.response) {
      console.error(`[RAILWAY API] Error ${error.response.status}:`, error.response.data);
    } else if (error.request) {
      console.error('[RAILWAY API] No response received:', error.message);
    } else {
      console.error('[RAILWAY API] Request setup error:', error.message);
    }
    return Promise.reject(error);
  }
);

// Types
export interface Patient {
  id?: number;
  name: string;
  status?: string;
  created_at?: string;
}

export interface Bed {
  id: number;
  bed_number: string;
  floor: number;
  status: string;
  type: string;
  created_at?: string;
}

export interface Task {
  id: number;
  type: string;
  target_role?: string;
  agent_role?: string;
  assigned_to?: string | null;
  patient_id?: number | null;
  bed_id?: number | null;
  status: string;
  scheduled_at?: string;
  created_at?: string;
}

export interface AgentTask {
  id: number;
  type: string;
  status: string;
  patient_id?: number;
  bed_id?: number;
  details?: Record<string, unknown>;
}

export interface AdmissionResponse {
  patient_id: number;
  message: string;
  tasks_created?: number;
}

export interface DischargeResponse {
  patient_id: number;
  message: string;
  status: string;
}

// API Service Object
export const railwayApiService = {
  // Root endpoint
  root: async () => {
    const response = await railwayApi.get('/');
    return response.data;
  },

  // Debug endpoint
  debug: async () => {
    const response = await railwayApi.get('/debug/');
    return response.data;
  },

  // ============================================
  // PATIENTS ENDPOINTS
  // ============================================

  patients: {
    // POST /patients/ - Create Patient
    create: async (name: string): Promise<Patient> => {
      const response = await railwayApi.post('/patients/', null, {
        params: { name }
      });
      return response.data;
    },

    // GET /patients/ - List Patients
    list: async (): Promise<Patient[]> => {
      const response = await railwayApi.get('/patients/');
      return response.data;
    },
  },

  // ============================================
  // BEDS ENDPOINTS
  // ============================================

  beds: {
    // GET /beds/ - List Beds
    list: async (): Promise<Bed[]> => {
      const response = await railwayApi.get('/beds/');
      return response.data;
    },

    // GET /beds/available - List Available Beds
    listAvailable: async (): Promise<Bed[]> => {
      const response = await railwayApi.get('/beds/available');
      return response.data;
    },
  },

  // ============================================
  // TASKS ENDPOINTS
  // ============================================

  tasks: {
    // GET /tasks/ - List Tasks
    list: async (): Promise<Task[]> => {
      const response = await railwayApi.get('/tasks/');
      return response.data;
    },

    // POST /tasks/ - Create Task
    create: async (taskData: {
      type: string;
      target_role?: string;
      agent_role?: string;
      patient_id?: number;
      bed_id?: number;
      assigned_to?: string;
      status?: string;
    }): Promise<Task> => {
      const response = await railwayApi.post('/tasks/', taskData);
      return response.data;
    },
  },

  // ============================================
  // ADMISSIONS ENDPOINTS
  // ============================================

  admissions: {
    // POST /admissions/patients/{patient_id}/admit - Admit Patient
    admit: async (patientId: number): Promise<AdmissionResponse> => {
      const response = await railwayApi.post(`/admissions/patients/${patientId}/admit`);
      return response.data;
    },
  },

  // ============================================
  // AGENT ENDPOINTS
  // ============================================

  agent: {
    // GET /agent/tasks - Get Agent Tasks
    getTasks: async (): Promise<AgentTask[]> => {
      const response = await railwayApi.get('/agent/tasks');
      return response.data;
    },

    // POST /agent/tasks/{task_id}/complete - Complete Task
    completeTask: async (taskId: number, result?: Record<string, unknown>): Promise<{ message: string; task_id: number }> => {
      const response = await railwayApi.post(`/agent/tasks/${taskId}/complete`, result || {});
      return response.data;
    },
  },

  // ============================================
  // DISCHARGE ENDPOINTS
  // ============================================

  discharge: {
    // POST /discharge/patients/{patient_id}/request - Request Discharge
    request: async (patientId: number): Promise<DischargeResponse> => {
      const response = await railwayApi.post(`/discharge/patients/${patientId}/request`);
      return response.data;
    },
  },

  // ============================================
  // HEALTH CHECK
  // ============================================

  healthCheck: async (): Promise<{ status: string; message: string }> => {
    try {
      const response = await railwayApi.get('/');
      return {
        status: 'healthy',
        message: 'Railway backend is reachable',
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        message: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  },
};

// Helper function to check if Railway API is configured
export const isRailwayApiConfigured = (): boolean => {
  const url = import.meta.env.VITE_RAILWAY_API_URL;
  return !!url && url !== '';
};

// Helper function to get the Railway API URL
export const getRailwayApiUrl = (): string => {
  return RAILWAY_API_BASE_URL;
};

export default railwayApiService;
