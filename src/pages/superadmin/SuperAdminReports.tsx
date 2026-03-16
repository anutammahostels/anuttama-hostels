import { SuperAdminLayout } from "@/components/superadmin/SuperAdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { BarChart3, Building2, Users, BedDouble, AlertTriangle, TrendingUp, IndianRupee } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const SuperAdminReports = () => {
  const { data, isLoading } = useQuery({
    queryKey: ["superadmin-reports"],
    queryFn: async () => {
      const [properties, students, rooms, beds, complaints, invoices, organizations] = await Promise.all([
        supabase.from("properties").select("id, total_capacity, occupied_beds"),
        supabase.from("students").select("id", { count: "exact", head: true }),
        supabase.from("rooms").select("id", { count: "exact", head: true }),
        supabase.from("beds").select("id, status"),
        supabase.from("complaints").select("id, status"),
        supabase.from("invoices").select("id, total_amount, paid_amount, status"),
        supabase.from("organizations").select("id", { count: "exact", head: true }),
      ]);

      const totalCapacity = properties.data?.reduce((s, p) => s + (p.total_capacity || 0), 0) || 0;
      const totalOccupied = properties.data?.reduce((s, p) => s + (p.occupied_beds || 0), 0) || 0;
      const occupancyRate = totalCapacity > 0 ? Math.round((totalOccupied / totalCapacity) * 100) : 0;

      const complaintsByStatus: Record<string, number> = {};
      complaints.data?.forEach((c) => {
        complaintsByStatus[c.status] = (complaintsByStatus[c.status] || 0) + 1;
      });

      const totalRevenue = invoices.data?.reduce((s, i) => s + Number(i.paid_amount || 0), 0) || 0;
      const pendingRevenue = invoices.data?.reduce((s, i) => s + (Number(i.total_amount) - Number(i.paid_amount || 0)), 0) || 0;

      const vacantBeds = beds.data?.filter((b) => b.status === "vacant").length || 0;
      const occupiedBeds = beds.data?.filter((b) => b.status === "occupied").length || 0;

      return {
        totalProperties: properties.data?.length || 0,
        totalStudents: students.count || 0,
        totalRooms: rooms.count || 0,
        totalOrganizations: organizations.count || 0,
        totalCapacity,
        totalOccupied,
        occupancyRate,
        complaintsByStatus,
        totalComplaints: complaints.data?.length || 0,
        totalRevenue,
        pendingRevenue,
        vacantBeds,
        occupiedBeds,
        totalBeds: beds.data?.length || 0,
      };
    },
  });

  const StatCard = ({ label, value, icon: Icon, color, suffix }: any) => (
    <Card className="border-border/50">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-2">
          <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${color} flex items-center justify-center`}>
            <Icon className="h-4 w-4 text-white" />
          </div>
        </div>
        {isLoading ? (
          <Skeleton className="h-7 w-16 mb-1" />
        ) : (
          <p className="text-2xl font-bold text-foreground">{value}{suffix}</p>
        )}
        <p className="text-xs text-muted-foreground">{label}</p>
      </CardContent>
    </Card>
  );

  return (
    <SuperAdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground flex items-center gap-2">
            <BarChart3 className="h-7 w-7 text-red-500" />
            Reports & Analytics
          </h1>
          <p className="text-muted-foreground text-sm mt-1">High-level analytics across all hostels</p>
        </div>

        {/* Top KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatCard label="Organizations" value={data?.totalOrganizations} icon={Building2} color="from-blue-600 to-blue-400" />
          <StatCard label="Properties" value={data?.totalProperties} icon={Building2} color="from-emerald-600 to-emerald-400" />
          <StatCard label="Total Students" value={data?.totalStudents} icon={Users} color="from-purple-600 to-purple-400" />
          <StatCard label="Occupancy Rate" value={data?.occupancyRate} icon={TrendingUp} color="from-amber-600 to-amber-400" suffix="%" />
        </div>

        {/* Detailed Cards */}
        <div className="grid md:grid-cols-3 gap-4">
          {/* Bed Occupancy */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <BedDouble className="h-4 w-4 text-muted-foreground" />
                Bed Occupancy
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-2">{[1,2,3].map(i => <Skeleton key={i} className="h-5 w-full" />)}</div>
              ) : (
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Total Beds</span>
                    <span className="font-semibold">{data?.totalBeds}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Occupied</span>
                    <span className="font-semibold text-emerald-600">{data?.occupiedBeds}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Vacant</span>
                    <span className="font-semibold text-amber-600">{data?.vacantBeds}</span>
                  </div>
                  <div className="w-full bg-secondary rounded-full h-2 mt-2">
                    <div
                      className="bg-gradient-to-r from-emerald-500 to-emerald-400 h-2 rounded-full transition-all"
                      style={{ width: `${data?.totalBeds ? (data.occupiedBeds / data.totalBeds) * 100 : 0}%` }}
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Complaints Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                Complaints Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-2">{[1,2,3].map(i => <Skeleton key={i} className="h-5 w-full" />)}</div>
              ) : (
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Total</span>
                    <span className="font-semibold">{data?.totalComplaints}</span>
                  </div>
                  {Object.entries(data?.complaintsByStatus || {}).map(([status, count]) => (
                    <div key={status} className="flex justify-between text-sm">
                      <span className="text-muted-foreground capitalize">{status}</span>
                      <span className="font-semibold">{count as number}</span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Revenue Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <IndianRupee className="h-4 w-4 text-muted-foreground" />
                Revenue Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-2">{[1,2,3].map(i => <Skeleton key={i} className="h-5 w-full" />)}</div>
              ) : (
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Collected</span>
                    <span className="font-semibold text-emerald-600">₹{(data?.totalRevenue || 0).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Pending</span>
                    <span className="font-semibold text-amber-600">₹{(data?.pendingRevenue || 0).toLocaleString()}</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </SuperAdminLayout>
  );
};

export default SuperAdminReports;
