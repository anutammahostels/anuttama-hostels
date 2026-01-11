import { Plus, QrCode, UserPlus, Receipt, Wrench, FileText, Send, LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";

interface Action {
  icon: LucideIcon;
  label: string;
  shortLabel: string;
  iconBg: string;
  hoverBg: string;
  path: string;
}

const actions: Action[] = [
  { 
    icon: UserPlus, 
    label: "Add Student",
    shortLabel: "Student",
    iconBg: "bg-gradient-to-br from-hostylia-navy to-hostylia-navy-light",
    hoverBg: "hover:border-hostylia-navy/30",
    path: "/dashboard/students"
  },
  { 
    icon: QrCode, 
    label: "Issue Pass",
    shortLabel: "Pass",
    iconBg: "bg-gradient-to-br from-hostylia-forest to-hostylia-forest-light",
    hoverBg: "hover:border-hostylia-forest/30",
    path: "/dashboard/passes"
  },
  { 
    icon: Receipt, 
    label: "Create Invoice",
    shortLabel: "Invoice",
    iconBg: "bg-gradient-to-br from-amber-500 to-orange-500",
    hoverBg: "hover:border-amber-500/30",
    path: "/dashboard/billing"
  },
  { 
    icon: Wrench, 
    label: "Log Ticket",
    shortLabel: "Ticket",
    iconBg: "bg-gradient-to-br from-rose-500 to-pink-500",
    hoverBg: "hover:border-rose-500/30",
    path: "/dashboard/maintenance"
  },
  { 
    icon: FileText, 
    label: "Room Allocation",
    shortLabel: "Rooms",
    iconBg: "bg-gradient-to-br from-purple-500 to-violet-500",
    hoverBg: "hover:border-purple-500/30",
    path: "/dashboard/rooms"
  },
  { 
    icon: Send, 
    label: "Mess",
    shortLabel: "Mess",
    iconBg: "bg-gradient-to-br from-cyan-500 to-blue-500",
    hoverBg: "hover:border-cyan-500/30",
    path: "/dashboard/mess"
  },
];

export const QuickActions = () => {
  const navigate = useNavigate();

  return (
    <div className="rounded-xl md:rounded-2xl border border-border/50 bg-card p-3 md:p-6 shadow-sm">
      <div className="flex items-center justify-between mb-3 md:mb-6">
        <h3 className="font-bold text-sm md:text-lg text-card-foreground">Quick Actions</h3>
        <Button variant="ghost" size="sm" className="text-hostylia-forest hover:text-hostylia-forest-light hover:bg-hostylia-forest/10 text-xs md:text-sm h-7 md:h-9 px-2 md:px-3">
          <Plus className="h-3 w-3 md:h-4 md:w-4 mr-1" />
          <span className="hidden sm:inline">Customize</span>
        </Button>
      </div>

      <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 md:gap-3">
        {actions.map((action) => (
          <button
            key={action.label}
            onClick={() => navigate(action.path)}
            className={cn(
              "flex flex-col items-center gap-1.5 md:gap-3 p-2 md:p-4 rounded-lg md:rounded-xl bg-secondary/30 hover:bg-secondary/60 border-2 border-transparent transition-all duration-300 group",
              action.hoverBg
            )}
          >
            <div className={cn(
              "p-2 md:p-3.5 rounded-lg md:rounded-xl shadow-lg transition-all duration-300 group-hover:scale-110 group-hover:shadow-xl",
              action.iconBg
            )}>
              <action.icon className="h-3.5 w-3.5 md:h-5 md:w-5 text-white" />
            </div>
            <span className="text-[10px] md:text-sm font-semibold text-foreground text-center leading-tight">
              <span className="md:hidden">{action.shortLabel}</span>
              <span className="hidden md:inline">{action.label}</span>
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};