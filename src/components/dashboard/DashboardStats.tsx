import { Users, BedDouble, Receipt, AlertTriangle, TrendingUp, TrendingDown } from "lucide-react";

const stats = [
  {
    label: "Total Students",
    value: "1,247",
    change: "+12",
    trend: "up",
    icon: Users,
    color: "from-blue-500 to-blue-600",
  },
  {
    label: "Occupancy Rate",
    value: "94.2%",
    change: "+2.1%",
    trend: "up",
    icon: BedDouble,
    color: "from-emerald-500 to-emerald-600",
  },
  {
    label: "Pending Dues",
    value: "₹2.4L",
    change: "-₹32K",
    trend: "down",
    icon: Receipt,
    color: "from-amber-500 to-orange-500",
  },
  {
    label: "Open Tickets",
    value: "18",
    change: "+3",
    trend: "up",
    icon: AlertTriangle,
    color: "from-rose-500 to-pink-500",
  },
];

export const DashboardStats = () => {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="relative overflow-hidden rounded-xl border border-border bg-card p-5 transition-all hover:shadow-lg hover:shadow-primary/5"
        >
          {/* Background decoration */}
          <div className={`absolute -right-4 -top-4 w-24 h-24 rounded-full bg-gradient-to-br ${stat.color} opacity-10 blur-2xl`} />
          
          <div className="relative">
            {/* Icon and change */}
            <div className="flex items-center justify-between mb-3">
              <div className={`inline-flex p-2.5 rounded-lg bg-gradient-to-br ${stat.color}`}>
                <stat.icon className="h-4 w-4 text-white" />
              </div>
              <div className={`flex items-center gap-1 text-xs font-medium ${
                stat.trend === "up" ? "text-success" : "text-destructive"
              }`}>
                {stat.trend === "up" ? (
                  <TrendingUp className="h-3 w-3" />
                ) : (
                  <TrendingDown className="h-3 w-3" />
                )}
                {stat.change}
              </div>
            </div>

            {/* Value and label */}
            <p className="text-2xl font-bold text-card-foreground mb-1">
              {stat.value}
            </p>
            <p className="text-sm text-muted-foreground">{stat.label}</p>
          </div>
        </div>
      ))}
    </div>
  );
};
