import { Users, BedDouble, Receipt, AlertTriangle, TrendingUp, TrendingDown, LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { useDashboard } from "@/hooks/useDashboard";
import { Skeleton } from "@/components/ui/skeleton";

interface StatCard {
  label: string;
  value: string;
  change: string;
  trend: "up" | "down" | "neutral";
  icon: LucideIcon;
  iconBg: string;
  glowColor: string;
}

export const DashboardStats = () => {
  const { stats, isLoading } = useDashboard();

  const formatCurrency = (value: number) => {
    if (value >= 100000) return `₹${(value / 100000).toFixed(1)}L`;
    if (value >= 1000) return `₹${(value / 1000).toFixed(1)}K`;
    return `₹${value}`;
  };

  const statsData: StatCard[] = [
    {
      label: "Total Students",
      value: stats.totalStudents.toLocaleString(),
      change: stats.studentsChange > 0 ? `+${stats.studentsChange}` : stats.studentsChange.toString(),
      trend: stats.studentsChange >= 0 ? "up" : "down",
      icon: Users,
      iconBg: "bg-gradient-to-br from-hostylia-navy to-hostylia-navy-light",
      glowColor: "group-hover:shadow-hostylia-navy/20",
    },
    {
      label: "Occupancy Rate",
      value: `${stats.occupancyRate}%`,
      change: stats.occupancyChange > 0 ? `+${stats.occupancyChange}%` : `${stats.occupancyChange}%`,
      trend: stats.occupancyChange >= 0 ? "up" : "down",
      icon: BedDouble,
      iconBg: "bg-gradient-to-br from-hostylia-forest to-hostylia-forest-light",
      glowColor: "group-hover:shadow-hostylia-forest/20",
    },
    {
      label: "Pending Dues",
      value: formatCurrency(stats.pendingDues),
      change: stats.duesChange !== 0 ? formatCurrency(Math.abs(stats.duesChange)) : "—",
      trend: stats.duesChange <= 0 ? "down" : "up",
      icon: Receipt,
      iconBg: "bg-gradient-to-br from-amber-500 to-orange-500",
      glowColor: "group-hover:shadow-amber-500/20",
    },
    {
      label: "Open Tickets",
      value: stats.openTickets.toString(),
      change: stats.ticketsChange !== 0 ? `+${stats.ticketsChange}` : "—",
      trend: stats.ticketsChange > 0 ? "up" : "neutral",
      icon: AlertTriangle,
      iconBg: "bg-gradient-to-br from-rose-500 to-pink-500",
      glowColor: "group-hover:shadow-rose-500/20",
    },
  ];

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="rounded-2xl border border-border/50 bg-card p-5">
            <div className="flex items-center justify-between mb-4">
              <Skeleton className="h-11 w-11 rounded-xl" />
              <Skeleton className="h-6 w-16 rounded-full" />
            </div>
            <Skeleton className="h-9 w-24 mb-1" />
            <Skeleton className="h-4 w-20" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {statsData.map((stat, index) => (
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
              {stat.change !== "—" && stat.trend !== "neutral" && (
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
              )}
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