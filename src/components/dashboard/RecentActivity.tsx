import { QrCode, Receipt, Wrench, UserCheck, LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface Activity {
  icon: LucideIcon;
  title: string;
  description: string;
  time: string;
  iconBg: string;
}

const activities: Activity[] = [
  {
    icon: QrCode,
    title: "Gate pass approved",
    description: "Rahul Sharma - Weekend leave",
    time: "2 min ago",
    iconBg: "bg-gradient-to-br from-hostylia-navy to-hostylia-navy-light",
  },
  {
    icon: Receipt,
    title: "Payment received",
    description: "₹15,000 from Room 204",
    time: "15 min ago",
    iconBg: "bg-gradient-to-br from-hostylia-forest to-hostylia-forest-light",
  },
  {
    icon: Wrench,
    title: "Ticket resolved",
    description: "AC repair - Block A, Room 112",
    time: "1 hour ago",
    iconBg: "bg-gradient-to-br from-amber-500 to-orange-500",
  },
  {
    icon: UserCheck,
    title: "New student check-in",
    description: "Priya Patel - Room 305B",
    time: "2 hours ago",
    iconBg: "bg-gradient-to-br from-purple-500 to-violet-500",
  },
  {
    icon: QrCode,
    title: "Late entry logged",
    description: "Amit Kumar - 11:45 PM",
    time: "3 hours ago",
    iconBg: "bg-gradient-to-br from-rose-500 to-pink-500",
  },
];

export const RecentActivity = () => {
  return (
    <div className="rounded-2xl border border-border/50 bg-card p-6 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-bold text-lg text-card-foreground">Recent Activity</h3>
        <button className="text-sm font-semibold text-hostylia-forest hover:text-hostylia-forest-light transition-colors">
          View all
        </button>
      </div>

      <div className="space-y-4">
        {activities.map((activity, index) => (
          <div 
            key={index} 
            className="flex items-start gap-3 p-3 -mx-3 rounded-xl hover:bg-secondary/50 transition-colors group"
          >
            <div className={cn(
              "p-2.5 rounded-xl shadow-md transition-transform group-hover:scale-110",
              activity.iconBg
            )}>
              <activity.icon className="h-4 w-4 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-card-foreground truncate">
                {activity.title}
              </p>
              <p className="text-xs text-muted-foreground truncate mt-0.5">
                {activity.description}
              </p>
            </div>
            <span className="text-xs text-muted-foreground whitespace-nowrap font-medium">
              {activity.time}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
