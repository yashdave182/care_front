import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Building2,
  LogOut,
  Brush,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ListChecks,
  Calendar,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useHospitalStore } from "@/store/hospitalStore";
import agentClient from "@/lib/agents";
import type { CleaningTask, CleaningType } from "@/lib/agents/types";
import { toast } from "sonner";
import AdminLayout from "@/components/AdminLayout";

/**
 * Cleaning Page
 * -----------------------------------------------------------------------------
 * Provides an interface for:
 *  - Viewing beds that require cleaning (mock logic for now)
 *  - Scheduling cleaning tasks via the Cleaning Agent endpoint
 *  - Tracking locally scheduled tasks (until backend persistence wired)
 *
 * Once the backend is integrated:
 *  - Replace local state with queries to /cleaning/tasks (or SSE stream)
 *  - Show real-time task status updates
 */

const CLEANING_TYPES: CleaningType[] = [
  "standard",
  "deep",
  "isolation",
  "terminal",
];

interface ScheduleFormState {
  bedId: string;
  type: CleaningType;
  notes: string;
  scheduledFor: string; // ISO (datetime-local input)
}

const Cleaning = () => {
  const navigate = useNavigate();
  const { user, hospital, beds } = useHospitalStore();

  const [tasks, setTasks] = useState<CleaningTask[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [form, setForm] = useState<ScheduleFormState>({
    bedId: "",
    type: "standard",
    notes: "",
    scheduledFor: "",
  });

  const isAdmin = user?.role === "admin" || user?.role === "Admin";

  // Role guard (allow admin and cleaner roles)
  useEffect(() => {
    if (
      user &&
      user.role !== "admin" &&
      user.role !== "Admin" &&
      user.role !== "cleaner"
    ) {
      toast.error("Access denied. Admin and Cleaner only.");
      navigate("/");
      return;
    }
  }, [user, navigate]);

  // Derived list of beds that are candidates for cleaning.
  // For now: status "cleaning" OR status "occupied" (simulate turnover).
  const bedsNeedingCleaning = useMemo(
    () => beds.filter((b) => ["cleaning", "occupied"].includes(b.status)),
    [beds],
  );

  // Simple heuristic: tasks with status queued/running/blocked are "active"
  const activeTasks = tasks.filter((t) =>
    ["queued", "running", "waiting", "blocked"].includes(t.status),
  );
  const completedTasks = tasks.filter((t) => t.status === "completed");
  const failedTasks = tasks.filter((t) => t.status === "failed");

  const handleFieldChange = (field: keyof ScheduleFormState, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const resetForm = () => {
    setForm({
      bedId: "",
      type: "standard",
      notes: "",
      scheduledFor: "",
    });
  };

  const handleSchedule = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.bedId) {
      toast.error("Please select a bed");
      return;
    }

    setIsSubmitting(true);
    toast.loading("Scheduling cleaning task...", { id: "cleaning-task" });

    try {
      const payload = {
        bedId: form.bedId,
        type: form.type,
        scheduledFor: form.scheduledFor
          ? new Date(form.scheduledFor).toISOString()
          : undefined,
        priority:
          form.type === "terminal"
            ? "urgent"
            : form.type === "isolation"
              ? "high"
              : "normal",
      };

      // Call Cleaning Agent
      const task = await agentClient.cleaning.schedule(payload);

      // Augment task with notes locally (until backend supports notes)
      const augmented: CleaningTask = {
        ...task,
        notes: form.notes || undefined,
      };

      setTasks((prev) => [augmented, ...prev]);
      toast.success(`Cleaning task scheduled (${augmented.type})`, {
        id: "cleaning-task",
      });
      resetForm();
    } catch (err: any) {
      toast.error(`Failed to schedule cleaning: ${err.message}`, {
        id: "cleaning-task",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    toast.success("Logged out");
    navigate("/");
  };

  // Admin users get AdminLayout with sidebar, cleaners get standalone view
  const content = (
    <div className="min-h-screen bg-background">
      {/* Header (only show for non-admin) */}
      {!isAdmin && (
        <header className="border-b border-border bg-card shadow-sm">
          <div className="container mx-auto px-4 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                <Building2 className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-bold">CareFlow Nexus</h1>
                <p className="text-sm text-muted-foreground">
                  {hospital?.name || "Hospital"} · Cleaning Operations
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm text-muted-foreground hidden sm:block">
                {user?.role === "admin" ? "Admin" : user?.role}
              </span>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                <LogOut className="w-4 h-4 mr-2 sm:mr-0 sm:hidden" />
                <span className="hidden sm:inline">Logout</span>
                <span className="sm:hidden">Logout</span>
              </Button>
            </div>
          </div>
        </header>
      )}

      <main className="container mx-auto px-4 py-6 space-y-6">
        {/* Overview Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6 flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">
                  Beds Needing Cleaning
                </p>
                <p className="text-2xl font-bold">
                  {bedsNeedingCleaning.length}
                </p>
              </div>
              <Brush className="w-8 h-8 text-primary" />
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Tasks</p>
                <p className="text-2xl font-bold text-warning">
                  {activeTasks.length}
                </p>
              </div>
              <Clock className="w-8 h-8 text-warning" />
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Completed</p>
                <p className="text-2xl font-bold text-success">
                  {completedTasks.length}
                </p>
              </div>
              <CheckCircle2 className="w-8 h-8 text-success" />
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Failed</p>
                <p className="text-2xl font-bold text-emergency">
                  {failedTasks.length}
                </p>
              </div>
              <AlertTriangle className="w-8 h-8 text-emergency" />
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Scheduling Form */}
          <Card className="lg:col-span-1 shadow-[var(--shadow-elegant)]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brush className="w-5 h-5" />
                Schedule Cleaning
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSchedule} className="space-y-5">
                {/* Bed Selection */}
                <div className="space-y-2">
                  <Label htmlFor="bed">Bed</Label>
                  <Select
                    value={form.bedId}
                    onValueChange={(v) => handleFieldChange("bedId", v)}
                  >
                    <SelectTrigger id="bed">
                      <SelectValue placeholder="Select bed needing cleaning" />
                    </SelectTrigger>
                    <SelectContent>
                      {bedsNeedingCleaning.map((bed) => (
                        <SelectItem key={bed.id} value={bed.id}>
                          {bed.bed_number} · Floor {bed.floor} · {bed.status}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Cleaning Type */}
                <div className="space-y-2">
                  <Label htmlFor="type">Cleaning Type</Label>
                  <Select
                    value={form.type}
                    onValueChange={(v) =>
                      handleFieldChange("type", v as CleaningType)
                    }
                  >
                    <SelectTrigger id="type">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CLEANING_TYPES.map((ct) => (
                        <SelectItem key={ct} value={ct}>
                          {ct.charAt(0).toUpperCase() + ct.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Scheduled For */}
                <div className="space-y-2">
                  <Label htmlFor="scheduledFor">
                    Scheduled Time (optional)
                  </Label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="scheduledFor"
                      type="datetime-local"
                      value={form.scheduledFor}
                      onChange={(e) =>
                        handleFieldChange("scheduledFor", e.target.value)
                      }
                      className="pl-10"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Leave blank to dispatch immediately.
                  </p>
                </div>

                {/* Notes */}
                <div className="space-y-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    value={form.notes}
                    onChange={(e) => handleFieldChange("notes", e.target.value)}
                    placeholder="Any specific instructions..."
                    rows={3}
                  />
                </div>

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-gradient-to-r from-primary to-accent"
                >
                  {isSubmitting ? "Scheduling..." : "Schedule Cleaning Task"}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Tasks List */}
          <Card className="lg:col-span-2 shadow-[var(--shadow-elegant)]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ListChecks className="w-5 h-5" />
                Cleaning Tasks
              </CardTitle>
            </CardHeader>
            <CardContent>
              {tasks.length === 0 ? (
                <div className="text-center py-10 text-muted-foreground">
                  No cleaning tasks scheduled yet.
                </div>
              ) : (
                <div className="space-y-4">
                  {tasks.map((task) => (
                    <Card key={task.id} className="border border-border">
                      <CardContent className="pt-4 space-y-3">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div>
                            <p className="font-semibold">
                              Bed {task.bedId} • {task.type}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Task ID: {task.id}
                            </p>
                          </div>
                          <Badge
                            variant="outline"
                            className={
                              task.status === "completed"
                                ? "bg-success/10 text-success border-success"
                                : task.status === "failed"
                                  ? "bg-emergency/10 text-emergency border-emergency"
                                  : "bg-warning/10 text-warning border-warning"
                            }
                          >
                            {task.status}
                          </Badge>
                        </div>

                        {task.notes && (
                          <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                            {task.notes}
                          </p>
                        )}

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                          {task.startedAt && (
                            <div>
                              <p className="text-muted-foreground">Started</p>
                              <p className="font-medium">
                                {new Date(task.startedAt).toLocaleString()}
                              </p>
                            </div>
                          )}
                          {task.completedAt && (
                            <div>
                              <p className="text-muted-foreground">Completed</p>
                              <p className="font-medium">
                                {new Date(task.completedAt).toLocaleString()}
                              </p>
                            </div>
                          )}
                          {task.assignedCleanerId && (
                            <div>
                              <p className="text-muted-foreground">Cleaner</p>
                              <p className="font-medium">
                                {task.assignedCleanerId}
                              </p>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );

  // Wrap with AdminLayout for admin users
  if (isAdmin) {
    return <AdminLayout title="Cleaning Dashboard">{content}</AdminLayout>;
  }

  return content;
};

export default Cleaning;
