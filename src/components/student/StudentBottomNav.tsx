import { NavLink } from "react-router-dom";
import { LayoutDashboard, QrCode, Receipt, Wrench, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";

const sideItems = [
  { icon: LayoutDashboard, label: "Home", path: "/student", end: true },
  { icon: QrCode, label: "Passes", path: "/student/passes" },
];

const rightItems = [
  { icon: Wrench, label: "Maint.", path: "/student/maintenance" },
  { icon: MessageSquare, label: "Cmplnt", path: "/student/complaints" },
];

export const StudentBottomNav = () => {
  return (
    <nav
      className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-background/95 backdrop-blur-xl border-t border-border shadow-[0_-4px_20px_rgba(0,0,0,0.08)]"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="relative grid grid-cols-5 items-end h-16 px-2">
        {sideItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.end}
            className={({ isActive }) =>
              cn(
                "flex flex-col items-center justify-center gap-0.5 h-full text-[10px] font-medium transition-colors",
                isActive ? "text-blue-600" : "text-muted-foreground hover:text-foreground"
              )
            }
          >
            <item.icon className="h-5 w-5" />
            <span>{item.label}</span>
          </NavLink>
        ))}

        {/* Center highlighted: My Invoices */}
        <div className="flex justify-center">
          <NavLink
            to="/student/invoices"
            className={({ isActive }) =>
              cn(
                "flex flex-col items-center justify-center -mt-7 w-16 h-16 rounded-full shadow-lg ring-4 ring-background transition-all",
                isActive
                  ? "bg-blue-600 text-white scale-105"
                  : "bg-blue-500 text-white hover:bg-blue-600"
              )
            }
          >
            <Receipt className="h-6 w-6" />
            <span className="text-[9px] font-semibold mt-0.5">Bills</span>
          </NavLink>
        </div>

        {rightItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              cn(
                "flex flex-col items-center justify-center gap-0.5 h-full text-[10px] font-medium transition-colors",
                isActive ? "text-blue-600" : "text-muted-foreground hover:text-foreground"
              )
            }
          >
            <item.icon className="h-5 w-5" />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
};
