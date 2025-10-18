import { Clock, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface Bed {
  id: string;
  bed_number: string;
  floor: number;
  status: 'available' | 'occupied' | 'cleaning' | 'icu';
  position: { x: number; y: number; z: number };
  patient?: string;
}

interface Nurse {
  id: string;
  name: string;
  nurse_id: string;
  specialization: string;
  status: 'available' | 'busy';
  assignment?: string;
}

interface Doctor {
  id: string;
  name: string;
  doctor_id: string;
  specialization: string;
  status: 'available' | 'busy';
  assignment?: string;
}

interface Emergency {
  id: string;
  emergency_id: string;
  type: string;
  patient_name: string;
  status: string;
  bed?: Bed;
  nurse?: Nurse;
  doctor?: Doctor;
  created_at: string;
}

interface ActiveEmergenciesProps {
  emergencies: Emergency[];
  onResolve: (id: string) => void;
}

const ActiveEmergencies = ({ emergencies, onResolve }: ActiveEmergenciesProps) => {
  const getTimeAgo = (timestamp: string) => {
    const diff = Date.now() - new Date(timestamp).getTime();
    const minutes = Math.floor(diff / 60000);
    return `${minutes} mins ago`;
  };

  return (
    <Card className="shadow-[var(--shadow-elegant)]">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Active Emergencies</span>
          <Badge variant="destructive" className="bg-emergency">
            {emergencies.length}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 max-h-[500px] overflow-y-auto">
        {emergencies.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">
            No active emergencies
          </p>
        ) : (
          emergencies.map((emergency) => (
            <Card key={emergency.id} className="bg-emergency/5 border-emergency/20">
              <CardContent className="p-4 space-y-2">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono text-sm font-semibold text-emergency">
                        {emergency.emergency_id}
                      </span>
                      <Badge variant="outline" className="text-xs">
                        {emergency.type}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="w-3 h-3" />
                      {getTimeAgo(emergency.created_at)}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-sm pt-2 border-t border-border">
                  <div>
                    <p className="text-muted-foreground text-xs">Patient</p>
                    <p className="font-medium">{emergency.patient_name}</p>
                  </div>
                  {emergency.bed && (
                    <div>
                      <p className="text-muted-foreground text-xs">Bed</p>
                      <p className="font-medium">{emergency.bed.bed_number}</p>
                    </div>
                  )}
                  {emergency.nurse && (
                    <div>
                      <p className="text-muted-foreground text-xs">Nurse</p>
                      <p className="font-medium">{emergency.nurse.name}</p>
                    </div>
                  )}
                  {emergency.doctor && (
                    <div>
                      <p className="text-muted-foreground text-xs">Doctor</p>
                      <p className="font-medium">{emergency.doctor.name}</p>
                    </div>
                  )}
                </div>

                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onResolve(emergency.id)}
                  className="w-full mt-2 hover:bg-success/10 hover:text-success hover:border-success"
                >
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Resolve
                </Button>
              </CardContent>
            </Card>
          ))
        )}
      </CardContent>
    </Card>
  );
};

export default ActiveEmergencies;
