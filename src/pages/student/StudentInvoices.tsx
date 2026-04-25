import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Receipt, Download, IndianRupee, Loader2, CreditCard } from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { ToastAction } from "@/components/ui/toast";
import { createPaymentSession, openPaymentCheckout } from "@/lib/hdfc";
import { PaymentOrderDetails } from "@/components/student/PaymentOrderDetails";

export default function StudentInvoices() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [payingInvoiceId, setPayingInvoiceId] = useState<string | null>(null);

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

    const checkoutWindow = window.self !== window.top ? window.open("", "_blank") : null;
    if (checkoutWindow) {
      checkoutWindow.document.title = "Redirecting to payment";
      checkoutWindow.document.body.innerHTML = "<p style='font-family: sans-serif; padding: 24px;'>Redirecting to the secure payment page…</p>";
    }

    setPayingInvoiceId(invoice.id);

    try {
      const session = await createPaymentSession(
        invoice.id,
        `${(window.location.origin.includes('lovableproject.com') || window.location.origin.includes('lovable.app')) ? 'https://hostylia.com' : window.location.origin}/student/payment/status`
      );

      // Save order_id to sessionStorage as fallback in case HDFC strips query params
      if (session.order_id) {
        sessionStorage.setItem("hdfc_pending_order_id", session.order_id);
      }

      openPaymentCheckout(session, checkoutWindow);
    } catch (err: any) {
      if (checkoutWindow && !checkoutWindow.closed) checkoutWindow.close();
      console.error("Payment initiation failed:", err);
      toast({
        title: "Payment Failed",
        description: err.message || "Could not initiate payment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setPayingInvoiceId(null);
    }
  };

  const handleDownloadInvoice = (inv: any) => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    const studentName = profile?.full_name || "Student";
    const studentEmail = profile?.email || "";
    const studentPhone = profile?.phone || "";
    const rollNumber = student?.roll_number || "";

    const html = `<!DOCTYPE html><html><head><title>Invoice ${inv.invoice_number}</title>
    <style>
      body{font-family:'Segoe UI',Arial,sans-serif;padding:40px;color:#1a1a2e;max-width:800px;margin:0 auto}
      .header{display:flex;justify-content:space-between;align-items:flex-start;border-bottom:3px solid #0f3460;padding-bottom:20px;margin-bottom:30px}
      .logo{font-size:24px;font-weight:bold;color:#0f3460}
      .invoice-title{font-size:28px;color:#0f3460;text-align:right}
      .invoice-number{font-size:14px;color:#666;text-align:right}
      .details-grid{display:grid;grid-template-columns:1fr 1fr;gap:30px;margin-bottom:30px}
      .detail-section h3{font-size:12px;text-transform:uppercase;letter-spacing:1px;color:#999;margin-bottom:8px}
      .detail-section p{margin:4px 0;font-size:14px}
      table{width:100%;border-collapse:collapse;margin:20px 0}
      th{background:#0f3460;color:#fff;padding:12px 16px;text-align:left;font-size:13px}
      td{border-bottom:1px solid #eee;padding:10px 16px;font-size:14px}
      .total-row td{font-weight:bold;border-top:2px solid #0f3460;font-size:16px}
      .status-badge{display:inline-block;padding:4px 12px;border-radius:20px;font-size:12px;font-weight:600}
      .status-paid{background:#dcfce7;color:#16a34a}
      .status-pending{background:#fef9c3;color:#ca8a04}
      .status-overdue{background:#fecaca;color:#dc2626}
      .status-partial{background:#dbeafe;color:#2563eb}
      .footer{margin-top:40px;padding-top:20px;border-top:1px solid #eee;text-align:center;color:#999;font-size:12px}
      .payment-info{background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:16px;margin-top:20px}
      @media print{body{padding:20px}@page{margin:1cm}}
    </style></head><body>
    <div class="header">
      <div>
        <div class="logo">🏨 Hostylia</div>
        <p style="color:#666;font-size:13px;margin-top:4px">Hostel Management System</p>
      </div>
      <div>
        <div class="invoice-title">INVOICE</div>
        <div class="invoice-number">${inv.invoice_number}</div>
        <div style="margin-top:8px">
          <span class="status-badge status-${inv.status || 'pending'}">${(inv.status || 'pending').toUpperCase()}</span>
        </div>
      </div>
    </div>

    <div class="details-grid">
      <div class="detail-section">
        <h3>Bill To</h3>
        <p><strong>${studentName}</strong></p>
        ${rollNumber ? `<p>Roll No: ${rollNumber}</p>` : ''}
        ${studentEmail ? `<p>${studentEmail}</p>` : ''}
        ${studentPhone ? `<p>${studentPhone}</p>` : ''}
      </div>
      <div class="detail-section" style="text-align:right">
        <h3>Invoice Details</h3>
        <p>Billing Month: <strong>${format(new Date(inv.billing_month), "MMMM yyyy")}</strong></p>
        <p>Due Date: <strong>${format(new Date(inv.due_date), "dd MMM yyyy")}</strong></p>
        <p>Generated: ${format(new Date(inv.created_at), "dd MMM yyyy")}</p>
      </div>
    </div>

    <table>
      <tr><th>Description</th><th style="text-align:right">Amount (₹)</th></tr>
      ${inv.room_rent ? `<tr><td>Room Rent</td><td style="text-align:right">₹${Number(inv.room_rent).toLocaleString('en-IN')}</td></tr>` : ''}
      ${inv.mess_charges ? `<tr><td>Mess Charges</td><td style="text-align:right">₹${Number(inv.mess_charges).toLocaleString('en-IN')}</td></tr>` : ''}
      ${inv.electricity_charges ? `<tr><td>Electricity Charges</td><td style="text-align:right">₹${Number(inv.electricity_charges).toLocaleString('en-IN')}</td></tr>` : ''}
      ${inv.other_charges && inv.other_charges > 0 ? `<tr><td>Other Charges</td><td style="text-align:right">₹${Number(inv.other_charges).toLocaleString('en-IN')}</td></tr>` : ''}
      ${inv.discounts && inv.discounts > 0 ? `<tr><td>Discount</td><td style="text-align:right;color:#16a34a">-₹${Number(inv.discounts).toLocaleString('en-IN')}</td></tr>` : ''}
      <tr class="total-row"><td>Total Amount</td><td style="text-align:right">₹${Number(inv.total_amount).toLocaleString('en-IN')}</td></tr>
    </table>

    ${inv.status === 'paid' ? `
    <div class="payment-info">
      <strong>✅ Payment Received</strong><br/>
      <span style="font-size:14px">Amount: ₹${Number(inv.paid_amount || inv.total_amount).toLocaleString('en-IN')} | Method: ${(inv.payment_method || 'N/A').toUpperCase()}${inv.payment_date ? ` | Date: ${format(new Date(inv.payment_date), "dd MMM yyyy")}` : ''}</span>
    </div>` : inv.paid_amount && inv.paid_amount > 0 ? `
    <div style="background:#eff6ff;border:1px solid #bfdbfe;border-radius:8px;padding:16px;margin-top:20px">
      <strong>Partial Payment Received</strong><br/>
      <span style="font-size:14px">Paid: ₹${Number(inv.paid_amount).toLocaleString('en-IN')} | Balance Due: ₹${(inv.total_amount - inv.paid_amount).toLocaleString('en-IN')}</span>
    </div>` : ''}

    <div class="footer">
      <p>This is a computer-generated invoice and does not require a signature.</p>
      <p>For queries, contact your hostel administration.</p>
    </div>
    </body></html>`;

    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.print();
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
