import { useState } from 'react';
import { AlertTriangle, Phone, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';

const emergencyTypes = [
  'Cardiac Emergency',
  'Trauma',
  'Respiratory Failure',
  'Stroke',
  'Poisoning',
  'Severe Bleeding',
  'Head Injury',
  'Burns',
];

interface EmergencyTriggerProps {
  onTrigger: (data: { type: string; patient_name: string; caller_phone: string }) => void;
}

const EmergencyTrigger = ({ onTrigger }: EmergencyTriggerProps) => {
  const [type, setType] = useState('Cardiac Emergency');
  const [patientName, setPatientName] = useState('');
  const [callerPhone, setCallerPhone] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!patientName || !callerPhone) {
      toast.error('Please fill all fields');
      return;
    }

    setIsSubmitting(true);
    try {
      await onTrigger({ type, patient_name: patientName, caller_phone: callerPhone });
      toast.success('Emergency triggered! AI assigning resources...');
      setPatientName('');
      setCallerPhone('');
    } catch (error) {
      toast.error('Failed to trigger emergency');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="shadow-[var(--shadow-elegant)]">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-emergency">
          <AlertTriangle className="w-5 h-5" />
          Emergency Trigger
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="emergency-type">Emergency Type</Label>
            <Select value={type} onValueChange={setType}>
              <SelectTrigger id="emergency-type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-popover">
                {emergencyTypes.map((t) => (
                  <SelectItem key={t} value={t}>
                    {t}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="patient-name">Patient Name</Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="patient-name"
                value={patientName}
                onChange={(e) => setPatientName(e.target.value)}
                placeholder="Enter patient name"
                className="pl-10"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="caller-phone">Caller Phone</Label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="caller-phone"
                value={callerPhone}
                onChange={(e) => setCallerPhone(e.target.value)}
                placeholder="+91 9876543210"
                className="pl-10"
              />
            </div>
          </div>

          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full h-12 bg-gradient-to-r from-emergency to-emergency-glow hover:opacity-90 shadow-[var(--shadow-emergency)] text-lg font-semibold"
          >
            <AlertTriangle className="w-5 h-5 mr-2" />
            {isSubmitting ? 'Triggering...' : '🚨 TRIGGER EMERGENCY'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default EmergencyTrigger;
