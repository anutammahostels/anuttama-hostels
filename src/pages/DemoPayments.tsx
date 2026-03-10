import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { motion, AnimatePresence } from "framer-motion";
import {
  IndianRupee, CreditCard, Smartphone, Building, QrCode, CheckCircle2,
  Clock, AlertTriangle, Download, Send, TrendingUp, ArrowUpRight,
  Receipt, Users, Loader2, Shield, Zap, Eye, X, ChevronRight, Wallet
} from "lucide-react";
import { format } from "date-fns";

// ─── Mock Data ───────────────────────────────────────────
const MOCK_STUDENTS = [
  { id: "s1", name: "Rahul Sharma", roll: "CS2024001", room: "A-101", course: "B.Tech CSE", year: 2, avatar: "RS" },
  { id: "s2", name: "Priya Patel", roll: "EC2024015", room: "B-203", course: "B.Tech ECE", year: 3, avatar: "PP" },
  { id: "s3", name: "Amit Kumar", roll: "ME2024008", room: "A-305", course: "B.Tech ME", year: 1, avatar: "AK" },
  { id: "s4", name: "Neha Singh", roll: "CS2024022", room: "C-102", course: "B.Tech CSE", year: 2, avatar: "NS" },
  { id: "s5", name: "Vikash Yadav", roll: "IT2024011", room: "B-401", course: "B.Tech IT", year: 4, avatar: "VY" },
  { id: "s6", name: "Ananya Gupta", roll: "CS2024033", room: "D-201", course: "B.Tech CSE", year: 1, avatar: "AG" },
];

const MOCK_INVOICES = [
  { id: "inv1", number: "INV-2026-001", studentId: "s1", rent: 8000, mess: 3500, electricity: 800, other: 200, total: 12500, paid: 12500, status: "paid", dueDate: "2026-03-15", paidDate: "2026-03-10", method: "UPI" },
  { id: "inv2", number: "INV-2026-002", studentId: "s2", rent: 8000, mess: 3500, electricity: 650, other: 0, total: 12150, paid: 8000, status: "partial", dueDate: "2026-03-15", paidDate: "2026-03-08", method: "Bank Transfer" },
  { id: "inv3", number: "INV-2026-003", studentId: "s3", rent: 8000, mess: 3500, electricity: 900, other: 500, total: 12900, paid: 0, status: "pending", dueDate: "2026-03-20", paidDate: null, method: null },
  { id: "inv4", number: "INV-2026-004", studentId: "s4", rent: 8000, mess: 3500, electricity: 720, other: 0, total: 12220, paid: 0, status: "overdue", dueDate: "2026-03-05", paidDate: null, method: null },
  { id: "inv5", number: "INV-2026-005", studentId: "s5", rent: 10000, mess: 4000, electricity: 1100, other: 300, total: 15400, paid: 15400, status: "paid", dueDate: "2026-03-15", paidDate: "2026-03-12", method: "Card" },
  { id: "inv6", number: "INV-2026-006", studentId: "s6", rent: 8000, mess: 3500, electricity: 600, other: 0, total: 12100, paid: 0, status: "pending", dueDate: "2026-03-25", paidDate: null, method: null },
];

const MOCK_TRANSACTIONS = [
  { id: "t1", invoiceId: "inv1", student: "Rahul Sharma", amount: 12500, method: "UPI", status: "success", date: "2026-03-10T14:30:00", txnId: "TXN9823746510" },
  { id: "t2", invoiceId: "inv2", student: "Priya Patel", amount: 8000, method: "Bank Transfer", status: "success", date: "2026-03-08T10:15:00", txnId: "TXN9823746511" },
  { id: "t3", invoiceId: "inv5", student: "Vikash Yadav", amount: 15400, method: "Credit Card", status: "success", date: "2026-03-12T09:45:00", txnId: "TXN9823746512" },
  { id: "t4", invoiceId: "inv4", student: "Neha Singh", amount: 12220, method: "UPI", status: "failed", date: "2026-03-04T16:20:00", txnId: "TXN9823746513" },
];

const formatCurrency = (n: number) => `₹${n.toLocaleString("en-IN")}`;

const statusConfig: Record<string, { label: string; color: string; bg: string }> = {
  paid: { label: "Paid", color: "text-green-600", bg: "bg-green-500/10" },
  partial: { label: "Partial", color: "text-blue-600", bg: "bg-blue-500/10" },
  pending: { label: "Pending", color: "text-yellow-600", bg: "bg-yellow-500/10" },
  overdue: { label: "Overdue", color: "text-red-600", bg: "bg-red-500/10" },
};

// ─── Payment Gateway Simulation ──────────────────────────
type PaymentStep = "select" | "processing" | "success" | "receipt";

const PaymentGateway = ({
  invoice,
  student,
  onClose,
  onComplete,
}: {
  invoice: typeof MOCK_INVOICES[0];
  student: typeof MOCK_STUDENTS[0];
  onClose: () => void;
  onComplete: (method: string) => void;
}) => {
  const [step, setStep] = useState<PaymentStep>("select");
  const [method, setMethod] = useState("upi");
  const [progress, setProgress] = useState(0);
  const balance = invoice.total - invoice.paid;

  useEffect(() => {
    if (step === "processing") {
      const timer = setInterval(() => {
        setProgress((p) => {
          if (p >= 100) {
            clearInterval(timer);
            setTimeout(() => setStep("success"), 400);
            return 100;
          }
          return p + Math.random() * 15 + 5;
        });
      }, 300);
      return () => clearInterval(timer);
    }
  }, [step]);

  const methodIcons: Record<string, typeof CreditCard> = {
    upi: Smartphone,
    card: CreditCard,
    netbanking: Building,
    wallet: Wallet,
  };

  return (
    <Dialog open onOpenChange={() => onClose()}>
      <DialogContent className="sm:max-w-md p-0 overflow-hidden">
        {/* Gateway header */}
        <div className="bg-gradient-to-r from-hostylia-forest to-hostylia-forest-light p-4 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              <span className="font-semibold text-sm">Hostylia Secure Pay</span>
            </div>
            <Badge className="bg-white/20 text-white text-[10px]">
              <Zap className="h-3 w-3 mr-1" /> 256-bit SSL
            </Badge>
          </div>
          <div className="mt-3">
            <p className="text-white/70 text-xs">Amount to Pay</p>
            <p className="text-2xl font-bold">{formatCurrency(balance)}</p>
            <p className="text-white/70 text-xs mt-1">{student.name} • {invoice.number}</p>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {step === "select" && (
            <motion.div
              key="select"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="p-4 space-y-4"
            >
              <Label className="text-sm font-semibold">Select Payment Method</Label>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { id: "upi", label: "UPI / GPay", desc: "Instant transfer" },
                  { id: "card", label: "Credit/Debit Card", desc: "Visa, Mastercard" },
                  { id: "netbanking", label: "Net Banking", desc: "All major banks" },
                  { id: "wallet", label: "Wallet", desc: "Paytm, PhonePe" },
                ].map((m) => {
                  const Icon = methodIcons[m.id];
                  return (
                    <button
                      key={m.id}
                      onClick={() => setMethod(m.id)}
                      className={`p-3 rounded-xl border-2 text-left transition-all ${
                        method === m.id
                          ? "border-primary bg-primary/5 shadow-sm"
                          : "border-border hover:border-primary/40"
                      }`}
                    >
                      <Icon className={`h-5 w-5 mb-1 ${method === m.id ? "text-primary" : "text-muted-foreground"}`} />
                      <p className="text-xs font-semibold">{m.label}</p>
                      <p className="text-[10px] text-muted-foreground">{m.desc}</p>
                    </button>
                  );
                })}
              </div>

              {method === "upi" && (
                <div className="space-y-2">
                  <Label className="text-xs">UPI ID</Label>
                  <Input placeholder="yourname@upi" defaultValue="demo@ybl" className="text-sm" />
                </div>
              )}
              {method === "card" && (
                <div className="space-y-2">
                  <Label className="text-xs">Card Number</Label>
                  <Input placeholder="4242 4242 4242 4242" defaultValue="4242 4242 4242 4242" className="text-sm" />
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label className="text-xs">Expiry</Label>
                      <Input placeholder="MM/YY" defaultValue="12/28" className="text-sm" />
                    </div>
                    <div>
                      <Label className="text-xs">CVV</Label>
                      <Input placeholder="***" defaultValue="123" type="password" className="text-sm" />
                    </div>
                  </div>
                </div>
              )}

              <Button
                onClick={() => { setStep("processing"); setProgress(0); }}
                className="w-full gradient-primary text-white h-11"
              >
                Pay {formatCurrency(balance)}
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
              <p className="text-[10px] text-center text-muted-foreground">
                Powered by Hostylia Payments • Secured by Jeevijay Technologies
              </p>
            </motion.div>
          )}

          {step === "processing" && (
            <motion.div
              key="processing"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="p-8 flex flex-col items-center gap-4"
            >
              <div className="relative">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <IndianRupee className="h-5 w-5 text-primary" />
                </div>
              </div>
              <div className="text-center">
                <p className="font-semibold">Processing Payment</p>
                <p className="text-sm text-muted-foreground">Please wait while we verify your transaction...</p>
              </div>
              <Progress value={Math.min(progress, 100)} className="w-full h-2" />
              <p className="text-xs text-muted-foreground">Verifying with bank...</p>
            </motion.div>
          )}

          {step === "success" && (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: "spring", duration: 0.5 }}
              className="p-8 flex flex-col items-center gap-4"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", delay: 0.2 }}
                className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center"
              >
                <CheckCircle2 className="h-10 w-10 text-green-500" />
              </motion.div>
              <div className="text-center">
                <p className="text-xl font-bold text-green-600">Payment Successful!</p>
                <p className="text-sm text-muted-foreground mt-1">{formatCurrency(balance)} received</p>
              </div>
              <div className="w-full bg-muted/50 rounded-lg p-3 space-y-1.5 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Transaction ID</span>
                  <span className="font-mono font-medium">TXN{Date.now().toString().slice(-10)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Method</span>
                  <span className="capitalize">{method === "upi" ? "UPI" : method === "card" ? "Credit Card" : method === "netbanking" ? "Net Banking" : "Wallet"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Date</span>
                  <span>{format(new Date(), "MMM d, yyyy h:mm a")}</span>
                </div>
              </div>
              <div className="flex gap-2 w-full">
                <Button variant="outline" className="flex-1" onClick={() => setStep("receipt")}>
                  <Eye className="h-4 w-4 mr-1" /> View Receipt
                </Button>
                <Button className="flex-1 gradient-primary text-white" onClick={() => onComplete(method)}>
                  Done
                </Button>
              </div>
            </motion.div>
          )}

          {step === "receipt" && (
            <motion.div
              key="receipt"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="p-4 space-y-3"
            >
              <div className="border border-dashed border-border rounded-lg p-4 space-y-3">
                <div className="text-center">
                  <p className="font-bold text-lg">Hostylia</p>
                  <p className="text-[10px] text-muted-foreground">Payment Receipt</p>
                </div>
                <Separator />
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between"><span className="text-muted-foreground">Receipt No.</span><span className="font-mono">{invoice.number}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Student</span><span>{student.name}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Roll No.</span><span>{student.roll}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Room</span><span>{student.room}</span></div>
                </div>
                <Separator />
                <div className="space-y-1.5 text-sm">
                  <div className="flex justify-between"><span>Room Rent</span><span>{formatCurrency(invoice.rent)}</span></div>
                  <div className="flex justify-between"><span>Mess Charges</span><span>{formatCurrency(invoice.mess)}</span></div>
                  <div className="flex justify-between"><span>Electricity</span><span>{formatCurrency(invoice.electricity)}</span></div>
                  {invoice.other > 0 && <div className="flex justify-between"><span>Other</span><span>{formatCurrency(invoice.other)}</span></div>}
                  <Separator />
                  <div className="flex justify-between font-bold text-base">
                    <span>Total Paid</span>
                    <span className="text-green-600">{formatCurrency(balance)}</span>
                  </div>
                </div>
                <Separator />
                <div className="text-center space-y-1">
                  <p className="text-[10px] text-muted-foreground">Payment via {method.toUpperCase()}</p>
                  <p className="text-[10px] text-muted-foreground">{format(new Date(), "MMMM d, yyyy 'at' h:mm a")}</p>
                  <p className="text-[10px] text-muted-foreground">Powered by Jeevijay Technologies Pvt. Ltd.</p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" className="flex-1" onClick={() => setStep("success")}>
                  Back
                </Button>
                <Button className="flex-1 gradient-primary text-white" onClick={() => onComplete(method)}>
                  <Download className="h-4 w-4 mr-1" /> Download
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
};

// ─── Main Page ───────────────────────────────────────────
const DemoPayments = () => {
  const [invoices, setInvoices] = useState(MOCK_INVOICES);
  const [selectedInvoice, setSelectedInvoice] = useState<typeof MOCK_INVOICES[0] | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [tab, setTab] = useState("overview");

  const totalRevenue = invoices.reduce((a, i) => a + i.total, 0);
  const collected = invoices.reduce((a, i) => a + i.paid, 0);
  const pending = totalRevenue - collected;
  const collectionRate = Math.round((collected / totalRevenue) * 100);
  const overdueCount = invoices.filter((i) => i.status === "overdue").length;

  const handlePaymentComplete = (invoiceId: string, method: string) => {
    setInvoices((prev) =>
      prev.map((inv) =>
        inv.id === invoiceId ? { ...inv, paid: inv.total, status: "paid", paidDate: new Date().toISOString(), method } : inv
      )
    );
    setSelectedInvoice(null);
  };

  const getStudent = (id: string) => MOCK_STUDENTS.find((s) => s.id === id)!;

  const filtered = invoices.filter((inv) => {
    const s = getStudent(inv.studentId);
    return (
      searchQuery === "" ||
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.roll.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inv.number.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  const stats = [
    { label: "Total Revenue", value: formatCurrency(totalRevenue), icon: IndianRupee, color: "from-green-500 to-emerald-600", change: `${invoices.length} invoices` },
    { label: "Collected", value: formatCurrency(collected), icon: CheckCircle2, color: "from-blue-500 to-indigo-600", change: `${collectionRate}% collected` },
    { label: "Pending Dues", value: formatCurrency(pending), icon: Clock, color: "from-amber-500 to-orange-600", change: `${invoices.filter((i) => i.status === "pending" || i.status === "partial").length} invoices` },
    { label: "Overdue", value: overdueCount.toString(), icon: AlertTriangle, color: "from-red-500 to-rose-600", change: "need attention" },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold text-foreground">Payments</h1>
              <Badge className="bg-amber-500/10 text-amber-600 text-[10px]">DEMO</Badge>
            </div>
            <p className="text-sm text-muted-foreground">Collect fees, track payments & generate receipts</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-1" /> Export
            </Button>
            <Button size="sm" className="gradient-primary text-white">
              <Send className="h-4 w-4 mr-1" /> Send Reminders
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {stats.map((stat) => (
            <motion.div key={stat.label} whileHover={{ y: -2 }} transition={{ duration: 0.2 }}>
              <Card className="border-border/50 overflow-hidden">
                <CardContent className="p-3 sm:p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-[10px] sm:text-xs text-muted-foreground uppercase tracking-wider">{stat.label}</p>
                      <p className="text-lg sm:text-2xl font-bold mt-1">{stat.value}</p>
                      <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5">{stat.change}</p>
                    </div>
                    <div className={`p-2 rounded-lg bg-gradient-to-br ${stat.color} bg-opacity-10`}>
                      <stat.icon className="h-4 w-4 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Collection Progress */}
        <Card className="border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-semibold">Collection Progress</p>
              <span className="text-sm font-bold text-primary">{collectionRate}%</span>
            </div>
            <Progress value={collectionRate} className="h-3" />
            <div className="flex justify-between mt-2 text-xs text-muted-foreground">
              <span>Collected: {formatCurrency(collected)}</span>
              <span>Target: {formatCurrency(totalRevenue)}</span>
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs value={tab} onValueChange={setTab}>
          <TabsList className="w-full sm:w-auto">
            <TabsTrigger value="overview" className="text-xs sm:text-sm">All Invoices</TabsTrigger>
            <TabsTrigger value="pending" className="text-xs sm:text-sm">Pending</TabsTrigger>
            <TabsTrigger value="transactions" className="text-xs sm:text-sm">Transactions</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-4">
            <div className="mb-4">
              <Input
                placeholder="Search by student, roll no, or invoice..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="max-w-sm text-sm"
              />
            </div>

            <div className="space-y-3">
              {filtered.map((inv) => {
                const student = getStudent(inv.studentId);
                const balance = inv.total - inv.paid;
                const cfg = statusConfig[inv.status];
                return (
                  <motion.div key={inv.id} layout whileHover={{ scale: 1.005 }}>
                    <Card className="border-border/50">
                      <CardContent className="p-3 sm:p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center flex-shrink-0">
                            <span className="text-white text-xs font-bold">{student.avatar}</span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <p className="font-semibold text-sm truncate">{student.name}</p>
                              <Badge className={`${cfg.bg} ${cfg.color} text-[10px]`}>{cfg.label}</Badge>
                            </div>
                            <p className="text-xs text-muted-foreground">
                              {student.roll} • Room {student.room} • {inv.number}
                            </p>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <p className="font-bold text-sm">{formatCurrency(inv.total)}</p>
                            {balance > 0 ? (
                              <p className="text-[10px] text-red-500">Due: {formatCurrency(balance)}</p>
                            ) : (
                              <p className="text-[10px] text-green-500">Fully Paid</p>
                            )}
                          </div>
                        </div>

                        {/* Breakdown */}
                        <div className="mt-3 grid grid-cols-4 gap-2 text-[10px] sm:text-xs">
                          <div className="bg-muted/50 rounded p-1.5 text-center">
                            <p className="text-muted-foreground">Rent</p>
                            <p className="font-semibold">{formatCurrency(inv.rent)}</p>
                          </div>
                          <div className="bg-muted/50 rounded p-1.5 text-center">
                            <p className="text-muted-foreground">Mess</p>
                            <p className="font-semibold">{formatCurrency(inv.mess)}</p>
                          </div>
                          <div className="bg-muted/50 rounded p-1.5 text-center">
                            <p className="text-muted-foreground">Electric</p>
                            <p className="font-semibold">{formatCurrency(inv.electricity)}</p>
                          </div>
                          <div className="bg-muted/50 rounded p-1.5 text-center">
                            <p className="text-muted-foreground">Other</p>
                            <p className="font-semibold">{formatCurrency(inv.other)}</p>
                          </div>
                        </div>

                        {/* Actions */}
                        {inv.status !== "paid" && (
                          <div className="mt-3 flex gap-2">
                            <Button
                              size="sm"
                              className="flex-1 gradient-primary text-white text-xs h-8"
                              onClick={() => setSelectedInvoice(inv)}
                            >
                              <IndianRupee className="h-3 w-3 mr-1" /> Collect Payment
                            </Button>
                            <Button variant="outline" size="sm" className="text-xs h-8">
                              <Send className="h-3 w-3 mr-1" /> Remind
                            </Button>
                          </div>
                        )}
                        {inv.status === "paid" && (
                          <div className="mt-3 flex gap-2">
                            <Button variant="outline" size="sm" className="text-xs h-8">
                              <Receipt className="h-3 w-3 mr-1" /> Receipt
                            </Button>
                            <Button variant="outline" size="sm" className="text-xs h-8">
                              <Download className="h-3 w-3 mr-1" /> PDF
                            </Button>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          </TabsContent>

          <TabsContent value="pending" className="mt-4">
            <div className="space-y-3">
              {invoices
                .filter((i) => i.status !== "paid")
                .map((inv) => {
                  const student = getStudent(inv.studentId);
                  const balance = inv.total - inv.paid;
                  const cfg = statusConfig[inv.status];
                  return (
                    <Card key={inv.id} className="border-border/50">
                      <CardContent className="p-3 sm:p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center">
                              <span className="text-white text-xs font-bold">{student.avatar}</span>
                            </div>
                            <div>
                              <p className="font-semibold text-sm">{student.name}</p>
                              <p className="text-xs text-muted-foreground">{student.roll} • Due: {format(new Date(inv.dueDate), "MMM d")}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-red-500">{formatCurrency(balance)}</p>
                            <Badge className={`${cfg.bg} ${cfg.color} text-[10px]`}>{cfg.label}</Badge>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          className="w-full mt-3 gradient-primary text-white text-xs h-8"
                          onClick={() => setSelectedInvoice(inv)}
                        >
                          <IndianRupee className="h-3 w-3 mr-1" /> Collect {formatCurrency(balance)}
                        </Button>
                      </CardContent>
                    </Card>
                  );
                })}
              {invoices.filter((i) => i.status !== "paid").length === 0 && (
                <div className="text-center py-12">
                  <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto mb-3" />
                  <p className="font-semibold">All Dues Collected! 🎉</p>
                  <p className="text-sm text-muted-foreground">No pending payments</p>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="transactions" className="mt-4">
            <div className="space-y-3">
              {MOCK_TRANSACTIONS.map((txn) => (
                <Card key={txn.id} className="border-border/50">
                  <CardContent className="p-3 sm:p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-full flex items-center justify-center ${txn.status === "success" ? "bg-green-500/10" : "bg-red-500/10"}`}>
                          {txn.status === "success" ? (
                            <CheckCircle2 className="h-5 w-5 text-green-500" />
                          ) : (
                            <X className="h-5 w-5 text-red-500" />
                          )}
                        </div>
                        <div>
                          <p className="font-semibold text-sm">{txn.student}</p>
                          <p className="text-xs text-muted-foreground">{txn.method} • {format(new Date(txn.date), "MMM d, h:mm a")}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`font-bold text-sm ${txn.status === "success" ? "text-green-600" : "text-red-500 line-through"}`}>
                          {formatCurrency(txn.amount)}
                        </p>
                        <p className="text-[10px] font-mono text-muted-foreground">{txn.txnId}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Payment Gateway Modal */}
      {selectedInvoice && (
        <PaymentGateway
          invoice={selectedInvoice}
          student={getStudent(selectedInvoice.studentId)}
          onClose={() => setSelectedInvoice(null)}
          onComplete={(method) => handlePaymentComplete(selectedInvoice.id, method)}
        />
      )}
    </DashboardLayout>
  );
};

export default DemoPayments;
