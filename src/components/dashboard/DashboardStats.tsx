import { Users, BedDouble, Receipt, AlertTriangle, TrendingUp, TrendingDown, LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCard {
  label: string;
  value: string;
  change: string;
  trend: "up" | "down";
  icon: LucideIcon;
  iconBg: string;
  glowColor: string;
}

const stats: StatCard[] = [
  {
    label: "Total Students",
    value: "1,247",
    change: "+12",
    trend: "up",
    icon: Users,
    iconBg: "bg-gradient-to-br from-hostylia-navy to-hostylia-navy-light",
    glowColor: "group-hover:shadow-hostylia-navy/20",
  },
  {
    label: "Occupancy Rate",
    value: "94.2%",
    change: "+2.1%",
    trend: "up",
    icon: BedDouble,
    iconBg: "bg-gradient-to-br from-hostylia-forest to-hostylia-forest-light",
    glowColor: "group-hover:shadow-hostylia-forest/20",
  },
  {
    label: "Pending Dues",
    value: "₹2.4L",
    change: "-₹32K",
    trend: "down",
    icon: Receipt,
    iconBg: "bg-gradient-to-br from-amber-500 to-orange-500",
    glowColor: "group-hover:shadow-amber-500/20",
  },
  {
    label: "Open Tickets",
    value: "18",
    change: "+3",
    trend: "up",
    icon: AlertTriangle,
    iconBg: "bg-gradient-to-br from-rose-500 to-pink-500",
    glowColor: "group-hover:shadow-rose-500/20",
  },
];

export const DashboardStats = () => {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, index) => (
        <div
          key={stat.label}
          className={cn(
            "group relative overflow-hidden rounded-2xl border border-border/50 bg-card p-5 transition-all duration-300 hover:shadow-xl",
            stat.glowColor,
            "animate-fade-in"
          )}
          style={{ animationDelay: `${index * 100}ms` }}
        >
          {/* Background decoration */}
          <div className="absolute -right-8 -top-8 w-32 h-32 rounded-full bg-gradient-to-br from-primary/5 to-transparent blur-2xl transition-all duration-300 group-hover:scale-150" />
          
          <div className="relative">
            {/* Icon and change */}
            <div className="flex items-center justify-between mb-4">
              <div className={cn(
                "inline-flex p-3 rounded-xl shadow-lg transition-transform duration-300 group-hover:scale-110",
                stat.iconBg
              )}>
                <stat.icon className="h-5 w-5 text-white" />
              </div>
              <div className={cn(
                "flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold",
                stat.trend === "up" 
                  ? "bg-success/10 text-success" 
                  : "bg-destructive/10 text-destructive"
              )}>
                {stat.trend === "up" ? (
                  <TrendingUp className="h-3.5 w-3.5" />
                ) : (
                  <TrendingDown className="h-3.5 w-3.5" />
                )}
                {stat.change}
              </div>
            </div>

            {/* Value and label */}
            <p className="text-3xl font-bold text-card-foreground mb-1 tracking-tight">
              {stat.value}
            </p>
            <p className="text-sm text-muted-foreground font-medium">{stat.label}</p>
          </div>
        </div>
      ))}
    </div>
  );
};
