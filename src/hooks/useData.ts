// Custom React Hooks for Data Fetching
// Supports both Mock and Real Supabase Data
import { useState, useEffect, useCallback } from "react";
import dataService from "@/services/dataService";

// Generic hook for data fetching
export const useData = <T>(
  fetchFunction: () => Promise<{ data: T; error: unknown }>,
  dependencies: unknown[] = [],
) => {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<unknown>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const result = await fetchFunction();
      if (result.error) {
        setError(result.error);
      } else {
        setData(result.data);
        setError(null);
      }
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [fetchFunction]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
};

// Specific hooks for each data type
export const useBeds = () => {
  return useData(
    () => dataService.getBeds() as Promise<{ data: unknown; error: unknown }>,
  );
};

export const useBed = (id: string | null) => {
  return useData(
    () =>
      id
        ? dataService.getBedById(id)
        : Promise.resolve({ data: null, error: null }),
    [id],
  );
};

export const useStaff = (role?: string) => {
  return useData(
    () =>
      dataService.getStaff(role) as Promise<{ data: unknown; error: unknown }>,
  );
};

export const usePatients = () => {
  return useData(
    () =>
      dataService.getPatients() as Promise<{ data: unknown; error: unknown }>,
  );
};

export const usePatient = (id: string | null) => {
  return useData(
    () =>
      id
        ? dataService.getPatientById(id)
        : Promise.resolve({ data: null, error: null }),
    [id],
  );
};

export const useTasks = (filters?: {
  role?: string;
  status?: string;
  assigned_to?: string;
}) => {
  return useData(
    () =>
      dataService.getTasks(filters) as Promise<{
        data: unknown;
        error: unknown;
      }>,
  );
};

export const useAdmissions = () => {
  return useData(
    () =>
      dataService.getAdmissions() as Promise<{ data: unknown; error: unknown }>,
  );
};

export const useEvents = (limit: number = 50) => {
  return useData(
    () =>
      dataService.getEvents(limit) as Promise<{
        data: unknown;
        error: unknown;
      }>,
  );
};

// Hook to get data mode
export const useDataMode = () => {
  const [mode, setMode] = useState(dataService.getDataMode());

  const toggleMode = () => {
    dataService.toggleDataMode();
    setMode(dataService.getDataMode());
  };

  return { mode, toggleMode, isMock: mode === "mock" };
};

// Hook for realtime subscriptions
export const useRealtimeSubscription = (
  table: string,
  callback: (payload: unknown) => void,
) => {
  useEffect(() => {
    const subscription = dataService.subscribeToTable(table, callback);

    return () => {
      if (subscription.unsubscribe) {
        subscription.unsubscribe();
      }
    };
  }, [table, callback]);
};

// Hook for mutations with loading state
export const useMutation = <T, P>(
  mutationFunction: (params: P) => Promise<{ data: T; error: unknown }>,
) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<unknown>(null);

  const mutate = useCallback(
    async (params: P) => {
      setLoading(true);
      setError(null);
      try {
        const result = await mutationFunction(params);
        if (result.error) {
          setError(result.error);
          return { success: false, data: null, error: result.error };
        }
        return { success: true, data: result.data, error: null };
      } catch (err) {
        setError(err);
        return { success: false, data: null, error: err };
      } finally {
        setLoading(false);
      }
    },
    [mutationFunction],
  );

  return { mutate, loading, error };
};

// Specific mutation hooks
export const useCreatePatient = () => {
  return useMutation((params: { patient_name: string }) =>
    dataService.createPatient(params),
  );
};

export const useUpdateBedStatus = () => {
  return useMutation(
    (params: { id: string; status: string }) =>
      dataService.updateBedStatus(params.id, params.status) as Promise<{
        data: unknown;
        error: unknown;
      }>,
  );
};

export const useUpdateTaskStatus = () => {
  return useMutation(
    (params: { id: string; status: string }) =>
      dataService.updateTaskStatus(params.id, params.status) as Promise<{
        data: unknown;
        error: unknown;
      }>,
  );
};

export const useCreateAdmission = () => {
  return useMutation(
    (params: { patient_id: string; bed_id: string }) =>
      dataService.createAdmission(params) as Promise<{
        data: unknown;
        error: unknown;
      }>,
  );
};

export default {
  useData,
  useBeds,
  useBed,
  useStaff,
  usePatients,
  usePatient,
  useTasks,
  useAdmissions,
  useEvents,
  useDataMode,
  useRealtimeSubscription,
  useMutation,
  useCreatePatient,
  useUpdateBedStatus,
  useUpdateTaskStatus,
  useCreateAdmission,
};
