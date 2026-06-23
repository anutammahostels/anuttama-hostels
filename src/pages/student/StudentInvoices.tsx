import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  const [payDialog, setPayDialog] = useState<{ open: boolean; invoice: any | null }>({ open: false, invoice: null });
  const [partialAmount, setPartialAmount] = useState<string>("");
  const [paymentsUsed, setPaymentsUsed] = useState<number | null>(null);

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

  // Load payment count when pay dialog opens
  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!payDialog.open || !payDialog.invoice) {
        setPaymentsUsed(null);
        return;
      }
      const { count } = await supabase
        .from("payments")
        .select("id", { count: "exact", head: true })
        .eq("invoice_id", payDialog.invoice.id)
        .eq("status", "completed");
      if (cancelled) return;
      const used = count || 0;
      setPaymentsUsed(used);
      const balance = Math.max(0, (payDialog.invoice.total_amount || 0) - (payDialog.invoice.paid_amount || 0));
      // 3rd (final) payment must clear balance; default is balance otherwise too
      setPartialAmount(String(balance));
    })();
    return () => { cancelled = true; };
  }, [payDialog.open, payDialog.invoice?.id]);

  const openPayDialog = (invoice: any) => {
    // Pre-flight: profile must be complete to start a payment
    const rawPhone = String(profile?.phone || "").replace(/[^0-9]/g, "");
    const phone10 = rawPhone.length > 10 ? rawPhone.slice(-10) : rawPhone;
    const emailOk = !!profile?.email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profile.email);
    if (!emailOk || phone10.length !== 10) {
      toast({
        title: "Profile incomplete",
        description: "Add a valid email and 10-digit mobile number on your profile to pay online.",
        variant: "destructive",
        action: (
          <ToastAction altText="Update profile" onClick={() => navigate("/student/profile")}>Update profile</ToastAction>
        ),
      });
      return;
    }
    setPayDialog({ open: true, invoice });
  };

  const handlePayOnline = async () => {
    const invoice = payDialog.invoice;
    if (!invoice) return;
    const balance = invoice.total_amount - (invoice.paid_amount || 0);
    if (balance <= 0) return;
    const amt = Number(partialAmount);
    if (!Number.isFinite(amt) || amt <= 0) {
      toast({ title: "Invalid amount", description: "Enter a valid amount.", variant: "destructive" });
      return;
    }
    if (amt > balance + 0.01) {
      toast({ title: "Amount too high", description: `Cannot exceed balance of ₹${balance.toLocaleString()}.`, variant: "destructive" });
      return;
    }

    const checkoutWindow = window.self !== window.top ? window.open("", "_blank") : null;
    if (checkoutWindow) {
      checkoutWindow.document.title = "Redirecting to payment";
      checkoutWindow.document.body.innerHTML = "<p style='font-family: sans-serif; padding: 24px;'>Redirecting to the secure payment page…</p>";
    }

    setPayingInvoiceId(invoice.id);
    try {
      const { data, error } = await supabase.functions.invoke("hdfc-create-session", {
        body: {
          invoice_id: invoice.id,
          amount: amt,
          return_url: `${window.location.origin}/student/payment/status`,
        },
      });
      if (error) throw error;
      const session = data as any;
      if (session?.order_id) {
        sessionStorage.setItem("hdfc_pending_order_id", session.order_id);
        localStorage.setItem("hdfc_pending_order_id", session.order_id);
        localStorage.setItem("hdfc_pending_order_started_at", String(Date.now()));
      }
      openPaymentCheckout(session, checkoutWindow);
      setPayDialog({ open: false, invoice: null });
    } catch (err: any) {
      if (checkoutWindow && !checkoutWindow.closed) checkoutWindow.close();
      const msg: string = err?.message || err?.context?.error || "";
      const isProfileIssue = /profile|phone|email/i.test(msg);
      toast({
        title: isProfileIssue ? "Profile incomplete" : "Payment Failed",
        description: msg || "Could not initiate payment. Please try again.",
        variant: "destructive",
        action: isProfileIssue ? (
          <ToastAction altText="Update profile" onClick={() => navigate("/student/profile")}>Update profile</ToastAction>
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
      motherName: s.mother_name,
      gender: s.gender,
      course: s.course,
    });
    printWindow.document.write(buildReceiptHtml(data));
    printWindow.document.close();
  };

  const dialogInvoice = payDialog.invoice;
  const dialogBalance = dialogInvoice ? Math.max(0, (dialogInvoice.total_amount || 0) - (dialogInvoice.paid_amount || 0)) : 0;
  const dialogUsed = paymentsUsed ?? 0;
  const dialogIsFinal = dialogUsed === 2;
  const dialogIsExhausted = dialogUsed >= 3;

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
                          {inv.status === "paid" ? "Receipt" : "Download"}
                        </Button>
                        {inv.status !== "paid" && (
                          <Button
                            size="sm"
                            className="gradient-primary text-white"
                            onClick={() => openPayDialog(inv)}
                            disabled={isPaying}
                          >
                            {isPaying ? <Loader2 className="h-3 w-3 mr-1 animate-spin" /> : <CreditCard className="h-3 w-3 mr-1" />}
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

      {/* Partial payment dialog */}
      <Dialog open={payDialog.open} onOpenChange={(open) => { if (!open) setPayDialog({ open: false, invoice: null }); }}>
        <DialogContent className="bg-background">
          <DialogHeader>
            <DialogTitle>Pay invoice {dialogInvoice?.invoice_number}</DialogTitle>
            <DialogDescription>
              You can split this invoice into up to 3 partial payments. The 3rd payment must clear the full remaining balance.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="bg-muted/50 rounded-lg p-4 space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">Invoice total</span><span className="font-medium">₹{Number(dialogInvoice?.total_amount || 0).toLocaleString()}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Already paid</span><span className="text-green-600">₹{Number(dialogInvoice?.paid_amount || 0).toLocaleString()}</span></div>
              <div className="flex justify-between border-t pt-2"><span className="text-muted-foreground">Balance due</span><span className="font-bold text-destructive">₹{dialogBalance.toLocaleString()}</span></div>
              <div className="flex justify-between border-t pt-2">
                <span className="text-muted-foreground">Partial payments used</span>
                <Badge variant={dialogIsFinal || dialogIsExhausted ? "destructive" : "secondary"}>
                  {dialogUsed} of 3
                </Badge>
              </div>
            </div>

            {dialogIsExhausted && (
              <div className="rounded-md border border-destructive/40 bg-destructive/5 p-3 text-sm text-destructive">
                You've used all 3 allowed partial payments for this invoice. Please contact the hostel office.
              </div>
            )}
            {dialogIsFinal && !dialogIsExhausted && (
              <div className="rounded-md border border-amber-500/40 bg-amber-500/5 p-3 text-sm text-amber-700">
                This is your final allowed payment for this invoice — it must clear the full remaining balance of ₹{dialogBalance.toLocaleString()}.
              </div>
            )}

            <div className="space-y-2">
              <Label>Amount to pay (₹)</Label>
              <Input
                type="number"
                value={partialAmount}
                disabled={dialogIsExhausted || dialogIsFinal}
                onChange={(e) => setPartialAmount(e.target.value)}
              />
              {!dialogIsFinal && !dialogIsExhausted && (
                <p className="text-xs text-muted-foreground">
                  Pay any amount up to ₹{dialogBalance.toLocaleString()}. You'll receive a receipt for every successful payment.
                </p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPayDialog({ open: false, invoice: null })}>Cancel</Button>
            <Button
              className="gradient-primary text-white"
              disabled={dialogIsExhausted || !partialAmount || payingInvoiceId === dialogInvoice?.id}
              onClick={handlePayOnline}
            >
              {payingInvoiceId === dialogInvoice?.id ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <CreditCard className="h-4 w-4 mr-1" />}
              Pay ₹{Number(partialAmount || 0).toLocaleString()}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
