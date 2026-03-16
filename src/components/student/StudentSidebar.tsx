import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  QrCode,
  UtensilsCrossed,
  Receipt,
  Wrench,
  Bell,
  User,
  LogOut,
  Home,
  X,
  MessageSquare,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

interface StudentSidebarProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const menuItems = [
  { icon: LayoutDashboard, label: "Dashboard", shortLabel: "Home", path: "/student" },
  { icon: QrCode, label: "Gate Passes", shortLabel: "Passes", path: "/student/passes" },
  { icon: UtensilsCrossed, label: "Mess", shortLabel: "Mess", path: "/student/mess" },
  { icon: Receipt, label: "My Invoices", shortLabel: "Bills", path: "/student/invoices" },
  { icon: Wrench, label: "Maintenance", shortLabel: "Maint.", path: "/student/maintenance" },
  { icon: MessageSquare, label: "Complaints", shortLabel: "Cmplnt", path: "/student/complaints" },
  { icon: Bell, label: "Notices", shortLabel: "Notice", path: "/student/notices" },
  { icon: User, label: "Profile", shortLabel: "Profile", path: "/student/profile" },
];

export const StudentSidebar = ({ open, onOpenChange }: StudentSidebarProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { profile, signOut } = useAuth();
  const { toast } = useToast();

  const handleSignOut = async () => {
    await signOut();
    toast({ title: "Signed out", description: "You have been signed out successfully." });
    navigate("/");
  };

  const userInitial = profile?.full_name?.charAt(0) || profile?.email?.charAt(0) || "S";
  const userName = profile?.full_name || profile?.email?.split("@")[0] || "Student";

  const SidebarContent = ({ isMobile = false }: { isMobile?: boolean }) => (
    <>
      <div className="flex items-center justify-between h-14 px-3 border-b border-hostylia-navy-light/30">
        <Link to="/student" className="flex items-center gap-2 group">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex-shrink-0 transition-transform group-hover:scale-105">
            <Home className="h-4 w-4 text-white" />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-sm text-white tracking-tight">Hostylia</span>
            <span className="text-[9px] text-hostylia-slate -mt-0.5">Student Portal</span>
          </div>
        </Link>
        {isMobile && (
          <button onClick={() => onOpenChange(false)} className="p-1.5 rounded-lg hover:bg-hostylia-navy-light/50 transition-colors">
            <X className="h-5 w-5 text-hostylia-slate" />
          </button>
        )}
      </div>

      <div className="px-3 py-2">
        <span className="inline-flex items-center px-2 py-1 rounded-full text-[10px] font-semibold shadow-sm bg-blue-600 text-white">
          Student
        </span>
      </div>

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
                  ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/20"
                  : "text-hostylia-slate hover:bg-hostylia-navy-light/50 hover:text-white"
              )}
              title={item.label}
            >
              <item.icon className={cn("h-4 w-4 flex-shrink-0 transition-transform duration-200", !isActive && "group-hover:scale-110")} />
              {isMobile && <span className="text-sm font-medium">{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      <div className="p-2 border-t border-hostylia-navy-light/30">
        <div className={cn("flex items-center gap-2 px-2 py-2 rounded-lg bg-hostylia-navy-light/30", isMobile ? "" : "justify-center")}>
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center flex-shrink-0 ring-2 ring-blue-500/30">
            <span className="text-white text-xs font-semibold uppercase">{userInitial}</span>
          </div>
          {isMobile && (
            <>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-white truncate">{userName}</p>
                <p className="text-[10px] text-hostylia-slate truncate">Student</p>
              </div>
              <button onClick={handleSignOut} className="p-1.5 rounded-lg hover:bg-hostylia-navy-light/50 transition-colors group" title="Sign out">
                <LogOut className="h-4 w-4 text-hostylia-slate group-hover:text-white transition-colors" />
              </button>
            </>
          )}
        </div>
        {!isMobile && (
          <button onClick={handleSignOut} className="w-full mt-1 p-2 rounded-lg hover:bg-hostylia-navy-light/50 transition-colors group flex items-center justify-center" title="Sign out">
            <LogOut className="h-4 w-4 text-hostylia-slate group-hover:text-white transition-colors" />
          </button>
        )}
      </div>
    </>
  );

  return (
    <>
      {open && <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden animate-fade-in" onClick={() => onOpenChange(false)} />}
      <aside className="fixed left-0 top-0 z-50 h-screen w-14 bg-gradient-to-b from-hostylia-charcoal via-hostylia-navy to-hostylia-navy-dark border-r border-hostylia-navy-light/20 transition-all duration-300 hidden lg:flex flex-col">
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
