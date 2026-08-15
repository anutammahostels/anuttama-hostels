import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Download, FileText, Loader2, Undo2 } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useInvoices } from "@/hooks/useInvoices";
import { supabase } from "@/integrations/supabase/client";
import { exportToExcel } from "@/lib/exportExcel";
import { initiateRefund } from "@/lib/hdfc";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { TablePagination } from "@/components/ui/table-pagination";

const formatCurrency = (n: number) => `₹${n.toLocaleString('en-IN')}`;

type HdfcTxn = { order_id: string; amount: number; hdfc_txn_id: string | null; updated_at: string; invoice_id: string | null };
type PaymentRow = { student_id: string | null; amount: number; payment_method: string | null; payment_mode_label: string | null; paid_at: string | null };

const Receivables = ({ embedded = false }: { embedded?: boolean }) => {
  const { invoices, isLoading } = useInvoices();
  const { toast } = useToast();
  const [refundsMap, setRefundsMap] = useState<Map<string, number>>(new Map());
  const [paymentRowsMap, setPaymentRowsMap] = useState<Map<string, PaymentRow[]>>(new Map());
  const [ledgerLoading, setLedgerLoading] = useState(true);
  const [page, setPage] = useState(1);
  const pageSize = 25;

  // Refund dialog state
  const [refundOpen, setRefundOpen] = useState(false);
  const [refundStudent, setRefundStudent] = useState<{ id: string; name: string } | null>(null);
  const [studentTxns, setStudentTxns] = useState<HdfcTxn[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<string>("");
  const [refundAmount, setRefundAmount] = useState("");
  const [refundReason, setRefundReason] = useState("");
  const [refunding, setRefunding] = useState(false);
  const [loadingTxns, setLoadingTxns] = useState(false);

  useEffect(() => {
    const fetchLedger = async () => {
      setLedgerLoading(true);
      const PAGE = 1000;
      const refunds: { student_id: string | null; amount: number }[] = [];
      const payments: PaymentRow[] = [];

      let refundFrom = 0;
      while (true) {
        const { data } = await supabase
          .from('refunds')
          .select('student_id, amount')
          .range(refundFrom, refundFrom + PAGE - 1);
        if (!data || data.length === 0) break;
        refunds.push(...data);
        if (data.length < PAGE) break;
        refundFrom += PAGE;
      }

      let paymentFrom = 0;
      while (true) {
        const { data } = await supabase
          .from('payments')
          .select('student_id, amount, payment_method, payment_mode_label, paid_at')
          .eq('status', 'completed')
          .order('paid_at', { ascending: true })
          .range(paymentFrom, paymentFrom + PAGE - 1);
        if (!data || data.length === 0) break;
        payments.push(...data);
        if (data.length < PAGE) break;
        paymentFrom += PAGE;
      }

      const refundMap = new Map<string, number>();
      refunds.filter(r => r.student_id).forEach(r => {
        const sid = r.student_id;
        if (!sid) return;
        refundMap.set(sid, (refundMap.get(sid) || 0) + Number(r.amount || 0));
      });

      const paymentMap = new Map<string, PaymentRow[]>();
      payments.filter(p => p.student_id).forEach(p => {
        const sid = p.student_id;
        if (!sid) return;
        const list = paymentMap.get(sid) || [];
        list.push(p);
        paymentMap.set(sid, list);
      });

      setRefundsMap(refundMap);
      setPaymentRowsMap(paymentMap);
      setLedgerLoading(false);
    };
    fetchLedger();
  }, [invoices]);

  const openRefund = async (studentId: string, studentName: string) => {
    setRefundStudent({ id: studentId, name: studentName });
    setRefundOpen(true);
    setSelectedOrder("");
    setRefundAmount("");
    setRefundReason("");
    setLoadingTxns(true);
    // Find HDFC successful transactions for this student's invoices
    const studentInvoiceIds = invoices.filter(i => i.student_id === studentId).map(i => i.id);
    if (studentInvoiceIds.length === 0) {
      setStudentTxns([]);
      setLoadingTxns(false);
      return;
    }
    const { data } = await supabase
      .from('payment_transactions')
      .select('order_id, amount, hdfc_txn_id, updated_at, invoice_id')
      .in('invoice_id', studentInvoiceIds)
      .eq('status', 'SUCCESS')
      .order('updated_at', { ascending: false });
    setStudentTxns((data as HdfcTxn[]) || []);
    setLoadingTxns(false);
  };

  const submitRefund = async () => {
    if (!selectedOrder || !refundAmount || !refundReason) return;
    setRefunding(true);
    try {
      const res = await initiateRefund(selectedOrder, parseFloat(refundAmount), undefined, refundReason);
      toast({
        title: res.status === "SUCCESS" ? "Refund processed" : "Refund initiated",
        description: `HDFC status: ${res.status}${res.refund_id ? ` (ref ${res.refund_id})` : ""}`,
      });
      setRefundOpen(false);
      // Refresh refund totals
      const PAGE = 1000;
      const refunds: { student_id: string | null; amount: number }[] = [];
      let refundFrom = 0;
      while (true) {
        const { data } = await supabase
          .from('refunds')
          .select('student_id, amount')
          .range(refundFrom, refundFrom + PAGE - 1);
        if (!data || data.length === 0) break;
        refunds.push(...data);
        if (data.length < PAGE) break;
        refundFrom += PAGE;
      }
      if (refunds.length) {
        const map = new Map<string, number>();
        refunds.filter(r => r.student_id).forEach(r => {
          const sid = r.student_id;
          if (!sid) return;
          map.set(sid, (map.get(sid) || 0) + Number(r.amount || 0));
        });
        setRefundsMap(map);
      }
    } catch (err: any) {
      toast({ title: "Refund failed", description: err?.message || "HDFC refund error", variant: "destructive" });
    } finally {
      setRefunding(false);
    }
  };

  // Group by student
  const studentMap = new Map<string, {
    name: string; rollNo: string; gross: number; discounts: number;
    received: number; refunds: number; paymentModes: Set<string>; net: number;
  }>();

  // Track received/refunds for excluded (inactive) students separately so they
  // still appear in the "Amount Received" total but not in Gross/Net.
  let excludedReceived = 0;
  let excludedRefunds = 0;
  const excludedStudentIds = new Set<string>();

  invoices.forEach(inv => {
    if (!inv.student_id || !inv.student?.id) return;
    const sid = inv.student_id;
    const isExcluded = inv.student?.status === 'inactive';
    if (isExcluded) {
      if (!excludedStudentIds.has(sid)) {
        const r = refundsMap.get(sid) || 0;
        const directPayments = paymentRowsMap.get(sid) || [];
        excludedRefunds += r;
        excludedReceived += directPayments.reduce((sum, p) => sum + Number(p.amount || 0), 0);
        excludedStudentIds.add(sid);
      }
      return; // don't include in per-student receivables rows
    }
    const existing = studentMap.get(sid) || {
      name: inv.student?.profile?.full_name || "Unknown",
      rollNo: inv.student?.roll_number || "-",
      gross: 0, discounts: 0, received: 0, refunds: 0, paymentModes: new Set<string>(), net: 0,
    };
    existing.gross += Number(inv.total_amount || 0);
    existing.discounts += Number(inv.discounts || 0);
    existing.refunds = refundsMap.get(sid) || 0;
    studentMap.set(sid, existing);
  });

  // Amount Received is always the sum of completed payment transactions.
  // Net Receivable follows the client report: Gross - Discounts - Amount Received.
  studentMap.forEach((d, studentId) => {
    const payments = paymentRowsMap.get(studentId) || [];
    d.received = payments.reduce((sum, p) => sum + Number(p.amount || 0), 0);
    payments.forEach((p) => d.paymentModes.add(p.payment_mode_label || p.payment_method || '-'));
    d.net = d.gross - d.discounts - d.received;
  });

  const rows = Array.from(studentMap.entries()).map(([id, d]) => ({
    id,
    ...d,
    paymentModes: Array.from(d.paymentModes).join(', ') || '-',
  }));

  const totals = rows.reduce((acc, r) => ({
    gross: acc.gross + r.gross, discounts: acc.discounts + r.discounts,
    received: acc.received + r.received, refunds: acc.refunds + r.refunds, net: acc.net + r.net,
  }), { gross: 0, discounts: 0, received: excludedReceived, refunds: excludedRefunds, net: 0 });
  totals.net = totals.gross - totals.discounts - totals.received;

  const pagedRows = rows.slice((page - 1) * pageSize, page * pageSize);

  const handleExportExcel = () => {
    exportToExcel(rows.map(r => {
      const payments = paymentRowsMap.get(r.id) || [];
      const [p1, p2, p3] = [payments[0], payments[1], payments[2]];
      const fmt = (d: any) => d ? format(new Date(d), "dd MMM yyyy") : "";
      const method = (p?: PaymentRow) => p?.payment_mode_label || p?.payment_method || "";
      return {
        "Student Name": r.name,
        "Form Number": r.rollNo,
        "Gross Receivable": r.gross,
        "Discounts": r.discounts,
        "Amount 1": Number(p1?.amount || 0),
        "Amount 1 Date": fmt(p1?.paid_at),
        "Amount 1 Method": method(p1),
        "Amount 2": Number(p2?.amount || 0),
        "Amount 2 Date": fmt(p2?.paid_at),
        "Amount 2 Method": method(p2),
        "Amount 3": Number(p3?.amount || 0),
        "Amount 3 Date": fmt(p3?.paid_at),
        "Amount 3 Method": method(p3),
        "Total Received": r.received,
        "Refunds": r.refunds,
        "Net Receivable": r.net,
      };
    }), `receivables-${format(new Date(), "yyyy-MM-dd")}`, "Receivables");
  };

  const handleExportPdf = () => {
    const w = window.open("", "_blank");
    if (!w) return;
    w.document.write(`<!DOCTYPE html><html><head><title>Receivables Report</title>
    <style>body{font-family:Arial,sans-serif;padding:30px;color:#1a1a2e}h1{color:#0f3460;border-bottom:2px solid #0f3460;padding-bottom:8px}
    table{width:100%;border-collapse:collapse;margin:15px 0}th,td{border:1px solid #ddd;padding:8px;text-align:left;font-size:13px}
    th{background:#0f3460;color:#fff}.total td{font-weight:bold;background:#f0f4ff}@media print{body{padding:15px}}</style></head><body>
    <h1>Student Receivables Report</h1><p>Generated: ${format(new Date(), "dd MMM yyyy")}</p>
    <table><tr><th>Student</th><th>Form Number</th><th>Gross Receivable</th><th>Discounts</th><th>Received</th><th>Refunds</th><th>Payment Mode</th><th>Net Receivable</th></tr>
    ${rows.map(r => `<tr><td>${r.name}</td><td>${r.rollNo}</td><td>${formatCurrency(r.gross)}</td><td>${formatCurrency(r.discounts)}</td><td>${formatCurrency(r.received)}</td><td>${formatCurrency(r.refunds)}</td><td>${r.paymentModes}</td><td>${formatCurrency(r.net)}</td></tr>`).join("")}
    <tr class="total"><td colspan="2">TOTAL</td><td>${formatCurrency(totals.gross)}</td><td>${formatCurrency(totals.discounts)}</td><td>${formatCurrency(totals.received)}</td><td>${formatCurrency(totals.refunds)}</td><td></td><td>${formatCurrency(totals.net)}</td></tr>
    </table></body></html>`);
    w.document.close();
    w.print();
  };

  if (isLoading || ledgerLoading) return <div className="flex items-center justify-center h-64"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

  return (
    <div className="space-y-6">
      {!embedded && (
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Student Receivables</h1>
          <p className="text-muted-foreground">Gross receivables, discounts, collections, refunds & net outstanding</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExportExcel}><Download className="h-4 w-4 mr-2" />Export Excel</Button>
          <Button variant="outline" onClick={handleExportPdf}><FileText className="h-4 w-4 mr-2" />Export PDF</Button>
        </div>
      </div>
      )}

      {embedded && (
        <div className="flex justify-end">
          <Button variant="outline" size="sm" onClick={handleExportPdf}><FileText className="h-4 w-4 mr-2" />Export PDF</Button>
        </div>
      )}

      {!embedded && (
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        <Card><CardContent className="p-4"><p className="text-sm text-muted-foreground">Gross Receivable</p><p className="text-xl sm:text-2xl font-bold">{formatCurrency(totals.gross)}</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-sm text-muted-foreground">Discounts Given</p><p className="text-xl sm:text-2xl font-bold text-yellow-600">{formatCurrency(totals.discounts)}</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-sm text-muted-foreground">Amount Received</p><p className="text-xl sm:text-2xl font-bold text-green-600">{formatCurrency(totals.received)}</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-sm text-muted-foreground">Refunds</p><p className="text-xl sm:text-2xl font-bold text-orange-600">{formatCurrency(totals.refunds)}</p></CardContent></Card>
        <Card className="col-span-2 sm:col-span-1"><CardContent className="p-4"><p className="text-sm text-muted-foreground">Net Receivable</p><p className="text-xl sm:text-2xl font-bold text-red-600">{formatCurrency(totals.net)}</p></CardContent></Card>
      </div>
      )}


      <Card>
        <CardContent className="p-0">
          <div className="sm:hidden divide-y divide-border">
            {rows.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">No receivables data</div>
            ) : (
              <>
                {pagedRows.map(r => (
                  <div key={r.id} className="p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{r.name}</p>
                        <p className="text-xs text-muted-foreground">{r.rollNo}</p>
                      </div>
                      <p className="font-bold text-red-600">{formatCurrency(r.net)}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div><span className="text-muted-foreground">Gross:</span> {formatCurrency(r.gross)}</div>
                      <div><span className="text-muted-foreground">Discount:</span> <span className="text-yellow-600">{formatCurrency(r.discounts)}</span></div>
                      <div><span className="text-muted-foreground">Received:</span> <span className="text-green-600">{formatCurrency(r.received)}</span></div>
                      <div><span className="text-muted-foreground">Refunds:</span> <span className="text-orange-600">{formatCurrency(r.refunds)}</span></div>
                    </div>
                    <div className="flex items-center justify-between pt-1">
                      {r.paymentModes !== '-' && <Badge variant="outline" className="text-xs capitalize">{r.paymentModes}</Badge>}
                      {!embedded && (
                        <Button size="sm" variant="outline" onClick={() => openRefund(r.id, r.name)}>
                          <Undo2 className="h-3.5 w-3.5 mr-1" />Refund
                        </Button>
                      )}
                    </div>

                  </div>
                ))}
                <div className="p-4 bg-muted/50 font-bold">
                  <div className="flex justify-between">
                    <span>TOTAL</span>
                    <span className="text-red-600">{formatCurrency(totals.net)}</span>
                  </div>
                </div>
              </>
            )}
          </div>
          <div className="hidden sm:block overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Form Number</TableHead>
                  <TableHead className="text-right">Gross Receivable</TableHead>
                  <TableHead className="text-right">Discounts</TableHead>
                  <TableHead className="text-right">Received</TableHead>
                  <TableHead className="text-right">Refunds</TableHead>
                  <TableHead>Payment Mode</TableHead>
                  <TableHead className="text-right">Net Receivable</TableHead>
                  {!embedded && <TableHead className="text-right">Action</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.length === 0 ? (
                  <TableRow><TableCell colSpan={embedded ? 8 : 9} className="text-center py-8 text-muted-foreground">No receivables data</TableCell></TableRow>
                ) : pagedRows.map(r => (
                  <TableRow key={r.id}>
                    <TableCell className="font-medium">{r.name}</TableCell>
                    <TableCell>{r.rollNo}</TableCell>
                    <TableCell className="text-right">{formatCurrency(r.gross)}</TableCell>
                    <TableCell className="text-right text-yellow-600">{formatCurrency(r.discounts)}</TableCell>
                    <TableCell className="text-right text-green-600">{formatCurrency(r.received)}</TableCell>
                    <TableCell className="text-right text-orange-600">{formatCurrency(r.refunds)}</TableCell>
                    <TableCell><Badge variant="outline" className="text-xs capitalize">{r.paymentModes}</Badge></TableCell>
                    <TableCell className="text-right font-bold text-red-600">{formatCurrency(r.net)}</TableCell>
                    {!embedded && (
                      <TableCell className="text-right">
                        <Button size="sm" variant="outline" onClick={() => openRefund(r.id, r.name)}>
                          <Undo2 className="h-3.5 w-3.5 mr-1" />Refund
                        </Button>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
                {rows.length > 0 && (
                  <TableRow className="bg-muted/50 font-bold">
                    <TableCell colSpan={2}>TOTAL</TableCell>
                    <TableCell className="text-right">{formatCurrency(totals.gross)}</TableCell>
                    <TableCell className="text-right text-yellow-600">{formatCurrency(totals.discounts)}</TableCell>
                    <TableCell className="text-right text-green-600">{formatCurrency(totals.received)}</TableCell>
                    <TableCell className="text-right text-orange-600">{formatCurrency(totals.refunds)}</TableCell>
                    <TableCell></TableCell>
                    <TableCell className="text-right text-red-600">{formatCurrency(totals.net)}</TableCell>
                    {!embedded && <TableCell></TableCell>}
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          <TablePagination page={page} pageSize={pageSize} totalItems={rows.length} onPageChange={setPage} itemLabel="students" />
        </CardContent>
      </Card>

      <Dialog open={refundOpen} onOpenChange={setRefundOpen}>
        <DialogContent className="bg-background">
          <DialogHeader>
            <DialogTitle>HDFC Refund</DialogTitle>
            <DialogDescription>Refund an online payment to the original card/UPI for {refundStudent?.name}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            {loadingTxns ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" />Loading transactions…</div>
            ) : studentTxns.length === 0 ? (
              <p className="text-sm text-muted-foreground">No successful HDFC transactions found for this student. Use the manual refund in Billing for offline payments.</p>
            ) : (
              <>
                <div className="space-y-2">
                  <Label>Original Transaction</Label>
                  <Select value={selectedOrder} onValueChange={(v) => {
                    setSelectedOrder(v);
                    const t = studentTxns.find(x => x.order_id === v);
                    if (t) setRefundAmount(String(t.amount));
                  }}>
                    <SelectTrigger><SelectValue placeholder="Select a payment" /></SelectTrigger>
                    <SelectContent className="bg-popover">
                      {studentTxns.map(t => (
                        <SelectItem key={t.order_id} value={t.order_id}>
                          {formatCurrency(Number(t.amount))} • {format(new Date(t.updated_at), "dd MMM yyyy")} • {t.order_id.slice(-8)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Refund Amount (₹)</Label>
                  <Input type="number" value={refundAmount} onChange={(e) => setRefundAmount(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Reason</Label>
                  <Textarea value={refundReason} onChange={(e) => setRefundReason(e.target.value)} placeholder="e.g. Student exit, overpayment..." />
                </div>
              </>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRefundOpen(false)}>Cancel</Button>
            <Button
              variant="destructive"
              disabled={!selectedOrder || !refundAmount || !refundReason || refunding}
              onClick={submitRefund}
            >
              {refunding ? <Loader2 className="h-4 w-4 animate-spin" /> : "Process Refund"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Receivables;
