import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowLeft, IndianRupee, Loader2 } from "lucide-react";
import { formatCurrency } from "@/lib/formatCurrency";

const fmtDate = (d?: string | null) => (d ? new Date(d).toLocaleDateString("en-GB") : "—");

const StudentDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data, isLoading } = useQuery({
    queryKey: ["student-detail", id],
    enabled: !!id,
    queryFn: async () => {
      const { data: student, error } = await supabase
        .from("students")
        .select("*")
        .eq("id", id!)
        .maybeSingle();
      if (error) throw error;
      if (!student) return null;

      const [profileRes, propertyRes, bedRes, invoicesRes, paymentsRes, refundsRes] = await Promise.all([
        supabase.from("profiles").select("*").eq("id", student.user_id).maybeSingle(),
        student.property_id
          ? supabase.from("properties").select("id, name, city").eq("id", student.property_id).maybeSingle()
          : Promise.resolve({ data: null } as any),
        supabase
          .from("beds")
          .select("id, bed_number, room:rooms(room_number, room_type, monthly_rent, floor:floors(floor_number, block:blocks(name)))")
          .eq("student_id", student.id)
          .maybeSingle(),
        supabase.from("invoices").select("*").eq("student_id", student.id).order("billing_month", { ascending: true }),
        supabase.from("payments").select("*").eq("student_id", student.id).order("paid_at", { ascending: true }),
        supabase.from("refunds").select("*").eq("student_id", student.id).order("created_at", { ascending: true }),
      ]);

      return {
        student,
        profile: profileRes.data,
        property: propertyRes.data,
        bed: bedRes.data,
        invoices: invoicesRes.data || [],
        payments: (paymentsRes.data || []).filter((p: any) => p.status === "completed"),
        allPayments: paymentsRes.data || [],
        refunds: refundsRes.data || [],
      };
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" onClick={() => navigate("/dashboard/students")}>
          <ArrowLeft className="h-4 w-4 mr-2" /> Back to Students
        </Button>
        <p className="text-muted-foreground">Student not found.</p>
      </div>
    );
  }

  const { student, profile, property, bed, invoices, payments, allPayments, refunds } = data as any;

  const gross = invoices.reduce((s: number, i: any) => s + Number(i.total_amount || 0), 0);
  const concession = invoices.reduce((s: number, i: any) => s + Number(i.discounts || 0), 0);
  const paid = payments.reduce((s: number, p: any) => s + Number(p.amount || 0), 0);
  const refunded = refunds.reduce((s: number, r: any) => s + Number(r.amount || 0), 0);
  const finalFee = Number(student.final_fee || 0);
  const pending = Math.max(Math.max(gross, finalFee) - paid, 0);

  const room = bed?.room
    ? `${bed.room.floor?.block?.name ? bed.room.floor.block.name + " / " : ""}${bed.room.room_number} · Bed ${bed.bed_number}`
    : "Not allocated";

  const details: Array<[string, any]> = [
    ["Form Number", student.roll_number || "—"],
    ["Center", property?.name || "—"],
    ["Father Name", student.father_name || "—"],
    ["Mother Name", student.mother_name || "—"],
    ["Gender", student.gender || "—"],
    ["Class / Grade", student.course || "—"],
    ["Stream", student.department || "—"],
    ["Phone", profile?.phone || "—"],
    ["Email", profile?.email || "—"],
    ["Room", room],
    ["Admission Date", fmtDate(student.admission_date)],
    ["Account Number", student.account_number || "—"],
    ["Status", student.status || "—"],
    ["Remarks", student.remarks || "—"],
  ];

  const stats = [
    { label: "Final Fee", value: finalFee || gross },
    { label: "Concession", value: concession },
    { label: "Total Paid", value: paid },
    { label: "Pending Dues", value: pending },
    { label: "Refunded", value: refunded },
  ];

  return (
    <div className="space-y-4 md:space-y-6">
      <Button variant="ghost" size="sm" onClick={() => navigate("/dashboard/students")}>
        <ArrowLeft className="h-4 w-4 mr-2" /> Back to Students
      </Button>

      <Card>
        <CardContent className="p-4 md:p-6 flex flex-col sm:flex-row sm:items-center gap-4">
          <Avatar className="h-14 w-14">
            <AvatarImage src={profile?.avatar_url || ""} />
            <AvatarFallback className="bg-primary/10 text-primary text-lg">
              {profile?.full_name?.split(" ").map((n: string) => n[0]).join("") || "?"}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <h1 className="text-xl md:text-2xl font-bold truncate">{profile?.full_name || "Unknown Student"}</h1>
            <p className="text-sm text-muted-foreground">
              {student.roll_number || "No Form Number"} · {property?.name || "No Center"}
            </p>
          </div>
          <Badge variant="secondary" className="w-fit">{student.status || "unknown"}</Badge>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        {stats.map(s => (
          <Card key={s.label}>
            <CardContent className="p-3 md:p-4">
              <p className="text-xs text-muted-foreground">{s.label}</p>
              <p className="text-base md:text-lg font-bold">{formatCurrency(s.value)}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Student Details</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {details.map(([label, value]) => (
            <div key={label} className="min-w-0">
              <p className="text-xs text-muted-foreground">{label}</p>
              <p className="text-sm font-medium break-words">{String(value)}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <IndianRupee className="h-4 w-4" /> Transactions ({allPayments.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0 sm:p-6 sm:pt-0">
          {allPayments.length === 0 ? (
            <p className="text-sm text-muted-foreground p-4">No transactions recorded.</p>
          ) : (
            <>
              <div className="sm:hidden divide-y">
                {allPayments.map((p: any, i: number) => (
                  <div key={p.id} className="p-3 space-y-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-semibold text-sm">#{i + 1} {formatCurrency(Number(p.amount || 0))}</p>
                      <Badge variant={p.status === "completed" ? "secondary" : "outline"} className="text-[10px]">{p.status}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">Date: {fmtDate(p.paid_at)}</p>
                    <p className="text-xs text-muted-foreground">Mode: {p.payment_mode_label || p.payment_method || "—"}</p>
                    <p className="text-xs text-muted-foreground break-all">Txn: {p.transaction_id || "—"}</p>
                    <p className="text-xs text-muted-foreground break-all">UTR: {p.transaction_reference || "—"}</p>
                  </div>
                ))}
              </div>
              <div className="hidden sm:block overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>#</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Mode</TableHead>
                      <TableHead>Transaction ID</TableHead>
                      <TableHead>UTR / Reference</TableHead>
                      <TableHead>Label</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {allPayments.map((p: any, i: number) => (
                      <TableRow key={p.id}>
                        <TableCell>{i + 1}</TableCell>
                        <TableCell>{fmtDate(p.paid_at)}</TableCell>
                        <TableCell className="font-medium">{formatCurrency(Number(p.amount || 0))}</TableCell>
                        <TableCell>{p.payment_mode_label || p.payment_method || "—"}</TableCell>
                        <TableCell className="text-xs break-all">{p.transaction_id || "—"}</TableCell>
                        <TableCell className="text-xs break-all">{p.transaction_reference || "—"}</TableCell>
                        <TableCell className="text-xs">{p.payment_label || "—"}</TableCell>
                        <TableCell>
                          <Badge variant={p.status === "completed" ? "secondary" : "outline"} className="text-xs">{p.status}</Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Invoices ({invoices.length})</CardTitle>
        </CardHeader>
        <CardContent className="p-0 sm:p-6 sm:pt-0">
          {invoices.length === 0 ? (
            <p className="text-sm text-muted-foreground p-4">No invoices.</p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Invoice</TableHead>
                    <TableHead>Billing Month</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Discount</TableHead>
                    <TableHead>Paid</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invoices.map((inv: any) => (
                    <TableRow key={inv.id}>
                      <TableCell className="text-xs">{inv.invoice_number}</TableCell>
                      <TableCell>{fmtDate(inv.billing_month)}</TableCell>
                      <TableCell>{formatCurrency(Number(inv.total_amount || 0))}</TableCell>
                      <TableCell>{formatCurrency(Number(inv.discounts || 0))}</TableCell>
                      <TableCell>{formatCurrency(Number(inv.paid_amount || 0))}</TableCell>
                      <TableCell>{fmtDate(inv.due_date)}</TableCell>
                      <TableCell><Badge variant="outline" className="text-xs">{inv.status}</Badge></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {refunds.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Refunds ({refunds.length})</CardTitle>
          </CardHeader>
          <CardContent className="p-0 sm:p-6 sm:pt-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Method</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Reason</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {refunds.map((r: any) => (
                    <TableRow key={r.id}>
                      <TableCell>{fmtDate(r.created_at)}</TableCell>
                      <TableCell>{formatCurrency(Number(r.amount || 0))}</TableCell>
                      <TableCell>{r.refund_method || "—"}</TableCell>
                      <TableCell><Badge variant="outline" className="text-xs">{r.status}</Badge></TableCell>
                      <TableCell className="text-xs max-w-[320px] break-words">{r.reason || "—"}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default StudentDetail;
