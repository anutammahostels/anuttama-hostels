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
import { Download, FileText, Loader2, Search } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { exportToExcel } from "@/lib/exportExcel";
import { format } from "date-fns";
import { TablePagination } from "@/components/ui/table-pagination";
import { useCenter } from "@/contexts/CenterContext";
import { CenterFilter } from "@/components/dashboard/CenterFilter";

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

const Refunds = () => {
  const { centerId } = useCenter();
  const [rows, setRows] = useState<RefundRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [page, setPage] = useState(1);
  const pageSize = 25;

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
  }, [centerId]);

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

  if (loading)
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );

  return (
    <div className="space-y-6">
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

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card><CardContent className="p-4"><p className="text-sm text-muted-foreground">Total Refund Amount</p><p className="text-xl sm:text-2xl font-bold text-orange-600">{formatCurrency(totals.total)}</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-sm text-muted-foreground">Processed Refunds</p><p className="text-xl sm:text-2xl font-bold text-green-600">{formatCurrency(totals.processed)}</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-sm text-muted-foreground">Total Records</p><p className="text-xl sm:text-2xl font-bold">{totals.count}</p></CardContent></Card>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by student, form no., invoice or method"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
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
                </TableRow>
              </TableHeader>
              <TableBody>
                {paged.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
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
    </div>
  );
};

export default Refunds;
