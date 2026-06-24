import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { NotificationsDropdown } from "@/components/dashboard/NotificationsDropdown";

interface DashboardHeaderProps {
  onMenuClick: () => void;
}

export const DashboardHeader = ({ onMenuClick }: DashboardHeaderProps) => {
  const { profile } = useAuth();
  
  const userInitial = profile?.full_name?.charAt(0) || profile?.email?.charAt(0) || 'U';

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
          
        </div>

        {/* Right section */}
        <div className="flex items-center gap-1.5 md:gap-2 lg:gap-3">

          {/* Notifications */}
          <NotificationsDropdown />

          {/* Profile */}
          <button className="flex items-center gap-2 p-1 md:p-1.5 rounded-lg hover:bg-secondary transition-all group">
            <div className="w-7 h-7 md:w-8 md:h-8 rounded-lg bg-[#29926A] flex items-center justify-center ring-2 ring-hostylia-forest/20 group-hover:ring-hostylia-forest/40 transition-all">
              <span className="text-white text-xs md:text-sm font-semibold uppercase">{userInitial}</span>
            </div>
          </button>
        </div>
      </div>
    </header>
  );
};