import { Bell, Search, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/useAuth";

interface DashboardHeaderProps {
  onMenuClick: () => void;
}

export const DashboardHeader = ({ onMenuClick }: DashboardHeaderProps) => {
  const { profile } = useAuth();
  
  const userInitial = profile?.full_name?.charAt(0) || profile?.email?.charAt(0) || 'U';

  return (
    <header className="sticky top-0 z-30 h-16 bg-background/80 backdrop-blur-xl border-b border-border">
      <div className="flex items-center justify-between h-full px-6">
        {/* Left section */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={onMenuClick}
          >
            <Menu className="h-5 w-5" />
          </Button>
          
          {/* Search */}
          <div className="relative hidden md:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search students, rooms, tickets..."
              className="w-80 pl-10 bg-secondary/50 border-0 focus-visible:ring-1"
            />
          </div>
        </div>

        {/* Right section */}
        <div className="flex items-center gap-3">
          {/* Current Property */}
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-secondary">
            <div className="w-2 h-2 rounded-full bg-success" />
            <span className="text-sm font-medium text-foreground">Sunrise Hostel</span>
          </div>

          {/* Notifications */}
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-destructive" />
          </Button>

          {/* Profile */}
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center cursor-pointer hover:ring-2 hover:ring-primary/30 transition-all">
            <span className="text-white text-sm font-medium uppercase">{userInitial}</span>
          </div>
        </div>
      </div>
    </header>
  );
};
