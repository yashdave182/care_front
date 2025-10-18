import { useState } from 'react';
import { UserPlus, User, Calendar, Stethoscope, Bed, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { AIAssignmentService } from '@/lib/aiAssignmentService';

interface PatientRegistrationFormProps {
  nurses: any[];
  doctors: any[];
  beds: any[];
  onRegister: (data: any) => void;
}

const medicalConditions = [
  'General Checkup',
  'Cardiac Emergency',
  'Trauma',
  'Respiratory Issue',
  'Stroke',
  'Poisoning',
  'Severe Bleeding',
  'Head Injury',
  'Burns',
  'Pediatric Care',
  'Surgical Consultation',
  'Chronic Disease Management',
];

const specialties = [
  'Cardiology',
  'Emergency Medicine',
  'Neurology',
  'General Surgery',
  'ICU',
  'Pediatric',
  'General Medicine',
  'Orthopedics',
  'Oncology',
  'Dermatology',
];

const PatientRegistrationForm = ({ nurses, doctors, beds, onRegister }: PatientRegistrationFormProps) => {
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [condition, setCondition] = useState('');
  const [specialtyRequired, setSpecialtyRequired] = useState('');
  const [notes, setNotes] = useState('');
  const [phone, setPhone] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name || !age) {
      toast.error('Please fill in required fields (Name and Age)');
      return;
    }

    setIsSubmitting(true);
    try {
      // Create patient data object
      const patientData = {
        name,
        age,
        condition,
        specialty_required: specialtyRequired,
        notes,
        phone
      };

      // Get AI-powered assignments
      toast.loading('Analyzing patient needs and assigning staff...', { id: 'patient-registration' });
      
      const availableNurses = nurses.filter(n => n.status === 'available');
      const availableDoctors = doctors.filter(d => d.status === 'available');
      const availableBeds = beds.filter(b => b.status === 'available');
      
      // This will now always call the Gemini API directly
      const assignment = await AIAssignmentService.assignPatientToStaff(
        patientData,
        availableNurses.length > 0 ? availableNurses : nurses,
        availableDoctors.length > 0 ? availableDoctors : doctors,
        availableBeds.length > 0 ? availableBeds : beds
      );

      // Prepare data for submission
      const registrationData = {
        ...patientData,
        assigned_nurse: assignment.nurse,
        assigned_doctor: assignment.doctor,
        assigned_bed: assignment.bed,
        reasoning: assignment.reasoning
      };

      await onRegister(registrationData);
      
      toast.success(`New patient registered successfully!\nAI Recommendation: ${assignment.reasoning}`, { 
        id: 'patient-registration',
        duration: 5000
      });
      
      // Reset form
      setName('');
      setAge('');
      setCondition('');
      setSpecialtyRequired('');
      setNotes('');
      setPhone('');
    } catch (error) {
      console.error('Error registering patient:', error);
      toast.error(`Failed to register patient: ${error.message}`, { id: 'patient-registration' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="shadow-[var(--shadow-elegant)]">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-primary">
          <UserPlus className="w-5 h-5" />
          Register New Patient
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="patient-name">Patient Name *</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="patient-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter patient full name"
                  className="pl-10"
                  required
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="patient-age">Age *</Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="patient-age"
                  type="number"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  placeholder="Enter patient age"
                  className="pl-10"
                  required
                />
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="medical-condition">Medical Condition</Label>
              <div className="relative">
                <Stethoscope className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Select value={condition} onValueChange={setCondition}>
                  <SelectTrigger id="medical-condition" className="pl-10">
                    <SelectValue placeholder="Select condition" />
                  </SelectTrigger>
                  <SelectContent>
                    {medicalConditions.map((condition) => (
                      <SelectItem key={condition} value={condition}>
                        {condition}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="specialty-required">Specialty Required</Label>
              <div className="relative">
                <Stethoscope className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Select value={specialtyRequired} onValueChange={setSpecialtyRequired}>
                  <SelectTrigger id="specialty-required" className="pl-10">
                    <SelectValue placeholder="Select required specialty" />
                  </SelectTrigger>
                  <SelectContent>
                    {specialties.map((specialty) => (
                      <SelectItem key={specialty} value={specialty}>
                        {specialty}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="patient-phone">Phone Number</Label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="patient-phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 9876543210"
                className="pl-10"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="patient-notes">Additional Notes</Label>
            <div className="relative">
              <Bed className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
              <Textarea
                id="patient-notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Any additional information about the patient..."
                className="pl-10"
                rows={3}
              />
            </div>
          </div>
          
          <div className="bg-secondary/50 p-4 rounded-lg border border-border">
            <h4 className="font-medium flex items-center gap-2 mb-2">
              <Stethoscope className="w-4 h-4" />
              AI Assignment Information
            </h4>
            <p className="text-sm text-muted-foreground">
              The AI will automatically assign the most suitable nurse and doctor based on:
            </p>
            <ul className="text-sm text-muted-foreground list-disc list-inside mt-2 space-y-1">
              <li>Patient's medical condition and required specialty</li>
              <li>Staff availability and current workload</li>
              <li>Doctor's qualifications and experience</li>
              <li>Nurse's specialization and skills</li>
            </ul>
          </div>
          
          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full h-12 bg-gradient-to-r from-primary to-accent hover:opacity-90 shadow-[var(--shadow-glow)] text-lg font-semibold"
          >
            <UserPlus className="w-5 h-5 mr-2" />
            {isSubmitting ? 'Registering...' : 'Register Patient'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default PatientRegistrationForm;