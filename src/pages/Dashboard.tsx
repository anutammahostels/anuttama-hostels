import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { DashboardStats } from "@/components/dashboard/DashboardStats";
import { OccupancyChart } from "@/components/dashboard/OccupancyChart";
import { RecentActivity } from "@/components/dashboard/RecentActivity";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { PendingApprovals } from "@/components/dashboard/PendingApprovals";
import { useDashboard } from "@/hooks/useDashboard";
import { useAuth } from "@/hooks/useAuth";
import { Skeleton } from "@/components/ui/skeleton";

const Dashboard = () => {
  const { profile } = useAuth();
  const { property, isLoading } = useDashboard();

  const firstName = profile?.full_name?.split(' ')[0] || 'Admin';
  const propertyName = property?.name || 'your property';

  return (
    <DashboardLayout>
      {/* Welcome section */}
      <div className="mb-4 md:mb-6 animate-fade-in">
        <div className="flex flex-col gap-3">
          <div>
            {isLoading ? (
              <>
                <Skeleton className="h-6 md:h-8 w-48 md:w-64 mb-2" />
                <Skeleton className="h-4 md:h-5 w-64 md:w-80" />
              </>
            ) : (
              <>
                <h1 className="text-lg md:text-2xl lg:text-3xl font-bold text-foreground mb-1">
                  Welcome, {firstName} 👋
                </h1>
                <p className="text-xs md:text-sm text-muted-foreground">
                  <span className="text-hostylia-forest font-medium">{propertyName}</span> overview
                </p>
              </>
            )}
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground bg-secondary/50 px-3 py-1.5 rounded-lg w-fit">
            <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse"></span>
            <span>All systems operational</span>
          </div>
        </div>
      </div>

      {/* Stats */}
      <DashboardStats />

      {/* Main content grid */}
      <div className="grid lg:grid-cols-3 gap-4 md:gap-6 mt-4 md:mt-6">
        {/* Charts - takes 2 columns */}
        <div className="lg:col-span-2 space-y-4 md:space-y-6">
          <OccupancyChart />
          <QuickActions />
        </div>

        {/* Right sidebar */}
        <div className="space-y-4 md:space-y-6">
          <PendingApprovals />
          <RecentActivity />
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;