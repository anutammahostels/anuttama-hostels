import { Plus, QrCode, UserPlus, Receipt, Wrench, FileText, Send } from "lucide-react";
import { Button } from "@/components/ui/button";

const actions = [
  { icon: UserPlus, label: "Add Student", color: "from-blue-500 to-blue-600" },
  { icon: QrCode, label: "Issue Gate Pass", color: "from-emerald-500 to-emerald-600" },
  { icon: Receipt, label: "Create Invoice", color: "from-amber-500 to-orange-500" },
  { icon: Wrench, label: "Log Ticket", color: "from-rose-500 to-pink-500" },
  { icon: FileText, label: "Generate Report", color: "from-purple-500 to-violet-500" },
  { icon: Send, label: "Send Notice", color: "from-cyan-500 to-blue-500" },
];

export const QuickActions = () => {
  return (
    <div className="rounded-xl border border-border bg-card p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-semibold text-card-foreground">Quick Actions</h3>
        <Button variant="ghost" size="sm" className="text-primary">
          <Plus className="h-4 w-4 mr-1" />
          Customize
        </Button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {actions.map((action) => (
          <button
            key={action.label}
            className="flex flex-col items-center gap-3 p-4 rounded-xl bg-secondary/50 hover:bg-secondary border border-transparent hover:border-border transition-all group"
          >
            <div className={`p-3 rounded-xl bg-gradient-to-br ${action.color} transition-transform group-hover:scale-110`}>
              <action.icon className="h-5 w-5 text-white" />
            </div>
            <span className="text-sm font-medium text-foreground">{action.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};
