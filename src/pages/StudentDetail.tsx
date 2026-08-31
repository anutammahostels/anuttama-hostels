import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, IndianRupee, Loader2, Receipt, Wallet, Percent } from "lucide-react";
import { formatINR as formatCurrency } from "@/lib/formatCurrency";
import { useInvoices } from "@/hooks/useInvoices";
import { invoiceToReceipt, buildReceiptHtml } from "@/lib/receiptTemplate";
import { useToast } from "@/hooks/use-toast";

const fmtDate = (d?: string | null) => (d ? new Date(d).toLocaleDateString("en-GB") : "—");

const StudentDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { recordPayment, updateInvoice } = useInvoices(id);

  const [paymentDialog, setPaymentDialog] = useState<{ open: boolean; invoice: any | null }>({ open: false, invoice: null });
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("upi");
  const [paymentReference, setPaymentReference] = useState("");
  const [paymentCount, setPaymentCount] = useState<number | null>(null);

  const [discountDialog, setDiscountDialog] = useState<{ open: boolean; invoice: any | null }>({ open: false, invoice: null });
  const [discountAmount, setDiscountAmount] = useState("");

  const closeDiscountDialog = () => {
    setDiscountDialog({ open: false, invoice: null });
    setDiscountAmount("");
  };

  const openDiscountDialog = (inv: any) => {
    setDiscountDialog({ open: true, invoice: inv });
    setDiscountAmount(String(Number(inv.discounts) || 0));
  };

  const handleSetDiscount = async () => {
    const inv = discountDialog.invoice;
    if (!inv) return;
    const newDiscount = parseFloat(discountAmount) || 0;
    const grossFee = Number(inv.total_amount || 0) + Number(inv.discounts || 0);
    const newTotal = grossFee - newDiscount;
    const paidSoFar = Number(inv.paid_amount || 0);
    if (newDiscount < 0 || newTotal < 0) {
      toast({ title: "Invalid discount", description: "Discount cannot be negative or exceed the fee amount.", variant: "destructive" });
      return;
    }
    if (newTotal < paidSoFar) {
      toast({ title: "Invalid discount", description: `Discount can't reduce the payable amount below what's already paid (₹${paidSoFar.toLocaleString("en-IN")}).`, variant: "destructive" });
      return;
    }
    await updateInvoice.mutateAsync({ id: inv.id, discounts: newDiscount, total_amount: newTotal });
    queryClient.invalidateQueries({ queryKey: ["student-detail", id] });
    closeDiscountDialog();
  };

  const closePaymentDialog = () => {
    setPaymentDialog({ open: false, invoice: null });
    setPaymentAmount("");
    setPaymentReference("");
    setPaymentCount(null);
  };

  // Load count of completed payments whenever the payment dialog opens,
  // mirroring Billing.tsx's rule enforcement (max 3 partial payments per invoice).
  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!paymentDialog.open || !paymentDialog.invoice) {
        setPaymentCount(null);
        return;
      }
      const { count } = await supabase
        .from("payments")
        .select("id", { count: "exact", head: true })
        .eq("invoice_id", paymentDialog.invoice.id)
        .eq("status", "completed");
      if (!cancelled) {
        const used = count || 0;
        setPaymentCount(used);
        const inv = paymentDialog.invoice;
        const balance = Math.max(0, (inv.total_amount || 0) - (inv.paid_amount || 0));
        if (used === 2) setPaymentAmount(String(balance));
        else if (!paymentAmount) setPaymentAmount(String(balance));
      }
    })();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paymentDialog.open, paymentDialog.invoice?.id]);

  const handleRecordPayment = async () => {
    if (!paymentDialog.invoice || !paymentAmount) return;
    await recordPayment.mutateAsync({
      id: paymentDialog.invoice.id,
      amount: parseFloat(paymentAmount),
      method: paymentMethod,
      modeLabel: paymentMethod,
      reference: paymentReference || undefined,
    });
    queryClient.invalidateQueries({ queryKey: ["student-detail", id] });
    closePaymentDialog();
  };

  const handleDownloadReceipt = (inv: any, student: any, studentName: string) => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;
    const data = invoiceToReceipt(inv, {
      studentName,
      rollNumber: student.roll_number,
      fatherName: student.father_name,
      motherName: student.mother_name,
      gender: student.gender,
      course: student.course,
    });
    const html = buildReceiptHtml(data);
    printWindow.document.write(html);
    printWindow.document.close();
  };

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
                    <TableHead className="text-right">Actions</TableHead>
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
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          {inv.status !== "paid" && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setPaymentDialog({ open: true, invoice: inv })}
                            >
                              <Wallet className="h-3.5 w-3.5 mr-1" /> Record Payment
                            </Button>
                          )}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openDiscountDialog(inv)}
                          >
                            <Percent className="h-3.5 w-3.5 mr-1" /> Discount
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDownloadReceipt(inv, student, profile?.full_name || "Unknown")}
                          >
                            <Receipt className="h-3.5 w-3.5 mr-1" /> Receipt
                          </Button>
                        </div>
                      </TableCell>
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

      <Dialog open={paymentDialog.open} onOpenChange={(open) => { if (!open) closePaymentDialog(); }}>
        <DialogContent className="bg-background">
          <DialogHeader>
            <DialogTitle>Record Payment</DialogTitle>
            <DialogDescription>
              Recording payment for invoice {paymentDialog.invoice?.invoice_number}
            </DialogDescription>
          </DialogHeader>
          {(() => {
            const inv = paymentDialog.invoice;
            const total = inv?.total_amount || 0;
            const paidSoFar = inv?.paid_amount || 0;
            const balance = Math.max(0, total - paidSoFar);
            const used = paymentCount ?? 0;
            const remaining = Math.max(0, 3 - used);
            const isFinal = used === 2;
            const isExhausted = used >= 3;
            return (
              <>
                <div className="space-y-4 py-4">
                  <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Total Amount:</span>
                      <span className="font-medium">{formatCurrency(total)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Already Paid:</span>
                      <span className="text-green-600">{formatCurrency(paidSoFar)}</span>
                    </div>
                    <div className="flex justify-between border-t pt-2">
                      <span className="text-muted-foreground">Balance Due:</span>
                      <span className="font-bold text-red-500">{formatCurrency(balance)}</span>
                    </div>
                    <div className="flex justify-between border-t pt-2">
                      <span className="text-muted-foreground">Partial payments used:</span>
                      <Badge variant={isFinal || isExhausted ? "destructive" : "secondary"}>
                        {used} of 3 {remaining > 0 ? `(${remaining} left)` : "(none left)"}
                      </Badge>
                    </div>
                  </div>

                  {isExhausted && (
                    <div className="rounded-md border border-destructive/40 bg-destructive/5 p-3 text-sm text-destructive">
                      This invoice has already used all 3 allowed partial payments. No more partial entries can be recorded.
                    </div>
                  )}
                  {isFinal && !isExhausted && (
                    <div className="rounded-md border border-amber-500/40 bg-amber-500/5 p-3 text-sm text-amber-700">
                      This is the final allowed payment — it must clear the full remaining balance of {formatCurrency(balance)}.
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label>Payment Amount</Label>
                    <Input
                      type="number"
                      placeholder="Enter amount..."
                      value={paymentAmount}
                      disabled={isExhausted || isFinal}
                      onChange={(e) => setPaymentAmount(e.target.value)}
                    />
                    {isFinal && (
                      <p className="text-xs text-muted-foreground">Locked to remaining balance.</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label>Payment Method</Label>
                    <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select method..." />
                      </SelectTrigger>
                      <SelectContent className="bg-popover">
                        <SelectItem value="cash">Cash</SelectItem>
                        <SelectItem value="upi">UPI</SelectItem>
                        <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                        <SelectItem value="cheque">Cheque</SelectItem>
                        <SelectItem value="online">Online Payment</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Transaction Reference / UTR (optional)</Label>
                    <Input
                      placeholder="UTR, cheque #, txn ID..."
                      value={paymentReference}
                      onChange={(e) => setPaymentReference(e.target.value)}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={closePaymentDialog}>
                    Cancel
                  </Button>
                  <Button
                    onClick={handleRecordPayment}
                    disabled={!paymentAmount || recordPayment.isPending || isExhausted}
                    className="gradient-primary text-white"
                  >
                    {recordPayment.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Record Payment"}
                  </Button>
                </DialogFooter>
              </>
            );
          })()}
        </DialogContent>
      </Dialog>

      <Dialog open={discountDialog.open} onOpenChange={(open) => { if (!open) closeDiscountDialog(); }}>
        <DialogContent className="bg-background">
          <DialogHeader>
            <DialogTitle>Set Discount</DialogTitle>
            <DialogDescription>
              Applying a discount for invoice {discountDialog.invoice?.invoice_number}
            </DialogDescription>
          </DialogHeader>
          {(() => {
            const inv = discountDialog.invoice;
            if (!inv) return null;
            const paidSoFar = Number(inv.paid_amount || 0);
            const grossFee = Number(inv.total_amount || 0) + Number(inv.discounts || 0);
            const newDiscount = parseFloat(discountAmount) || 0;
            const newTotal = Math.max(0, grossFee - newDiscount);
            const newDue = Math.max(0, newTotal - paidSoFar);
            return (
              <>
                <div className="space-y-4 py-4">
                  <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Original Fee:</span>
                      <span className="font-medium">{formatCurrency(grossFee)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Already Paid:</span>
                      <span className="text-green-600">{formatCurrency(paidSoFar)}</span>
                    </div>
                    <div className="flex justify-between border-t pt-2">
                      <span className="text-muted-foreground">Net Payable (after discount):</span>
                      <span className="font-bold">{formatCurrency(newTotal)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Remaining Due:</span>
                      <span className="font-bold text-red-500">{formatCurrency(newDue)}</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Discount Amount (₹)</Label>
                    <Input
                      type="number"
                      placeholder="e.g. 5000"
                      value={discountAmount}
                      onChange={(e) => setDiscountAmount(e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground">
                      This reduces the student's payable amount for this invoice. Already-paid amounts are not affected.
                    </p>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={closeDiscountDialog}>
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSetDiscount}
                    disabled={updateInvoice.isPending}
                    className="gradient-primary text-white"
                  >
                    {updateInvoice.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save Discount"}
                  </Button>
                </DialogFooter>
              </>
            );
          })()}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default StudentDetail;
