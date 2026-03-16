
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Receipt, Download } from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";

export default function StudentInvoices() {
  const { user } = useAuth();

  const { data: student } = useQuery({
    queryKey: ["student-record", user?.id],
    queryFn: async () => {
      const { data } = await supabase.from("students").select("*").eq("user_id", user!.id).single();
      return data;
    },
    enabled: !!user,
  });

  const { data: invoices = [] } = useQuery({
    queryKey: ["student-all-invoices", student?.id],
    queryFn: async () => {
      const { data } = await supabase.from("invoices").select("*").eq("student_id", student!.id).order("created_at", { ascending: false });
      return data || [];
    },
    enabled: !!student,
  });

  const totalDue = invoices.filter((i) => i.status !== "paid").reduce((s, i) => s + (i.total_amount - (i.paid_amount || 0)), 0);
  const totalPaid = invoices.filter((i) => i.status === "paid").reduce((s, i) => s + i.total_amount, 0);

  return (
    <>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">My Invoices</h1>
          <p className="text-sm text-muted-foreground">View and track your billing</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          <Card><CardContent className="p-4 text-center"><p className="text-xs text-muted-foreground">Total Invoices</p><p className="text-2xl font-bold text-foreground">{invoices.length}</p></CardContent></Card>
          <Card className="border-amber-200"><CardContent className="p-4 text-center"><p className="text-xs text-muted-foreground">Pending Due</p><p className="text-2xl font-bold text-amber-600">₹{totalDue.toLocaleString()}</p></CardContent></Card>
          <Card className="border-green-200"><CardContent className="p-4 text-center"><p className="text-xs text-muted-foreground">Total Paid</p><p className="text-2xl font-bold text-green-600">₹{totalPaid.toLocaleString()}</p></CardContent></Card>
        </div>

        <div className="space-y-3">
          {invoices.length === 0 ? (
            <Card><CardContent className="p-8 text-center text-muted-foreground">No invoices yet</CardContent></Card>
          ) : (
            invoices.map((inv) => (
              <Card key={inv.id} className="border-border/50">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <Receipt className="h-4 w-4 text-muted-foreground" />
                        <h3 className="font-semibold text-foreground">{inv.invoice_number}</h3>
                        <Badge variant={inv.status === "paid" ? "default" : inv.status === "overdue" ? "destructive" : "secondary"} className="text-xs">{inv.status}</Badge>
                      </div>
                      <div className="flex flex-wrap gap-x-4 text-xs text-muted-foreground mt-2">
                        <span>Month: {format(new Date(inv.billing_month), "MMM yyyy")}</span>
                        <span>Due: {format(new Date(inv.due_date), "MMM d, yyyy")}</span>
                        {inv.room_rent && <span>Rent: ₹{inv.room_rent}</span>}
                        {inv.mess_charges && <span>Mess: ₹{inv.mess_charges}</span>}
                        {inv.electricity_charges && <span>Elec: ₹{inv.electricity_charges}</span>}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-foreground">₹{inv.total_amount.toLocaleString()}</p>
                      {inv.status === "paid" && inv.payment_date && (
                        <p className="text-xs text-green-600">Paid on {format(new Date(inv.payment_date), "MMM d")}</p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </StudentLayout>
  );
}
