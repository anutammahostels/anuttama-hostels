import { RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

interface PullToRefreshIndicatorProps {
  pullDistance: number;
  isRefreshing: boolean;
  progress: number;
  shouldTrigger: boolean;
}

export function PullToRefreshIndicator({
  pullDistance,
  isRefreshing,
  progress,
  shouldTrigger,
}: PullToRefreshIndicatorProps) {
  if (pullDistance === 0 && !isRefreshing) return null;

  return (
    <div 
      className="flex items-center justify-center overflow-hidden transition-all duration-200"
      style={{ 
        height: pullDistance,
        opacity: Math.min(progress * 2, 1),
      }}
    >
      <div 
        className={cn(
          "flex items-center justify-center w-10 h-10 rounded-full transition-all duration-200",
          shouldTrigger || isRefreshing 
            ? "bg-primary/20 text-primary" 
            : "bg-muted text-muted-foreground"
        )}
      >
        <RefreshCw 
          className={cn(
            "w-5 h-5 transition-transform duration-200",
            isRefreshing && "animate-spin"
          )}
          style={{
            transform: isRefreshing 
              ? undefined 
              : `rotate(${progress * 360}deg)`,
          }}
        />
      </div>
      {shouldTrigger && !isRefreshing && (
        <span className="ml-2 text-xs text-primary font-medium">
          Release to refresh
        </span>
      )}
      {isRefreshing && (
        <span className="ml-2 text-xs text-primary font-medium">
          Refreshing...
        </span>
      )}
    </div>
  );
}
