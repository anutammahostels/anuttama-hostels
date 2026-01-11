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
      <div className="rounded-2xl border border-border/50 bg-card p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-4 w-16" />
        </div>
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-start gap-3 p-3">
              <Skeleton className="h-9 w-9 rounded-xl" />
              <div className="flex-1">
                <Skeleton className="h-4 w-32 mb-1" />
                <Skeleton className="h-3 w-24" />
              </div>
              <Skeleton className="h-3 w-16" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-border/50 bg-card p-6 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-bold text-lg text-card-foreground">Recent Activity</h3>
        <button className="text-sm font-semibold text-hostylia-forest hover:text-hostylia-forest-light transition-colors">
          View all
        </button>
      </div>

      {recentActivity.length === 0 ? (
        <div className="text-center py-8">
          <Activity className="h-10 w-10 mx-auto text-muted-foreground mb-2" />
          <p className="text-muted-foreground">No recent activity</p>
        </div>
      ) : (
        <div className="space-y-4">
          {recentActivity.map((activity) => {
            const { icon: Icon, bg } = getActivityIcon(activity.type);
            return (
              <div 
                key={activity.id} 
                className="flex items-start gap-3 p-3 -mx-3 rounded-xl hover:bg-secondary/50 transition-colors group"
              >
                <div className={cn(
                  "p-2.5 rounded-xl shadow-md transition-transform group-hover:scale-110",
                  bg
                )}>
                  <Icon className="h-4 w-4 text-white" />
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
            );
          })}
        </div>
      )}
    </div>
  );
};