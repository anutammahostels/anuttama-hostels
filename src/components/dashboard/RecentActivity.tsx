import { QrCode, Receipt, Wrench, UserCheck, LucideIcon, Activity } from "lucide-react";
import { cn } from "@/lib/utils";
import { useDashboard, type RecentActivityItem } from "@/hooks/useDashboard";
import { Skeleton } from "@/components/ui/skeleton";

const getActivityIcon = (type: RecentActivityItem['type']): { icon: LucideIcon; bg: string } => {
  switch (type) {
    case 'gate_pass':
      return { 
        icon: QrCode, 
        bg: "bg-gradient-to-br from-hostylia-navy to-hostylia-navy-light" 
      };
    case 'payment':
      return { 
        icon: Receipt, 
        bg: "bg-gradient-to-br from-hostylia-forest to-hostylia-forest-light" 
      };
    case 'ticket':
      return { 
        icon: Wrench, 
        bg: "bg-gradient-to-br from-amber-500 to-orange-500" 
      };
    case 'check_in':
      return { 
        icon: UserCheck, 
        bg: "bg-gradient-to-br from-purple-500 to-violet-500" 
      };
    case 'late_entry':
      return { 
        icon: QrCode, 
        bg: "bg-gradient-to-br from-rose-500 to-pink-500" 
      };
    default:
      return { 
        icon: Activity, 
        bg: "bg-gradient-to-br from-gray-500 to-gray-600" 
      };
  }
};

export const RecentActivity = () => {
  const { recentActivity, isLoading } = useDashboard();

  if (isLoading) {
    return (
      <div className="rounded-xl md:rounded-2xl border border-border/50 bg-card p-3 md:p-6 shadow-sm">
        <div className="flex items-center justify-between mb-3 md:mb-6">
          <Skeleton className="h-5 w-24 md:h-6 md:w-32" />
          <Skeleton className="h-4 w-12 md:w-16" />
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-start gap-2 md:gap-3 p-2 md:p-3">
              <Skeleton className="h-7 w-7 md:h-9 md:w-9 rounded-lg md:rounded-xl" />
              <div className="flex-1">
                <Skeleton className="h-3 w-24 md:h-4 md:w-32 mb-1" />
                <Skeleton className="h-2 w-20 md:h-3 md:w-24" />
              </div>
              <Skeleton className="h-3 w-12 md:w-16" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl md:rounded-2xl border border-border/50 bg-card p-3 md:p-6 shadow-sm">
      <div className="flex items-center justify-between mb-3 md:mb-6">
        <h3 className="font-bold text-sm md:text-lg text-card-foreground">Recent Activity</h3>
        <button className="text-xs md:text-sm font-semibold text-hostylia-forest hover:text-hostylia-forest-light transition-colors">
          View all
        </button>
      </div>

      {recentActivity.length === 0 ? (
        <div className="text-center py-6">
          <Activity className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
          <p className="text-xs md:text-sm text-muted-foreground">No recent activity</p>
        </div>
      ) : (
        <div className="space-y-2 md:space-y-4">
          {recentActivity.slice(0, 4).map((activity) => {
            const { icon: Icon, bg } = getActivityIcon(activity.type);
            return (
              <div 
                key={activity.id} 
                className="flex items-start gap-2 md:gap-3 p-2 md:p-3 -mx-2 md:-mx-3 rounded-lg md:rounded-xl hover:bg-secondary/50 transition-colors group"
              >
                <div className={cn(
                  "p-1.5 md:p-2.5 rounded-lg md:rounded-xl shadow-md transition-transform group-hover:scale-110",
                  bg
                )}>
                  <Icon className="h-3 w-3 md:h-4 md:w-4 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs md:text-sm font-semibold text-card-foreground truncate">
                    {activity.title}
                  </p>
                  <p className="text-[10px] md:text-xs text-muted-foreground truncate mt-0.5">
                    {activity.description}
                  </p>
                </div>
                <span className="text-[10px] md:text-xs text-muted-foreground whitespace-nowrap font-medium">
                  {activity.time}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};