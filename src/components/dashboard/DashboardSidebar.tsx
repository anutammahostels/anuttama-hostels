import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Building2,
  LayoutDashboard,
  Users,
  BedDouble,
  QrCode,
  UtensilsCrossed,
  Receipt,
  IndianRupee,
  Wrench,
  MessageSquareWarning,
  Settings,
  ChevronLeft,
  LogOut,
  Home,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import type { Database } from "@/integrations/supabase/types";

type AppRole = Database['public']['Enums']['app_role'];

interface DashboardSidebarProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface MenuItem {
  icon: typeof LayoutDashboard;
  label: string;
  shortLabel: string;
  path: string;
  roles?: AppRole[];
}

const allMenuItems: MenuItem[] = [
  { icon: LayoutDashboard, label: "Dashboard", shortLabel: "Home", path: "/dashboard" },
  { icon: Building2, label: "Properties", shortLabel: "Props", path: "/dashboard/properties", roles: ['super_admin', 'tenant_admin', 'warden'] },
  { icon: Users, label: "Students", shortLabel: "Students", path: "/dashboard/students", roles: ['super_admin', 'tenant_admin', 'warden'] },
  { icon: BedDouble, label: "Rooms", shortLabel: "Rooms", path: "/dashboard/rooms", roles: ['super_admin', 'tenant_admin', 'warden'] },
  { icon: QrCode, label: "Gate Passes", shortLabel: "Passes", path: "/dashboard/passes" },
  { icon: UtensilsCrossed, label: "Mess", shortLabel: "Mess", path: "/dashboard/mess" },
  { icon: Receipt, label: "Billing", shortLabel: "Bills", path: "/dashboard/billing" },
  { icon: IndianRupee, label: "Payments", shortLabel: "Pay", path: "/dashboard/payments" },
  { icon: Wrench, label: "Maintenance", shortLabel: "Maint.", path: "/dashboard/maintenance" },
  { icon: MessageSquareWarning, label: "Complaints", shortLabel: "Compl.", path: "/dashboard/complaints" },
  { icon: Settings, label: "Settings", shortLabel: "Settings", path: "/dashboard/settings" },
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
    if (!item.roles) return true;
    if (!role) return false;
    return item.roles.includes(role);
  });

  const userInitial = profile?.full_name?.charAt(0) || profile?.email?.charAt(0) || 'U';
  const userName = profile?.full_name || profile?.email?.split('@')[0] || 'User';
  const roleLabel = role ? roleLabels[role] : '';
  const roleBadgeColor = role ? roleBadgeColors[role] : 'bg-muted text-muted-foreground';

  const SidebarContent = ({ isMobile = false }: { isMobile?: boolean }) => (
    <>
      {/* Logo */}
      <div className="flex items-center justify-between h-14 px-3 border-b border-hostylia-navy-light/30">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-hostylia-forest to-hostylia-forest-light flex-shrink-0 transition-transform group-hover:scale-105">
            <Home className="h-4 w-4 text-white" />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-sm text-white tracking-tight">Hostylia</span>
            <span className="text-[9px] text-hostylia-slate -mt-0.5">Management Suite</span>
          </div>
        </Link>
        {isMobile && (
          <button
            onClick={() => onOpenChange(false)}
            className="p-1.5 rounded-lg hover:bg-hostylia-navy-light/50 transition-colors"
          >
            <X className="h-5 w-5 text-hostylia-slate" />
          </button>
        )}
      </div>

      {/* Role Badge */}
      {role && (
        <div className="px-3 py-2">
          <span className={cn(
            "inline-flex items-center px-2 py-1 rounded-full text-[10px] font-semibold shadow-sm",
            roleBadgeColor
          )}>
            {roleLabel}
          </span>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 p-2 space-y-0.5 overflow-y-auto">
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={isMobile ? () => onOpenChange(false) : undefined}
              className={cn(
                "flex items-center gap-2 px-2 py-2 rounded-lg transition-all duration-200 group",
                isActive
                  ? "bg-gradient-to-r from-hostylia-forest to-hostylia-forest-light text-white shadow-lg shadow-hostylia-forest/20"
                  : "text-hostylia-slate hover:bg-hostylia-navy-light/50 hover:text-white"
              )}
              title={item.label}
            >
              <item.icon className={cn(
                "h-4 w-4 flex-shrink-0 transition-transform duration-200",
                !isActive && "group-hover:scale-110"
              )} />
              <span className="text-sm font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* User section */}
      <div className="p-2 border-t border-hostylia-navy-light/30">
        <div className="flex items-center gap-2 px-2 py-2 rounded-lg bg-hostylia-navy-light/30">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-hostylia-forest to-hostylia-forest-light flex items-center justify-center flex-shrink-0 ring-2 ring-hostylia-forest/30">
            <span className="text-white text-xs font-semibold uppercase">{userInitial}</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-white truncate">{userName}</p>
            <p className="text-[10px] text-hostylia-slate truncate">{roleLabel}</p>
          </div>
          <button 
            onClick={handleSignOut}
            className="p-1.5 rounded-lg hover:bg-hostylia-navy-light/50 transition-colors group"
            title="Sign out"
          >
            <LogOut className="h-4 w-4 text-hostylia-slate group-hover:text-white transition-colors" />
          </button>
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

      {/* Desktop sidebar - Always collapsed */}
      <aside
        className="fixed left-0 top-0 z-50 h-screen w-52 bg-gradient-to-b from-hostylia-charcoal via-hostylia-navy to-hostylia-navy-dark border-r border-hostylia-navy-light/20 transition-all duration-300 hidden lg:flex flex-col"
      >
        <SidebarContent />
      </aside>

      {/* Mobile sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-0 z-50 h-screen w-64 bg-gradient-to-b from-hostylia-charcoal via-hostylia-navy to-hostylia-navy-dark border-r border-hostylia-navy-light/20 transition-transform duration-300 lg:hidden flex flex-col",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <SidebarContent isMobile />
      </aside>
    </>
  );
};