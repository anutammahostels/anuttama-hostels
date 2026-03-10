import { SuperAdminLayout } from "@/components/superadmin/SuperAdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, Building2, Users, BedDouble, AlertTriangle, QrCode, Receipt, Wrench } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";

const SuperAdminDashboard = () => {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['superadmin-stats'],
    queryFn: async () => {
      const [properties, students, rooms, gatePasses, invoices, complaints, maintenance, users] = await Promise.all([
        supabase.from('properties').select('id', { count: 'exact', head: true }),
        supabase.from('students').select('id', { count: 'exact', head: true }),
        supabase.from('rooms').select('id', { count: 'exact', head: true }),
        supabase.from('gate_passes').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
        supabase.from('invoices').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
        supabase.from('complaints').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
        supabase.from('maintenance_tickets').select('id', { count: 'exact', head: true }).eq('status', 'open'),
        supabase.from('user_roles').select('id', { count: 'exact', head: true }),
      ]);
      return {
        properties: properties.count || 0,
        students: students.count || 0,
        rooms: rooms.count || 0,
        pendingPasses: gatePasses.count || 0,
        pendingInvoices: invoices.count || 0,
        pendingComplaints: complaints.count || 0,
        openMaintenance: maintenance.count || 0,
        totalUsers: users.count || 0,
      };
    },
  });

  const statCards = [
    { label: "Total Properties", value: stats?.properties, icon: Building2, color: "from-blue-600 to-blue-400" },
    { label: "Total Students", value: stats?.students, icon: Users, color: "from-emerald-600 to-emerald-400" },
    { label: "Total Rooms", value: stats?.rooms, icon: BedDouble, color: "from-purple-600 to-purple-400" },
    { label: "Total Users", value: stats?.totalUsers, icon: Shield, color: "from-orange-600 to-orange-400" },
    { label: "Pending Passes", value: stats?.pendingPasses, icon: QrCode, color: "from-amber-600 to-amber-400" },
    { label: "Pending Invoices", value: stats?.pendingInvoices, icon: Receipt, color: "from-rose-600 to-rose-400" },
    { label: "Open Complaints", value: stats?.pendingComplaints, icon: AlertTriangle, color: "from-red-600 to-red-400" },
    { label: "Open Maintenance", value: stats?.openMaintenance, icon: Wrench, color: "from-slate-600 to-slate-400" },
  ];

  return (
    <SuperAdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground flex items-center gap-2">
            <Shield className="h-7 w-7 text-red-500" />
            Super Admin Dashboard
          </h1>
          <p className="text-muted-foreground text-sm mt-1">Complete system overview and management</p>
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

        <div className="grid md:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-semibold">System Health</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {["Database", "Authentication", "Storage", "Edge Functions"].map((service) => (
                <div key={service} className="flex items-center justify-between py-1.5">
                  <span className="text-sm text-foreground">{service}</span>
                  <span className="flex items-center gap-1.5 text-xs text-emerald-600 font-medium">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    Operational
                  </span>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-semibold">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-2">
              {[
                { label: "Manage Users", path: "/superadmin/users", icon: Users },
                { label: "View Properties", path: "/superadmin/properties", icon: Building2 },
                { label: "View Complaints", path: "/superadmin/complaints", icon: AlertTriangle },
                { label: "System Settings", path: "/superadmin/settings", icon: Shield },
              ].map((action) => (
                <a
                  key={action.path}
                  href={action.path}
                  className="flex items-center gap-2 p-3 rounded-lg border border-border/50 hover:bg-secondary/50 transition-colors text-sm"
                >
                  <action.icon className="h-4 w-4 text-muted-foreground" />
                  {action.label}
                </a>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </SuperAdminLayout>
  );
};

export default SuperAdminDashboard;
