import { Link, useLocation, useNavigate } from "react-router-dom";
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
  Home,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { HostyliaLogo } from "@/components/brand/HostyliaLogo";
import type { Database } from "@/integrations/supabase/types";

type AppRole = Database['public']['Enums']['app_role'];

interface DashboardSidebarProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface MenuItem {
  icon: typeof LayoutDashboard;
  label: string;
  path: string;
  roles?: AppRole[];
}

const allMenuItems: MenuItem[] = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard" },
  { icon: Building2, label: "Properties", path: "/dashboard/properties", roles: ['super_admin', 'tenant_admin', 'warden'] },
  { icon: Users, label: "Students", path: "/dashboard/students", roles: ['super_admin', 'tenant_admin', 'warden'] },
  { icon: BedDouble, label: "Room Allocation", path: "/dashboard/rooms", roles: ['super_admin', 'tenant_admin', 'warden'] },
  { icon: QrCode, label: "Gate Passes", path: "/dashboard/passes" },
  { icon: UtensilsCrossed, label: "Mess Management", path: "/dashboard/mess" },
  { icon: Receipt, label: "Billing", path: "/dashboard/billing" },
  { icon: Wrench, label: "Maintenance", path: "/dashboard/maintenance" },
  { icon: Settings, label: "Settings", path: "/dashboard/settings" },
];

const roleLabels: Record<AppRole, string> = {
  super_admin: 'Super Admin',
  tenant_admin: 'Owner',
  warden: 'Warden',
  student: 'Student',
  parent: 'Parent',
  security_guard: 'Guard',
};

const roleBadgeColors: Record<AppRole, string> = {
  super_admin: 'bg-hostylia-forest text-white',
  tenant_admin: 'bg-hostylia-navy-light text-white',
  warden: 'bg-amber-600 text-white',
  student: 'bg-blue-600 text-white',
  parent: 'bg-purple-600 text-white',
  security_guard: 'bg-slate-600 text-white',
};

export const DashboardSidebar = ({ open, onOpenChange }: DashboardSidebarProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { profile, role, signOut } = useAuth();
  const { toast } = useToast();

  const handleSignOut = async () => {
    await signOut();
    toast({
      title: "Signed out",
      description: "You have been signed out successfully.",
    });
    navigate('/');
  };

  // Filter menu items based on user role
  const menuItems = allMenuItems.filter(item => {
    if (!item.roles) return true; // No role restriction
    if (!role) return false;
    return item.roles.includes(role);
  });

  const userInitial = profile?.full_name?.charAt(0) || profile?.email?.charAt(0) || 'U';
  const userName = profile?.full_name || profile?.email?.split('@')[0] || 'User';
  const userEmail = profile?.email || '';
  const roleLabel = role ? roleLabels[role] : '';
  const roleBadgeColor = role ? roleBadgeColors[role] : 'bg-muted text-muted-foreground';

  const SidebarContent = ({ isMobile = false }: { isMobile?: boolean }) => (
    <>
      {/* Logo */}
      <div className="flex items-center justify-between h-16 px-4 border-b border-hostylia-navy-light/30">
        <Link to="/" className="flex items-center gap-3 group">
          <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-br from-hostylia-forest to-hostylia-forest-light flex-shrink-0 transition-transform group-hover:scale-105">
            <Home className="h-5 w-5 text-white" />
          </div>
          {(open || isMobile) && (
            <div className="flex flex-col">
              <span className="font-bold text-base text-white tracking-tight">Hostylia</span>
              <span className="text-[10px] text-hostylia-slate -mt-0.5">Management Suite</span>
            </div>
          )}
        </Link>
        {!isMobile && (
          <button
            onClick={() => onOpenChange(!open)}
            className="p-1.5 rounded-lg hover:bg-hostylia-navy-light/50 transition-colors"
          >
            <ChevronLeft
              className={cn(
                "h-4 w-4 text-hostylia-slate transition-transform duration-300",
                !open && "rotate-180"
              )}
            />
          </button>
        )}
      </div>

      {/* Role Badge */}
      {(open || isMobile) && role && (
        <div className="px-4 py-3">
          <span className={cn(
            "inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold shadow-sm",
            roleBadgeColor
          )}>
            {roleLabel}
          </span>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={isMobile ? () => onOpenChange(false) : undefined}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group",
                isActive
                  ? "bg-gradient-to-r from-hostylia-forest to-hostylia-forest-light text-white shadow-lg shadow-hostylia-forest/20"
                  : "text-hostylia-slate hover:bg-hostylia-navy-light/50 hover:text-white"
              )}
            >
              <item.icon className={cn(
                "h-5 w-5 flex-shrink-0 transition-transform duration-200",
                !isActive && "group-hover:scale-110"
              )} />
              {(open || isMobile) && <span className="font-medium">{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* User section */}
      <div className="p-3 border-t border-hostylia-navy-light/30">
        <div className={cn(
          "flex items-center gap-3 px-3 py-2.5 rounded-xl bg-hostylia-navy-light/30",
          (open || isMobile) ? "" : "justify-center"
        )}>
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-hostylia-forest to-hostylia-forest-light flex items-center justify-center flex-shrink-0 ring-2 ring-hostylia-forest/30">
            <span className="text-white text-sm font-semibold uppercase">{userInitial}</span>
          </div>
          {(open || isMobile) && (
            <>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white truncate">{userName}</p>
                <p className="text-xs text-hostylia-slate truncate">{userEmail}</p>
              </div>
              <button 
                onClick={handleSignOut}
                className="p-2 rounded-lg hover:bg-hostylia-navy-light/50 transition-colors group"
                title="Sign out"
              >
                <LogOut className="h-4 w-4 text-hostylia-slate group-hover:text-white transition-colors" />
              </button>
            </>
          )}
        </div>
      </div>
    </>
  );

  return (
    <>
      {/* Backdrop for mobile */}
      {open && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden animate-fade-in"
          onClick={() => onOpenChange(false)}
        />
      )}

      {/* Desktop sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-0 z-50 h-screen bg-gradient-to-b from-hostylia-charcoal via-hostylia-navy to-hostylia-navy-dark border-r border-hostylia-navy-light/20 transition-all duration-300 flex flex-col",
          open ? "w-64" : "w-20",
          "hidden lg:flex"
        )}
      >
        <SidebarContent />
      </aside>

      {/* Mobile sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-0 z-50 h-screen w-72 bg-gradient-to-b from-hostylia-charcoal via-hostylia-navy to-hostylia-navy-dark border-r border-hostylia-navy-light/20 transition-transform duration-300 lg:hidden flex flex-col",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <SidebarContent isMobile />
      </aside>
    </>
  );
};
