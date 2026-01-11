import { useState } from "react";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { cn } from "@/lib/utils";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/20">
      <DashboardSidebar open={sidebarOpen} onOpenChange={setSidebarOpen} />
      
      <div className={cn(
        "transition-all duration-300",
        "lg:ml-20" // Default collapsed on desktop
      )}>
        <DashboardHeader onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
        
        <main className="p-3 md:p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  );
};