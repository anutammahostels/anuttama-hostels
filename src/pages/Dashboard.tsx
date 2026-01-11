import { useState } from "react";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { DashboardStats } from "@/components/dashboard/DashboardStats";
import { OccupancyChart } from "@/components/dashboard/OccupancyChart";
import { RecentActivity } from "@/components/dashboard/RecentActivity";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { PendingApprovals } from "@/components/dashboard/PendingApprovals";

const Dashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="min-h-screen bg-background">
      <DashboardSidebar open={sidebarOpen} onOpenChange={setSidebarOpen} />
      
      <div className={`transition-all duration-300 ${sidebarOpen ? "lg:ml-64" : "lg:ml-20"}`}>
        <DashboardHeader onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
        
        <main className="p-6">
          {/* Welcome section */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-foreground mb-1">
              Welcome back, Admin
            </h1>
            <p className="text-muted-foreground">
              Here's what's happening at Sunrise Hostel today
            </p>
          </div>

          {/* Stats */}
          <DashboardStats />

          {/* Main content grid */}
          <div className="grid lg:grid-cols-3 gap-6 mt-6">
            {/* Charts - takes 2 columns */}
            <div className="lg:col-span-2 space-y-6">
              <OccupancyChart />
              <QuickActions />
            </div>

            {/* Right sidebar */}
            <div className="space-y-6">
              <PendingApprovals />
              <RecentActivity />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
