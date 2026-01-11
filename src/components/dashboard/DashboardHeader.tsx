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
  const userName = profile?.full_name || profile?.email?.split('@')[0] || 'User';
  const propertyName = property?.name || 'Select Property';

  return (
    <header className="sticky top-0 z-30 h-16 bg-background/95 backdrop-blur-xl border-b border-border/50 shadow-sm">
      <div className="flex items-center justify-between h-full px-4 lg:px-6">
        {/* Left section */}
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden hover:bg-secondary"
            onClick={onMenuClick}
          >
            <Menu className="h-5 w-5" />
          </Button>
          
          {/* Search */}
          <div className="relative hidden md:block">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search students, rooms, tickets..."
              className="w-80 pl-10 h-10 bg-secondary/70 border-border/50 focus:border-primary focus:bg-background transition-all rounded-xl"
            />
          </div>
        </div>

        {/* Right section */}
        <div className="flex items-center gap-2 lg:gap-3">
          {/* Current Property Selector */}
          {isLoading ? (
            <Skeleton className="h-10 w-36 rounded-xl hidden sm:block" />
          ) : (
            <button className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-xl bg-secondary/70 hover:bg-secondary border border-border/50 transition-all group">
              <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
              <span className="text-sm font-medium text-foreground truncate max-w-[120px]">
                {propertyName}
              </span>
              <ChevronDown className="h-3.5 w-3.5 text-muted-foreground group-hover:text-foreground transition-colors" />
            </button>
          )}

          {/* Theme toggle */}
          <Button variant="ghost" size="icon" className="hover:bg-secondary rounded-xl">
            <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          </Button>

          {/* Notifications */}
          <Button variant="ghost" size="icon" className="relative hover:bg-secondary rounded-xl">
            <Bell className="h-5 w-5" />
            <span className="absolute top-2 right-2 flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-hostylia-forest opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-hostylia-forest"></span>
            </span>
          </Button>

          {/* Profile */}
          <button className="flex items-center gap-2.5 p-1.5 pr-3 rounded-xl hover:bg-secondary transition-all group">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-hostylia-navy to-hostylia-forest flex items-center justify-center ring-2 ring-hostylia-forest/20 group-hover:ring-hostylia-forest/40 transition-all">
              <span className="text-white text-sm font-semibold uppercase">{userInitial}</span>
            </div>
            <span className="hidden lg:block text-sm font-medium text-foreground">{userName}</span>
          </button>
        </div>
      </div>
    </header>
  );
};