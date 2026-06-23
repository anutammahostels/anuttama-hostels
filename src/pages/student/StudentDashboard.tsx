
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { QrCode, UtensilsCrossed, Receipt, Wrench, Bell, Clock, CheckCircle, AlertTriangle } from "lucide-react";
import { Link } from "react-router-dom";
import { format } from "date-fns";

export default function StudentDashboard() {
  const { user, profile } = useAuth();

  const { data: studentData } = useQuery({
    queryKey: ["student-record", user?.id],
    queryFn: async () => {
      const { data } = await supabase.from("students").select("*").eq("user_id", user!.id).single();
      return data;
    },
    enabled: !!user,
  });

  const { data: pendingPasses = [] } = useQuery({
    queryKey: ["student-pending-passes", studentData?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from("gate_passes")
        .select("*")
        .eq("student_id", studentData!.id)
        .in("status", ["pending", "approved"])
        .order("created_at", { ascending: false })
        .limit(5);
      return data || [];
    },
    enabled: !!studentData,
  });

  const { data: recentInvoices = [] } = useQuery({
    queryKey: ["student-invoices", studentData?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from("invoices")
        .select("*")
        .eq("student_id", studentData!.id)
        .order("created_at", { ascending: false })
        .limit(3);
      return data || [];
    },
    enabled: !!studentData,
  });

  const { data: activeComplaints = [] } = useQuery({
    queryKey: ["student-complaints", studentData?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from("complaints")
        .select("*")
        .eq("student_id", studentData!.id)
        .in("status", ["pending", "in_progress"])
        .order("created_at", { ascending: false })
        .limit(5);
      return data || [];
    },
    enabled: !!studentData,
  });

  const { data: notices = [] } = useQuery({
    queryKey: ["student-notices"],
    queryFn: async () => {
      const { data } = await supabase
        .from("notices")
        .select("*")
        .eq("is_active", true)
        .order("created_at", { ascending: false })
        .limit(5);
      return data || [];
    },
  });

  const unpaidAmount = recentInvoices
    .filter((i) => i.status !== "paid")
    .reduce((sum, i) => sum + (i.total_amount - (i.paid_amount || 0)), 0);

  const quickLinks = [
    { icon: QrCode, label: "Gate Passes", path: "/student/passes", count: pendingPasses.length, color: "text-blue-500 bg-blue-50" },
    { icon: Receipt, label: "Invoices", path: "/student/invoices", count: recentInvoices.filter((i) => i.status !== "paid").length, color: "text-amber-500 bg-amber-50" },
    { icon: Wrench, label: "Maintenance", path: "/student/maintenance", count: 0, color: "text-purple-500 bg-purple-50" },
    { icon: Bell, label: "Notices", path: "/student/notices", count: notices.length, color: "text-green-500 bg-green-50" },
  ];

  return (
    <>
      <div className="space-y-6">
        {/* Welcome */}
        <div>
          <h1 className="text-2xl font-bold text-foreground">Welcome, {profile?.full_name || "Student"} 👋</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {studentData?.roll_number && <span>Form No: {studentData.roll_number}</span>}
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {quickLinks.map((link) => (
            <Link key={link.path} to={link.path}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer border-border/50">
                <CardContent className="p-4 flex items-center gap-3">
                  <div className={`p-2.5 rounded-xl ${link.color}`}>
                    <link.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">{link.label}</p>
                    <p className="text-lg font-bold text-foreground">{link.count}</p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {/* Outstanding Dues Alert */}
        {unpaidAmount > 0 && (
          <Card className="border-amber-200 bg-amber-50/50">
            <CardContent className="p-4 flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              <div>
                <p className="font-semibold text-foreground">Outstanding Dues</p>
                <p className="text-sm text-muted-foreground">
                  You have ₹{unpaidAmount.toLocaleString()} in pending payments.{" "}
                  <Link to="/student/invoices" className="text-primary hover:underline">View invoices →</Link>
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid md:grid-cols-2 gap-6">
          {/* Gate Passes */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <QrCode className="h-4 w-4 text-blue-500" /> Recent Gate Passes
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {pendingPasses.length === 0 ? (
                <p className="text-sm text-muted-foreground py-4 text-center">No recent gate passes</p>
              ) : (
                pendingPasses.map((pass) => (
                  <div key={pass.id} className="flex items-center justify-between p-2.5 rounded-lg bg-muted/50">
                    <div>
                      <p className="text-sm font-medium text-foreground">{pass.reason}</p>
                      <p className="text-xs text-muted-foreground">{format(new Date(pass.out_date), "MMM d, yyyy")}</p>
                    </div>
                    <Badge variant={pass.status === "approved" ? "default" : "secondary"} className="text-xs">
                      {pass.status}
                    </Badge>
                  </div>
                ))
              )}
              <Link to="/student/passes" className="block text-center text-sm text-primary hover:underline pt-2">
                View all passes →
              </Link>
            </CardContent>
          </Card>

          {/* Notices */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Bell className="h-4 w-4 text-green-500" /> Recent Notices
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {notices.length === 0 ? (
                <p className="text-sm text-muted-foreground py-4 text-center">No notices</p>
              ) : (
                notices.map((notice) => (
                  <div key={notice.id} className="p-2.5 rounded-lg bg-muted/50">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-foreground">{notice.title}</p>
                      {notice.priority === "high" && <Badge variant="destructive" className="text-[10px]">Urgent</Badge>}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{notice.content}</p>
                  </div>
                ))
              )}
              <Link to="/student/notices" className="block text-center text-sm text-primary hover:underline pt-2">
                View all notices →
              </Link>
            </CardContent>
          </Card>

          {/* Recent Invoices */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Receipt className="h-4 w-4 text-amber-500" /> Recent Invoices
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {recentInvoices.length === 0 ? (
                <p className="text-sm text-muted-foreground py-4 text-center">No invoices yet</p>
              ) : (
                recentInvoices.map((inv) => (
                  <div key={inv.id} className="flex items-center justify-between p-2.5 rounded-lg bg-muted/50">
                    <div>
                      <p className="text-sm font-medium text-foreground">{inv.invoice_number}</p>
                      <p className="text-xs text-muted-foreground">Due: {format(new Date(inv.due_date), "MMM d, yyyy")}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-foreground">₹{inv.total_amount.toLocaleString()}</p>
                      <Badge variant={inv.status === "paid" ? "default" : "secondary"} className="text-[10px]">{inv.status}</Badge>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {/* Active Complaints */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Wrench className="h-4 w-4 text-purple-500" /> Active Complaints
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {activeComplaints.length === 0 ? (
                <p className="text-sm text-muted-foreground py-4 text-center">No active complaints</p>
              ) : (
                activeComplaints.map((c) => (
                  <div key={c.id} className="flex items-center justify-between p-2.5 rounded-lg bg-muted/50">
                    <div>
                      <p className="text-sm font-medium text-foreground">{c.subject}</p>
                      <p className="text-xs text-muted-foreground">{c.category}</p>
                    </div>
                    <Badge variant={c.status === "in_progress" ? "default" : "secondary"} className="text-xs">{c.status}</Badge>
                  </div>
                ))
              )}
              <Link to="/student/complaints" className="block text-center text-sm text-primary hover:underline pt-2">
                View all →
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
