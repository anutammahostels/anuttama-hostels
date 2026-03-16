import { useState } from "react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Receipt, Plus, Search, Download, IndianRupee, TrendingUp, Clock, AlertTriangle, MoreVertical, FileText, Send, Loader2, CheckCircle } from "lucide-react";
import { useInvoices, type InvoiceWithStudent } from "@/hooks/useInvoices";
import { useStudents } from "@/hooks/useStudents";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";

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

const formatCurrency = (amount: number | null) => {
  if (amount === null) return "₹0";
  return `₹${amount.toLocaleString('en-IN')}`;
};

const Billing = () => {
  const [searchQuery, setSearchQuery] = useState("");
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
  const [defaultRoomRent, setDefaultRoomRent] = useState("5000");
  const [defaultMessCharges, setDefaultMessCharges] = useState("3000");
  const [defaultElectricity, setDefaultElectricity] = useState("500");
  const [defaultOtherCharges, setDefaultOtherCharges] = useState("0");
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generateProgress, setGenerateProgress] = useState(0);
  const [generateResults, setGenerateResults] = useState<{ success: number; failed: number } | null>(null);

  const { invoices, stats, isLoading, recordPayment, createInvoice } = useInvoices();
  const { students } = useStudents();
  const { toast } = useToast();

  // Active students for invoice generation
  const activeStudents = students.filter(s => s.status === 'active');

  // Filter invoices based on search
  const filteredInvoices = invoices.filter(invoice => {
    const matchesSearch = searchQuery === "" ||
      invoice.student?.profile?.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      invoice.invoice_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      invoice.student?.roll_number?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

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
    setIsGenerating(false);
    setGenerateProgress(0);
    setGenerateResults(null);
  };

  const handleGenerateInvoices = async () => {
    if (selectedStudentIds.length === 0) {
      toast({ title: "No students selected", description: "Please select at least one student.", variant: "destructive" });
      return;
    }

    setIsGenerating(true);
    setGenerateProgress(0);
    let success = 0;
    let failed = 0;

    for (let i = 0; i < selectedStudentIds.length; i++) {
      const studentId = selectedStudentIds[i];
      const roomRent = parseFloat(defaultRoomRent) || 0;
      const messCharges = parseFloat(defaultMessCharges) || 0;
      const electricity = parseFloat(defaultElectricity) || 0;
      const otherCharges = parseFloat(defaultOtherCharges) || 0;
      const totalAmount = roomRent + messCharges + electricity + otherCharges;

      const invoiceNumber = `INV-${billingMonth.replace('-', '')}-${(i + 1 + invoices.length).toString().padStart(4, '0')}`;

      try {
        await createInvoice.mutateAsync({
          student_id: studentId,
          invoice_number: invoiceNumber,
          billing_month: `${billingMonth}-01`,
          due_date: dueDate,
          room_rent: roomRent,
          mess_charges: messCharges,
          electricity_charges: electricity,
          other_charges: otherCharges,
          total_amount: totalAmount,
          status: 'pending',
        });
        success++;
      } catch {
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
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button className="gradient-primary text-white" onClick={() => { setSelectedStudentIds(activeStudents.map(s => s.id)); setGenerateDialog(true); }}>
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
          <TabsList>
            <TabsTrigger value="invoices">All Invoices</TabsTrigger>
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="overdue">Overdue</TabsTrigger>
          </TabsList>

          <TabsContent value="invoices" className="mt-6">
            {/* Search */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Search invoices..." 
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Button variant="outline">
                <Send className="h-4 w-4 mr-2" />
                Send Reminders
              </Button>
            </div>

            <Card className="border-border/50">
              <CardContent className="p-0">
                {filteredInvoices.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <Receipt className="h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium mb-2">No Invoices Found</h3>
                    <p className="text-muted-foreground mb-4">
                      {invoices.length === 0 ? "Generate your first invoice to get started" : "Try adjusting your search"}
                    </p>
                    <Button className="gradient-primary text-white" onClick={() => { setSelectedStudentIds(activeStudents.map(s => s.id)); setGenerateDialog(true); }}>
                      <Plus className="h-4 w-4 mr-2" />
                      Generate Invoices
                    </Button>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Invoice</TableHead>
                          <TableHead>Student</TableHead>
                          <TableHead>Breakdown</TableHead>
                          <TableHead>Total</TableHead>
                          <TableHead>Paid</TableHead>
                          <TableHead>Due Date</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="w-[50px]"></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredInvoices.map((invoice) => {
                          const balance = invoice.total_amount - (invoice.paid_amount || 0);
                          return (
                            <TableRow key={invoice.id}>
                              <TableCell className="font-medium font-mono text-sm">{invoice.invoice_number}</TableCell>
                              <TableCell>
                                <div>
                                  <p className="font-medium">{invoice.student?.profile?.full_name || "Unknown"}</p>
                                  <p className="text-sm text-muted-foreground">{invoice.student?.roll_number || "-"}</p>
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="text-sm space-y-1">
                                  {invoice.room_rent && (
                                    <div className="flex justify-between w-32">
                                      <span className="text-muted-foreground">Rent:</span>
                                      <span>{formatCurrency(invoice.room_rent)}</span>
                                    </div>
                                  )}
                                  {invoice.electricity_charges && (
                                    <div className="flex justify-between w-32">
                                      <span className="text-muted-foreground">Electricity:</span>
                                      <span>{formatCurrency(invoice.electricity_charges)}</span>
                                    </div>
                                  )}
                                  {invoice.mess_charges && (
                                    <div className="flex justify-between w-32">
                                      <span className="text-muted-foreground">Mess:</span>
                                      <span>{formatCurrency(invoice.mess_charges)}</span>
                                    </div>
                                  )}
                                  {invoice.other_charges && invoice.other_charges > 0 && (
                                    <div className="flex justify-between w-32">
                                      <span className="text-muted-foreground">Other:</span>
                                      <span>{formatCurrency(invoice.other_charges)}</span>
                                    </div>
                                  )}
                                </div>
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
                                    <DropdownMenuItem>
                                      <FileText className="h-4 w-4 mr-2" />
                                      View Invoice
                                    </DropdownMenuItem>
                                    <DropdownMenuItem>
                                      <Download className="h-4 w-4 mr-2" />
                                      Download PDF
                                    </DropdownMenuItem>
                                    <DropdownMenuItem>
                                      <Send className="h-4 w-4 mr-2" />
                                      Send Reminder
                                    </DropdownMenuItem>
                                    {invoice.status !== 'paid' && (
                                      <DropdownMenuItem onClick={() => setPaymentDialog({ open: true, invoice })}>
                                        <IndianRupee className="h-4 w-4 mr-2" />
                                        Record Payment
                                      </DropdownMenuItem>
                                    )}
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>
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
                      {invoices.filter(inv => inv.status === 'pending' || inv.status === 'partial').map((invoice) => (
                        <TableRow key={invoice.id}>
                          <TableCell className="font-medium font-mono text-sm">{invoice.invoice_number}</TableCell>
                          <TableCell>{invoice.student?.profile?.full_name || "Unknown"}</TableCell>
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
                      {invoices.filter(inv => inv.status !== 'paid' && new Date(inv.due_date) < new Date()).map((invoice) => {
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
                                <Button size="sm" variant="outline">
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
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Payment Dialog */}
        <Dialog open={paymentDialog.open} onOpenChange={(open) => setPaymentDialog({ open, invoice: null })}>
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
                Create invoices for selected students with default charge amounts.
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
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Billing Month</Label>
                    <Input type="month" value={billingMonth} onChange={(e) => setBillingMonth(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>Due Date</Label>
                    <Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
                  </div>
                </div>

                {/* Default Charges */}
                <div>
                  <h4 className="font-medium mb-3">Default Charges (₹)</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Room Rent</Label>
                      <Input type="number" value={defaultRoomRent} onChange={(e) => setDefaultRoomRent(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <Label>Mess Charges</Label>
                      <Input type="number" value={defaultMessCharges} onChange={(e) => setDefaultMessCharges(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <Label>Electricity</Label>
                      <Input type="number" value={defaultElectricity} onChange={(e) => setDefaultElectricity(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <Label>Other Charges</Label>
                      <Input type="number" value={defaultOtherCharges} onChange={(e) => setDefaultOtherCharges(e.target.value)} />
                    </div>
                  </div>
                  <div className="mt-3 p-3 bg-muted/50 rounded-lg flex justify-between">
                    <span className="text-sm text-muted-foreground">Total per student:</span>
                    <span className="font-bold">
                      {formatCurrency(
                        (parseFloat(defaultRoomRent) || 0) +
                        (parseFloat(defaultMessCharges) || 0) +
                        (parseFloat(defaultElectricity) || 0) +
                        (parseFloat(defaultOtherCharges) || 0)
                      )}
                    </span>
                  </div>
                </div>

                {/* Student Selection */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium">Select Students ({selectedStudentIds.length}/{activeStudents.length})</h4>
                    <Button variant="outline" size="sm" onClick={toggleSelectAll}>
                      {selectedStudentIds.length === activeStudents.length ? "Deselect All" : "Select All"}
                    </Button>
                  </div>
                  <div className="max-h-48 overflow-y-auto border rounded-lg divide-y">
                    {activeStudents.length === 0 ? (
                      <p className="p-4 text-sm text-muted-foreground text-center">No active students found</p>
                    ) : (
                      activeStudents.map(student => (
                        <div key={student.id} className="flex items-center gap-3 p-3 hover:bg-muted/30 transition-colors">
                          <Checkbox 
                            checked={selectedStudentIds.includes(student.id)}
                            onCheckedChange={() => toggleStudentSelection(student.id)}
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{student.profile?.full_name || "Unknown"}</p>
                            <p className="text-xs text-muted-foreground">{student.roll_number || "No Roll #"} • {student.course || "N/A"}</p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

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
      </div>
    </DashboardLayout>
  );
};

export default Billing;
