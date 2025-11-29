// INTEGRATION_EXAMPLE.tsx
// Example showing how to integrate the data service into AdminDashboard
// This file demonstrates the pattern - copy relevant parts to your actual AdminDashboard.tsx

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  useBeds,
  useStaff,
  usePatients,
  useTasks,
  useAdmissions,
  useEvents,
  useDataMode,
  useCreatePatient,
  useUpdateBedStatus,
  useUpdateTaskStatus,
} from "@/hooks/useData";
import DataModeToggle from "@/components/DataModeToggle";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Building2,
  LogOut,
  Users,
  Bed,
  Activity,
  AlertCircle,
  Stethoscope,
  Sparkles,
  Clock,
  CheckCircle2,
  XCircle,
  RefreshCw,
} from "lucide-react";
import { toast } from "sonner";

interface AgentStatus {
  agent: string;
  status: "online" | "offline" | "busy";
  tasksActive: number;
  lastUpdate: string;
}

const AdminDashboardExample = () => {
  const navigate = useNavigate();

  // ========================================
  // DATA HOOKS - Replace mock data with these
  // ========================================

  // Fetch data using hooks
  const {
    data: beds,
    loading: bedsLoading,
    error: bedsError,
    refetch: refetchBeds,
  } = useBeds();

  const {
    data: staff,
    loading: staffLoading,
    refetch: refetchStaff,
  } = useStaff();

  const { data: nurses } = useStaff("nurse");
  const { data: doctors } = useStaff("doctor");
  const { data: cleaners } = useStaff("cleaner");

  const {
    data: patients,
    loading: patientsLoading,
    refetch: refetchPatients,
  } = usePatients();

  const { data: tasks, refetch: refetchTasks } = useTasks();
  const { data: pendingTasks } = useTasks({ status: "pending" });

  const { data: admissions } = useAdmissions();
  const { data: events } = useEvents(20);

  // Data mode
  const { mode, isMock, toggleMode } = useDataMode();

  // Mutations
  const { mutate: createPatient, loading: creatingPatient } = useCreatePatient();
  const { mutate: updateBedStatus } = useUpdateBedStatus();
  const { mutate: updateTaskStatus } = useUpdateTaskStatus();

  // ========================================
  // AGENT STATUS (keep as is or fetch from backend)
  // ========================================
  const [agentStatuses, setAgentStatuses] = useState<AgentStatus[]>([
    {
      agent: "MASTER Agent",
      status: "online",
      tasksActive: 2,
      lastUpdate: new Date().toISOString(),
    },
    {
      agent: "NURSE Agent",
      status: "online",
      tasksActive: 3,
      lastUpdate: new Date().toISOString(),
    },
    {
      agent: "CLEANER Agent",
      status: "online",
      tasksActive: 5,
      lastUpdate: new Date().toISOString(),
    },
  ]);

  // ========================================
  // AUTO-REFRESH (only in real data mode)
  // ========================================
  useEffect(() => {
    if (!isMock) {
      const interval = setInterval(() => {
        refetchBeds();
        refetchStaff();
        refetchPatients();
        refetchTasks();
      }, 30000); // Refresh every 30 seconds

      return () => clearInterval(interval);
    }
  }, [isMock, refetchBeds, refetchStaff, refetchPatients, refetchTasks]);

  // ========================================
  // COMPUTED VALUES
  // ========================================
  const availableBeds = beds?.filter((b) => b.status === "available").length || 0;
  const occupiedBeds = beds?.filter((b) => b.status === "occupied").length || 0;
  const cleaningBeds =
    beds?.filter((b) => b.status === "cleaning_in_progress").length || 0;
  const pendingCleaningBeds =
    beds?.filter((b) => b.status === "pending_cleaning").length || 0;

  const availableNurses =
    nurses?.filter((n) => n.available === true).length || 0;
  const availableDoctors =
    doctors?.filter((d) => d.available === true).length || 0;
  const availableCleaners =
    cleaners?.filter((c) => c.available === true).length || 0;

  const totalPatients = patients?.length || 0;
  const activeTasks = tasks?.filter((t) => t.status !== "completed").length || 0;

  const onlineAgents = agentStatuses.filter((a) => a.status === "online").length;
  const totalAgentTasks = agentStatuses.reduce(
    (sum, a) => sum + a.tasksActive,
    0
  );

  // ========================================
  // HANDLERS
  // ========================================
  const handleLogout = () => {
    localStorage.removeItem("token");
    toast.success("Logged out");
    navigate("/");
  };

  const handleRefreshAll = async () => {
    toast.info("Refreshing all data...");
    await Promise.all([
      refetchBeds(),
      refetchStaff(),
      refetchPatients(),
      refetchTasks(),
    ]);
    toast.success("Data refreshed");
  };

  const handleAdmitPatient = async () => {
    const result = await createPatient({
      patient_name: "Test Patient",
      age: 35,
      condition: "General Checkup",
    });

    if (result.success) {
      toast.success("Patient admitted successfully");
      refetchPatients();
    } else {
      toast.error("Failed to admit patient");
    }
  };

  const handleCompleteTask = async (taskId: string) => {
    const result = await updateTaskStatus({ id: taskId, status: "completed" });

    if (result.success) {
      toast.success("Task completed");
      refetchTasks();
    } else {
      toast.error("Failed to update task");
    }
  };

  const handleTriggerScheduledEvents = () => {
    toast.info("Triggering scheduled events...");
    // Call backend API to trigger recurring tasks
    // This would typically be a POST to /api/debug/trigger-schedule
  };

  // ========================================
  // LOADING STATE
  // ========================================
  if (bedsLoading || staffLoading || patientsLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p className="text-lg font-medium">Loading dashboard...</p>
          <p className="text-sm text-muted-foreground">
            Using {isMock ? "mock" : "real"} data
          </p>
        </div>
      </div>
    );
  }

  // ========================================
  // ERROR STATE
  // ========================================
  if (bedsError) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <AlertCircle className="w-5 h-5" />
              Error Loading Data
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              {bedsError.message || "Failed to load dashboard data"}
            </p>
            <div className="space-y-2">
              <Button onClick={handleRefreshAll} className="w-full">
                Retry
              </Button>
              {!isMock && (
                <Button
                  onClick={toggleMode}
                  variant="outline"
                  className="w-full"
                >
                  Switch to Mock Data
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ========================================
  // MAIN RENDER
  // ========================================
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/95 backdrop-blur">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                <Building2 className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">CareFlow Nexus</h1>
                <p className="text-sm text-muted-foreground">Admin Dashboard</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              {/* Data Mode Toggle */}
              <DataModeToggle compact showLabel />

              {/* Refresh Button */}
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefreshAll}
                disabled={isMock}
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </Button>

              {/* Logout */}
              <Button variant="outline" size="sm" onClick={handleLogout}>
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Mock Data Warning */}
      {isMock && (
        <div className="bg-yellow-50 dark:bg-yellow-950 border-y border-yellow-200 dark:border-yellow-800">
          <div className="container mx-auto px-4 py-3">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
              <p className="text-sm text-yellow-900 dark:text-yellow-100">
                <strong>Mock Data Mode Active:</strong> You're viewing sample data.
                Changes won't persist. Switch to real mode for production.
              </p>
              <Button
                onClick={toggleMode}
                size="sm"
                variant="outline"
                className="ml-auto"
              >
                Switch to Real Data
              </Button>
            </div>
          </div>
        </div>
      )}

      <div className="container mx-auto px-4 py-6">
        {/* Statistics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {/* Beds */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Available Beds</p>
                  <p className="text-3xl font-bold">{availableBeds}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {occupiedBeds} occupied, {cleaningBeds} cleaning
                  </p>
                </div>
                <Bed className="w-10 h-10 text-blue-600 dark:text-blue-400" />
              </div>
            </CardContent>
          </Card>

          {/* Staff */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Available Staff</p>
                  <p className="text-3xl font-bold">
                    {availableNurses + availableDoctors + availableCleaners}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {availableNurses}N, {availableDoctors}D, {availableCleaners}C
                  </p>
                </div>
                <Users className="w-10 h-10 text-green-600 dark:text-green-400" />
              </div>
            </CardContent>
          </Card>

          {/* Patients */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Patients</p>
                  <p className="text-3xl font-bold">{totalPatients}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {activeTasks} active tasks
                  </p>
                </div>
                <Stethoscope className="w-10 h-10 text-purple-600 dark:text-purple-400" />
              </div>
            </CardContent>
          </Card>

          {/* Agents */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">AI Agents</p>
                  <p className="text-3xl font-bold">
                    {onlineAgents}/{agentStatuses.length}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {totalAgentTasks} tasks
                  </p>
                </div>
                <Activity className="w-10 h-10 text-cyan-600 dark:text-cyan-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common administrative tasks</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <Button
                variant="outline"
                className="h-auto py-4 flex flex-col gap-2"
                onClick={handleAdmitPatient}
                disabled={creatingPatient}
              >
                <Users className="w-6 h-6" />
                <span className="text-sm">Admit Patient</span>
              </Button>
              <Button
                variant="outline"
                className="h-auto py-4 flex flex-col gap-2"
                onClick={handleTriggerScheduledEvents}
              >
                <Clock className="w-6 h-6" />
                <span className="text-sm">Trigger Events</span>
              </Button>
              <Button
                variant="outline"
                className="h-auto py-4 flex flex-col gap-2"
                onClick={() => navigate("/cleaning")}
              >
                <Sparkles className="w-6 h-6" />
                <span className="text-sm">Cleaning</span>
              </Button>
              <Button
                variant="outline"
                className="h-auto py-4 flex flex-col gap-2"
                onClick={() => navigate("/doctor-dashboard")}
              >
                <Stethoscope className="w-6 h-6" />
                <span className="text-sm">Doctor</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Detailed Tabs */}
        <Tabs defaultValue="beds" className="w-full">
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-5">
            <TabsTrigger value="beds">Beds</TabsTrigger>
            <TabsTrigger value="staff">Staff</TabsTrigger>
            <TabsTrigger value="patients">Patients</TabsTrigger>
            <TabsTrigger value="tasks">Tasks</TabsTrigger>
            <TabsTrigger value="agents">Agents</TabsTrigger>
          </TabsList>

          {/* Beds Tab */}
          <TabsContent value="beds">
            <Card>
              <CardHeader>
                <CardTitle>Bed Status</CardTitle>
                <CardDescription>Complete bed allocation overview</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border max-h-96 overflow-y-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Bed Number</TableHead>
                        <TableHead>Floor</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Type</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {beds?.slice(0, 20).map((bed) => (
                        <TableRow key={bed.id}>
                          <TableCell className="font-medium">
                            {bed.bed_number}
                          </TableCell>
                          <TableCell>{bed.floor}</TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                bed.status === "available"
                                  ? "default"
                                  : bed.status === "occupied"
                                  ? "secondary"
                                  : "outline"
                              }
                            >
                              {bed.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="capitalize">
                            {bed.type || "general"}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Staff Tab */}
          <TabsContent value="staff">
            <Card>
              <CardHeader>
                <CardTitle>Staff Directory</CardTitle>
                <CardDescription>All hospital staff members</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border max-h-96 overflow-y-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {staff?.map((member) => (
                        <TableRow key={member.id}>
                          <TableCell className="font-medium">
                            {member.name}
                          </TableCell>
                          <TableCell className="capitalize">
                            {member.role}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={member.available ? "default" : "secondary"}
                            >
                              {member.available ? "Available" : "Busy"}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Patients Tab */}
          <TabsContent value="patients">
            <Card>
              <CardHeader>
                <CardTitle>Patient List</CardTitle>
                <CardDescription>All registered patients</CardDescription>
              </CardHeader>
              <CardContent>
                {patients && patients.length > 0 ? (
                  <div className="rounded-md border max-h-96 overflow-y-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Age</TableHead>
                          <TableHead>Condition</TableHead>
                          <TableHead>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {patients.map((patient) => (
                          <TableRow key={patient.id}>
                            <TableCell className="font-medium">
                              {patient.patient_name}
                            </TableCell>
                            <TableCell>{patient.age || "-"}</TableCell>
                            <TableCell>{patient.condition || "-"}</TableCell>
                            <TableCell>
                              <Badge variant="outline">{patient.status}</Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    <Users className="w-12 h-12 mx-auto mb-4" />
                    <p>No patients registered</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tasks Tab */}
          <TabsContent value="tasks">
            <Card>
              <CardHeader>
                <CardTitle>Active Tasks</CardTitle>
                <CardDescription>All pending and in-progress tasks</CardDescription>
              </CardHeader>
              <CardContent>
                {tasks && tasks.length > 0 ? (
                  <div className="rounded-md border max-h-96 overflow-y-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Type</TableHead>
                          <TableHead>Assigned To</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {tasks.map((task) => (
                          <TableRow key={task.id}>
                            <TableCell className="font-medium capitalize">
                              {task.type.replace("_", " ")}
                            </TableCell>
                            <TableCell>{task.assigned_to || "Unassigned"}</TableCell>
                            <TableCell>
                              <Badge variant="outline">{task.status}</Badge>
                            </TableCell>
                            <TableCell>
                              {task.status !== "completed" && (
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => handleCompleteTask(task.id)}
                                >
                                  <CheckCircle2 className="w-4 h-4" />
                                </Button>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    <CheckCircle2 className="w-12 h-12 mx-auto mb-4" />
                    <p>No active tasks</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Agents Tab */}
          <TabsContent value="agents">
            <Card>
              <CardHeader>
                <CardTitle>AI Agent Status</CardTitle>
                <CardDescription>Monitor autonomous agent activity</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {agentStatuses.map((agent) => (
                    <Card key={agent.agent}>
                      <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                          <div className="space-y-1">
                            <p className="font-medium">{agent.agent}</p>
                            <div className="flex items-center gap-2">
                              <Badge
                                variant={
                                  agent.status === "online"
                                    ? "default"
                                    : agent.status === "busy"
                                    ? "secondary"
                                    : "destructive"
                                }
                              >
                                {agent.status}
                              </Badge>
                              <span className="text-sm text-muted-foreground">
                                {agent.tasksActive} active tasks
                              </span>
                            </div>
                          </div>
                          <Activity className="w-8 h-8 text-muted-foreground" />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboardExample;
