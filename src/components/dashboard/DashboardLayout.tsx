import { useState } from "react";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { cn } from "@/lib/utils";
import { useHasExternalLayout } from "@/contexts/LayoutContext";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const hasExternalLayout = useHasExternalLayout();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // If already inside SuperAdminLayout, skip rendering this layout
  if (hasExternalLayout) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-[#29926A]">
      <DashboardSidebar open={sidebarOpen} onOpenChange={setSidebarOpen} />
      
      <div className={cn(
        "transition-all duration-300",
        "lg:ml-52"
      )}>
        <DashboardHeader onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
        
        <main className="p-3 md:p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  );
};