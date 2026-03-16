import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Shield,
  LayoutDashboard,
  Building2,
  Users,
  MessageSquareWarning,
  Settings,
  X,
  LogOut,
  Megaphone,
  BarChart3,
  Landmark,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

interface SuperAdminSidebarProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface MenuSection {
  title: string;
  items: {
    icon: typeof LayoutDashboard;
    label: string;
    path: string;
  }[];
}

const menuSections: MenuSection[] = [
  {
    title: "Overview",
    items: [
      { icon: LayoutDashboard, label: "Dashboard", path: "/superadmin" },
      { icon: Landmark, label: "Organizations", path: "/superadmin/organizations" },
    ],
  },
  {
    title: "Hostel Management",
    items: [
      { icon: Building2, label: "Properties", path: "/superadmin/properties" },
      { icon: Users, label: "User Management", path: "/superadmin/users" },
    ],
  },
  {
    title: "Monitoring",
    items: [
      { icon: MessageSquareWarning, label: "Complaints", path: "/superadmin/complaints" },
      { icon: Megaphone, label: "Notices", path: "/superadmin/notices" },
      { icon: BarChart3, label: "Reports", path: "/superadmin/reports" },
    ],
  },
  {
    title: "System",
    items: [
      { icon: Settings, label: "Settings", path: "/superadmin/settings" },
    ],
  },
];

export const SuperAdminSidebar = ({ open, onOpenChange }: SuperAdminSidebarProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { profile, signOut } = useAuth();
  const { toast } = useToast();

  const handleSignOut = async () => {
    await signOut();
    toast({ title: "Signed out", description: "You have been signed out successfully." });
    navigate('/');
  };

  const userInitial = profile?.full_name?.charAt(0) || profile?.email?.charAt(0) || 'S';
  const userName = profile?.full_name || profile?.email?.split('@')[0] || 'Super Admin';

  const SidebarContent = ({ isMobile = false }: { isMobile?: boolean }) => (
    <>
      {/* Logo */}
      <div className="flex items-center justify-between h-14 px-3 border-b border-hostylia-navy-light/30">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-red-600 to-orange-500 flex-shrink-0 transition-transform group-hover:scale-105">
            <Shield className="h-4 w-4 text-white" />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-sm text-white tracking-tight">Hostylia</span>
            <span className="text-[9px] text-hostylia-slate -mt-0.5">Super Admin</span>
          </div>
        </Link>
        {isMobile && (
          <button onClick={() => onOpenChange(false)} className="p-1.5 rounded-lg hover:bg-hostylia-navy-light/50 transition-colors">
            <X className="h-5 w-5 text-hostylia-slate" />
          </button>
        )}
      </div>

      {/* Role Badge */}
      <div className="px-3 py-2">
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold bg-gradient-to-r from-red-600 to-orange-500 text-white shadow-sm">
          <Shield className="h-3 w-3" />
          Super Admin
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-2 space-y-3 overflow-y-auto">
        {menuSections.map((section) => (
          <div key={section.title}>
            <p className="px-2 mb-1 text-[10px] font-semibold uppercase tracking-wider text-hostylia-slate/60">
              {section.title}
            </p>
            <div className="space-y-0.5">
              {section.items.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={isMobile ? () => onOpenChange(false) : undefined}
                    className={cn(
                      "flex items-center gap-2 px-2 py-2 rounded-lg transition-all duration-200 group",
                      isActive
                        ? "bg-gradient-to-r from-red-600 to-orange-500 text-white shadow-lg shadow-red-600/20"
                        : "text-hostylia-slate hover:bg-hostylia-navy-light/50 hover:text-white"
                    )}
                  >
                    <item.icon className={cn("h-4 w-4 flex-shrink-0 transition-transform duration-200", !isActive && "group-hover:scale-110")} />
                    <span className="text-sm font-medium">{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* User section */}
      <div className="p-2 border-t border-hostylia-navy-light/30">
        <div className="flex items-center gap-2 px-2 py-2 rounded-lg bg-hostylia-navy-light/30">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-red-600 to-orange-500 flex items-center justify-center flex-shrink-0 ring-2 ring-red-600/30">
            <span className="text-white text-xs font-semibold uppercase">{userInitial}</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-white truncate">{userName}</p>
            <p className="text-[10px] text-hostylia-slate truncate">Super Admin</p>
          </div>
          <button onClick={handleSignOut} className="p-1.5 rounded-lg hover:bg-hostylia-navy-light/50 transition-colors group" title="Sign out">
            <LogOut className="h-4 w-4 text-hostylia-slate group-hover:text-white transition-colors" />
          </button>
        </div>
      </div>
    </>
  );

  return (
    <>
      {open && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden animate-fade-in" onClick={() => onOpenChange(false)} />
      )}
      <aside className="fixed left-0 top-0 z-50 h-screen w-56 bg-gradient-to-b from-hostylia-charcoal via-hostylia-navy to-hostylia-navy-dark border-r border-hostylia-navy-light/20 transition-all duration-300 hidden lg:flex flex-col">
        <SidebarContent />
      </aside>
      <aside className={cn(
        "fixed left-0 top-0 z-50 h-screen w-64 bg-gradient-to-b from-hostylia-charcoal via-hostylia-navy to-hostylia-navy-dark border-r border-hostylia-navy-light/20 transition-transform duration-300 lg:hidden flex flex-col",
        open ? "translate-x-0" : "-translate-x-full"
      )}>
        <SidebarContent isMobile />
      </aside>
    </>
  );
};
