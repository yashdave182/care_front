import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useHospitalStore } from "@/store/hospitalStore";
import { agentClient } from "@/lib/agents";
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
  UserCheck,
  Sparkles,
  Clock,
  CheckCircle2,
  XCircle,
  Loader2,
  ArrowRight,
  Eye,
} from "lucide-react";
import PatientAdmissionForm from "@/components/PatientAdmissionForm";
import { usePatients } from "@/hooks/useData";
import { Patient } from "@/store/hospitalStore";

interface AgentStatus {
  agent: string;
  status: "online" | "offline" | "busy";
  tasksActive: number;
  lastUpdate: string;
}

const AdminDashboard = () => {
  const navigate = useNavigate();
  const {
    user,
    hospital,
    beds,
    nurses,
    doctors,
    emergencies,
    patients,
    setBeds,
    setNurses,
    setDoctors,
    setEmergencies,
  } = useHospitalStore();

  // Fetch real patients from Supabase
  const { data: realPatients, refetch: refetchPatients } = usePatients();

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

  const [isLoadingData, setIsLoadingData] = useState(false);

  useEffect(() => {
    // Initialize mock data if not present
    if (beds.length === 0) {
      const mockBeds = Array.from({ length: 50 }, (_, i) => {
        const floor = Math.floor(i / 15) + 1;
        const x = (i % 5) * 2;
        const z = Math.floor((i % 15) / 5) * 2;
        const statuses = ["available", "occupied", "cleaning", "icu"] as const;

        return {
          id: `bed-${i + 1}`,
          bed_number: `B${String(i + 1).padStart(3, "0")}`,
          floor,
          status: statuses[Math.floor(Math.random() * statuses.length)],
          position: { x, y: floor * 3, z },
          patient: i % 3 === 0 ? `Patient ${i}` : undefined,
        };
      });
      setBeds(mockBeds);
    }

    if (nurses.length === 0) {
      const mockNurses = Array.from({ length: 20 }, (_, i) => ({
        id: `nurse-${i + 1}`,
        name: `Nurse ${String.fromCharCode(65 + i)}`,
        nurse_id: `N${String(i + 1).padStart(3, "0")}`,
        specialization: ["General", "ICU", "Pediatric", "ER"][i % 4],
        status: (i % 2 === 0 ? "available" : "busy") as "available" | "busy",
        assignment: i % 2 === 0 ? undefined : `Patient ${i}`,
      }));
      setNurses(mockNurses);
    }

    if (doctors.length === 0) {
      const mockDoctors = Array.from({ length: 15 }, (_, i) => ({
        id: `doctor-${i + 1}`,
        name: `Dr. ${["Smith", "Johnson", "Williams", "Brown", "Jones"][i % 5]}`,
        doctor_id: `D${String(i + 1).padStart(3, "0")}`,
        specialization: [
          "Cardiology",
          "Neurology",
          "Orthopedics",
          "General Surgery",
          "Pediatrics",
        ][i % 5],
        status: (i % 3 === 0 ? "available" : "busy") as "available" | "busy",
        assignment: i % 3 === 0 ? undefined : `Patient ${i}`,
      }));
      setDoctors(mockDoctors);
    }

    if (emergencies.length === 0) {
      const mockEmergencies = [
        {
          id: "emr-001",
          emergency_id: "EMR-001",
          type: "Cardiac Arrest",
          patient_name: "John Doe",
          status: "active",
          created_at: new Date(Date.now() - 300000).toISOString(),
        },
        {
          id: "emr-002",
          emergency_id: "EMR-002",
          type: "Severe Trauma",
          patient_name: "Jane Smith",
          status: "active",
          created_at: new Date(Date.now() - 600000).toISOString(),
        },
      ];
      setEmergencies(mockEmergencies);
    }
  }, [
    beds,
    nurses,
    doctors,
    emergencies,
    setBeds,
    setNurses,
    setDoctors,
    setEmergencies,
  ]);

  const handleLogout = () => {
    navigate("/");
  };

  const availableBeds = beds.filter((b) => b.status === "available").length;
  const occupiedBeds = beds.filter((b) => b.status === "occupied").length;
  const icuBeds = beds.filter((b) => b.status === "icu").length;
  const cleaningBeds = beds.filter((b) => b.status === "cleaning").length;

  const availableNurses = nurses.filter((n) => n.status === "available").length;
  const busyNurses = nurses.filter((n) => n.status === "busy").length;

  const availableDoctors = doctors.filter(
    (d) => d.status === "available",
  ).length;
  const busyDoctors = doctors.filter((d) => d.status === "busy").length;

  const activeEmergencies = emergencies.filter(
    (e) => e.status === "active",
  ).length;
  const totalPatients = patients.length;

  const onlineAgents = agentStatuses.filter(
    (a) => a.status === "online",
  ).length;
  const totalTasks = agentStatuses.reduce((sum, a) => sum + a.tasksActive, 0);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card shadow-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <Building2 className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-bold">
                CareFlow Nexus - Admin Control Center
              </h1>
              <p className="text-sm text-muted-foreground">
                {hospital?.name || "Hospital"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Badge
              variant="outline"
              className="bg-primary/10 text-primary border-primary"
            >
              <Users className="w-3 h-3 mr-1" />
              Admin Access
            </Badge>
            <span className="text-sm text-muted-foreground hidden sm:block">
              {user?.email}
            </span>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Quick Stats Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 border-blue-200 dark:border-blue-800">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Beds</p>
                  <p className="text-3xl font-bold">{beds.length}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {availableBeds} available
                  </p>
                </div>
                <Bed className="w-10 h-10 text-blue-600 dark:text-blue-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 border-green-200 dark:border-green-800">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Nurses</p>
                  <p className="text-3xl font-bold">{nurses.length}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {availableNurses} available
                  </p>
                </div>
                <UserCheck className="w-10 h-10 text-green-600 dark:text-green-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900 border-purple-200 dark:border-purple-800">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Doctors</p>
                  <p className="text-3xl font-bold">{doctors.length}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {availableDoctors} available
                  </p>
                </div>
                <Stethoscope className="w-10 h-10 text-purple-600 dark:text-purple-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-950 dark:to-red-900 border-red-200 dark:border-red-800">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Emergencies</p>
                  <p className="text-3xl font-bold">{activeEmergencies}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Active now
                  </p>
                </div>
                <AlertCircle className="w-10 h-10 text-red-600 dark:text-red-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950 dark:to-orange-900 border-orange-200 dark:border-orange-800">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Patients</p>
                  <p className="text-3xl font-bold">{totalPatients}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Total admitted
                  </p>
                </div>
                <Users className="w-10 h-10 text-orange-600 dark:text-orange-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-cyan-50 to-cyan-100 dark:from-cyan-950 dark:to-cyan-900 border-cyan-200 dark:border-cyan-800">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">AI Agents</p>
                  <p className="text-3xl font-bold">
                    {onlineAgents}/{agentStatuses.length}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {totalTasks} tasks
                  </p>
                </div>
                <Activity className="w-10 h-10 text-cyan-600 dark:text-cyan-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <ArrowRight className="w-5 h-5" />
                  Quick Actions
                </CardTitle>
                <CardDescription>Common administrative tasks</CardDescription>
              </div>
              <PatientAdmissionForm onSuccess={refetchPatients} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
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
              <Button
                variant="outline"
                className="h-auto py-4 flex flex-col gap-2"
                onClick={() => navigate("/nurse-dashboard")}
              >
                <Users className="w-6 h-6" />
                <span className="text-sm">Nurse</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Detailed Information Tabs */}
        <Tabs defaultValue="beds" className="w-full">
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 lg:grid-cols-6">
            <TabsTrigger value="beds">Beds</TabsTrigger>
            <TabsTrigger value="staff">Staff</TabsTrigger>
            <TabsTrigger value="emergencies">Emergencies</TabsTrigger>
            <TabsTrigger value="patients">Patients</TabsTrigger>
            <TabsTrigger value="agents">AI Agents</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          {/* Beds Tab */}
          <TabsContent value="beds" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Bed Status Overview</CardTitle>
                <CardDescription>
                  Complete bed allocation and status
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                  <div className="p-4 bg-green-50 dark:bg-green-950 rounded-lg border border-green-200 dark:border-green-800">
                    <p className="text-sm text-muted-foreground">Available</p>
                    <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                      {availableBeds}
                    </p>
                  </div>
                  <div className="p-4 bg-red-50 dark:bg-red-950 rounded-lg border border-red-200 dark:border-red-800">
                    <p className="text-sm text-muted-foreground">Occupied</p>
                    <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                      {occupiedBeds}
                    </p>
                  </div>
                  <div className="p-4 bg-purple-50 dark:bg-purple-950 rounded-lg border border-purple-200 dark:border-purple-800">
                    <p className="text-sm text-muted-foreground">ICU</p>
                    <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                      {icuBeds}
                    </p>
                  </div>
                  <div className="p-4 bg-yellow-50 dark:bg-yellow-950 rounded-lg border border-yellow-200 dark:border-yellow-800">
                    <p className="text-sm text-muted-foreground">Cleaning</p>
                    <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                      {cleaningBeds}
                    </p>
                  </div>
                </div>

                <div className="rounded-md border max-h-96 overflow-y-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Bed Number</TableHead>
                        <TableHead>Floor</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Patient</TableHead>
                        <TableHead>Position</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {beds.map((bed) => (
                        <TableRow key={bed.id}>
                          <TableCell className="font-medium">
                            {bed.bed_number}
                          </TableCell>
                          <TableCell>Floor {bed.floor}</TableCell>
                          <TableCell>
                            <Badge
                              variant="outline"
                              className={
                                bed.status === "available"
                                  ? "bg-green-50 text-green-700 border-green-200 dark:bg-green-950 dark:text-green-400"
                                  : bed.status === "occupied"
                                    ? "bg-red-50 text-red-700 border-red-200 dark:bg-red-950 dark:text-red-400"
                                    : bed.status === "icu"
                                      ? "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950 dark:text-purple-400"
                                      : "bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-950 dark:text-yellow-400"
                              }
                            >
                              {bed.status}
                            </Badge>
                          </TableCell>
                          <TableCell>{bed.patient || "-"}</TableCell>
                          <TableCell className="text-muted-foreground text-sm">
                            ({bed.position.x}, {bed.position.y},{" "}
                            {bed.position.z})
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
          <TabsContent value="staff" className="space-y-4">
            <div className="grid gap-4 lg:grid-cols-2">
              {/* Nurses */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <UserCheck className="w-5 h-5" />
                    Nurses ({nurses.length})
                  </CardTitle>
                  <CardDescription>
                    {availableNurses} available, {busyNurses} busy
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="rounded-md border max-h-96 overflow-y-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>ID</TableHead>
                          <TableHead>Specialization</TableHead>
                          <TableHead>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {nurses.map((nurse) => (
                          <TableRow key={nurse.id}>
                            <TableCell className="font-medium">
                              {nurse.name}
                            </TableCell>
                            <TableCell>{nurse.nurse_id}</TableCell>
                            <TableCell>{nurse.specialization}</TableCell>
                            <TableCell>
                              <Badge
                                variant="outline"
                                className={
                                  nurse.status === "available"
                                    ? "bg-green-50 text-green-700 border-green-200 dark:bg-green-950 dark:text-green-400"
                                    : "bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950 dark:text-orange-400"
                                }
                              >
                                {nurse.status}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>

              {/* Doctors */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Stethoscope className="w-5 h-5" />
                    Doctors ({doctors.length})
                  </CardTitle>
                  <CardDescription>
                    {availableDoctors} available, {busyDoctors} busy
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="rounded-md border max-h-96 overflow-y-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>ID</TableHead>
                          <TableHead>Specialization</TableHead>
                          <TableHead>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {doctors.map((doctor) => (
                          <TableRow key={doctor.id}>
                            <TableCell className="font-medium">
                              {doctor.name}
                            </TableCell>
                            <TableCell>{doctor.doctor_id}</TableCell>
                            <TableCell>{doctor.specialization}</TableCell>
                            <TableCell>
                              <Badge
                                variant="outline"
                                className={
                                  doctor.status === "available"
                                    ? "bg-green-50 text-green-700 border-green-200 dark:bg-green-950 dark:text-green-400"
                                    : "bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950 dark:text-orange-400"
                                }
                              >
                                {doctor.status}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Emergencies Tab */}
          <TabsContent value="emergencies" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-red-600" />
                  Active Emergencies
                </CardTitle>
                <CardDescription>Real-time emergency tracking</CardDescription>
              </CardHeader>
              <CardContent>
                {emergencies.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <CheckCircle2 className="w-12 h-12 mx-auto mb-4 text-green-500" />
                    <p>No active emergencies</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {emergencies.map((emergency) => (
                      <Card
                        key={emergency.id}
                        className="border-red-200 dark:border-red-800"
                      >
                        <CardContent className="pt-6">
                          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                            <div className="space-y-2">
                              <div className="flex items-center gap-2">
                                <Badge className="bg-red-600 text-white">
                                  {emergency.emergency_id}
                                </Badge>
                                <Badge variant="outline">
                                  {emergency.status}
                                </Badge>
                              </div>
                              <h3 className="font-semibold text-lg">
                                {emergency.patient_name}
                              </h3>
                              <p className="text-muted-foreground">
                                {emergency.type}
                              </p>
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Clock className="w-4 h-4" />
                                {new Date(
                                  emergency.created_at,
                                ).toLocaleString()}
                              </div>
                            </div>
                            <Button variant="outline" size="sm">
                              <Eye className="w-4 h-4 mr-2" />
                              View Details
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Patients Tab */}
          <TabsContent value="patients" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="w-5 h-5" />
                      All Patients (
                      {(realPatients && (realPatients as unknown[]).length) ||
                        totalPatients}
                      )
                    </CardTitle>
                  </div>
                  <PatientAdmissionForm
                    onSuccess={refetchPatients}
                    trigger={
                      <Button size="sm" variant="outline">
                        <Users className="w-4 h-4 mr-2" />
                        Add Patient
                      </Button>
                    }
                  />
                </div>
                <CardDescription>Complete patient directory</CardDescription>
              </CardHeader>
              <CardContent>
                {/* Use real patients if available, fallback to store patients */}
                {(
                  ((realPatients && (realPatients as unknown[]).length > 0
                    ? realPatients
                    : patients) as Patient[]) || []
                ).length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <Users className="w-12 h-12 mx-auto mb-4" />
                    <p>No patients registered</p>
                    <div className="mt-4 space-y-2">
                      <p className="text-sm">
                        Click "Admit New Patient" above to add your first
                        patient
                      </p>
                      <Button
                        onClick={refetchPatients}
                        variant="outline"
                        size="sm"
                      >
                        Refresh Patient List
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="mb-4 flex justify-end">
                      <Button
                        onClick={refetchPatients}
                        variant="outline"
                        size="sm"
                      >
                        <ArrowRight className="w-4 h-4 mr-2" />
                        Refresh
                      </Button>
                    </div>
                    <div className="rounded-md border max-h-96 overflow-y-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Created At</TableHead>
                            <TableHead>Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {(
                            (realPatients &&
                            (realPatients as unknown[]).length > 0
                              ? realPatients
                              : patients) as Patient[]
                          ).map((patient: Patient) => (
                            <TableRow key={patient.id}>
                              <TableCell className="font-medium">
                                {patient.name || patient.patient_name}
                              </TableCell>
                              <TableCell>
                                <Badge variant="outline">
                                  {patient.status || "pending_bed"}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-sm text-muted-foreground">
                                {patient.created_at
                                  ? new Date(
                                      patient.created_at,
                                    ).toLocaleString()
                                  : "-"}
                              </TableCell>
                              <TableCell>
                                <Button variant="ghost" size="sm">
                                  <Eye className="w-4 h-4" />
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* AI Agents Tab */}
          <TabsContent value="agents" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5" />
                  AI Agent System Status
                </CardTitle>
                <CardDescription>
                  {onlineAgents}/{agentStatuses.length} agents online,{" "}
                  {totalTasks} active tasks
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {agentStatuses.map((agent, idx) => (
                    <Card
                      key={idx}
                      className="border-cyan-200 dark:border-cyan-800"
                    >
                      <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold">{agent.agent}</h3>
                              <Badge
                                variant="outline"
                                className={
                                  agent.status === "online"
                                    ? "bg-green-50 text-green-700 border-green-200 dark:bg-green-950 dark:text-green-400"
                                    : agent.status === "busy"
                                      ? "bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950 dark:text-orange-400"
                                      : "bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-950 dark:text-gray-400"
                                }
                              >
                                {agent.status}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {agent.tasksActive} active tasks
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Last update:{" "}
                              {new Date(agent.lastUpdate).toLocaleTimeString()}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            {agent.status === "online" ? (
                              <CheckCircle2 className="w-8 h-8 text-green-600 dark:text-green-400" />
                            ) : agent.status === "busy" ? (
                              <Loader2 className="w-8 h-8 text-orange-600 dark:text-orange-400 animate-spin" />
                            ) : (
                              <XCircle className="w-8 h-8 text-gray-600 dark:text-gray-400" />
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
                <div className="mt-6">
                  <p className="text-center text-sm text-muted-foreground">
                    AI Agents running autonomously
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-4">
            <div className="grid gap-4 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="w-5 h-5" />
                    Resource Utilization
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Bed Occupancy</span>
                      <span className="font-semibold">
                        {Math.round(
                          ((occupiedBeds + icuBeds) / beds.length) * 100,
                        )}
                        %
                      </span>
                    </div>
                    <div className="w-full bg-secondary rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all"
                        style={{
                          width: `${((occupiedBeds + icuBeds) / beds.length) * 100}%`,
                        }}
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Nurse Utilization</span>
                      <span className="font-semibold">
                        {Math.round((busyNurses / nurses.length) * 100)}%
                      </span>
                    </div>
                    <div className="w-full bg-secondary rounded-full h-2">
                      <div
                        className="bg-green-600 h-2 rounded-full transition-all"
                        style={{
                          width: `${(busyNurses / nurses.length) * 100}%`,
                        }}
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Doctor Utilization</span>
                      <span className="font-semibold">
                        {Math.round((busyDoctors / doctors.length) * 100)}%
                      </span>
                    </div>
                    <div className="w-full bg-secondary rounded-full h-2">
                      <div
                        className="bg-purple-600 h-2 rounded-full transition-all"
                        style={{
                          width: `${(busyDoctors / doctors.length) * 100}%`,
                        }}
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>AI Agent Availability</span>
                      <span className="font-semibold">
                        {Math.round(
                          (onlineAgents / agentStatuses.length) * 100,
                        )}
                        %
                      </span>
                    </div>
                    <div className="w-full bg-secondary rounded-full h-2">
                      <div
                        className="bg-cyan-600 h-2 rounded-full transition-all"
                        style={{
                          width: `${(onlineAgents / agentStatuses.length) * 100}%`,
                        }}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="w-5 h-5" />
                    System Health
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-950 rounded-lg border border-green-200 dark:border-green-800">
                    <span className="text-sm font-medium">API Gateway</span>
                    <Badge className="bg-green-600 text-white">Online</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-950 rounded-lg border border-green-200 dark:border-green-800">
                    <span className="text-sm font-medium">Database</span>
                    <Badge className="bg-green-600 text-white">Connected</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-950 rounded-lg border border-green-200 dark:border-green-800">
                    <span className="text-sm font-medium">Agent Network</span>
                    <Badge className="bg-green-600 text-white">
                      Operational
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-950 rounded-lg border border-green-200 dark:border-green-800">
                    <span className="text-sm font-medium">Monitoring</span>
                    <Badge className="bg-green-600 text-white">Active</Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard;
