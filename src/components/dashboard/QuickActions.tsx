import { Plus, QrCode, UserPlus, Receipt, Wrench, FileText, Send, LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";

interface Action {
  icon: LucideIcon;
  label: string;
  iconBg: string;
  hoverBg: string;
  path: string;
}

const actions: Action[] = [
  { 
    icon: UserPlus, 
    label: "Add Student", 
    iconBg: "bg-gradient-to-br from-hostylia-navy to-hostylia-navy-light",
    hoverBg: "hover:border-hostylia-navy/30",
    path: "/students"
  },
  { 
    icon: QrCode, 
    label: "Issue Gate Pass", 
    iconBg: "bg-gradient-to-br from-hostylia-forest to-hostylia-forest-light",
    hoverBg: "hover:border-hostylia-forest/30",
    path: "/gate-passes"
  },
  { 
    icon: Receipt, 
    label: "Create Invoice", 
    iconBg: "bg-gradient-to-br from-amber-500 to-orange-500",
    hoverBg: "hover:border-amber-500/30",
    path: "/billing"
  },
  { 
    icon: Wrench, 
    label: "Log Ticket", 
    iconBg: "bg-gradient-to-br from-rose-500 to-pink-500",
    hoverBg: "hover:border-rose-500/30",
    path: "/maintenance"
  },
  { 
    icon: FileText, 
    label: "Room Allocation", 
    iconBg: "bg-gradient-to-br from-purple-500 to-violet-500",
    hoverBg: "hover:border-purple-500/30",
    path: "/room-allocation"
  },
  { 
    icon: Send, 
    label: "Mess Management", 
    iconBg: "bg-gradient-to-br from-cyan-500 to-blue-500",
    hoverBg: "hover:border-cyan-500/30",
    path: "/mess-management"
  },
];

export const QuickActions = () => {
  const navigate = useNavigate();

  return (
    <div className="rounded-2xl border border-border/50 bg-card p-6 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-bold text-lg text-card-foreground">Quick Actions</h3>
        <Button variant="ghost" size="sm" className="text-hostylia-forest hover:text-hostylia-forest-light hover:bg-hostylia-forest/10">
          <Plus className="h-4 w-4 mr-1.5" />
          Customize
        </Button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {actions.map((action) => (
          <button
            key={action.label}
            onClick={() => navigate(action.path)}
            className={cn(
              "flex flex-col items-center gap-3 p-4 rounded-xl bg-secondary/30 hover:bg-secondary/60 border-2 border-transparent transition-all duration-300 group",
              action.hoverBg
            )}
          >
            <div className={cn(
              "p-3.5 rounded-xl shadow-lg transition-all duration-300 group-hover:scale-110 group-hover:shadow-xl",
              action.iconBg
            )}>
              <action.icon className="h-5 w-5 text-white" />
            </div>
            <span className="text-sm font-semibold text-foreground text-center">{action.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};