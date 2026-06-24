import { useState } from "react";
import { StudentSidebar } from "@/components/student/StudentSidebar";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { cn } from "@/lib/utils";

interface StudentLayoutProps {
  children: React.ReactNode;
}

export const StudentLayout = ({ children }: StudentLayoutProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-blue-50/30 overflow-x-hidden">
      <StudentSidebar open={sidebarOpen} onOpenChange={setSidebarOpen} />
      <div className={cn("transition-all duration-300 min-w-0", "lg:ml-52")}>
        <DashboardHeader onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
        <main className="p-3 md:p-4 lg:p-6 min-w-0 overflow-x-hidden">{children}</main>
      </div>
    </div>
  );
};
