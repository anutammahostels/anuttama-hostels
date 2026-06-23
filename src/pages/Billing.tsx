import { useState, useEffect } from "react";
import { TablePagination } from "@/components/ui/table-pagination";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { Receipt, Plus, Search, Download, IndianRupee, TrendingUp, Clock, AlertTriangle, MoreVertical, FileText, Send, Loader2, CheckCircle, Undo2, Trash2 } from "lucide-react";
import { useInvoices, type InvoiceWithStudent } from "@/hooks/useInvoices";
import { useInvoicesPaginated } from "@/hooks/useInvoicesPaginated";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useStudents } from "@/hooks/useStudents";
import { useProperties } from "@/hooks/useProperties";
import { useCenter } from "@/contexts/CenterContext";
import { CenterFilter } from "@/components/dashboard/CenterFilter";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { exportToExcel } from "@/lib/exportExcel";
import { buildReceiptHtml, invoiceToReceipt } from "@/lib/receiptTemplate";
import { formatCompactINR } from "@/lib/formatCurrency";

const getStatusBadge = (status: string | null) => {
  switch (status) {
    case "paid":
      return <Badge className="bg-green-500/10 text-green-600">Paid</Badge>;
    case "pending":
      return <Badge className="bg-yellow-500/10 text-yellow-600">Pending</Badge>;
    case "overdue":
      return <Badge className="bg-red-500/10 text-red-600">Overdue</Badge>;
    case "partial":
      return <Badge className="bg-blue-500/10 text-blue-600">Partial</Badge>;
    default:
      return <Badge variant="secondary">{status || "Unknown"}</Badge>;
  }
};

const formatCurrency = (amount: number | null) => formatCompactINR(amount);

const Billing = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(searchQuery.trim()), 300);
    return () => clearTimeout(t);
  }, [searchQuery]);
  const [paymentDialog, setPaymentDialog] = useState<{ open: boolean; invoice: InvoiceWithStudent | null }>({ open: false, invoice: null });
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("upi");

  // Generate Invoices dialog state
  const [generateDialog, setGenerateDialog] = useState(false);
  const [billingMonth, setBillingMonth] = useState(() => format(new Date(), 'yyyy-MM'));
  const [dueDate, setDueDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 15);
    return format(d, 'yyyy-MM-dd');
  });
  const [txnAmount, setTxnAmount] = useState("0");
  const [txnDate, setTxnDate] = useState(() => format(new Date(), 'yyyy-MM-dd'));
  const [txnMode, setTxnMode] = useState("Cash");
  const [txnDetails, setTxnDetails] = useState("");
  const [txnUtr, setTxnUtr] = useState("");
  const [txnRemarks, setTxnRemarks] = useState("");
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);
  const [studentSearchQuery, setStudentSearchQuery] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generateProgress, setGenerateProgress] = useState(0);
  const [generateResults, setGenerateResults] = useState<{ success: number; failed: number } | null>(null);

  // Refund dialog state
  const [refundDialog, setRefundDialog] = useState<{ open: boolean; invoice: InvoiceWithStudent | null }>({ open: false, invoice: null });
  const [refundAmount, setRefundAmount] = useState("");
  const [refundReason, setRefundReason] = useState("");
  const [refundMethod, setRefundMethod] = useState("cash");

  const { invoices: allInvoices, stats: rawStats, isLoading, recordPayment, createInvoice, processRefund, deleteInvoice } = useInvoices();
  const { user } = useAuth();
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; invoice: InvoiceWithStudent | null }>({ open: false, invoice: null });
  const { students } = useStudents();
  const { properties } = useProperties();
  const { centerId } = useCenter();
  const propertyMap = new Map(properties.map(p => [p.id, p.name]));
  const { toast } = useToast();

  // Apply center scope to invoices and recompute stats locally
  const invoices = centerId === "all"
    ? allInvoices
    : allInvoices.filter(inv => inv.student?.property_id === centerId);

  const stats = centerId === "all" ? rawStats : {
    totalInvoices: invoices.length,
    totalAmount: invoices.reduce((acc, inv) => acc + inv.total_amount, 0),
    paidAmount: invoices.reduce((acc, inv) => acc + (inv.paid_amount || 0), 0),
    pendingAmount: invoices.reduce((acc, inv) => acc + (inv.total_amount - (inv.paid_amount || 0)), 0),
    overdueCount: invoices.filter(inv => inv.status !== 'paid' && new Date(inv.due_date) < new Date()).length,
  };

  // Fetch refunds for the Refunds tab
  const [refundsList, setRefundsList] = useState<any[]>([]);
  const [refundsLoading, setRefundsLoading] = useState(false);

  const fetchRefundsList = async () => {
    setRefundsLoading(true);
    const { data } = await supabase
      .from('refunds')
      .select('*')
      .order('created_at', { ascending: false });
    if (data) {
      // Enrich with student names and invoice numbers
      const studentIds = [...new Set(data.map(r => r.student_id).filter(Boolean))];
      const invoiceIds = [...new Set(data.map(r => r.invoice_id))];
      
      const [{ data: studentsData }, { data: invoicesData }] = await Promise.all([
        supabase.from('students').select('id, user_id, roll_number').in('id', studentIds.length ? studentIds : ['']),
        supabase.from('invoices').select('id, invoice_number').in('id', invoiceIds.length ? invoiceIds : ['']),
      ]);

      const userIds = studentsData?.map(s => s.user_id).filter(Boolean) || [];
      const { data: profiles } = await supabase.from('profiles').select('id, full_name').in('id', userIds.length ? userIds : ['']);

      const profileMap = new Map(profiles?.map(p => [p.id, p.full_name]) || []);
      const studentInfoMap = new Map(studentsData?.map(s => [s.id, { name: profileMap.get(s.user_id) || 'Unknown', rollNo: s.roll_number }]) || []);
      const invoiceMap = new Map(invoicesData?.map(i => [i.id, i.invoice_number]) || []);

      setRefundsList(data.map(r => ({
        ...r,
        studentName: r.student_id ? (studentInfoMap.get(r.student_id)?.name || 'Unknown') : 'Deleted Student',
        studentRollNo: r.student_id ? (studentInfoMap.get(r.student_id)?.rollNo || '-') : '-',
        invoiceNumber: invoiceMap.get(r.invoice_id) || '-',
      })));
    }
    setRefundsLoading(false);
  };

  useEffect(() => { fetchRefundsList(); }, []);

  const handleSendReminder = (invoice?: InvoiceWithStudent) => {
    if (invoice) {
      toast({ title: "Reminder Sent", description: `Payment reminder sent for ${invoice.invoice_number} to ${invoice.student?.profile?.full_name || "student"}.` });
    } else {
      const overdueCount = invoices.filter(inv => inv.status !== 'paid' && new Date(inv.due_date) < new Date()).length;
      if (overdueCount === 0) {
        toast({ title: "No Overdue Invoices", description: "There are no overdue invoices to send reminders for." });
      } else {
        toast({ title: "Reminders Sent", description: `Payment reminders sent for ${overdueCount} overdue invoice(s).` });
      }
    }
  };

  // Active students for invoice generation
  const activeStudents = students.filter(s => s.status === 'active');

  // Note: All Invoices tab uses server-side pagination (see paginatedQuery below).
  // Other tabs (Pending, Overdue, Payment History) still operate on the full invoice list.

  const [invoicePage, setInvoicePage] = useState(1);
  const invoicePageSize = 10;
  useEffect(() => { setInvoicePage(1); }, [debouncedSearch, centerId]);

  // Client-side pagination for the other tabs (10 per page each)
  const TAB_PAGE_SIZE = 10;
  const [pendingPage, setPendingPage] = useState(1);
  const [overduePage, setOverduePage] = useState(1);
  const [paymentsPage, setPaymentsPage] = useState(1);
  const [refundsPage, setRefundsPage] = useState(1);
  useEffect(() => { setPendingPage(1); setOverduePage(1); setPaymentsPage(1); setRefundsPage(1); }, [centerId]);

  const pendingList = invoices.filter(inv => inv.status === 'pending' || inv.status === 'partial');
  const overdueList = invoices.filter(inv => inv.status !== 'paid' && new Date(inv.due_date) < new Date());
  const paymentsList = invoices.filter(inv => inv.paid_amount && inv.paid_amount > 0);

  const pagedPending = pendingList.slice((pendingPage - 1) * TAB_PAGE_SIZE, pendingPage * TAB_PAGE_SIZE);
  const pagedOverdue = overdueList.slice((overduePage - 1) * TAB_PAGE_SIZE, overduePage * TAB_PAGE_SIZE);
  const pagedPayments = paymentsList.slice((paymentsPage - 1) * TAB_PAGE_SIZE, paymentsPage * TAB_PAGE_SIZE);
  const pagedRefunds = refundsList.slice((refundsPage - 1) * TAB_PAGE_SIZE, refundsPage * TAB_PAGE_SIZE);

  // Server-side paginated query for the All Invoices table (10 per page).
  const paginatedQuery = useInvoicesPaginated({
    page: invoicePage,
    pageSize: invoicePageSize,
    search: debouncedSearch,
    // When searching, ignore center filter so invoices for students without
    // an assigned property (or in another center) still surface.
    centerId: debouncedSearch.trim() ? "all" : centerId,
  });
  const pagedInvoices = paginatedQuery.data?.rows ?? [];
  const pagedTotal = paginatedQuery.data?.totalCount ?? 0;

  const handleRecordPayment = async () => {
    if (!paymentDialog.invoice || !paymentAmount) return;
    await recordPayment.mutateAsync({
      id: paymentDialog.invoice.id,
      amount: parseFloat(paymentAmount),
      method: paymentMethod,
    });
    setPaymentDialog({ open: false, invoice: null });
    setPaymentAmount("");
    setPaymentMethod("upi");
  };

  const handleDownloadPdf = (invoice: InvoiceWithStudent) => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;
    const studentName = invoice.student?.profile?.full_name || (invoice.student_id === null ? "Deleted Student" : "Unknown");
    const rollNumber = invoice.student?.roll_number || "";
    const s: any = invoice.student || {};
    const data = invoiceToReceipt(invoice, {
      studentName,
      rollNumber,
      fatherName: s.father_name,
      motherName: s.mother_name,
      gender: s.gender,
      course: s.course,
    });
    const html = buildReceiptHtml(data);
    printWindow.document.write(html);
    printWindow.document.close();
  };


  const toggleStudentSelection = (studentId: string) => {
    setSelectedStudentIds(prev => 
      prev.includes(studentId) ? prev.filter(id => id !== studentId) : [...prev, studentId]
    );
  };

  const toggleSelectAll = () => {
    if (selectedStudentIds.length === activeStudents.length) {
      setSelectedStudentIds([]);
    } else {
      setSelectedStudentIds(activeStudents.map(s => s.id));
    }
  };

  const resetGenerateDialog = () => {
    setGenerateDialog(false);
    setSelectedStudentIds([]);
    setStudentSearchQuery("");
    setIsGenerating(false);
    setGenerateProgress(0);
    setGenerateResults(null);
    setTxnAmount("0");
    setTxnDate(format(new Date(), 'yyyy-MM-dd'));
    setTxnMode("Cash");
    setTxnDetails("");
    setTxnUtr("");
    setTxnRemarks("");
  };

  const handleGenerateInvoices = async () => {
    if (selectedStudentIds.length === 0) {
      toast({ title: "No students selected", description: "Please select at least one student.", variant: "destructive" });
      return;
    }
    const amount = parseFloat(txnAmount) || 0;
    if (amount <= 0) {
      toast({ title: "Invalid amount", description: "Enter an amount greater than 0.", variant: "destructive" });
      return;
    }
    if (!txnDate) {
      toast({ title: "Missing date", description: "Please choose a payment date.", variant: "destructive" });
      return;
    }
    if (!txnMode) {
      toast({ title: "Missing mode", description: "Please choose a payment mode.", variant: "destructive" });
      return;
    }

    setIsGenerating(true);
    setGenerateProgress(0);
    let success = 0;
    let failed = 0;

    for (let i = 0; i < selectedStudentIds.length; i++) {
      const studentId = selectedStudentIds[i];

      const stamp = Date.now().toString(36).toUpperCase();
      const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
      const invoiceNumber = `INV-${billingMonth.replace('-', '')}-${stamp}-${rand}-${i + 1}`;

      const notesBlob = [
        txnDetails ? `Transaction: ${txnDetails}` : null,
        txnUtr ? `UTR: ${txnUtr}` : null,
        txnRemarks ? `Remarks: ${txnRemarks}` : null,
      ].filter(Boolean).join(" | ");

      try {
        const { data: inv, error: invErr } = await supabase
          .from('invoices')
          .insert({
            student_id: studentId,
            invoice_number: invoiceNumber,
            billing_month: `${billingMonth}-01`,
            due_date: dueDate,
            room_rent: 0,
            mess_charges: 0,
            electricity_charges: 0,
            other_charges: 0,
            discounts: 0,
            total_amount: amount,
            paid_amount: 0,
            status: 'pending',
            notes: notesBlob || null,
          })
          .select()
          .single();

        if (invErr) throw invErr;

        // Lookup student's property via bed → room → floor → block
        let propertyId: string | null = null;
        const { data: bedData } = await supabase
          .from('beds')
          .select('rooms(floors(blocks(property_id)))')
          .eq('student_id', studentId)
          .limit(1)
          .maybeSingle();
        propertyId = (bedData as any)?.rooms?.floors?.blocks?.property_id || null;
        if (!propertyId) {
          const { data: stu } = await supabase
            .from('students')
            .select('property_id')
            .eq('id', studentId)
            .maybeSingle();
          propertyId = (stu as any)?.property_id || null;
        }

        if (propertyId) {
          // Insert the payment — the DB trigger will reconcile paid_amount + status.
          await supabase.from('payments').insert({
            invoice_id: inv.id,
            student_id: studentId,
            property_id: propertyId,
            amount,
            payment_method: txnMode,
            payment_mode_label: txnMode,
            payment_label: txnDetails || null,
            transaction_reference: txnUtr || null,
            status: 'completed',
            paid_at: new Date(txnDate).toISOString(),
            recorded_by: user?.id || null,
          } as any);
        }
        success++;
      } catch (e) {
        console.error('Invoice generation failed', e);
        failed++;
      }

      setGenerateProgress(Math.round(((i + 1) / selectedStudentIds.length) * 100));
    }

    setGenerateResults({ success, failed });
    setIsGenerating(false);

    if (success > 0) {
      toast({ title: "Invoices Generated", description: `${success} invoice(s) created successfully.${failed > 0 ? ` ${failed} failed.` : ''}` });
    }
  };


  const statsData = [
    { 
      label: "Total Revenue", 
      value: formatCurrency(stats.totalAmount), 
      icon: IndianRupee, 
      color: "text-green-500", 
      change: `${stats.totalInvoices} invoices` 
    },
    { 
      label: "Collected", 
      value: formatCurrency(stats.paidAmount), 
      icon: CheckCircle, 
      color: "text-blue-500", 
      change: `${Math.round((stats.paidAmount / (stats.totalAmount || 1)) * 100)}%` 
    },
    { 
      label: "Pending Dues", 
      value: formatCurrency(stats.pendingAmount), 
      icon: Clock, 
      color: "text-yellow-500", 
      change: "Outstanding" 
    },
    { 
      label: "Overdue", 
      value: stats.overdueCount.toString(), 
      icon: AlertTriangle, 
      color: "text-red-500", 
      change: "invoices" 
    },
  ];

  if (isLoading) {
    return (
      <>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </>
    );
  }

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Billing & Invoices</h1>
            <p className="text-muted-foreground">Manage invoices, payments, and collections</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => {
              if (invoices.length === 0) return;
              exportToExcel(invoices.map(inv => ({
                "Invoice #": inv.invoice_number,
                "Student": inv.student?.profile?.full_name || "",
                "Form Number": inv.student?.roll_number || "",
                "Billing Month": inv.billing_month,
                "Room Rent": inv.room_rent || 0,
                "Mess": inv.mess_charges || 0,
                "Electricity": inv.electricity_charges || 0,
                "Other": inv.other_charges || 0,
                "Discount": inv.discounts || 0,
                "Total": inv.total_amount,
                "Paid": inv.paid_amount || 0,
                "Balance": inv.total_amount - (inv.paid_amount || 0),
                "Due Date": inv.due_date,
                "Status": inv.status || "",
                "Payment Method": inv.payment_method || "",
              })), `invoices-${format(new Date(), "yyyy-MM-dd")}`, "Invoices");
              toast({ title: "Exported", description: `${invoices.length} invoices exported as Excel` });
            }}>
              <Download className="h-4 w-4 mr-2" />
              Export Excel
            </Button>
            <Button variant="outline" onClick={() => {
              if (invoices.length === 0) return;
              const headers = ["Invoice #", "Student", "Form Number", "Billing Month", "Room Rent", "Mess", "Electricity", "Other", "Discount", "Total", "Paid", "Balance", "Due Date", "Status", "Payment Method", "Payment Date"];
              const rows = invoices.map(inv => [
                inv.invoice_number,
                inv.student?.profile?.full_name || "",
                inv.student?.roll_number || "",
                inv.billing_month,
                inv.room_rent || 0,
                inv.mess_charges || 0,
                inv.electricity_charges || 0,
                inv.other_charges || 0,
                inv.discounts || 0,
                inv.total_amount,
                inv.paid_amount || 0,
                inv.total_amount - (inv.paid_amount || 0),
                inv.due_date,
                inv.status || "",
                inv.payment_method || "",
                inv.payment_date || "",
              ]);
              const csv = [headers.join(","), ...rows.map(r => r.map(c => `"${c}"`).join(","))].join("\n");
              const blob = new Blob([csv], { type: "text/csv" });
              const url = URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url; a.download = `invoices-${format(new Date(), "yyyy-MM-dd")}.csv`; a.click();
              URL.revokeObjectURL(url);
              toast({ title: "Exported", description: `${invoices.length} invoices exported as CSV` });
            }}>
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
            <Button className="gradient-primary text-white" onClick={() => { setSelectedStudentIds([]); setGenerateDialog(true); }}>

              <Plus className="h-4 w-4 mr-2" />
              Generate Invoices
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {statsData.map((stat) => (
            <Card key={stat.label} className="border-border/50">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg bg-muted ${stat.color}`}>
                      <stat.icon className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{stat.value}</p>
                      <p className="text-sm text-muted-foreground">{stat.label}</p>
                    </div>
                  </div>
                  <span className="text-xs text-muted-foreground">{stat.change}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Late Fee Rule Info */}
        <Card className="border-border/50 bg-gradient-to-r from-yellow-500/5 to-transparent">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 text-yellow-500" />
              <div>
                <p className="font-medium">Late Fee Policy</p>
                <p className="text-sm text-muted-foreground">
                  Invoices unpaid 5 days past due date incur a daily penalty as per policy
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs defaultValue="invoices">
          <TabsList className="w-full sm:w-auto overflow-x-auto flex-wrap h-auto">
            <TabsTrigger value="invoices">All Invoices</TabsTrigger>
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="overdue">Overdue</TabsTrigger>
            <TabsTrigger value="payments">Payment History</TabsTrigger>
            <TabsTrigger value="refunds" onClick={() => fetchRefundsList()}>Refunds</TabsTrigger>
          </TabsList>

          <TabsContent value="invoices" className="mt-6">
            {/* Search + Center filter */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Search by invoice # or Form Number..." 
                  className="pl-10 pr-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                {(searchQuery !== debouncedSearch || (debouncedSearch && paginatedQuery.isFetching)) && (
                  <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-primary" aria-label="Searching invoices" />
                )}
              </div>
              <CenterFilter />
              <Button variant="outline" onClick={() => handleSendReminder()}>
                <Send className="h-4 w-4 mr-2" />
                Send Reminders
              </Button>
            </div>

            <Card className="border-border/50">
              <CardContent className="p-0">
                {paginatedQuery.isFetching && pagedInvoices.length === 0 ? (
                  <div role="status" aria-live="polite" aria-label={debouncedSearch ? `Searching invoices for ${debouncedSearch}` : "Loading invoices"}>
                    {/* Mobile skeleton */}
                    <div className="sm:hidden divide-y divide-border">
                      {Array.from({ length: 6 }).map((_, i) => (
                        <div key={i} className="p-4 space-y-3">
                          <div className="flex items-center justify-between">
                            <div className="space-y-2 flex-1">
                              <Skeleton className="h-4 w-40" />
                              <Skeleton className="h-3 w-56" />
                              <Skeleton className="h-3 w-32" />
                            </div>
                            <Skeleton className="h-5 w-16 rounded-full" />
                          </div>
                          <div className="flex items-center justify-between">
                            <Skeleton className="h-6 w-24" />
                            <Skeleton className="h-4 w-28" />
                          </div>
                          <div className="flex gap-2">
                            <Skeleton className="h-7 w-16" />
                            <Skeleton className="h-7 w-16" />
                          </div>
                        </div>
                      ))}
                    </div>
                    {/* Desktop skeleton table */}
                    <div className="hidden sm:block overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Invoice</TableHead>
                            <TableHead>Student</TableHead>
                            <TableHead>Center</TableHead>
                            <TableHead>Total</TableHead>
                            <TableHead>Paid</TableHead>
                            <TableHead>Due Date</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="w-[50px]"></TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {Array.from({ length: invoicePageSize }).map((_, i) => (
                            <TableRow key={i}>
                              <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                              <TableCell>
                                <Skeleton className="h-4 w-36 mb-1" />
                                <Skeleton className="h-3 w-24" />
                              </TableCell>
                              <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                              <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                              <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                              <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                              <TableCell><Skeleton className="h-5 w-16 rounded-full" /></TableCell>
                              <TableCell><Skeleton className="h-8 w-8 rounded" /></TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                    <span className="sr-only">
                      {debouncedSearch ? `Searching invoices for "${debouncedSearch}"...` : "Loading invoices..."}
                    </span>
                  </div>
                ) : pagedTotal === 0 && !paginatedQuery.isLoading ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <Receipt className="h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium mb-2">No Invoices Found</h3>
                    <p className="text-muted-foreground mb-4">
                      {searchQuery ? "Try adjusting your search" : "Generate your first invoice to get started"}
                    </p>
                    <Button className="gradient-primary text-white" onClick={() => { setSelectedStudentIds([]); setGenerateDialog(true); }}>
                      <Plus className="h-4 w-4 mr-2" />
                      Generate Invoices
                    </Button>
                  </div>
                ) : (
                  <>
                    {/* Mobile card view */}
                    <div className="sm:hidden divide-y divide-border">
                      {pagedInvoices.map((invoice) => {
                        const balance = invoice.total_amount - (invoice.paid_amount || 0);
                        return (
                          <div key={invoice.id} className="p-4 space-y-2">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="font-medium">{invoice.student?.profile?.full_name || (invoice.student_id === null ? "Deleted Student" : "Unknown")}</p>
                                <p className="text-xs text-muted-foreground">{invoice.student?.roll_number || "-"} • {invoice.invoice_number}</p>
                                <p className="text-[10px] text-muted-foreground">Center: {propertyMap.get(invoice.student?.property_id || "") || "—"}</p>
                              </div>
                              {getStatusBadge(invoice.status)}
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-lg">{formatCurrency(invoice.total_amount)}</span>
                              <span className="text-sm text-muted-foreground">Due: {format(new Date(invoice.due_date), "MMM d, yyyy")}</span>
                            </div>
                            {balance > 0 && <p className="text-sm text-red-500">Paid: {formatCurrency(invoice.paid_amount || 0)} • Balance: {formatCurrency(balance)}</p>}
                            <div className="flex gap-2 flex-wrap">
                              <Button size="sm" variant="outline" className="h-7" onClick={() => handleDownloadPdf(invoice)}>
                                <FileText className="h-3 w-3 mr-1" /> PDF
                              </Button>
                              {invoice.status !== 'paid' && (
                                <Button size="sm" className="h-7 gradient-primary text-white" onClick={() => setPaymentDialog({ open: true, invoice })}>
                                  <IndianRupee className="h-3 w-3 mr-1" /> Pay
                                </Button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    {/* Desktop table view */}
                    <div className="hidden sm:block overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Invoice</TableHead>
                          <TableHead>Student</TableHead>
                          <TableHead>Center</TableHead>
                          <TableHead>Total</TableHead>
                          <TableHead>Paid</TableHead>
                          <TableHead>Due Date</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="w-[50px]"></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {pagedInvoices.map((invoice) => {
                          const balance = invoice.total_amount - (invoice.paid_amount || 0);
                          return (
                            <TableRow key={invoice.id}>
                              <TableCell className="font-medium font-mono text-sm">{invoice.invoice_number}</TableCell>
                              <TableCell>
                                <div>
                                  <p className="font-medium">{invoice.student?.profile?.full_name || (invoice.student_id === null ? "Deleted Student" : "Unknown")}</p>
                                  <p className="text-sm text-muted-foreground">{invoice.student?.roll_number || "-"}</p>
                                </div>
                              </TableCell>
                              <TableCell>
                                <Badge variant="outline" className="text-xs">
                                  {propertyMap.get(invoice.student?.property_id || "") || "—"}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <span className="font-bold text-lg">{formatCurrency(invoice.total_amount)}</span>
                              </TableCell>
                              <TableCell>
                                <span className={invoice.paid_amount ? "text-green-600" : "text-muted-foreground"}>
                                  {formatCurrency(invoice.paid_amount || 0)}
                                </span>
                                {balance > 0 && (
                                  <p className="text-xs text-red-500">Due: {formatCurrency(balance)}</p>
                                )}
                              </TableCell>
                              <TableCell>{format(new Date(invoice.due_date), "MMM d, yyyy")}</TableCell>
                              <TableCell>{getStatusBadge(invoice.status)}</TableCell>
                              <TableCell>
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-8 w-8">
                                      <MoreVertical className="h-4 w-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end" className="bg-popover">
                                    <DropdownMenuItem onClick={() => handleDownloadPdf(invoice)}>
                                      <FileText className="h-4 w-4 mr-2" />
                                      Download PDF
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handleSendReminder(invoice)}>
                                      <Send className="h-4 w-4 mr-2" />
                                      Send Reminder
                                    </DropdownMenuItem>
                                    {invoice.status !== 'paid' && (
                                      <DropdownMenuItem onClick={() => setPaymentDialog({ open: true, invoice })}>
                                        <IndianRupee className="h-4 w-4 mr-2" />
                                        Record Payment
                                      </DropdownMenuItem>
                                    )}
                                    {(invoice.paid_amount || 0) > 0 && (
                                      <DropdownMenuItem onClick={() => { setRefundDialog({ open: true, invoice }); setRefundAmount(String(invoice.paid_amount || 0)); }} className="text-destructive">
                                        <Undo2 className="h-4 w-4 mr-2" />
                                        Process Refund
                                      </DropdownMenuItem>
                                    )}
                                    <DropdownMenuItem onClick={() => setDeleteDialog({ open: true, invoice })} className="text-destructive">
                                      <Trash2 className="h-4 w-4 mr-2" />
                                      Delete Invoice
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                    </div>
                    <TablePagination page={invoicePage} pageSize={invoicePageSize} totalItems={pagedTotal} onPageChange={setInvoicePage} itemLabel="invoices" />
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="pending" className="mt-6">
            <Card className="border-border/50">
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Invoice</TableHead>
                        <TableHead>Student</TableHead>
                        <TableHead>Total</TableHead>
                        <TableHead>Due</TableHead>
                        <TableHead>Due Date</TableHead>
                        <TableHead>Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {pagedPending.map((invoice) => (
                        <TableRow key={invoice.id}>
                          <TableCell className="font-medium font-mono text-sm">{invoice.invoice_number}</TableCell>
                          <TableCell>{invoice.student?.profile?.full_name || (invoice.student_id === null ? "Deleted Student" : "Unknown")}</TableCell>
                          <TableCell>{formatCurrency(invoice.total_amount)}</TableCell>
                          <TableCell className="text-red-500 font-medium">
                            {formatCurrency(invoice.total_amount - (invoice.paid_amount || 0))}
                          </TableCell>
                          <TableCell>{format(new Date(invoice.due_date), "MMM d, yyyy")}</TableCell>
                          <TableCell>
                            <Button 
                              size="sm" 
                              className="gradient-primary text-white"
                              onClick={() => setPaymentDialog({ open: true, invoice })}
                            >
                              Record Payment
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  <TablePagination
                    page={pendingPage}
                    pageSize={TAB_PAGE_SIZE}
                    totalItems={pendingList.length}
                    onPageChange={setPendingPage}
                    itemLabel="pending invoices"
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="overdue" className="mt-6">
            <Card className="border-border/50">
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Invoice</TableHead>
                        <TableHead>Student</TableHead>
                        <TableHead>Amount Due</TableHead>
                        <TableHead>Days Overdue</TableHead>
                        <TableHead>Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {pagedOverdue.map((invoice) => {
                        const daysOverdue = Math.floor((new Date().getTime() - new Date(invoice.due_date).getTime()) / (1000 * 60 * 60 * 24));
                        return (
                          <TableRow key={invoice.id}>
                            <TableCell className="font-medium font-mono text-sm">{invoice.invoice_number}</TableCell>
                            <TableCell>{invoice.student?.profile?.full_name || "Unknown"}</TableCell>
                            <TableCell className="text-red-500 font-bold">
                              {formatCurrency(invoice.total_amount - (invoice.paid_amount || 0))}
                            </TableCell>
                            <TableCell>
                              <Badge variant="destructive">{daysOverdue} days</Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex gap-2">
                                <Button size="sm" variant="outline" onClick={() => handleSendReminder(invoice)}>
                                  <Send className="h-3 w-3 mr-1" />
                                  Remind
                                </Button>
                                <Button 
                                  size="sm" 
                                  className="gradient-primary text-white"
                                  onClick={() => setPaymentDialog({ open: true, invoice })}
                                >
                                  Collect
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                  <TablePagination
                    page={overduePage}
                    pageSize={TAB_PAGE_SIZE}
                    totalItems={overdueList.length}
                    onPageChange={setOverduePage}
                    itemLabel="overdue invoices"
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="payments" className="mt-6">
            <Card className="border-border/50">
              <CardHeader>
                <CardTitle className="text-lg">Payment History</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Invoice</TableHead>
                        <TableHead>Student</TableHead>
                        <TableHead>Amount Paid</TableHead>
                        <TableHead>Method</TableHead>
                        <TableHead>Payment Date</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paymentsList.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">No payments recorded yet</TableCell>
                        </TableRow>
                      ) : (
                        pagedPayments.map((invoice) => (
                          <TableRow key={invoice.id}>
                            <TableCell className="font-medium font-mono text-sm">{invoice.invoice_number}</TableCell>
                            <TableCell>{invoice.student?.profile?.full_name || "Unknown"}</TableCell>
                            <TableCell className="text-green-600 font-semibold">{formatCurrency(invoice.paid_amount || 0)}</TableCell>
                            <TableCell>
                              <Badge variant="outline" className="text-xs capitalize">{invoice.payment_method || "N/A"}</Badge>
                            </TableCell>
                            <TableCell>{invoice.payment_date ? format(new Date(invoice.payment_date), "MMM d, yyyy") : "—"}</TableCell>
                            <TableCell>{getStatusBadge(invoice.status)}</TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                  <TablePagination
                    page={paymentsPage}
                    pageSize={TAB_PAGE_SIZE}
                    totalItems={paymentsList.length}
                    onPageChange={setPaymentsPage}
                    itemLabel="payments"
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Refunds Tab */}
          <TabsContent value="refunds" className="mt-6">
            {(() => {
              const totalRefunded = refundsList.reduce((s, r) => s + Number(r.amount), 0);
              return (
                <>
                  <Card className="border-border/50 mb-4">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-muted text-orange-500">
                          <Undo2 className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="text-2xl font-bold">{formatCurrency(totalRefunded)}</p>
                          <p className="text-sm text-muted-foreground">Total Refunded ({refundsList.length} refunds)</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="border-border/50">
                    <CardHeader>
                      <CardTitle className="text-lg">Refund History</CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                      <div className="overflow-x-auto">
                        {refundsLoading ? (
                          <div className="flex items-center justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
                        ) : (
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Date</TableHead>
                                <TableHead>Student</TableHead>
                                <TableHead>Invoice</TableHead>
                                <TableHead>Amount</TableHead>
                                <TableHead>Method</TableHead>
                                <TableHead>Reason</TableHead>
                                <TableHead>Status</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {refundsList.length === 0 ? (
                                <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">No refunds processed yet</TableCell></TableRow>
                              ) : pagedRefunds.map(r => (
                                <TableRow key={r.id}>
                                  <TableCell className="text-sm">{format(new Date(r.created_at), "MMM d, yyyy")}</TableCell>
                                  <TableCell>
                                    <div>
                                      <p className="font-medium">{r.studentName}</p>
                                      <p className="text-xs text-muted-foreground">{r.studentRollNo}</p>
                                    </div>
                                  </TableCell>
                                  <TableCell className="font-mono text-sm">{r.invoiceNumber}</TableCell>
                                  <TableCell className="font-semibold text-orange-600">{formatCurrency(Number(r.amount))}</TableCell>
                                  <TableCell><Badge variant="outline" className="text-xs capitalize">{r.refund_method || 'cash'}</Badge></TableCell>
                                  <TableCell className="text-sm max-w-[200px] truncate">{r.reason || '—'}</TableCell>
                                  <TableCell><Badge className="bg-green-500/10 text-green-600">{r.status || 'processed'}</Badge></TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        )}
                        <TablePagination
                          page={refundsPage}
                          pageSize={TAB_PAGE_SIZE}
                          totalItems={refundsList.length}
                          onPageChange={setRefundsPage}
                          itemLabel="refunds"
                        />
                      </div>
                    </CardContent>
                  </Card>
                </>
              );
            })()}
          </TabsContent>
        </Tabs>

        {/* Payment Dialog */}
        <Dialog open={paymentDialog.open} onOpenChange={(open) => { if (!open) { setPaymentDialog({ open: false, invoice: null }); } }}>
          <DialogContent className="bg-background">
            <DialogHeader>
              <DialogTitle>Record Payment</DialogTitle>
              <DialogDescription>
                Recording payment for invoice {paymentDialog.invoice?.invoice_number}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Student:</span>
                  <span className="font-medium">{paymentDialog.invoice?.student?.profile?.full_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Amount:</span>
                  <span className="font-medium">{formatCurrency(paymentDialog.invoice?.total_amount || 0)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Already Paid:</span>
                  <span className="text-green-600">{formatCurrency(paymentDialog.invoice?.paid_amount || 0)}</span>
                </div>
                <div className="flex justify-between border-t pt-2">
                  <span className="text-muted-foreground">Balance Due:</span>
                  <span className="font-bold text-red-500">
                    {formatCurrency((paymentDialog.invoice?.total_amount || 0) - (paymentDialog.invoice?.paid_amount || 0))}
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Payment Amount</Label>
                <Input 
                  type="number"
                  placeholder="Enter amount..." 
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                />
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
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setPaymentDialog({ open: false, invoice: null })}>
                Cancel
              </Button>
              <Button 
                onClick={handleRecordPayment}
                disabled={!paymentAmount || recordPayment.isPending}
                className="gradient-primary text-white"
              >
                {recordPayment.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Record Payment"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Generate Invoices Dialog */}
        <Dialog open={generateDialog} onOpenChange={(open) => { if (!open) resetGenerateDialog(); }}>
          <DialogContent className="bg-background sm:max-w-2xl max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Generate Invoices</DialogTitle>
              <DialogDescription>
                Record an installment / transaction-based invoice for the selected students.
              </DialogDescription>
            </DialogHeader>

            {generateResults ? (
              <div className="py-6 text-center space-y-4">
                <CheckCircle className="h-12 w-12 text-green-500 mx-auto" />
                <div>
                  <h3 className="text-lg font-semibold">{generateResults.success} Invoice(s) Generated</h3>
                  {generateResults.failed > 0 && (
                    <p className="text-sm text-red-500">{generateResults.failed} failed</p>
                  )}
                </div>
                <Button onClick={resetGenerateDialog} className="gradient-primary text-white">Done</Button>
              </div>
            ) : (
              <div className="space-y-6 py-4">
                {/* Billing Period */}
                <div>
                  <div className="space-y-2">
                    <Label>Due Date</Label>
                    <Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
                  </div>
                </div>

                {/* Installment / Transaction Details */}
                <div>
                  <h4 className="font-medium mb-3">Installment / Transaction Details</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Amount (₹)</Label>
                      <Input type="number" min="0" value={txnAmount} onChange={(e) => setTxnAmount(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <Label>Payment Date</Label>
                      <Input type="date" value={txnDate} onChange={(e) => setTxnDate(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <Label>Payment Mode</Label>
                      <Select value={txnMode} onValueChange={setTxnMode}>
                        <SelectTrigger><SelectValue placeholder="Select mode" /></SelectTrigger>
                        <SelectContent>
                          {["Cash", "UPI", "RTGS", "NEFT", "Cheque", "DD", "Online"].map(m => (
                            <SelectItem key={m} value={m}>{m}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>UTR ID</Label>
                      <Input placeholder="UTR / Bank ref" value={txnUtr} onChange={(e) => setTxnUtr(e.target.value)} />
                    </div>
                    <div className="space-y-2 sm:col-span-2">
                      <Label>Transaction Details</Label>
                      <Input placeholder="Receipt / Ref note" value={txnDetails} onChange={(e) => setTxnDetails(e.target.value)} />
                    </div>
                    <div className="space-y-2 sm:col-span-2">
                      <Label>Remarks</Label>
                      <Input placeholder="Optional remarks" value={txnRemarks} onChange={(e) => setTxnRemarks(e.target.value)} />
                    </div>
                  </div>
                  <div className="mt-3 p-3 bg-muted/50 rounded-lg flex justify-between">
                    <span className="text-sm text-muted-foreground">Amount per student:</span>
                    <span className="font-bold">{formatCurrency(parseFloat(txnAmount) || 0)}</span>
                  </div>
                </div>


                {/* Student Selection */}
                {(() => {
                  const q = studentSearchQuery.trim().toLowerCase();
                  const filteredStudents = q
                    ? activeStudents.filter(s =>
                        (s.profile?.full_name || "").toLowerCase().includes(q) ||
                        (s.roll_number || "").toLowerCase().includes(q) ||
                        (s.course || "").toLowerCase().includes(q)
                      )
                    : activeStudents;
                  const allFilteredSelected = filteredStudents.length > 0 && filteredStudents.every(s => selectedStudentIds.includes(s.id));
                  const toggleFiltered = () => {
                    if (allFilteredSelected) {
                      setSelectedStudentIds(prev => prev.filter(id => !filteredStudents.some(s => s.id === id)));
                    } else {
                      setSelectedStudentIds(prev => Array.from(new Set([...prev, ...filteredStudents.map(s => s.id)])));
                    }
                  };
                  return (
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-medium">Select Students ({selectedStudentIds.length}/{activeStudents.length})</h4>
                        <Button variant="outline" size="sm" onClick={toggleFiltered} disabled={filteredStudents.length === 0}>
                          {allFilteredSelected ? "Deselect All" : "Select All"}
                        </Button>
                      </div>
                      <div className="relative mb-2">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="Search by name, Form Number or course..."
                          value={studentSearchQuery}
                          onChange={(e) => setStudentSearchQuery(e.target.value)}
                          className="pl-9"
                        />
                      </div>
                      <div className="max-h-48 overflow-y-auto border rounded-lg divide-y">
                        {filteredStudents.length === 0 ? (
                          <p className="p-4 text-sm text-muted-foreground text-center">
                            {activeStudents.length === 0 ? "No active students found" : "No students match your search"}
                          </p>
                        ) : (
                          filteredStudents.map(student => (
                            <div
                              key={student.id}
                              className="flex items-center gap-3 p-3 hover:bg-muted/30 transition-colors cursor-pointer"
                              onClick={() => toggleStudentSelection(student.id)}
                            >
                              <div onClick={(e) => e.stopPropagation()}>
                                <Checkbox
                                  checked={selectedStudentIds.includes(student.id)}
                                  onCheckedChange={() => toggleStudentSelection(student.id)}
                                />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate">{student.profile?.full_name || "Unknown"}</p>
                                <p className="text-xs text-muted-foreground">{student.roll_number || "No Form Number"} • {student.course || "N/A"}</p>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  );
                })()}

                {isGenerating && (
                  <div className="space-y-2">
                    <Progress value={generateProgress} />
                    <p className="text-sm text-muted-foreground text-center">Generating invoices... {generateProgress}%</p>
                  </div>
                )}

                <DialogFooter>
                  <Button variant="outline" onClick={resetGenerateDialog} disabled={isGenerating}>Cancel</Button>
                  <Button 
                    className="gradient-primary text-white" 
                    onClick={handleGenerateInvoices}
                    disabled={selectedStudentIds.length === 0 || isGenerating}
                  >
                    {isGenerating ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Receipt className="h-4 w-4 mr-2" />}
                    Generate {selectedStudentIds.length} Invoice(s)
                  </Button>
                </DialogFooter>
              </div>
            )}
          </DialogContent>
        </Dialog>
        {/* Refund Dialog */}
        <Dialog open={refundDialog.open} onOpenChange={(open) => { if (!open) setRefundDialog({ open: false, invoice: null }); }}>
          <DialogContent className="bg-background">
            <DialogHeader>
              <DialogTitle>Process Refund</DialogTitle>
              <DialogDescription>Refund for invoice {refundDialog.invoice?.invoice_number}</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                <div className="flex justify-between"><span className="text-muted-foreground">Student:</span><span className="font-medium">{refundDialog.invoice?.student?.profile?.full_name}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Paid Amount:</span><span className="font-medium">{formatCurrency(refundDialog.invoice?.paid_amount || 0)}</span></div>
              </div>
              <div className="space-y-2">
                <Label>Refund Amount (₹)</Label>
                <Input type="number" value={refundAmount} onChange={(e) => setRefundAmount(e.target.value)} max={refundDialog.invoice?.paid_amount || 0} />
              </div>
              <div className="space-y-2">
                <Label>Reason</Label>
                <Textarea value={refundReason} onChange={(e) => setRefundReason(e.target.value)} placeholder="e.g. Student exit, overpayment..." />
              </div>
              <div className="space-y-2">
                <Label>Refund Method</Label>
                <Select value={refundMethod} onValueChange={setRefundMethod}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent className="bg-popover">
                    <SelectItem value="cash">Cash</SelectItem>
                    <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                    <SelectItem value="upi">UPI</SelectItem>
                    <SelectItem value="cheque">Cheque</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setRefundDialog({ open: false, invoice: null })}>Cancel</Button>
              <Button variant="destructive" disabled={!refundAmount || !refundReason || processRefund.isPending} onClick={async () => {
                if (!refundDialog.invoice) return;
                const propertyId = properties?.[0]?.id || "";
                await processRefund.mutateAsync({
                  invoiceId: refundDialog.invoice.id,
                  studentId: refundDialog.invoice.student_id,
                  propertyId,
                  amount: parseFloat(refundAmount),
                  reason: refundReason,
                  refundMethod,
                });
                setRefundDialog({ open: false, invoice: null });
                setRefundAmount(""); setRefundReason(""); setRefundMethod("cash");
              }}>
                {processRefund.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Process Refund"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <AlertDialog open={deleteDialog.open} onOpenChange={(open) => !open && setDeleteDialog({ open: false, invoice: null })}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete this invoice?</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently delete invoice{" "}
                <span className="font-semibold text-foreground">{deleteDialog.invoice?.invoice_number}</span>
                {deleteDialog.invoice?.student?.profile?.full_name ? (
                  <> for <span className="font-semibold text-foreground">{deleteDialog.invoice.student.profile.full_name}</span></>
                ) : null}
                {(deleteDialog.invoice?.paid_amount || 0) > 0 ? (
                  <> along with its recorded payments and refunds (₹{(deleteDialog.invoice?.paid_amount || 0).toLocaleString('en-IN')} paid)</>
                ) : null}
                . This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={deleteInvoice.isPending}>Cancel</AlertDialogCancel>
              <AlertDialogAction
                disabled={deleteInvoice.isPending}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                onClick={async (e) => {
                  e.preventDefault();
                  if (!deleteDialog.invoice) return;
                  await deleteInvoice.mutateAsync(deleteDialog.invoice.id);
                  setDeleteDialog({ open: false, invoice: null });
                }}
              >
                {deleteInvoice.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Delete Invoice"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </>
  );
};

export default Billing;
