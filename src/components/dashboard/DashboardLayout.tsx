import { useState } from "react";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { cn } from "@/lib/utils";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/20">
      <DashboardSidebar open={sidebarOpen} onOpenChange={setSidebarOpen} />
      
      <div className={cn(
        "transition-all duration-300",
        sidebarOpen ? "lg:ml-64" : "lg:ml-20"
      )}>
        <DashboardHeader onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
        
        <main className="p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  );
};
