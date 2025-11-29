// DataModeToggle.tsx
// Component to toggle between Mock and Real Supabase Data
import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Database, HardDrive, RefreshCw } from "lucide-react";
import { toast } from "sonner";

interface DataModeToggleProps {
  compact?: boolean;
  showLabel?: boolean;
}

const DataModeToggle = ({ compact = false, showLabel = true }: DataModeToggleProps) => {
  const [useMockData, setUseMockData] = useState(
    import.meta.env.VITE_USE_MOCK_DATA === "true"
  );
  const [isChanging, setIsChanging] = useState(false);

  useEffect(() => {
    // Check localStorage for override
    const storedMode = localStorage.getItem("USE_MOCK_DATA");
    if (storedMode !== null) {
      setUseMockData(storedMode === "true");
    }
  }, []);

  const handleToggle = () => {
    setIsChanging(true);
    const newMode = !useMockData;

    // Store preference
    localStorage.setItem("USE_MOCK_DATA", newMode.toString());

    // Show toast notification
    toast.info(
      `Switching to ${newMode ? "Mock" : "Real"} Data Mode`,
      {
        description: "Page will reload to apply changes...",
        duration: 2000,
      }
    );

    // Reload after short delay
    setTimeout(() => {
      window.location.reload();
    }, 1500);
  };

  const currentMode = useMockData ? "Mock Data" : "Real Data";
  const currentIcon = useMockData ? (
    <HardDrive className="w-4 h-4" />
  ) : (
    <Database className="w-4 h-4" />
  );

  // Compact mode - just a badge and switch
  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <Badge
          variant={useMockData ? "outline" : "default"}
          className="flex items-center gap-1"
        >
          {currentIcon}
          {showLabel && <span className="text-xs">{currentMode}</span>}
        </Badge>
        <Switch
          checked={!useMockData}
          onCheckedChange={handleToggle}
          disabled={isChanging}
          aria-label="Toggle data mode"
        />
      </div>
    );
  }

  // Full card mode
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          {currentIcon}
          Data Source Mode
        </CardTitle>
        <CardDescription>
          Switch between mock data and real Supabase data
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-sm font-medium">Current Mode</p>
            <Badge
              variant={useMockData ? "outline" : "default"}
              className="flex items-center gap-1 w-fit"
            >
              {currentIcon}
              <span>{currentMode}</span>
            </Badge>
          </div>
          <Switch
            checked={!useMockData}
            onCheckedChange={handleToggle}
            disabled={isChanging}
            aria-label="Toggle data mode"
          />
        </div>

        <div className="border-t pt-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-muted-foreground">
                <HardDrive className="w-4 h-4" />
                <span className="font-medium">Mock Data</span>
              </div>
              <p className="text-xs text-muted-foreground">
                • Fast & instant
                <br />
                • No database needed
                <br />
                • Good for testing
              </p>
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Database className="w-4 h-4" />
                <span className="font-medium">Real Data</span>
              </div>
              <p className="text-xs text-muted-foreground">
                • Live Supabase data
                <br />
                • Persistent storage
                <br />
                • Production ready
              </p>
            </div>
          </div>
        </div>

        {isChanging && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <RefreshCw className="w-4 h-4 animate-spin" />
            <span>Switching modes...</span>
          </div>
        )}

        <div className="bg-muted p-3 rounded-md">
          <p className="text-xs text-muted-foreground">
            💡 <strong>Tip:</strong> Use mock data for quick testing and
            development. Switch to real data when you want to persist changes
            to Supabase.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default DataModeToggle;
