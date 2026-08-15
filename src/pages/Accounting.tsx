import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { TablePagination } from "@/components/ui/table-pagination";
import { Download, Loader2, Search } from "lucide-react";
import { format } from "date-fns";
import { CenterFilter } from "@/components/dashboard/CenterFilter";
import { useCenter } from "@/contexts/CenterContext";
import { useProperties } from "@/hooks/useProperties";
import { useAccountingLedger } from "@/hooks/useAccountingLedger";
import { exportAccountingWorkbook } from "@/lib/exportAccounting";
import { useToast } from "@/hooks/use-toast";
import Billing from "@/pages/Billing";
import Receivables from "@/pages/Receivables";
import Refunds from "@/pages/Refunds";

const formatCurrency = (n: number) => `₹${Math.round(Number(n || 0)).toLocaleString("en-IN")}`;

type StatGroup = "collections" | "transactions" | "refunds" | "students";

const STAT_GROUP_KEY = "accounting-stat-group";

const Accounting = () => {
  const { centerId } = useCenter();
  const { properties } = useProperties();
  const { toast } = useToast();
  const ledger = useAccountingLedger();
  const [statGroup, setStatGroup] = useState<StatGroup>(
    () => (localStorage.getItem(STAT_GROUP_KEY) as StatGroup) || "collections"
  );
  const [txnSearch, setTxnSearch] = useState("");
  const [txnPage, setTxnPage] = useState(1);
  const txnPageSize = 25;

  const centerLabel =
    centerId === "all" ? "All Centers" : properties.find((p) => p.id === centerId)?.name || "Center";

  const changeStatGroup = (value: StatGroup) => {
    setStatGroup(value);
    localStorage.setItem(STAT_GROUP_KEY, value);
  };

  const { totals, txnStats, refundStats } = ledger;

  const statCards: Record<StatGroup, { label: string; value: string; className?: string }[]> = {
    collections: [
      { label: "Gross Receivable", value: formatCurrency(totals.gross) },
      { label: "Discounts", value: formatCurrency(totals.discounts), className: "text-yellow-600" },
      { label: "Amount Received", value: formatCurrency(totals.received), className: "text-green-600" },
      { label: "Refunded", value: formatCurrency(totals.refunded), className: "text-orange-600" },
      { label: "Net Receivable", value: formatCurrency(totals.net), className: "text-red-600" },
    ],
    transactions: [
      { label: "Transactions", value: txnStats.count.toLocaleString("en-IN") },
      { label: "Online Collected", value: formatCurrency(txnStats.online), className: "text-green-600" },
      { label: "Offline Collected", value: formatCurrency(txnStats.offline), className: "text-blue-600" },
      { label: "Average Payment", value: formatCurrency(txnStats.average) },
      { label: "Collected This Month", value: formatCurrency(txnStats.thisMonth), className: "text-green-600" },
    ],
    refunds: [
      { label: "Total Refunds", value: formatCurrency(refundStats.total), className: "text-orange-600" },
      { label: "Processed", value: formatCurrency(refundStats.processed), className: "text-green-600" },
      { label: "Processed Count", value: refundStats.processedCount.toLocaleString("en-IN") },
      { label: "Pending Amount", value: formatCurrency(refundStats.pending), className: "text-yellow-600" },
      { label: "Pending Count", value: refundStats.pendingCount.toLocaleString("en-IN") },
    ],
    students: [
      { label: "Students Billed", value: totals.studentCount.toLocaleString("en-IN") },
      { label: "Fully Paid", value: totals.paidCount.toLocaleString("en-IN"), className: "text-green-600" },
      { label: "Partially Paid", value: totals.partialCount.toLocaleString("en-IN"), className: "text-blue-600" },
      { label: "Not Started", value: totals.pendingCount.toLocaleString("en-IN"), className: "text-red-600" },
      {
        label: "Collection %",
        value: `${totals.gross > 0 ? Math.round((totals.received / (totals.gross - totals.discounts || 1)) * 100) : 0}%`,
      },
    ],
  };

  const handleExport = () => {
    exportAccountingWorkbook({
      rows: ledger.rows,
      invoices: ledger.invoices,
      payments: ledger.payments,
      refunds: ledger.refunds,
      studentMap: ledger.studentMap,
      invoiceNumberMap: ledger.invoiceNumberMap,
      totals: ledger.totals,
      txnStats: ledger.txnStats,
      refundStats: ledger.refundStats,
      centerLabel,
    });
    toast({ title: "Exported", description: "Accounting workbook downloaded (5 sheets)" });
  };

  // Transactions sub-view
  const txnRows = ledger.payments
    .slice()
    .sort((a, b) => new Date(b.paid_at || 0).getTime() - new Date(a.paid_at || 0).getTime())
    .map((p) => {
      const s = p.student_id ? ledger.studentMap.get(p.student_id) : undefined;
      return {
        ...p,
        name: s?.name || "-",
        roll: s?.rollNumber || "-",
        center: s?.propertyName || "-",
        invoiceNumber: ledger.invoiceNumberMap.get(p.invoice_id) || "-",
        mode: p.payment_mode_label || p.payment_method || "-",
      };
    });

  const term = txnSearch.trim().toLowerCase();
  const filteredTxns = term
    ? txnRows.filter(
        (t) =>
          t.name.toLowerCase().includes(term) ||
          t.roll.toLowerCase().includes(term) ||
          t.invoiceNumber.toLowerCase().includes(term) ||
          t.mode.toLowerCase().includes(term)
      )
    : txnRows;
  const pagedTxns = filteredTxns.slice((txnPage - 1) * txnPageSize, txnPage * txnPageSize);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Accounting</h1>
          <p className="text-muted-foreground">Invoices, receivables, transactions & refunds in one place</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <CenterFilter />
          <Button variant="outline" onClick={handleExport} disabled={ledger.isLoading}>
            <Download className="h-4 w-4 mr-2" />Export Excel
          </Button>
        </div>
      </div>

      {/* Configurable statistics */}
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <span className="text-sm text-muted-foreground">Statistics</span>
          <Select value={statGroup} onValueChange={(v) => changeStatGroup(v as StatGroup)}>
            <SelectTrigger className="w-52">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="collections">Collections</SelectItem>
              <SelectItem value="transactions">Transactions</SelectItem>
              <SelectItem value="refunds">Refunds</SelectItem>
              <SelectItem value="students">Students</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {ledger.isLoading ? (
          <div className="flex items-center justify-center h-24">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
            {statCards[statGroup].map((s) => (
              <Card key={s.label}>
                <CardContent className="p-4">
                  <p className="text-xs sm:text-sm text-muted-foreground">{s.label}</p>
                  <p className={`text-lg sm:text-2xl font-bold ${s.className || ""}`}>{s.value}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Sub-views */}
      <Tabs defaultValue="invoices">
        <TabsList className="w-full sm:w-auto overflow-x-auto flex-wrap h-auto">
          <TabsTrigger value="invoices">Invoices</TabsTrigger>
          <TabsTrigger value="receivables">Receivables</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="refunds">Refunds</TabsTrigger>
        </TabsList>

        <TabsContent value="invoices" className="mt-6">
          <Billing embedded />
        </TabsContent>

        <TabsContent value="receivables" className="mt-6">
          <Receivables embedded />
        </TabsContent>

        <TabsContent value="transactions" className="mt-6 space-y-4">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by student, form no., invoice or method"
              value={txnSearch}
              onChange={(e) => {
                setTxnSearch(e.target.value);
                setTxnPage(1);
              }}
              className="pl-9"
            />
          </div>
          <Card>
            <CardContent className="p-0">
              {/* Mobile */}
              <div className="sm:hidden divide-y divide-border">
                {pagedTxns.length === 0 ? (
                  <div className="p-8 text-center text-muted-foreground">No transactions found</div>
                ) : (
                  pagedTxns.map((t) => (
                    <div key={t.id} className="p-4 space-y-1">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="font-medium truncate">{t.name}</p>
                          <p className="text-xs text-muted-foreground truncate">
                            {t.roll} · {t.invoiceNumber}
                          </p>
                        </div>
                        <p className="font-bold text-green-600 whitespace-nowrap">{formatCurrency(t.amount)}</p>
                      </div>
                      <div className="flex flex-wrap items-center gap-2 text-xs">
                        <Badge variant="outline" className="capitalize">{t.mode}</Badge>
                        <span className="text-muted-foreground">
                          {t.paid_at ? format(new Date(t.paid_at), "dd MMM yyyy") : "-"}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
              {/* Desktop */}
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
                      <TableHead>Reference</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pagedTxns.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                          No transactions found
                        </TableCell>
                      </TableRow>
                    ) : (
                      pagedTxns.map((t) => (
                        <TableRow key={t.id}>
                          <TableCell>{t.paid_at ? format(new Date(t.paid_at), "dd MMM yyyy") : "-"}</TableCell>
                          <TableCell className="font-medium">{t.name}</TableCell>
                          <TableCell>{t.roll}</TableCell>
                          <TableCell>{t.invoiceNumber}</TableCell>
                          <TableCell>{t.center}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className="capitalize text-xs">{t.mode}</Badge>
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground">
                            {t.transaction_reference || t.transaction_id || "-"}
                          </TableCell>
                          <TableCell className="text-right font-semibold text-green-600">
                            {formatCurrency(t.amount)}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
              {filteredTxns.length > txnPageSize && (
                <TablePagination
                  page={txnPage}
                  totalItems={filteredTxns.length}
                  pageSize={txnPageSize}
                  onPageChange={setTxnPage}
                  itemLabel="transactions"
                />

              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="refunds" className="mt-6">
          <Refunds embedded />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Accounting;
