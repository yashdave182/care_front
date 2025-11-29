import { useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useHospitalStore } from "@/store/hospitalStore";
import agentClient, {
  PatientRegistrationRequest,
  AssignmentRecommendation,
  PatientRecord
} from "@/lib/agents";
import { Loader2, UserPlus, Stethoscope, AlertTriangle, Activity, BrainCircuit, ClipboardList, Syringe } from "lucide-react";
import { toast } from "sonner";

/**
 * AdvancedPatientIntake
 * ---------------------------------------------------------------------------
 * A multi-step, AI-orchestrated patient intake component.
 *
 * Flow:
 * 1. Collect core patient data
 * 2. Submit to admission agent via agentClient.orchestration.registerWithRecommendation
 * 3. Display AI recommendation (nurse, doctor, bed + reasoning)
 * 4. Allow confirmation -> pushes into emergencies list (acting as active patients)
 *
 * This is frontend-only; it expects your backend agents gateway to implement:
 *   POST /admission/register
 * returning a structure with patient + optional assignment recommendation.
 *
 * If recommendation is absent, user can still finalize manually.
 */

interface AIResult {
  patient: PatientRecord | null;
  assignment: AssignmentRecommendation | null;
}

type Step = 1 | 2 | 3;

const medicalConditions = [
  "General Checkup",
  "Cardiac Emergency",
  "Trauma",
  "Respiratory Issue",
  "Stroke",
  "Poisoning",
  "Severe Bleeding",
  "Head Injury",
  "Burns",
  "Pediatric Care",
  "Surgical Consultation",
  "Chronic Disease Management"
];

const specialties = [
  "Cardiology",
  "Emergency Medicine",
  "Neurology",
  "General Surgery",
  "ICU",
  "Pediatric",
  "General Medicine",
  "Orthopedics",
  "Oncology",
  "Dermatology"
];

const severities = ["low", "medium", "high", "critical"];

const AdvancedPatientIntake = () => {
  const { nurses, doctors, beds, emergencies, setEmergencies } = useHospitalStore();

  // Form state
  const [name, setName] = useState("");
  const [age, setAge] = useState<string>("");
  const [gender, setGender] = useState<string>("unknown");
  const [phone, setPhone] = useState("");
  const [condition, setCondition] = useState("");
  const [specialtyRequired, setSpecialtyRequired] = useState("");
  const [severity, setSeverity] = useState("medium");
  const [allergies, setAllergies] = useState<string>("");
  const [notes, setNotes] = useState("");

  // Multi-step
  const [step, setStep] = useState<Step>(1);

  // AI interaction
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [aiResult, setAiResult] = useState<AIResult | null>(null);
  const [submissionError, setSubmissionError] = useState<string | null>(null);
  const [confirming, setConfirming] = useState(false);

  // Manual overrides (if AI does not assign or user changes)
  const [overrideNurseId, setOverrideNurseId] = useState<string | null>(null);
  const [overrideDoctorId, setOverrideDoctorId] = useState<string | null>(null);
  const [overrideBedId, setOverrideBedId] = useState<string | null>(null);

  const reset = () => {
    setName("");
    setAge("");
    setGender("unknown");
    setPhone("");
    setCondition("");
    setSpecialtyRequired("");
    setSeverity("medium");
    setAllergies("");
    setNotes("");
    setStep(1);
    setAiResult(null);
    setSubmissionError(null);
    setOverrideNurseId(null);
    setOverrideDoctorId(null);
    setOverrideBedId(null);
  };

  const canProceedStep1 = name.trim() !== "" && age.trim() !== "";

  const handleSubmitToAI = async () => {
    setIsSubmitting(true);
    setSubmissionError(null);
    toast.loading("Submitting to Admission Agent...", { id: "patient-intake" });

    const payload: PatientRegistrationRequest = {
      patient: {
        name,
        age,
        gender: gender as any,
        phone,
        condition,
        specialtyRequired,
        notes,
        allergies: allergies
          .split(",")
          .map(a => a.trim())
          .filter(a => a.length > 0),
        severity: severity as any
      },
      priority: severity === "critical" ? "critical" : severity === "high" ? "urgent" : "normal",
      autoOrchestrate: true
    };

    try {
      const { patient, assignment } = await agentClient.orchestration.registerWithRecommendation(payload);

      setAiResult({
        patient: patient || null,
        assignment: assignment || null
      });

      if (assignment) {
        toast.success("AI recommendation received", { id: "patient-intake" });
      } else {
        toast.success("Patient registered (no recommendation provided)", { id: "patient-intake" });
      }

      setStep(3);
    } catch (err: any) {
      console.error("[AdvancedPatientIntake] Admission failed:", err);
      setSubmissionError(err?.message || "Unknown error");
      toast.error(`Admission failed: ${err?.message || "Unknown error"}`, { id: "patient-intake" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const finalizeIntoSystem = useCallback(async () => {
    if (!aiResult?.patient) {
      toast.error("No patient record to finalize");
      return;
    }
    setConfirming(true);

    try {
      const assignedNurseId =
        overrideNurseId ||
        aiResult.assignment?.recommended_nurse_id ||
        null;

      const assignedDoctorId =
        overrideDoctorId ||
        aiResult.assignment?.recommended_doctor_id ||
        null;

      const assignedBedId =
        overrideBedId ||
        aiResult.assignment?.recommended_bed_id ||
        null;

      const nurseObj = nurses.find(n => n.id === assignedNurseId) || undefined;
      const doctorObj = doctors.find(d => d.id === assignedDoctorId) || undefined;
      const bedObj = beds.find(b => b.id === assignedBedId) || undefined;

      // Construct a domain object similar to Emergency for display continuity.
      const newEntry = {
        id: aiResult.patient.id || Date.now().toString(),
        emergency_id: `PAT-${Date.now()}`,
        type: aiResult.patient.condition || "General",
        patient_name: aiResult.patient.name,
        status: "active",
        bed: bedObj,
        nurse: nurseObj,
        doctor: doctorObj,
        created_at: new Date().toISOString()
      };

      setEmergencies([newEntry, ...emergencies]);

      toast.success("Patient added to active list");
      reset();
    } catch (e: any) {
      toast.error(`Failed to finalize: ${e.message}`);
    } finally {
      setConfirming(false);
    }
  }, [
    aiResult,
    nurses,
    doctors,
    beds,
    overrideNurseId,
    overrideDoctorId,
    overrideBedId,
    emergencies,
    setEmergencies
  ]);

  return (
    <Card className="shadow-[var(--shadow-elegant)]">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UserPlus className="w-5 h-5 text-primary" />
          Advanced Patient Intake
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-8">
        {/* Step Indicators */}
        <div className="flex items-center gap-2 text-sm">
          <div className={`px-3 py-1 rounded-full ${step === 1 ? "bg-primary text-primary-foreground" : "bg-secondary"}`}>
            1. Patient Info
          </div>
          <div className={`px-3 py-1 rounded-full ${step === 2 ? "bg-primary text-primary-foreground" : "bg-secondary"}`}>
            2. Review & Submit
          </div>
          <div className={`px-3 py-1 rounded-full ${step === 3 ? "bg-primary text-primary-foreground" : "bg-secondary"}`}>
            3. AI Recommendation
          </div>
        </div>

        {/* STEP 1: Core Patient Data */}
        {step === 1 && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Patient full name"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="age">Age *</Label>
                <Input
                  id="age"
                  type="number"
                  min={0}
                  value={age}
                  onChange={e => setAge(e.target.value)}
                  placeholder="Age"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="gender">Gender</Label>
                <Select value={gender} onValueChange={setGender}>
                  <SelectTrigger id="gender">
                    <SelectValue placeholder="Gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                    <SelectItem value="unknown">Prefer not to say</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Contact Phone</Label>
                <Input
                  id="phone"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  placeholder="+91 9876543210"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label>Medical Condition</Label>
                <Select value={condition} onValueChange={setCondition}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select condition" />
                  </SelectTrigger>
                  <SelectContent>
                    {medicalConditions.map(m => (
                      <SelectItem key={m} value={m}>{m}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Required Specialty</Label>
                <Select value={specialtyRequired} onValueChange={setSpecialtyRequired}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select specialty" />
                  </SelectTrigger>
                  <SelectContent>
                    {specialties.map(s => (
                      <SelectItem key={s} value={s}>{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <Label>Severity</Label>
                <Select value={severity} onValueChange={setSeverity}>
                  <SelectTrigger>
                    <SelectValue placeholder="Severity" />
                  </SelectTrigger>
                  <SelectContent>
                    {severities.map(s => (
                      <SelectItem key={s} value={s}>{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label>Allergies (comma separated)</Label>
                <Input
                  value={allergies}
                  onChange={e => setAllergies(e.target.value)}
                  placeholder="Penicillin, Latex, Nuts..."
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Additional Notes</Label>
              <Textarea
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="Any clinical notes or context..."
                rows={4}
              />
            </div>

            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={reset} disabled={isSubmitting}>
                Reset
              </Button>
              <Button
                disabled={!canProceedStep1 || isSubmitting}
                onClick={() => setStep(2)}
                className="bg-gradient-to-r from-primary to-accent"
              >
                Next
              </Button>
            </div>
          </div>
        )}

        {/* STEP 2: Review & Submit */}
        {step === 2 && (
          <div className="space-y-6">
            <div className="p-4 rounded-lg border border-border bg-secondary/40 space-y-3">
              <h4 className="font-semibold flex items-center gap-2">
                <ClipboardList className="w-4 h-4" />
                Review Patient Data
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Name</p>
                  <p className="font-medium">{name}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Age</p>
                  <p className="font-medium">{age}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Gender</p>
                  <p className="font-medium">{gender}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Phone</p>
                  <p className="font-medium">{phone || "-"}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Condition</p>
                  <p className="font-medium">{condition || "-"}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Specialty Required</p>
                  <p className="font-medium">{specialtyRequired || "-"}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Severity</p>
                  <Badge
                    variant="outline"
                    className={
                      severity === "critical"
                        ? "bg-emergency/15 text-emergency border-emergency"
                        : severity === "high"
                        ? "bg-warning/15 text-warning border-warning"
                        : severity === "medium"
                        ? "bg-primary/10 text-primary border-primary"
                        : "bg-secondary text-foreground border-border"
                    }
                  >
                    {severity}
                  </Badge>
                </div>
                <div>
                  <p className="text-muted-foreground">Allergies</p>
                  <p className="font-medium">
                    {allergies
                      .split(",")
                      .map(a => a.trim())
                      .filter(a => a).join(", ") || "-"}
                  </p>
                </div>
              </div>
              <div>
                <p className="text-muted-foreground text-sm">Notes</p>
                <p className="text-sm">{notes || "-"}</p>
              </div>
            </div>

            {submissionError && (
              <div className="p-3 rounded-md bg-emergency/10 border border-emergency/40 text-sm flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 mt-0.5 text-emergency" />
                <span>{submissionError}</span>
              </div>
            )}

            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setStep(1)} disabled={isSubmitting}>
                Back
              </Button>
              <Button
                onClick={handleSubmitToAI}
                disabled={isSubmitting}
                className="bg-gradient-to-r from-primary to-accent"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <BrainCircuit className="w-4 h-4 mr-2" />
                    Submit to AI
                  </>
                )}
              </Button>
            </div>
          </div>
        )}

        {/* STEP 3: AI Recommendation & Confirmation */}
        {step === 3 && (
          <div className="space-y-6">
            {!aiResult?.patient && (
              <div className="p-4 rounded-md border border-warning/40 bg-warning/10 text-sm flex items-start gap-2">
                <Activity className="w-4 h-4 mt-0.5 text-warning" />
                <span>
                  Patient registered but no detailed record returned. You may still finalize manually.
                </span>
              </div>
            )}

            {aiResult?.assignment ? (
              <div className="space-y-4 p-4 rounded-lg border border-border bg-secondary/40">
                <h4 className="font-semibold flex items-center gap-2">
                  <BrainCircuit className="w-4 h-4" />
                  AI Recommendation
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Nurse</p>
                    <p className="font-medium">
                      {resolveNurseName(aiResult.assignment.recommended_nurse_id, nurses) || "-"}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Doctor</p>
                    <p className="font-medium">
                      {resolveDoctorName(aiResult.assignment.recommended_doctor_id, doctors) || "-"}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Bed</p>
                    <p className="font-medium">
                      {resolveBedNumber(aiResult.assignment.recommended_bed_id, beds) || "-"}
                    </p>
                  </div>
                </div>
                <div className="text-sm">
                  <p className="text-muted-foreground mb-1">Reasoning</p>
                  <p>{aiResult.assignment.reasoning || "No reasoning provided."}</p>
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-md bg-warning/10 border border-warning/40 text-sm flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 mt-0.5 text-warning" />
                <span>No AI assignment recommendation received. Please select resources manually.</span>
              </div>
            )}

            {/* Manual overrides */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <Label>Override Nurse</Label>
                <Select
                  value={overrideNurseId || aiResult?.assignment?.recommended_nurse_id || ""}
                  onValueChange={val => setOverrideNurseId(val || null)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select nurse" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">(None)</SelectItem>
                    {nurses.map(n => (
                      <SelectItem key={n.id} value={n.id}>
                        {n.name} ({n.nurse_id})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Override Doctor</Label>
                <Select
                  value={overrideDoctorId || aiResult?.assignment?.recommended_doctor_id || ""}
                  onValueChange={val => setOverrideDoctorId(val || null)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select doctor" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">(None)</SelectItem>
                    {doctors.map(d => (
                      <SelectItem key={d.id} value={d.id}>
                        {d.name} ({d.doctor_id})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Override Bed</Label>
                <Select
                  value={overrideBedId || aiResult?.assignment?.recommended_bed_id || ""}
                  onValueChange={val => setOverrideBedId(val || null)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select bed" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">(None)</SelectItem>
                    {beds
                      .filter(b => b.status === "available" || b.id === aiResult?.assignment?.recommended_bed_id)
                      .map(b => (
                        <SelectItem key={b.id} value={b.id}>
                          {b.bed_number} (Floor {b.floor})
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex justify-between">
              <Button variant="outline" onClick={reset} disabled={confirming || isSubmitting}>
                Start Over
              </Button>
              <Button
                onClick={finalizeIntoSystem}
                disabled={confirming}
                className="bg-gradient-to-r from-primary to-accent"
              >
                {confirming ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Finalizing...
                  </>
                ) : (
                  <>
                    <Syringe className="w-4 h-4 mr-2" />
                    Confirm & Activate
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

/* Utility resolvers */

function resolveNurseName(id: string | null, nurses: ReturnType<typeof useHospitalStore>["nurses"]) {
  if (!id) return null;
  const n = nurses.find(n => n.id === id);
  return n ? `${n.name} (${n.nurse_id})` : null;
}

function resolveDoctorName(id: string | null, doctors: ReturnType<typeof useHospitalStore>["doctors"]) {
  if (!id) return null;
  const d = doctors.find(d => d.id === id);
  return d ? `${d.name} (${d.doctor_id})` : null;
}

function resolveBedNumber(id: string | null, beds: ReturnType<typeof useHospitalStore>["beds"]) {
  if (!id) return null;
  const b = beds.find(b => b.id === id);
  return b ? b.bed_number : null;
}

export default AdvancedPatientIntake;
