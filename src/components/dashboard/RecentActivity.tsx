import { QrCode, Receipt, Wrench, UserCheck } from "lucide-react";

const activities = [
  {
    icon: QrCode,
    title: "Gate pass approved",
    description: "Rahul Sharma - Weekend leave",
    time: "2 min ago",
    color: "bg-blue-500",
  },
  {
    icon: Receipt,
    title: "Payment received",
    description: "₹15,000 from Room 204",
    time: "15 min ago",
    color: "bg-emerald-500",
  },
  {
    icon: Wrench,
    title: "Ticket resolved",
    description: "AC repair - Block A, Room 112",
    time: "1 hour ago",
    color: "bg-amber-500",
  },
  {
    icon: UserCheck,
    title: "New student check-in",
    description: "Priya Patel - Room 305B",
    time: "2 hours ago",
    color: "bg-purple-500",
  },
  {
    icon: QrCode,
    title: "Late entry logged",
    description: "Amit Kumar - 11:45 PM",
    time: "3 hours ago",
    color: "bg-rose-500",
  },
];

export const RecentActivity = () => {
  return (
    <div className="rounded-xl border border-border bg-card p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-semibold text-card-foreground">Recent Activity</h3>
        <button className="text-sm text-primary hover:underline">View all</button>
      </div>

      <div className="space-y-4">
        {activities.map((activity, index) => (
          <div key={index} className="flex items-start gap-3">
            <div className={`p-2 rounded-lg ${activity.color}`}>
              <activity.icon className="h-3.5 w-3.5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-card-foreground truncate">
                {activity.title}
              </p>
              <p className="text-xs text-muted-foreground truncate">
                {activity.description}
              </p>
            </div>
            <span className="text-xs text-muted-foreground whitespace-nowrap">
              {activity.time}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
