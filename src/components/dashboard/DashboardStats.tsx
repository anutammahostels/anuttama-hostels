import { Users, BedDouble, Receipt, AlertTriangle, TrendingUp, TrendingDown, Undo2, LucideIcon } from "lucide-react";
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
      label: "Students",
      value: stats.totalStudents.toLocaleString(),
      change: stats.studentsChange > 0 ? `+${stats.studentsChange}` : stats.studentsChange.toString(),
      trend: stats.studentsChange >= 0 ? "up" : "down",
      icon: Users,
      iconBg: "bg-gradient-to-br from-hostylia-navy to-hostylia-navy-light",
      glowColor: "group-hover:shadow-hostylia-navy/20",
    },
    {
      label: "Occupancy",
      value: `${stats.occupancyRate}%`,
      change: stats.occupancyChange > 0 ? `+${stats.occupancyChange}%` : `${stats.occupancyChange}%`,
      trend: stats.occupancyChange >= 0 ? "up" : "down",
      icon: BedDouble,
      iconBg: "bg-gradient-to-br from-hostylia-forest to-hostylia-forest-light",
      glowColor: "group-hover:shadow-hostylia-forest/20",
    },
    {
      label: "Dues",
      value: formatCurrency(stats.pendingDues),
      change: stats.duesChange !== 0 ? formatCurrency(Math.abs(stats.duesChange)) : "—",
      trend: stats.duesChange <= 0 ? "down" : "up",
      icon: Receipt,
      iconBg: "bg-gradient-to-br from-amber-500 to-orange-500",
      glowColor: "group-hover:shadow-amber-500/20",
    },
    {
      label: "Tickets",
      value: stats.openTickets.toString(),
      change: stats.ticketsChange !== 0 ? `+${stats.ticketsChange}` : "—",
      trend: stats.ticketsChange > 0 ? "up" : "neutral",
      icon: AlertTriangle,
      iconBg: "bg-gradient-to-br from-rose-500 to-pink-500",
      glowColor: "group-hover:shadow-rose-500/20",
    },
    {
      label: "Refunds",
      value: formatCurrency(stats.totalRefunds),
      change: stats.refundsCount > 0 ? `${stats.refundsCount} processed` : "—",
      trend: stats.refundsCount > 0 ? "down" : "neutral",
      icon: Undo2,
      iconBg: "bg-gradient-to-br from-orange-500 to-red-500",
      glowColor: "group-hover:shadow-orange-500/20",
    },
  ];

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="rounded-xl md:rounded-2xl border border-border/50 bg-card p-3 md:p-5">
            <div className="flex items-center justify-between mb-2 md:mb-4">
              <Skeleton className="h-8 w-8 md:h-11 md:w-11 rounded-lg md:rounded-xl" />
              <Skeleton className="h-5 w-12 md:h-6 md:w-16 rounded-full" />
            </div>
            <Skeleton className="h-6 w-16 md:h-9 md:w-24 mb-1" />
            <Skeleton className="h-3 w-14 md:h-4 md:w-20" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-4">
      {statsData.map((stat, index) => (
        <div
          key={stat.label}
          className={cn(
            "group relative overflow-hidden rounded-xl md:rounded-2xl border border-border/50 bg-card p-3 md:p-5 transition-all duration-300 hover:shadow-xl",
            stat.glowColor,
            "animate-fade-in"
          )}
          style={{ animationDelay: `${index * 100}ms` }}
        >
          {/* Background decoration */}
          <div className="absolute -right-4 -top-4 md:-right-8 md:-top-8 w-16 h-16 md:w-32 md:h-32 rounded-full bg-gradient-to-br from-primary/5 to-transparent blur-2xl transition-all duration-300 group-hover:scale-150" />
          
          <div className="relative">
            {/* Icon and change */}
            <div className="flex items-center justify-between mb-2 md:mb-4">
              <div className={cn(
                "inline-flex p-2 md:p-3 rounded-lg md:rounded-xl shadow-lg transition-transform duration-300 group-hover:scale-110",
                stat.iconBg
              )}>
                <stat.icon className="h-3.5 w-3.5 md:h-5 md:w-5 text-white" />
              </div>
              {stat.change !== "—" && stat.trend !== "neutral" && (
                <div className={cn(
                  "flex items-center gap-1 px-1.5 md:px-2.5 py-0.5 md:py-1 rounded-full text-[10px] md:text-xs font-semibold",
                  stat.trend === "up" 
                    ? "bg-success/10 text-success" 
                    : "bg-destructive/10 text-destructive"
                )}>
                  {stat.trend === "up" ? (
                    <TrendingUp className="h-2.5 w-2.5 md:h-3.5 md:w-3.5" />
                  ) : (
                    <TrendingDown className="h-2.5 w-2.5 md:h-3.5 md:w-3.5" />
                  )}
                  <span className="hidden sm:inline">{stat.change}</span>
                </div>
              )}
            </div>

            {/* Value and label */}
            <p className="text-lg md:text-2xl lg:text-3xl font-bold text-card-foreground mb-0.5 md:mb-1 tracking-tight">
              {stat.value}
            </p>
            <p className="text-[10px] md:text-sm text-muted-foreground font-medium">{stat.label}</p>
          </div>
        </div>
      ))}
    </div>
  );
};
