import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, LogOut, MapPin, User, Clock, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useHospitalStore } from '@/store/hospitalStore';
import { toast } from 'sonner';

const NurseDashboard = () => {
  const navigate = useNavigate();
  const { user, hospital, emergencies, nurses } = useHospitalStore();
  const [nurseAssignments, setNurseAssignments] = useState<any[]>([]);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    // Redirect if user is not a nurse
    if (user && user.role !== 'nurse') {
      toast.error('Access denied. Nurses only.');
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
    // Find assignments for current nurse
    if (user && emergencies) {
      // Extract nurse ID from email (e.g., n001 from n001@hospital.com)
      const nurseId = user.email.split('@')[0];
      const nurse = nurses.find(n => n.nurse_id.toLowerCase() === nurseId.toLowerCase());
      if (nurse) {
        const assignments = emergencies.filter(e => e.nurse?.id === nurse.id);
        setNurseAssignments(assignments);
      }
    }
  }, [user, emergencies, nurses]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    toast.success('Logged out successfully');
    navigate('/');
  };

  // Get current nurse details
  const currentNurse = user ? nurses.find(n => n.nurse_id.toLowerCase() === user.email.split('@')[0].toLowerCase()) : null;

  if (!user || user.role !== 'nurse') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">Access Denied</h2>
          <p className="text-muted-foreground mb-4">You must be logged in as a nurse to view this page.</p>
          <Button onClick={() => navigate('/')}>Return to Login</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header - Responsive for mobile */}
      <header className="border-b border-border bg-card shadow-sm">
        <div className="container mx-auto px-4 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
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
              <span className="text-sm font-medium truncate max-w-[150px]">
                {currentNurse ? `${currentNurse.name} (${currentNurse.nurse_id})` : 'Nurse'}
              </span>
            </div>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-2 sm:mr-0 sm:hidden" />
              <span className="hidden sm:inline">Logout</span>
              <span className="sm:hidden">Logout</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content - Responsive layout */}
      <div className="container mx-auto px-4 py-6">
        {/* Welcome Card - Responsive for mobile */}
        <Card className="mb-6 shadow-[var(--shadow-elegant)]">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold">Welcome, {currentNurse?.name || 'Nurse'}!</h2>
                <p className="text-muted-foreground">
                  You have {nurseAssignments.length} active assignment{nurseAssignments.length !== 1 ? 's' : ''} today
                </p>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Clock className="w-4 h-4 text-muted-foreground" />
                <span>{currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Assignments - Responsive grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Active Assignments - Full width on mobile */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="shadow-[var(--shadow-elegant)]">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-emergency" />
                  Your Active Assignments
                </CardTitle>
              </CardHeader>
              <CardContent>
                {nurseAssignments.length === 0 ? (
                  <div className="text-center py-8">
                    <AlertTriangle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No active assignments at the moment</p>
                    <p className="text-sm text-muted-foreground mt-2">
                      You'll be notified when a new assignment is available
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {nurseAssignments.map((assignment) => (
                      <Card key={assignment.id} className="border border-border">
                        <CardContent className="pt-4">
                          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
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
                            <div className="flex items-start gap-2">
                              <MapPin className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                              <div>
                                <p className="text-sm font-medium">Location</p>
                                <p className="text-sm text-muted-foreground">
                                  {assignment.bed ? `Bed ${assignment.bed.bed_number}, Floor ${assignment.bed.floor}` : 'Not assigned'}
                                </p>
                              </div>
                            </div>
                            
                            <div className="flex items-start gap-2">
                              <User className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                              <div>
                                <p className="text-sm font-medium">Assigned Doctor</p>
                                <p className="text-sm text-muted-foreground">
                                  {assignment.doctor ? assignment.doctor.name : 'Not assigned'}
                                </p>
                              </div>
                            </div>
                          </div>
                          
                          <div className="mt-4 flex justify-end">
                            <Button size="sm" variant="outline">
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
          </div>

          {/* Nurse Info Sidebar - Full width on mobile */}
          <div className="space-y-6">
            {/* Nurse Profile */}
            <Card className="shadow-[var(--shadow-elegant)]">
              <CardHeader>
                <CardTitle>Nurse Profile</CardTitle>
              </CardHeader>
              <CardContent>
                {currentNurse ? (
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                        <User className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-bold">{currentNurse.name}</h3>
                        <p className="text-sm text-muted-foreground">{currentNurse.nurse_id}</p>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm font-medium">Specialization</p>
                        <p className="text-sm text-muted-foreground">{currentNurse.specialization}</p>
                      </div>
                      
                      <div>
                        <p className="text-sm font-medium">Status</p>
                        <Badge
                          variant="outline"
                          className={
                            currentNurse.status === 'available'
                              ? 'bg-success/10 text-success border-success'
                              : 'bg-warning/10 text-warning border-warning'
                          }
                        >
                          {currentNurse.status === 'available' ? '🟢 Available' : '🟠 Busy'}
                        </Badge>
                      </div>
                      
                      <div>
                        <p className="text-sm font-medium">Current Assignments</p>
                        <p className="text-sm text-muted-foreground">{nurseAssignments.length} active</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-muted-foreground">Nurse information not available</p>
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
                    <span className="text-muted-foreground">Today's Assignments</span>
                    <span className="font-bold">{nurseAssignments.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Completed Today</span>
                    <span className="font-bold">0</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Avg. Response Time</span>
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

export default NurseDashboard;