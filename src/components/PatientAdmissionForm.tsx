import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { UserPlus, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useCreatePatient } from "@/hooks/useData";

interface PatientAdmissionFormProps {
  onSuccess?: () => void;
  trigger?: React.ReactNode;
}

const PatientAdmissionForm = ({
  onSuccess,
  trigger,
}: PatientAdmissionFormProps) => {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    patient_name: "",
  });

  const { mutate: createPatient, loading } = useCreatePatient();
  const navigate = useNavigate();

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const resetForm = () => {
    setFormData({
      patient_name: "",
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    console.log("[FORM] Submit started");

    // Validation
    if (!formData.patient_name.trim()) {
      toast.error("Patient name is required");
      return;
    }

    // Prepare data for submission (only fields that exist in Supabase)
    const patientData = {
      patient_name: formData.patient_name.trim(),
    };

    console.log("[FORM] Submitting patient data:", patientData);

    try {
      // Submit to Supabase
      const result = await createPatient(patientData);

      console.log("[FORM] Result received:", result);

      if (result.success) {
        toast.success("Patient admitted successfully!", {
          description: `${formData.patient_name} has been added to the system.`,
        });

        resetForm();
        setOpen(false);

        if (onSuccess) {
          onSuccess();
        }
      } else {
        console.error("[FORM] Error from mutation:", result.error);
        toast.error("Failed to admit patient", {
          description: result.error?.message || "Please try again.",
        });
      }
    } catch (err) {
      console.error("[FORM] Exception during submit:", err);
      toast.error("An error occurred", {
        description: "Please check the console and try again.",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button className="gap-2">
            <UserPlus className="w-4 h-4" />
            Admit New Patient
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Admit New Patient</DialogTitle>
          <DialogDescription>
            Enter patient name to create a new admission. Status will be set to
            "pending_bed" automatically.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Patient Name */}
          <div className="space-y-2">
            <Label htmlFor="patient_name">
              Patient Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="patient_name"
              value={formData.patient_name}
              onChange={(e) => handleChange("patient_name", e.target.value)}
              placeholder="Enter full name"
              required
              autoFocus
            />
            <p className="text-xs text-muted-foreground">
              Patient will be added with status "pending_bed" for bed assignment
              by MASTER Agent
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                resetForm();
                setOpen(false);
              }}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Admitting...
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4 mr-2" />
                  Admit Patient
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default PatientAdmissionForm;
