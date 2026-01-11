import { Link, useLocation } from "react-router-dom";
import {
  Building2,
  LayoutDashboard,
  Users,
  BedDouble,
  QrCode,
  UtensilsCrossed,
  Receipt,
  Wrench,
  Settings,
  ChevronLeft,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface DashboardSidebarProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const menuItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard" },
  { icon: Building2, label: "Properties", path: "/dashboard/properties" },
  { icon: Users, label: "Students", path: "/dashboard/students" },
  { icon: BedDouble, label: "Room Allocation", path: "/dashboard/rooms" },
  { icon: QrCode, label: "Gate Passes", path: "/dashboard/passes" },
  { icon: UtensilsCrossed, label: "Mess Management", path: "/dashboard/mess" },
  { icon: Receipt, label: "Billing", path: "/dashboard/billing" },
  { icon: Wrench, label: "Maintenance", path: "/dashboard/maintenance" },
  { icon: Settings, label: "Settings", path: "/dashboard/settings" },
];

export const DashboardSidebar = ({ open, onOpenChange }: DashboardSidebarProps) => {
  const location = useLocation();

  return (
    <>
      {/* Backdrop for mobile */}
      {open && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => onOpenChange(false)}
        />
      )}

      <aside
        className={cn(
          "fixed left-0 top-0 z-50 h-screen bg-sidebar border-r border-sidebar-border transition-all duration-300",
          open ? "w-64" : "w-20",
          "hidden lg:block"
        )}
      >
        {/* Logo */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-sidebar-border">
          <Link to="/" className="flex items-center gap-3">
            <div className="flex items-center justify-center w-9 h-9 rounded-lg gradient-primary flex-shrink-0">
              <Building2 className="h-5 w-5 text-white" />
            </div>
            {open && (
              <span className="font-bold text-lg text-white">HostelHub</span>
            )}
          </Link>
          <button
            onClick={() => onOpenChange(!open)}
            className="p-1.5 rounded-lg hover:bg-sidebar-accent transition-colors"
          >
            <ChevronLeft
              className={cn(
                "h-4 w-4 text-sidebar-foreground transition-transform",
                !open && "rotate-180"
              )}
            />
          </button>
        </div>

        {/* Navigation */}
        <nav className="p-3 space-y-1">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200",
                  isActive
                    ? "bg-sidebar-primary text-sidebar-primary-foreground"
                    : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                )}
              >
                <item.icon className="h-5 w-5 flex-shrink-0" />
                {open && <span className="font-medium">{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* User section */}
        <div className="absolute bottom-0 left-0 right-0 p-3 border-t border-sidebar-border">
          <div className={cn(
            "flex items-center gap-3 px-3 py-2 rounded-lg",
            open ? "" : "justify-center"
          )}>
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center flex-shrink-0">
              <span className="text-white text-sm font-medium">A</span>
            </div>
            {open && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">Admin User</p>
                <p className="text-xs text-sidebar-foreground/70 truncate">admin@hostelhub.com</p>
              </div>
            )}
            {open && (
              <button className="p-1.5 rounded-lg hover:bg-sidebar-accent transition-colors">
                <LogOut className="h-4 w-4 text-sidebar-foreground" />
              </button>
            )}
          </div>
        </div>
      </aside>

      {/* Mobile sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-0 z-50 h-screen w-64 bg-sidebar border-r border-sidebar-border transition-transform duration-300 lg:hidden",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Same content as desktop */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-sidebar-border">
          <Link to="/" className="flex items-center gap-3">
            <div className="flex items-center justify-center w-9 h-9 rounded-lg gradient-primary">
              <Building2 className="h-5 w-5 text-white" />
            </div>
            <span className="font-bold text-lg text-white">HostelHub</span>
          </Link>
        </div>

        <nav className="p-3 space-y-1">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => onOpenChange(false)}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200",
                  isActive
                    ? "bg-sidebar-primary text-sidebar-primary-foreground"
                    : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                )}
              >
                <item.icon className="h-5 w-5" />
                <span className="font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </aside>
    </>
  );
};
