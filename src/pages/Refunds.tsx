import { useEffect, useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Download, FileText, Loader2, Search, CheckCircle2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { exportToExcel } from "@/lib/exportExcel";
import { format } from "date-fns";
import { TablePagination } from "@/components/ui/table-pagination";
import { useCenter } from "@/contexts/CenterContext";
import { CenterFilter } from "@/components/dashboard/CenterFilter";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { initiateRefund } from "@/lib/hdfc";
import { useToast } from "@/hooks/use-toast";

const formatCurrency = (n: number) => `₹${Number(n || 0).toLocaleString("en-IN")}`;

type RefundRow = {
  id: string;
  amount: number;
  created_at: string;
  status: string | null;
  refund_method: string | null;
  reason: string | null;
  invoice_id: string;
  student_id: string | null;
  property_id: string;
  student_name: string;
  roll_number: string;
  invoice_number: string;
  property_name: string;
};

const Refunds = ({ embedded = false }: { embedded?: boolean }) => {
  const { centerId } = useCenter();
  const [rows, setRows] = useState<RefundRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [page, setPage] = useState(1);
  const pageSize = 25;
  const { toast } = useToast();
  const [reloadKey, setReloadKey] = useState(0);

  // Process refund dialog
  const [processOpen, setProcessOpen] = useState(false);
  const [activeRow, setActiveRow] = useState<RefundRow | null>(null);
  const [method, setMethod] = useState<string>("hdfc");
  const [notes, setNotes] = useState("");
  const [accountHolder, setAccountHolder] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [ifsc, setIfsc] = useState("");
  const [bankName, setBankName] = useState("");
  const [upiId, setUpiId] = useState("");
  const [chequeNumber, setChequeNumber] = useState("");
  const [referenceNumber, setReferenceNumber] = useState("");
  const [processing, setProcessing] = useState(false);

  const isPending = (s: string | null) =>
    !["processed", "completed", "success", "failed", "rejected"].includes((s || "").toLowerCase());

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const PAGE = 1000;
      const refunds: any[] = [];
      let from = 0;
      while (true) {
        let q = supabase
          .from("refunds")
          .select("id, amount, created_at, status, refund_method, reason, invoice_id, student_id, property_id")
          .order("created_at", { ascending: false })
          .range(from, from + PAGE - 1);
        if (centerId !== "all") q = q.eq("property_id", centerId);
        const { data, error } = await q;
        if (error || !data || data.length === 0) break;
        refunds.push(...data);
        if (data.length < PAGE) break;
        from += PAGE;
      }

      const studentIds = Array.from(new Set(refunds.map((r) => r.student_id).filter(Boolean)));
      const invoiceIds = Array.from(new Set(refunds.map((r) => r.invoice_id).filter(Boolean)));
      const propertyIds = Array.from(new Set(refunds.map((r) => r.property_id).filter(Boolean)));

      const [studentsRes, invoicesRes, propertiesRes] = await Promise.all([
        studentIds.length
          ? supabase.from("students").select("id, roll_number, user_id").in("id", studentIds)
          : Promise.resolve({ data: [] as any[] }),
        invoiceIds.length
          ? supabase.from("invoices").select("id, invoice_number").in("id", invoiceIds)
          : Promise.resolve({ data: [] as any[] }),
        propertyIds.length
          ? supabase.from("properties").select("id, name").in("id", propertyIds)
          : Promise.resolve({ data: [] as any[] }),
      ]);

      const students = (studentsRes.data as any[]) || [];
      const userIds = students.map((s) => s.user_id).filter(Boolean);
      const { data: profiles } = userIds.length
        ? await supabase.from("profiles").select("id, full_name").in("id", userIds)
        : { data: [] as any[] };

      const profileMap = new Map((profiles || []).map((p: any) => [p.id, p.full_name]));
      const studentMap = new Map(
        students.map((s: any) => [s.id, { roll: s.roll_number, name: profileMap.get(s.user_id) || "-" }])
      );
      const invoiceMap = new Map(((invoicesRes.data as any[]) || []).map((i) => [i.id, i.invoice_number]));
      const propertyMap = new Map(((propertiesRes.data as any[]) || []).map((p) => [p.id, p.name]));

      const mapped: RefundRow[] = refunds.map((r) => ({
        id: r.id,
        amount: Number(r.amount || 0),
        created_at: r.created_at,
        status: r.status,
        refund_method: r.refund_method,
        reason: r.reason,
        invoice_id: r.invoice_id,
        student_id: r.student_id,
        property_id: r.property_id,
        student_name: r.student_id ? studentMap.get(r.student_id)?.name || "-" : "-",
        roll_number: r.student_id ? studentMap.get(r.student_id)?.roll || "-" : "-",
        invoice_number: invoiceMap.get(r.invoice_id) || "-",
        property_name: propertyMap.get(r.property_id) || "-",
      }));

      setRows(mapped);
      setLoading(false);
    };
    load();
  }, [centerId, reloadKey]);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return rows.filter((r) => {
      const matchesSearch =
        !term ||
        r.student_name.toLowerCase().includes(term) ||
        r.roll_number.toLowerCase().includes(term) ||
        r.invoice_number.toLowerCase().includes(term) ||
        (r.refund_method || "").toLowerCase().includes(term);

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "processed" &&
          ["processed", "completed", "success"].includes((r.status || "").toLowerCase())) ||
        (statusFilter === "pending" &&
          !["processed", "completed", "success", "failed", "rejected"].includes((r.status || "").toLowerCase()));

      return matchesSearch && matchesStatus;
    });
  }, [rows, search, statusFilter]);

  const totals = useMemo(() => {
    const total = filtered.reduce((s, r) => s + r.amount, 0);
    const processed = filtered
      .filter((r) => ["processed", "completed", "success"].includes((r.status || "").toLowerCase()))
      .reduce((s, r) => s + r.amount, 0);
    return { total, processed, count: filtered.length };
  }, [filtered]);

  const paged = filtered.slice((page - 1) * pageSize, page * pageSize);

  useEffect(() => setPage(1), [search, centerId, statusFilter]);

  const handleExportExcel = () => {
    exportToExcel(
      filtered.map((r) => ({
        Date: format(new Date(r.created_at), "dd MMM yyyy"),
        "Student Name": r.student_name,
        "Form Number": r.roll_number,
        "Invoice Number": r.invoice_number,
        Center: r.property_name,
        Amount: r.amount,
        Method: r.refund_method || "-",
        Status: r.status || "-",
        Reason: r.reason || "-",
      })),
      `refunds-${format(new Date(), "yyyy-MM-dd")}`,
      "Refunds"
    );
  };

  const handleExportPdf = () => {
    const w = window.open("", "_blank");
    if (!w) return;
    w.document.write(`<!DOCTYPE html><html><head><title>Refunds Report</title>
    <style>body{font-family:Arial,sans-serif;padding:30px;color:#1a1a2e}h1{color:#0f3460;border-bottom:2px solid #0f3460;padding-bottom:8px}
    table{width:100%;border-collapse:collapse;margin:15px 0}th,td{border:1px solid #ddd;padding:8px;text-align:left;font-size:13px}
    th{background:#0f3460;color:#fff}.total td{font-weight:bold;background:#f0f4ff}</style></head><body>
    <h1>Refunds Report</h1><p>Generated: ${format(new Date(), "dd MMM yyyy")}</p>
    <table><tr><th>Date</th><th>Student</th><th>Form No.</th><th>Invoice</th><th>Center</th><th>Method</th><th>Status</th><th>Amount</th></tr>
    ${filtered
      .map(
        (r) =>
          `<tr><td>${format(new Date(r.created_at), "dd MMM yyyy")}</td><td>${r.student_name}</td><td>${r.roll_number}</td><td>${r.invoice_number}</td><td>${r.property_name}</td><td>${r.refund_method || "-"}</td><td>${r.status || "-"}</td><td>${formatCurrency(r.amount)}</td></tr>`
      )
      .join("")}
    <tr class="total"><td colspan="7">TOTAL</td><td>${formatCurrency(totals.total)}</td></tr>
    </table></body></html>`);
    w.document.close();
    w.print();
  };

  const statusColor = (s: string | null) => {
    const v = (s || "").toLowerCase();
    if (["processed", "completed", "success"].includes(v)) return "bg-green-100 text-green-700";
    if (["failed", "rejected"].includes(v)) return "bg-red-100 text-red-700";
    return "bg-yellow-100 text-yellow-700";
  };

  const openProcess = (r: RefundRow) => {
    setActiveRow(r);
    setMethod("hdfc");
    setNotes(r.reason || "");
    setAccountHolder("");
    setAccountNumber("");
    setIfsc("");
    setBankName("");
    setUpiId("");
    setChequeNumber("");
    setReferenceNumber("");
    setProcessOpen(true);
  };

  const submitProcess = async () => {
    if (!activeRow) return;
    setProcessing(true);
    try {
      if (method === "hdfc") {
        // Look up a successful HDFC transaction on this invoice
        const { data: txns } = await supabase
          .from("payment_transactions")
          .select("order_id, amount")
          .eq("invoice_id", activeRow.invoice_id)
          .eq("status", "SUCCESS")
          .order("updated_at", { ascending: false })
          .limit(1);
        const txn = (txns || [])[0];
        if (!txn) {
          toast({
            title: "No HDFC transaction",
            description: "This invoice has no successful HDFC payment. Choose an offline method.",
            variant: "destructive",
          });
          setProcessing(false);
          return;
        }
        const res = await initiateRefund(
          txn.order_id,
          activeRow.amount,
          undefined,
          notes || "Refund processed from Refunds tab",
        );
        toast({
          title: res.status === "SUCCESS" ? "Refund processed" : "Refund initiated",
          description: `HDFC status: ${res.status}${res.refund_id ? ` (ref ${res.refund_id})` : ""}`,
        });
        // Delete the placeholder pending row — initiateRefund creates a fresh refund row
        await supabase.from("refunds").delete().eq("id", activeRow.id);
      } else {
        // Validate offline method-specific fields
        const missing: string[] = [];
        if (method === "neft") {
          if (!accountHolder.trim()) missing.push("Account holder");
          if (!accountNumber.trim()) missing.push("Account number");
          if (!ifsc.trim()) missing.push("IFSC code");
        } else if (method === "upi") {
          if (!upiId.trim()) missing.push("UPI ID");
        } else if (method === "cheque") {
          if (!chequeNumber.trim()) missing.push("Cheque number");
          if (!accountHolder.trim()) missing.push("Payee name");
          if (!bankName.trim()) missing.push("Bank name");
        } else if (method === "cash") {
          if (!referenceNumber.trim()) missing.push("Receipt / voucher no.");
        }
        if (missing.length) {
          toast({ title: "Missing details", description: missing.join(", "), variant: "destructive" });
          setProcessing(false);
          return;
        }

        // Compose refund details into reason for audit trail
        const details: string[] = [];
        if (method === "neft") details.push(`NEFT to ${accountHolder} • A/C ${accountNumber} • IFSC ${ifsc}${bankName ? ` • ${bankName}` : ""}`);
        if (method === "upi") details.push(`UPI to ${upiId}`);
        if (method === "cheque") details.push(`Cheque #${chequeNumber} • ${accountHolder} • ${bankName}`);
        if (method === "cash") details.push(`Cash • Voucher ${referenceNumber}`);
        if (referenceNumber && method !== "cash") details.push(`Ref: ${referenceNumber}`);
        if (notes.trim()) details.push(notes.trim());
        const composedReason = details.join(" | ");

        const { error } = await supabase
          .from("refunds")
          .update({
            status: "processed",
            refund_method: method,
            reason: composedReason || activeRow.reason,
          })
          .eq("id", activeRow.id);
        if (error) throw error;
        toast({ title: "Refund marked as processed" });
      }
      setProcessOpen(false);
      setActiveRow(null);
      setReloadKey((k) => k + 1);
    } catch (err: any) {
      toast({ title: "Failed to process refund", description: err?.message || "Error", variant: "destructive" });
    } finally {
      setProcessing(false);
    }
  };

  if (loading)
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );

  return (
    <div className="space-y-6">
      {!embedded && (
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Refunds</h1>
          <p className="text-muted-foreground">All refund transactions across centers</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <CenterFilter />
          <Button variant="outline" onClick={handleExportExcel}>
            <Download className="h-4 w-4 mr-2" />Export Excel
          </Button>
          <Button variant="outline" onClick={handleExportPdf}>
            <FileText className="h-4 w-4 mr-2" />Export PDF
          </Button>
        </div>
      </div>
      )}

      {embedded && (
        <div className="flex justify-end">
          <Button variant="outline" size="sm" onClick={handleExportPdf}>
            <FileText className="h-4 w-4 mr-2" />Export PDF
          </Button>
        </div>
      )}

      {!embedded && (
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card><CardContent className="p-4"><p className="text-sm text-muted-foreground">Total Refund Amount</p><p className="text-xl sm:text-2xl font-bold text-orange-600">{formatCurrency(totals.total)}</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-sm text-muted-foreground">Processed Refunds</p><p className="text-xl sm:text-2xl font-bold text-green-600">{formatCurrency(totals.processed)}</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-sm text-muted-foreground">Total Records</p><p className="text-xl sm:text-2xl font-bold">{totals.count}</p></CardContent></Card>
      </div>
      )}

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative max-w-md flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by student, form no., invoice or method"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-44">
            <SelectValue placeholder="Filter status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="processed">Processed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardContent className="p-0">
          {/* Mobile cards */}
          <div className="sm:hidden divide-y divide-border">
            {paged.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">No refunds found</div>
            ) : (
              paged.map((r) => (
                <div key={r.id} className="p-4 space-y-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium">{r.student_name}</p>
                      <p className="text-xs text-muted-foreground">{r.roll_number} · {r.invoice_number}</p>
                    </div>
                    <p className="font-bold text-orange-600">{formatCurrency(r.amount)}</p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    <Badge variant="outline" className="capitalize">{r.refund_method || "-"}</Badge>
                    <Badge className={statusColor(r.status)}>{r.status || "pending"}</Badge>
                    <span className="text-muted-foreground">{format(new Date(r.created_at), "dd MMM yyyy")}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">{r.property_name}</p>
                  {r.reason && <p className="text-xs text-muted-foreground italic">"{r.reason}"</p>}
                  {isPending(r.status) && (
                    <Button size="sm" className="mt-2 w-full" onClick={() => openProcess(r)}>
                      <CheckCircle2 className="h-3.5 w-3.5 mr-1" />Process Refund
                    </Button>
                  )}
                </div>
              ))
            )}
          </div>

          {/* Desktop table */}
          <div className="hidden sm:block overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Student</TableHead>
                  <TableHead>Form Number</TableHead>
                  <TableHead>Invoice</TableHead>
                  <TableHead>Center</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paged.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                      No refunds found
                    </TableCell>
                  </TableRow>
                ) : (
                  paged.map((r) => (
                    <TableRow key={r.id}>
                      <TableCell>{format(new Date(r.created_at), "dd MMM yyyy")}</TableCell>
                      <TableCell className="font-medium">{r.student_name}</TableCell>
                      <TableCell>{r.roll_number}</TableCell>
                      <TableCell>{r.invoice_number}</TableCell>
                      <TableCell>{r.property_name}</TableCell>
                      <TableCell className="capitalize">{r.refund_method || "-"}</TableCell>
                      <TableCell>
                        <Badge className={statusColor(r.status)}>{r.status || "pending"}</Badge>
                      </TableCell>
                      <TableCell className="text-right font-semibold text-orange-600">
                        {formatCurrency(r.amount)}
                      </TableCell>
                      <TableCell className="text-right">
                        {isPending(r.status) ? (
                          <Button size="sm" variant="outline" onClick={() => openProcess(r)}>
                            <CheckCircle2 className="h-3.5 w-3.5 mr-1" />Refund
                          </Button>
                        ) : (
                          <span className="text-xs text-muted-foreground">—</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {filtered.length > pageSize && (
        <TablePagination
          page={page}
          pageSize={pageSize}
          totalItems={filtered.length}
          onPageChange={setPage}
        />
      )}

      <Dialog open={processOpen} onOpenChange={setProcessOpen}>
        <DialogContent className="bg-background">
          <DialogHeader>
            <DialogTitle>Process Refund</DialogTitle>
            <DialogDescription>
              {activeRow ? (
                <>Refund {formatCurrency(activeRow.amount)} to {activeRow.student_name} ({activeRow.roll_number})</>
              ) : null}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2 max-h-[65vh] overflow-y-auto">
            <div className="space-y-2">
              <Label>Refund Method</Label>
              <Select value={method} onValueChange={setMethod}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent className="bg-popover">
                  <SelectItem value="hdfc">HDFC Payment Gateway (refund to original card/UPI)</SelectItem>
                  <SelectItem value="neft">NEFT / Bank Transfer</SelectItem>
                  <SelectItem value="upi">UPI</SelectItem>
                  <SelectItem value="cheque">Cheque</SelectItem>
                  <SelectItem value="cash">Cash</SelectItem>
                </SelectContent>
              </Select>
              {method === "hdfc" && (
                <p className="text-xs text-muted-foreground">
                  Real money will be refunded via HDFC to the payer's original card/UPI. Requires an original successful HDFC payment on this invoice.
                </p>
              )}
              {method !== "hdfc" && (
                <p className="text-xs text-amber-600">
                  Offline methods only record the refund — the actual money transfer must be done manually outside the system.
                </p>
              )}
            </div>

            {method === "neft" && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-2 sm:col-span-2">
                  <Label>Account Holder Name *</Label>
                  <Input value={accountHolder} onChange={(e) => setAccountHolder(e.target.value)} placeholder="As per bank records" />
                </div>
                <div className="space-y-2">
                  <Label>Account Number *</Label>
                  <Input value={accountNumber} onChange={(e) => setAccountNumber(e.target.value.replace(/\s/g, ""))} placeholder="e.g. 1234567890" />
                </div>
                <div className="space-y-2">
                  <Label>IFSC Code *</Label>
                  <Input value={ifsc} onChange={(e) => setIfsc(e.target.value.toUpperCase())} placeholder="e.g. HDFC0001234" maxLength={11} />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label>Bank Name</Label>
                  <Input value={bankName} onChange={(e) => setBankName(e.target.value)} placeholder="e.g. HDFC Bank" />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label>Transaction / UTR Reference</Label>
                  <Input value={referenceNumber} onChange={(e) => setReferenceNumber(e.target.value)} placeholder="UTR / Ref no. after transfer" />
                </div>
              </div>
            )}

            {method === "upi" && (
              <div className="space-y-3">
                <div className="space-y-2">
                  <Label>UPI ID *</Label>
                  <Input value={upiId} onChange={(e) => setUpiId(e.target.value)} placeholder="e.g. name@okhdfc" />
                </div>
                <div className="space-y-2">
                  <Label>UPI Transaction Reference</Label>
                  <Input value={referenceNumber} onChange={(e) => setReferenceNumber(e.target.value)} placeholder="Ref no. after transfer" />
                </div>
              </div>
            )}

            {method === "cheque" && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-2 sm:col-span-2">
                  <Label>Payee Name *</Label>
                  <Input value={accountHolder} onChange={(e) => setAccountHolder(e.target.value)} placeholder="Name on cheque" />
                </div>
                <div className="space-y-2">
                  <Label>Cheque Number *</Label>
                  <Input value={chequeNumber} onChange={(e) => setChequeNumber(e.target.value)} placeholder="e.g. 123456" />
                </div>
                <div className="space-y-2">
                  <Label>Bank Name *</Label>
                  <Input value={bankName} onChange={(e) => setBankName(e.target.value)} placeholder="Drawn on" />
                </div>
              </div>
            )}

            {method === "cash" && (
              <div className="space-y-2">
                <Label>Receipt / Voucher No. *</Label>
                <Input value={referenceNumber} onChange={(e) => setReferenceNumber(e.target.value)} placeholder="Internal voucher / receipt no." />
              </div>
            )}

            <div className="space-y-2">
              <Label>Notes / Remarks</Label>
              <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Any additional remarks…" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setProcessOpen(false)}>Cancel</Button>
            <Button disabled={processing} onClick={submitProcess}>
              {processing ? <Loader2 className="h-4 w-4 animate-spin" /> : method === "hdfc" ? "Refund via HDFC" : "Mark as Processed"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Refunds;
