import { ReactNode } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  Building2,
  LogOut,
  LayoutDashboard,
  Users,
  Stethoscope,
  Bed,
  Brush,
  Settings,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useHospitalStore } from "@/store/hospitalStore";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

/**
 * AdminLayout
 *
 * Shared layout wrapper for all forthcoming agentic admin pages.
 * Provides:
 *  - Persistent sidebar navigation
 *  - Top header bar with hospital info & logout
 *  - Scrollable main content area
 *
 * Usage:
 *  <AdminLayout>
 *     <YourPageContent/>
 *  </AdminLayout>
 */

interface AdminLayoutProps {
  title?: string;
  children: ReactNode;
  hideSidebar?: boolean;
}

interface NavItem {
  label: string;
  to: string;
  icon: ReactNode;
  description?: string;
  soon?: boolean;
}

const navItems: NavItem[] = [
  {
    label: "Admin",
    to: "/admin",
    icon: <LayoutDashboard className="w-4 h-4" />,
    description: "Admin Dashboard",
  },
  {
    label: "Doctor",
    to: "/doctor-dashboard",
    icon: <Stethoscope className="w-4 h-4" />,
    description: "Doctor Dashboard",
  },
  {
    label: "Nurse",
    to: "/nurse-dashboard",
    icon: <Users className="w-4 h-4" />,
    description: "Nurse Dashboard",
  },
  {
    label: "Cleaning",
    to: "/cleaning",
    icon: <Brush className="w-4 h-4" />,
    description: "Cleaning Agent",
  },
  {
    label: "Beds",
    to: "/beds",
    icon: <Bed className="w-4 h-4" />,
    description: "Bed Management",
    soon: true,
  },
  {
    label: "Settings",
    to: "/settings",
    icon: <Settings className="w-4 h-4" />,
    description: "System Configuration",
    soon: true,
  },
];

const AdminLayout = ({ children, title, hideSidebar }: AdminLayoutProps) => {
  const navigate = useNavigate();
  const { hospital, user, setUser } = useHospitalStore();

  const handleLogout = () => {
    localStorage.removeItem("token");
    setUser(null);
    toast.success("Logged out");
    navigate("/");
  };

  // Show sidebar for admin users, hide for others unless explicitly shown
  const shouldShowSidebar =
    !hideSidebar && (user?.role === "admin" || user?.role === "Admin");

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      {/* Sidebar */}
      {shouldShowSidebar && (
        <aside className="hidden md:flex w-64 flex-col border-r border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
          <div className="p-4 flex items-center gap-3 border-b border-border">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center shrink-0">
              <Building2 className="w-5 h-5 text-primary-foreground" />
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-semibold truncate">CareFlow Nexus</p>
              <p className="text-xs text-muted-foreground truncate">
                {hospital?.name || "Hospital"}
              </p>
            </div>
          </div>
          <ScrollArea className="flex-1">
            <nav className="p-3 space-y-1">
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={(e) => {
                    if (item.soon) {
                      e.preventDefault();
                    }
                  }}
                  className={({ isActive }) =>
                    cn(
                      "group flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                      "hover:bg-primary/10 hover:text-primary",
                      isActive
                        ? "bg-primary/15 text-primary shadow-sm"
                        : "text-muted-foreground",
                      item.soon && "opacity-60 cursor-not-allowed",
                    )
                  }
                >
                  <span className="flex items-center justify-center w-5">
                    {item.icon}
                  </span>
                  <span className="truncate">{item.label}</span>
                  {item.soon && (
                    <span className="ml-auto text-[10px] uppercase tracking-wide bg-accent/20 text-accent px-1.5 py-0.5 rounded">
                      Soon
                    </span>
                  )}
                </NavLink>
              ))}
            </nav>
          </ScrollArea>
          <div className="p-4 border-t border-border">
            <Button
              variant="outline"
              size="sm"
              className="w-full justify-center"
              onClick={handleLogout}
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </aside>
      )}

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar (mobile + main) */}
        <header className="md:hidden flex items-center justify-between px-4 py-3 border-b border-border bg-card/90 backdrop-blur">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-md bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <Building2 className="w-5 h-5 text-primary-foreground" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-semibold">CareFlow Nexus</span>
              <span className="text-xs text-muted-foreground truncate">
                {hospital?.name || "Hospital"}
              </span>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleLogout}
            className="shrink-0"
          >
            <LogOut className="w-4 h-4" />
          </Button>
        </header>

        {/* Page header */}
        <div className="px-6 pt-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-xl md:text-2xl font-bold tracking-tight">
                {title || "Admin"}
              </h1>
              <p className="text-sm text-muted-foreground">
                {user?.role === "admin" || user?.role === "Admin"
                  ? "Autonomous Operations Control Center"
                  : user?.role === "doctor" || user?.role === "Doctor"
                    ? "Doctor Interface"
                    : user?.role === "nurse" || user?.role === "Nurse"
                      ? "Nurse Interface"
                      : user?.role === "cleaner" || user?.role === "Cleaner"
                        ? "Cleaner Interface"
                        : "CareFlow Interface"}
              </p>
            </div>
            {/* Placeholder for future filters / global actions */}
            <div className="flex items-center gap-2">
              {/* Future: global search, notifications, theme toggle */}
            </div>
          </div>
        </div>

        {/* Content */}
        <main className="p-6 pt-4 flex-1">
          <div className="h-full w-full">{children}</div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
