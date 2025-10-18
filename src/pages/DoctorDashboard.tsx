import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, LogOut, MapPin, User, Clock, Stethoscope, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useHospitalStore } from '@/store/hospitalStore';
import { toast } from 'sonner';

const DoctorDashboard = () => {
  const navigate = useNavigate();
  const { user, hospital, emergencies, doctors } = useHospitalStore();
  const [doctorAssignments, setDoctorAssignments] = useState<any[]>([]);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    // Redirect if user is not a doctor
    if (user && user.role !== 'doctor') {
      toast.error('Access denied. Doctors only.');
      navigate('/');
      return;
    }

    // Update time every minute
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    return () => clearInterval(timer);
  }, [user, navigate]);

  useEffect(() => {
    // Find assignments for current doctor
    if (user && emergencies) {
      // Extract doctor ID from email (e.g., d001 from d001@hospital.com)
      const doctorId = user.email.split('@')[0];
      const doctor = doctors.find(d => d.doctor_id.toLowerCase() === doctorId.toLowerCase());
      if (doctor) {
        const assignments = emergencies.filter(e => e.doctor?.id === doctor.id);
        setDoctorAssignments(assignments);
      }
    }
  }, [user, emergencies, doctors]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    toast.success('Logged out successfully');
    navigate('/');
  };

  // Get current doctor details
  const currentDoctor = user ? doctors.find(d => d.doctor_id.toLowerCase() === user.email.split('@')[0].toLowerCase()) : null;

  if (!user || user.role !== 'doctor') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">Access Denied</h2>
          <p className="text-muted-foreground mb-4">You must be logged in as a doctor to view this page.</p>
          <Button onClick={() => navigate('/')}>Return to Login</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card shadow-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <Building2 className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-bold">CareFlow Nexus</h1>
              <p className="text-sm text-muted-foreground">{hospital?.name || 'Hospital'}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium">
                {currentDoctor ? `${currentDoctor.name} (${currentDoctor.doctor_id})` : 'Doctor'}
              </span>
            </div>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6">
        {/* Welcome Card */}
        <Card className="mb-6 shadow-[var(--shadow-elegant)]">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold">Welcome, {currentDoctor?.name || 'Doctor'}!</h2>
                <p className="text-muted-foreground">
                  You have {doctorAssignments.length} active patient{doctorAssignments.length !== 1 ? 's' : ''} to see
                </p>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Clock className="w-4 h-4 text-muted-foreground" />
                <span>{currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Assignments */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Active Assignments */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="shadow-[var(--shadow-elegant)]">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Stethoscope className="w-5 h-5 text-primary" />
                  Your Patient Assignments
                </CardTitle>
              </CardHeader>
              <CardContent>
                {doctorAssignments.length === 0 ? (
                  <div className="text-center py-8">
                    <Stethoscope className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No active patient assignments at the moment</p>
                    <p className="text-sm text-muted-foreground mt-2">
                      AI will assign patients based on your specialization and availability
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {doctorAssignments.map((assignment) => (
                      <Card key={assignment.id} className="border border-border">
                        <CardContent className="pt-4">
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="font-bold text-lg">{assignment.patient_name}</h3>
                              <p className="text-muted-foreground text-sm">{assignment.type}</p>
                              <Badge variant="outline" className="mt-2 bg-emergency/10 text-emergency border-emergency">
                                {assignment.emergency_id}
                              </Badge>
                            </div>
                            <Badge variant="outline" className="bg-primary/10 text-primary border-primary">
                              Active
                            </Badge>
                          </div>
                          
                          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="flex items-center gap-2">
                              <MapPin className="w-4 h-4 text-muted-foreground" />
                              <div>
                                <p className="text-sm font-medium">Location</p>
                                <p className="text-sm text-muted-foreground">
                                  {assignment.bed ? `Bed ${assignment.bed.bed_number}, Floor ${assignment.bed.floor}` : 'Not assigned'}
                                </p>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-2">
                              <User className="w-4 h-4 text-muted-foreground" />
                              <div>
                                <p className="text-sm font-medium">Assigned Nurse</p>
                                <p className="text-sm text-muted-foreground">
                                  {assignment.nurse ? assignment.nurse.name : 'Not assigned'}
                                </p>
                              </div>
                            </div>
                          </div>
                          
                          <div className="mt-4 flex justify-end gap-2">
                            <Button size="sm" variant="outline">
                              View Patient Details
                            </Button>
                            <Button size="sm">
                              Mark as Seen
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Doctor Info Sidebar */}
          <div className="space-y-6">
            {/* Doctor Profile */}
            <Card className="shadow-[var(--shadow-elegant)]">
              <CardHeader>
                <CardTitle>Doctor Profile</CardTitle>
              </CardHeader>
              <CardContent>
                {currentDoctor ? (
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                        <Stethoscope className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-bold">{currentDoctor.name}</h3>
                        <p className="text-sm text-muted-foreground">{currentDoctor.doctor_id}</p>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm font-medium">Specialization</p>
                        <p className="text-sm text-muted-foreground">{currentDoctor.specialization}</p>
                      </div>
                      
                      <div>
                        <p className="text-sm font-medium">Status</p>
                        <Badge
                          variant="outline"
                          className={
                            currentDoctor.status === 'available'
                              ? 'bg-success/10 text-success border-success'
                              : 'bg-warning/10 text-warning border-warning'
                          }
                        >
                          {currentDoctor.status === 'available' ? '🟢 Available' : '🟠 Busy'}
                        </Badge>
                      </div>
                      
                      <div>
                        <p className="text-sm font-medium">Current Patients</p>
                        <p className="text-sm text-muted-foreground">{doctorAssignments.length} active</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-muted-foreground">Doctor information not available</p>
                )}
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card className="shadow-[var(--shadow-elegant)]">
              <CardHeader>
                <CardTitle>Quick Stats</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Today's Patients</span>
                    <span className="font-bold">{doctorAssignments.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Completed Consultations</span>
                    <span className="font-bold">0</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Avg. Consultation Time</span>
                    <span className="font-bold">-</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorDashboard;