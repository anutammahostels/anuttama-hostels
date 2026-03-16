
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, Building2, Users, Landmark, AlertTriangle, Megaphone, BarChart3, Settings } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "react-router-dom";

const SuperAdminDashboard = () => {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['superadmin-stats'],
    queryFn: async () => {
      const [organizations, properties, users, complaints] = await Promise.all([
        supabase.from('organizations').select('id', { count: 'exact', head: true }),
        supabase.from('properties').select('id, total_capacity, occupied_beds'),
        supabase.from('user_roles').select('id', { count: 'exact', head: true }),
        supabase.from('complaints').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
      ]);

      const totalCapacity = properties.data?.reduce((s, p) => s + (p.total_capacity || 0), 0) || 0;
      const totalOccupied = properties.data?.reduce((s, p) => s + (p.occupied_beds || 0), 0) || 0;

      return {
        organizations: organizations.count || 0,
        properties: properties.data?.length || 0,
        totalUsers: users.count || 0,
        pendingComplaints: complaints.count || 0,
        occupancyRate: totalCapacity > 0 ? Math.round((totalOccupied / totalCapacity) * 100) : 0,
      };
    },
  });

  const statCards = [
    { label: "Organizations", value: stats?.organizations, icon: Landmark, color: "from-blue-600 to-blue-400" },
    { label: "Properties", value: stats?.properties, icon: Building2, color: "from-emerald-600 to-emerald-400" },
    { label: "Total Users", value: stats?.totalUsers, icon: Users, color: "from-purple-600 to-purple-400" },
    { label: "Open Complaints", value: stats?.pendingComplaints, icon: AlertTriangle, color: "from-red-600 to-red-400" },
  ];

  const quickActions = [
    { label: "Organizations", path: "/superadmin/organizations", icon: Landmark },
    { label: "Properties", path: "/superadmin/properties", icon: Building2 },
    { label: "User Management", path: "/superadmin/users", icon: Users },
    { label: "Complaints", path: "/superadmin/complaints", icon: AlertTriangle },
    { label: "Notices", path: "/superadmin/notices", icon: Megaphone },
    { label: "Reports", path: "/superadmin/reports", icon: BarChart3 },
  ];

  return (
    <>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground flex items-center gap-2">
            <Shield className="h-7 w-7 text-red-500" />
            Super Admin Dashboard
          </h1>
          <p className="text-muted-foreground text-sm mt-1">Global overview across all hostels</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          {statCards.map((stat) => (
            <Card key={stat.label} className="border-border/50 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${stat.color} flex items-center justify-center`}>
                    <stat.icon className="h-4 w-4 text-white" />
                  </div>
                </div>
                {isLoading ? (
                  <Skeleton className="h-7 w-12 mb-1" />
                ) : (
                  <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                )}
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Occupancy overview */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-semibold">Platform Occupancy</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-6 w-full" />
            ) : (
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <div className="w-full bg-secondary rounded-full h-3">
                    <div
                      className="bg-gradient-to-r from-emerald-500 to-emerald-400 h-3 rounded-full transition-all"
                      style={{ width: `${stats?.occupancyRate || 0}%` }}
                    />
                  </div>
                </div>
                <span className="text-lg font-bold text-foreground min-w-[3rem] text-right">{stats?.occupancyRate}%</span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-semibold">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {quickActions.map((action) => (
              <Link
                key={action.path}
                to={action.path}
                className="flex items-center gap-2 p-3 rounded-lg border border-border/50 hover:bg-secondary/50 transition-colors text-sm"
              >
                <action.icon className="h-4 w-4 text-muted-foreground" />
                {action.label}
              </Link>
            ))}
          </CardContent>
        </Card>
      </div>
    </SuperAdminLayout>
  );
};

export default SuperAdminDashboard;
