import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Building2,
  Eye,
  EyeOff,
  Loader2,
  User,
  Stethoscope,
  Shield,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";
import { useHospitalStore } from "@/store/hospitalStore";

const Login = () => {
  const [email, setEmail] = useState("admin@hospital.com");
  const [password, setPassword] = useState("admin123");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [userType, setUserType] = useState("admin"); // admin, nurse, doctor
  const navigate = useNavigate();
  const { setUser, setHospital } = useHospitalStore();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Mock response based on user type
      let mockUser;
      let redirectPath = "/";

      if (userType === "admin") {
        mockUser = {
          id: "1",
          email: email,
          role: "admin",
        };
        redirectPath = "/admin";
      } else if (userType === "nurse") {
        mockUser = {
          id: "2",
          email: email,
          role: "nurse",
        };
        redirectPath = "/nurse-dashboard";
      } else if (userType === "doctor") {
        mockUser = {
          id: "3",
          email: email,
          role: "doctor",
        };
        redirectPath = "/doctor-dashboard";
      }

      const mockHospital = {
        id: "1",
        name: "City General Hospital",
        location: "Mumbai",
        floors: 3,
        setup_complete: true, // Change to true after setup
      };

      localStorage.setItem("token", "mock-jwt-token");
      setUser(mockUser);
      setHospital(mockHospital);

      toast.success("Login successful!");

      navigate(redirectPath);
    } catch (error) {
      toast.error("Login failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Demo credentials based on user type
  const getDemoCredentials = () => {
    switch (userType) {
      case "admin":
        return { email: "admin@hospital.com", password: "admin123" };
      case "nurse":
        return { email: "n001@hospital.com", password: "nurse123" };
      case "doctor":
        return { email: "d001@hospital.com", password: "doctor123" };
      default:
        return { email: "admin@hospital.com", password: "admin123" };
    }
  };

  const demoCredentials = getDemoCredentials();

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-primary via-primary-glow to-accent">
      <Card className="w-full max-w-md shadow-[var(--shadow-elegant)]">
        <CardHeader className="space-y-3 text-center">
          <div className="mx-auto w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-[var(--shadow-glow)]">
            <Building2 className="w-8 h-8 text-primary-foreground" />
          </div>
          <CardTitle className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            CareFlow Nexus
          </CardTitle>
          <CardDescription className="text-base">
            AI Hospital Operating System
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* User Type Selection - Responsive for mobile */}
          <div className="flex flex-col sm:flex-row gap-2 mb-6">
            <Button
              variant={userType === "admin" ? "default" : "outline"}
              className={`w-full sm:flex-1 ${userType === "admin" ? "bg-gradient-to-r from-primary to-accent" : ""}`}
              onClick={() => setUserType("admin")}
            >
              <Shield className="w-4 h-4 mr-2" />
              <span className="truncate">Admin</span>
            </Button>
            <Button
              variant={userType === "nurse" ? "default" : "outline"}
              className={`w-full sm:flex-1 ${userType === "nurse" ? "bg-gradient-to-r from-primary to-accent" : ""}`}
              onClick={() => setUserType("nurse")}
            >
              <User className="w-4 h-4 mr-2" />
              <span className="truncate">Nurse</span>
            </Button>
            <Button
              variant={userType === "doctor" ? "default" : "outline"}
              className={`w-full sm:flex-1 ${userType === "doctor" ? "bg-gradient-to-r from-primary to-accent" : ""}`}
              onClick={() => setUserType("doctor")}
            >
              <Stethoscope className="w-4 h-4 mr-2" />
              <span className="truncate">Doctor</span>
            </Button>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder={`${userType}@hospital.com`}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isLoading}
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            <div className="p-4 bg-secondary rounded-lg border border-border">
              <p className="text-sm font-medium mb-2">Demo Credentials:</p>
              <p className="text-sm text-muted-foreground break-words">
                Email: {demoCredentials.email}
              </p>
              <p className="text-sm text-muted-foreground">
                Password: {demoCredentials.password}
              </p>
            </div>

            <Button
              type="submit"
              className="w-full h-11 bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-opacity shadow-[var(--shadow-glow)]"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Logging in...
                </>
              ) : (
                "Login"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;
