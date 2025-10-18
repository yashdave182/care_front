import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, ArrowRight, ArrowLeft, Loader2, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { toast } from 'sonner';
import { useHospitalStore } from '@/store/hospitalStore';

const Setup = () => {
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const navigate = useNavigate();
  const { setHospital } = useHospitalStore();

  const [formData, setFormData] = useState({
    hospital_name: 'City General Hospital',
    location: 'Mumbai',
    contact: '+91 9876543210',
    floors: 3,
    beds_count: 30,
    nurses_count: 15,
    doctors_count: 8,
    icu_beds_count: 5,
  });

  const updateField = (field: string, value: string | number) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleNext = () => {
    if (step < 3) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleGenerate = async () => {
    setIsLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 3000));
      
      setHospital({
        id: '1',
        name: formData.hospital_name,
        location: formData.location,
        floors: formData.floors,
        setup_complete: true,
      });

      setIsComplete(true);
      toast.success('Hospital setup complete!');
      
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
    } catch (error) {
      toast.error('Setup failed. Please try again.');
      setIsLoading(false);
    }
  };

  if (isComplete) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-primary via-primary-glow to-accent">
        <Card className="w-full max-w-md text-center shadow-[var(--shadow-elegant)]">
          <CardContent className="pt-12 pb-12">
            <div className="mx-auto w-20 h-20 rounded-full bg-success/10 flex items-center justify-center mb-6 animate-pulse">
              <CheckCircle2 className="w-12 h-12 text-success" />
            </div>
            <h2 className="text-3xl font-bold mb-2">Setup Complete!</h2>
            <p className="text-muted-foreground">Redirecting to dashboard...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-primary via-primary-glow to-accent">
      <Card className="w-full max-w-2xl shadow-[var(--shadow-elegant)]">
        <CardHeader>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <Building2 className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <CardTitle className="text-2xl">Hospital Setup Wizard</CardTitle>
              <CardDescription>Step {step} of 3</CardDescription>
            </div>
          </div>
          
          <div className="flex gap-2">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={`h-2 flex-1 rounded-full transition-all ${
                  s <= step ? 'bg-gradient-to-r from-primary to-accent' : 'bg-secondary'
                }`}
              />
            ))}
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {step === 1 && (
            <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
              <h3 className="text-xl font-semibold">Basic Information</h3>
              
              <div className="space-y-2">
                <Label htmlFor="hospital_name">Hospital Name</Label>
                <Input
                  id="hospital_name"
                  value={formData.hospital_name}
                  onChange={(e) => updateField('hospital_name', e.target.value)}
                  placeholder="e.g., City General Hospital"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Location/City</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => updateField('location', e.target.value)}
                  placeholder="e.g., Mumbai"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="contact">Contact Number</Label>
                <Input
                  id="contact"
                  value={formData.contact}
                  onChange={(e) => updateField('contact', e.target.value)}
                  placeholder="e.g., +91 9876543210"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="floors">Number of Floors</Label>
                <Input
                  id="floors"
                  type="number"
                  min="1"
                  max="10"
                  value={formData.floors}
                  onChange={(e) => updateField('floors', parseInt(e.target.value) || 1)}
                />
                <p className="text-sm text-muted-foreground">Between 1-10 floors</p>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
              <h3 className="text-xl font-semibold">Configure Resources</h3>

              <div className="space-y-2">
                <Label htmlFor="beds">Number of Beds</Label>
                <Input
                  id="beds"
                  type="number"
                  min="1"
                  value={formData.beds_count}
                  onChange={(e) => updateField('beds_count', parseInt(e.target.value) || 1)}
                />
                <p className="text-sm text-muted-foreground">ℹ️ We'll distribute across floors</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="nurses">Number of Nurses</Label>
                <Input
                  id="nurses"
                  type="number"
                  min="1"
                  value={formData.nurses_count}
                  onChange={(e) => updateField('nurses_count', parseInt(e.target.value) || 1)}
                />
                <p className="text-sm text-muted-foreground">ℹ️ Auto-assigned specializations</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="doctors">Number of Doctors</Label>
                <Input
                  id="doctors"
                  type="number"
                  min="1"
                  value={formData.doctors_count}
                  onChange={(e) => updateField('doctors_count', parseInt(e.target.value) || 1)}
                />
                <p className="text-sm text-muted-foreground">ℹ️ Auto-assigned specializations</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="icu">Emergency Beds (ICU)</Label>
                <Input
                  id="icu"
                  type="number"
                  min="1"
                  value={formData.icu_beds_count}
                  onChange={(e) => updateField('icu_beds_count', parseInt(e.target.value) || 1)}
                />
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
              <h3 className="text-xl font-semibold">Review & Generate</h3>

              <div className="space-y-4 p-6 bg-secondary rounded-lg border border-border">
                <div>
                  <p className="text-sm text-muted-foreground">Hospital</p>
                  <p className="font-semibold">{formData.hospital_name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Location</p>
                  <p className="font-semibold">{formData.location}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Floors</p>
                  <p className="font-semibold">{formData.floors}</p>
                </div>
              </div>

              <div className="space-y-2 p-6 bg-secondary rounded-lg border border-border">
                <p className="font-semibold mb-3">Resources to Generate:</p>
                <div className="space-y-2">
                  <p className="text-sm flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-success" />
                    {formData.beds_count} Beds (across {formData.floors} floors)
                  </p>
                  <p className="text-sm flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-success" />
                    {formData.nurses_count} Nurses (mixed specializations)
                  </p>
                  <p className="text-sm flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-success" />
                    {formData.doctors_count} Doctors (mixed specializations)
                  </p>
                  <p className="text-sm flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-success" />
                    {formData.icu_beds_count} ICU Beds
                  </p>
                </div>
              </div>

              <div className="p-4 bg-warning/10 rounded-lg border border-warning/20">
                <p className="text-sm text-warning-foreground">
                  ⚠️ This will create your hospital infrastructure. Ready?
                </p>
              </div>
            </div>
          )}

          <div className="flex gap-3 pt-4">
            {step > 1 && (
              <Button variant="outline" onClick={handleBack} disabled={isLoading}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
            )}
            
            {step < 3 ? (
              <Button
                onClick={handleNext}
                className="ml-auto bg-gradient-to-r from-primary to-accent hover:opacity-90"
              >
                Next
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button
                onClick={handleGenerate}
                disabled={isLoading}
                className="ml-auto bg-gradient-to-r from-primary to-accent hover:opacity-90 shadow-[var(--shadow-glow)]"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    🚀 Generate Hospital
                  </>
                )}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Setup;
