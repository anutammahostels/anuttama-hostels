import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Download, FileText, Loader2 } from "lucide-react";
import { useInvoices } from "@/hooks/useInvoices";
import { supabase } from "@/integrations/supabase/client";
import { exportToExcel } from "@/lib/exportExcel";
import { format } from "date-fns";
import { TablePagination } from "@/components/ui/table-pagination";

const formatCurrency = (n: number) => `₹${n.toLocaleString('en-IN')}`;

const Receivables = () => {
  const { invoices, isLoading } = useInvoices();
  const [refundsMap, setRefundsMap] = useState<Map<string, number>>(new Map());
  const [page, setPage] = useState(1);
  const pageSize = 25;

  useEffect(() => {
    const fetchRefunds = async () => {
      const { data } = await supabase.from('refunds').select('student_id, amount');
      if (data) {
        const map = new Map<string, number>();
        data.filter(r => r.student_id).forEach(r => {
          map.set(r.student_id!, (map.get(r.student_id!) || 0) + Number(r.amount));
        });
        setRefundsMap(map);
      }
    };
    fetchRefunds();
  }, []);

  // Group by student
  const studentMap = new Map<string, {
    name: string; rollNo: string; gross: number; discounts: number;
    received: number; refunds: number; paymentModes: Set<string>; net: number;
  }>();

  invoices.forEach(inv => {
    const sid = inv.student_id || '__deleted__';
    const existing = studentMap.get(sid) || {
      name: inv.student?.profile?.full_name || (inv.student_id === null ? "Deleted Student" : "Unknown"),
      rollNo: inv.student?.roll_number || "-",
      gross: 0, discounts: 0, received: 0, refunds: 0, paymentModes: new Set<string>(), net: 0,
    };
    existing.gross += inv.total_amount + (inv.discounts || 0);
    existing.discounts += inv.discounts || 0;
    existing.received += inv.paid_amount || 0;
    existing.refunds = refundsMap.get(sid) || 0;
    if (inv.payment_method) existing.paymentModes.add(inv.payment_method);
    existing.net = existing.gross - existing.discounts - existing.received + existing.refunds;
    studentMap.set(sid, existing);
  });

  const rows = Array.from(studentMap.entries()).map(([id, d]) => ({
    id,
    ...d,
    paymentModes: Array.from(d.paymentModes).join(', ') || '-',
  }));

  const totals = rows.reduce((acc, r) => ({
    gross: acc.gross + r.gross, discounts: acc.discounts + r.discounts,
    received: acc.received + r.received, refunds: acc.refunds + r.refunds, net: acc.net + r.net,
  }), { gross: 0, discounts: 0, received: 0, refunds: 0, net: 0 });

  const pagedRows = rows.slice((page - 1) * pageSize, page * pageSize);

  const handleExportExcel = () => {
    exportToExcel(rows.map(r => ({
      "Student Name": r.name,
      "Roll No": r.rollNo,
      "Gross Receivable": r.gross,
      "Discounts": r.discounts,
      "Amount Received": r.received,
      "Refunds": r.refunds,
      "Payment Mode": r.paymentModes,
      "Net Receivable": r.net,
    })), `receivables-${format(new Date(), "yyyy-MM-dd")}`, "Receivables");
  };

  const handleExportPdf = () => {
    const w = window.open("", "_blank");
    if (!w) return;
    w.document.write(`<!DOCTYPE html><html><head><title>Receivables Report</title>
    <style>body{font-family:Arial,sans-serif;padding:30px;color:#1a1a2e}h1{color:#0f3460;border-bottom:2px solid #0f3460;padding-bottom:8px}
    table{width:100%;border-collapse:collapse;margin:15px 0}th,td{border:1px solid #ddd;padding:8px;text-align:left;font-size:13px}
    th{background:#0f3460;color:#fff}.total td{font-weight:bold;background:#f0f4ff}@media print{body{padding:15px}}</style></head><body>
    <h1>Student Receivables Report</h1><p>Generated: ${format(new Date(), "dd MMM yyyy")}</p>
    <table><tr><th>Student</th><th>Roll No</th><th>Gross Receivable</th><th>Discounts</th><th>Received</th><th>Refunds</th><th>Payment Mode</th><th>Net Receivable</th></tr>
    ${rows.map(r => `<tr><td>${r.name}</td><td>${r.rollNo}</td><td>${formatCurrency(r.gross)}</td><td>${formatCurrency(r.discounts)}</td><td>${formatCurrency(r.received)}</td><td>${formatCurrency(r.refunds)}</td><td>${r.paymentModes}</td><td>${formatCurrency(r.net)}</td></tr>`).join("")}
    <tr class="total"><td colspan="2">TOTAL</td><td>${formatCurrency(totals.gross)}</td><td>${formatCurrency(totals.discounts)}</td><td>${formatCurrency(totals.received)}</td><td>${formatCurrency(totals.refunds)}</td><td></td><td>${formatCurrency(totals.net)}</td></tr>
    </table></body></html>`);
    w.document.close();
    w.print();
  };

  if (isLoading) return <div className="flex items-center justify-center h-64"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

  return (
    <div className="space-y-6">
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

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        <Card><CardContent className="p-4"><p className="text-sm text-muted-foreground">Gross Receivable</p><p className="text-xl sm:text-2xl font-bold">{formatCurrency(totals.gross)}</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-sm text-muted-foreground">Discounts Given</p><p className="text-xl sm:text-2xl font-bold text-yellow-600">{formatCurrency(totals.discounts)}</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-sm text-muted-foreground">Amount Received</p><p className="text-xl sm:text-2xl font-bold text-green-600">{formatCurrency(totals.received)}</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-sm text-muted-foreground">Refunds</p><p className="text-xl sm:text-2xl font-bold text-orange-600">{formatCurrency(totals.refunds)}</p></CardContent></Card>
        <Card className="col-span-2 sm:col-span-1"><CardContent className="p-4"><p className="text-sm text-muted-foreground">Net Receivable</p><p className="text-xl sm:text-2xl font-bold text-red-600">{formatCurrency(totals.net)}</p></CardContent></Card>
      </div>

      <Card>
        <CardContent className="p-0">
          {/* Mobile card view */}
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
                    {r.paymentModes !== '-' && <Badge variant="outline" className="text-xs capitalize">{r.paymentModes}</Badge>}
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
          {/* Desktop table view */}
          <div className="hidden sm:block overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Roll No</TableHead>
                  <TableHead className="text-right">Gross Receivable</TableHead>
                  <TableHead className="text-right">Discounts</TableHead>
                  <TableHead className="text-right">Received</TableHead>
                  <TableHead className="text-right">Refunds</TableHead>
                  <TableHead>Payment Mode</TableHead>
                  <TableHead className="text-right">Net Receivable</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.length === 0 ? (
                  <TableRow><TableCell colSpan={8} className="text-center py-8 text-muted-foreground">No receivables data</TableCell></TableRow>
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
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          <TablePagination page={page} pageSize={pageSize} totalItems={rows.length} onPageChange={setPage} itemLabel="students" />
        </CardContent>
      </Card>
    </div>
  );
};

export default Receivables;
