import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Receipt, Download, IndianRupee, Loader2, CreditCard } from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { ToastAction } from "@/components/ui/toast";
import { createPaymentSession, openPaymentCheckout } from "@/lib/hdfc";
import { PaymentOrderDetails } from "@/components/student/PaymentOrderDetails";
import { buildReceiptHtml, invoiceToReceipt } from "@/lib/receiptTemplate";

export default function StudentInvoices() {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [payingInvoiceId, setPayingInvoiceId] = useState<string | null>(null);

  // When the user lands here from the payment status page, force-refresh
  // invoices so the latest paid_amount/status is reflected immediately.
  useEffect(() => {
    queryClient.invalidateQueries({ queryKey: ["student-all-invoices"] });
    queryClient.invalidateQueries({ queryKey: ["student-record"] });
  }, [queryClient]);

  const { data: student } = useQuery({
    queryKey: ["student-record", user?.id],
    queryFn: async () => {
      const { data } = await supabase.from("students").select("*").eq("user_id", user!.id).single();
      return data;
    },
    enabled: !!user,
  });

  const { data: profile } = useQuery({
    queryKey: ["student-profile", user?.id],
    queryFn: async () => {
      const { data } = await supabase.from("profiles").select("*").eq("id", user!.id).single();
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

  const handlePayOnline = async (invoice: any) => {
    const balance = invoice.total_amount - (invoice.paid_amount || 0);
    if (balance <= 0) return;

    // Pre-flight: HDFC requires a valid email and 10-digit phone on the customer profile
    const rawPhone = String(profile?.phone || "").replace(/[^0-9]/g, "");
    const phone10 = rawPhone.length > 10 ? rawPhone.slice(-10) : rawPhone;
    const emailOk = !!profile?.email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profile.email);
    if (!emailOk || phone10.length !== 10) {
      toast({
        title: "Profile incomplete",
        description: "Add a valid email and 10-digit mobile number on your profile to pay online.",
        variant: "destructive",
        action: (
          <ToastAction altText="Update profile" onClick={() => navigate("/student/profile")}>
            Update profile
          </ToastAction>
        ),
      });
      return;
    }

    const checkoutWindow = window.self !== window.top ? window.open("", "_blank") : null;
    if (checkoutWindow) {
      checkoutWindow.document.title = "Redirecting to payment";
      checkoutWindow.document.body.innerHTML = "<p style='font-family: sans-serif; padding: 24px;'>Redirecting to the secure payment page…</p>";
    }

    setPayingInvoiceId(invoice.id);

    try {
      // Always return to the same origin where the student started — keeps
      // their auth session intact (hostylia.com would log them out).
      const session = await createPaymentSession(
        invoice.id,
        `${window.location.origin}/student/payment/status`
      );

      // Save order_id locally so the status page can recover it even if
      // HDFC strips query parameters or the session reloads.
      if (session.order_id) {
        sessionStorage.setItem("hdfc_pending_order_id", session.order_id);
        localStorage.setItem("hdfc_pending_order_id", session.order_id);
        localStorage.setItem("hdfc_pending_order_started_at", String(Date.now()));
      }

      openPaymentCheckout(session, checkoutWindow);
    } catch (err: any) {
      if (checkoutWindow && !checkoutWindow.closed) checkoutWindow.close();
      console.error("Payment initiation failed:", err);
      const msg: string = err?.message || "";
      const isProfileIssue = /profile|phone|email/i.test(msg);
      toast({
        title: isProfileIssue ? "Profile incomplete" : "Payment Failed",
        description: msg || "Could not initiate payment. Please try again.",
        variant: "destructive",
        action: isProfileIssue ? (
          <ToastAction altText="Update profile" onClick={() => navigate("/student/profile")}>
            Update profile
          </ToastAction>
        ) : undefined,
      });
    } finally {
      setPayingInvoiceId(null);
    }
  };

  const handleDownloadInvoice = (inv: any) => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;
    const studentName = profile?.full_name || "Student";
    const s: any = student || {};
    const data = invoiceToReceipt(inv, {
      studentName,
      rollNumber: s.roll_number,
      fatherName: s.father_name,
      gender: s.gender,
      course: s.course,
    });
    printWindow.document.write(buildReceiptHtml(data));
    printWindow.document.close();
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">My Invoices</h1>
        <p className="text-sm text-muted-foreground">View, pay, and download your billing invoices</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        <Card><CardContent className="p-4 text-center"><p className="text-xs text-muted-foreground">Total Invoices</p><p className="text-2xl font-bold text-foreground">{invoices.length}</p></CardContent></Card>
        <Card className="border-amber-200"><CardContent className="p-4 text-center"><p className="text-xs text-muted-foreground">Pending Due</p><p className="text-2xl font-bold text-amber-600">₹{totalDue.toLocaleString()}</p></CardContent></Card>
        <Card className="border-green-200"><CardContent className="p-4 text-center"><p className="text-xs text-muted-foreground">Total Paid</p><p className="text-2xl font-bold text-green-600">₹{totalPaid.toLocaleString()}</p></CardContent></Card>
      </div>

      {totalDue > 0 && (
        <Card className="border-primary/30 bg-primary/5">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-primary/10">
                <IndianRupee className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-semibold text-foreground">Total Dues: ₹{totalDue.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">Across {invoices.filter(i => i.status !== 'paid').length} unpaid invoice(s)</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="space-y-3">
        {invoices.length === 0 ? (
          <Card><CardContent className="p-8 text-center text-muted-foreground">No invoices yet</CardContent></Card>
        ) : (
          invoices.map((inv) => {
            const balance = inv.total_amount - (inv.paid_amount || 0);
            const isPaying = payingInvoiceId === inv.id;
            return (
              <Card key={inv.id} className="border-border/50">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Receipt className="h-4 w-4 text-muted-foreground shrink-0" />
                        <h3 className="font-semibold text-foreground">{inv.invoice_number}</h3>
                        <Badge variant={inv.status === "paid" ? "default" : inv.status === "overdue" ? "destructive" : "secondary"} className="text-xs">{inv.status}</Badge>
                      </div>
                      <div className="flex flex-wrap gap-x-4 text-xs text-muted-foreground mt-2">
                        <span>Month: {format(new Date(inv.billing_month), "MMM yyyy")}</span>
                        <span>Due: {format(new Date(inv.due_date), "MMM d, yyyy")}</span>
                        {inv.room_rent ? <span>Rent: ₹{inv.room_rent}</span> : null}
                        {inv.mess_charges ? <span>Mess: ₹{inv.mess_charges}</span> : null}
                        {inv.electricity_charges ? <span>Elec: ₹{inv.electricity_charges}</span> : null}
                      </div>
                      <div className="flex gap-2 mt-3">
                        <Button size="sm" variant="outline" onClick={() => handleDownloadInvoice(inv)}>
                          <Download className="h-3 w-3 mr-1" />
                          Download
                        </Button>
                        {inv.status !== "paid" && (
                          <Button 
                            size="sm" 
                            className="gradient-primary text-white"
                            onClick={() => handlePayOnline(inv)}
                            disabled={isPaying}
                          >
                            {isPaying ? (
                              <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                            ) : (
                              <CreditCard className="h-3 w-3 mr-1" />
                            )}
                            {isPaying ? "Processing..." : "Pay Online"}
                          </Button>
                        )}
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-lg font-bold text-foreground">₹{inv.total_amount.toLocaleString()}</p>
                      {inv.status === "paid" && inv.payment_date && (
                        <p className="text-xs text-green-600">Paid on {format(new Date(inv.payment_date), "MMM d")}</p>
                      )}
                      {balance > 0 && inv.status !== "paid" && (
                        <p className="text-xs text-destructive">Due: ₹{balance.toLocaleString()}</p>
                      )}
                    </div>
                  </div>
                  <PaymentOrderDetails invoiceId={inv.id} />
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
