import { Bell, Search, Menu, Sun, Moon, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/useAuth";
import { useDashboard } from "@/hooks/useDashboard";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

interface DashboardHeaderProps {
  onMenuClick: () => void;
}

export const DashboardHeader = ({ onMenuClick }: DashboardHeaderProps) => {
  const { profile } = useAuth();
  const { property, isLoading } = useDashboard();
  
  const userInitial = profile?.full_name?.charAt(0) || profile?.email?.charAt(0) || 'U';
  const propertyName = property?.name || 'Property';

  return (
    <header className="sticky top-0 z-30 h-14 md:h-16 bg-background/95 backdrop-blur-xl border-b border-border/50 shadow-sm">
      <div className="flex items-center justify-between h-full px-3 md:px-4 lg:px-6">
        {/* Left section */}
        <div className="flex items-center gap-2 md:gap-3">
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 lg:hidden hover:bg-secondary"
            onClick={onMenuClick}
          >
            <Menu className="h-5 w-5" />
          </Button>
          
          {/* Search - Hidden on mobile */}
          <div className="relative hidden md:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search..."
              className="w-48 lg:w-72 pl-9 h-9 bg-secondary/70 border-border/50 focus:border-primary focus:bg-background transition-all rounded-lg text-sm"
            />
          </div>

          {/* Mobile Search Icon */}
          <Button variant="ghost" size="icon" className="h-9 w-9 md:hidden hover:bg-secondary">
            <Search className="h-4 w-4" />
          </Button>
        </div>

        {/* Right section */}
        <div className="flex items-center gap-1.5 md:gap-2 lg:gap-3">
          {/* Current Property Selector */}
          {isLoading ? (
            <Skeleton className="h-8 w-24 rounded-lg hidden sm:block" />
          ) : (
            <button className="hidden sm:flex items-center gap-1.5 px-2 md:px-3 py-1.5 md:py-2 rounded-lg bg-secondary/70 hover:bg-secondary border border-border/50 transition-all group">
              <div className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
              <span className="text-xs md:text-sm font-medium text-foreground truncate max-w-[80px] md:max-w-[120px]">
                {propertyName}
              </span>
              <ChevronDown className="h-3 w-3 text-muted-foreground" />
            </button>
          )}

          {/* Notifications */}
          <Button variant="ghost" size="icon" className="relative h-9 w-9 hover:bg-secondary rounded-lg">
            <Bell className="h-4 w-4" />
            <span className="absolute top-1.5 right-1.5 flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-hostylia-forest opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-hostylia-forest"></span>
            </span>
          </Button>

          {/* Profile */}
          <button className="flex items-center gap-2 p-1 md:p-1.5 rounded-lg hover:bg-secondary transition-all group">
            <div className="w-7 h-7 md:w-8 md:h-8 rounded-lg bg-gradient-to-br from-hostylia-navy to-hostylia-forest flex items-center justify-center ring-2 ring-hostylia-forest/20 group-hover:ring-hostylia-forest/40 transition-all">
              <span className="text-white text-xs md:text-sm font-semibold uppercase">{userInitial}</span>
            </div>
          </button>
        </div>
      </div>
    </header>
  );
};