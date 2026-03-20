import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useProperties } from "@/hooks/useProperties";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Plus, TrendingUp, TrendingDown, BookOpen, ClipboardList, BarChart3,
  IndianRupee, ArrowUpRight, ArrowDownRight, Calendar, Download
} from "lucide-react";
import { format } from "date-fns";

type Account = {
  id: string; property_id: string; name: string; code: string | null;
  account_type: string; description: string | null; is_active: boolean | null; created_at: string;
};
type Transaction = {
  id: string; property_id: string; account_id: string; transaction_type: string;
  amount: number; date: string; description: string | null; reference_number: string | null;
  category: string | null; payment_mode: string | null; created_by: string | null;
  created_at: string; updated_at: string;
};
type JournalEntry = {
  id: string; property_id: string; entry_number: string; date: string;
  description: string; debit_account_id: string; credit_account_id: string;
  amount: number; reference: string | null; created_by: string | null; created_at: string;
};

const ACCOUNT_TYPES = ['income', 'expense', 'asset', 'liability'] as const;
const PAYMENT_MODES = ['cash', 'bank_transfer', 'upi', 'cheque', 'card'] as const;

export default function Accounting() {
  const { user } = useAuth();
  const { properties } = useProperties();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedProperty, setSelectedProperty] = useState<string>("");
  const [activeTab, setActiveTab] = useState("transactions");

  // Dialog states
  const [showAccountDialog, setShowAccountDialog] = useState(false);
  const [showTransactionDialog, setShowTransactionDialog] = useState(false);
  const [showJournalDialog, setShowJournalDialog] = useState(false);

  // Form states
  const [accountForm, setAccountForm] = useState({ name: "", code: "", account_type: "expense" as string, description: "" });
  const [txnForm, setTxnForm] = useState({ account_id: "", transaction_type: "expense", amount: "", date: format(new Date(), "yyyy-MM-dd"), description: "", reference_number: "", category: "", payment_mode: "cash" });
  const [journalForm, setJournalForm] = useState({ entry_number: "", date: format(new Date(), "yyyy-MM-dd"), description: "", debit_account_id: "", credit_account_id: "", amount: "", reference: "" });

  const propertyId = selectedProperty || properties[0]?.id || "";

  // Queries
  const { data: accounts = [] } = useQuery({
    queryKey: ["accounts", propertyId],
    queryFn: async () => {
      const { data, error } = await supabase.from("accounts").select("*").eq("property_id", propertyId).order("name");
      if (error) throw error;
      return data as Account[];
    },
    enabled: !!propertyId,
  });

  const { data: transactions = [] } = useQuery({
    queryKey: ["transactions", propertyId],
    queryFn: async () => {
      const { data, error } = await supabase.from("transactions").select("*").eq("property_id", propertyId).order("date", { ascending: false });
      if (error) throw error;
      return data as Transaction[];
    },
    enabled: !!propertyId,
  });

  const { data: journalEntries = [] } = useQuery({
    queryKey: ["journal_entries", propertyId],
    queryFn: async () => {
      const { data, error } = await supabase.from("journal_entries").select("*").eq("property_id", propertyId).order("date", { ascending: false });
      if (error) throw error;
      return data as JournalEntry[];
    },
    enabled: !!propertyId,
  });


  // Mutations
  const createAccount = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("accounts").insert({ ...accountForm, property_id: propertyId } as any);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["accounts"] });
      
      setShowAccountDialog(false);
      setAccountForm({ name: "", code: "", account_type: "expense", description: "" });
      toast({ title: "Account Created" });
    },
    onError: (e: Error) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const createTransaction = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("transactions").insert({
        ...txnForm, amount: Number(txnForm.amount), property_id: propertyId, created_by: user?.id,
      } as any);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      
      setShowTransactionDialog(false);
      setTxnForm({ account_id: "", transaction_type: "expense", amount: "", date: format(new Date(), "yyyy-MM-dd"), description: "", reference_number: "", category: "", payment_mode: "cash" });
      toast({ title: "Transaction Recorded" });
    },
    onError: (e: Error) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const createJournal = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("journal_entries").insert({
        ...journalForm, amount: Number(journalForm.amount), property_id: propertyId, created_by: user?.id,
      } as any);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["journal_entries"] });
      
      setShowJournalDialog(false);
      setJournalForm({ entry_number: "", date: format(new Date(), "yyyy-MM-dd"), description: "", debit_account_id: "", credit_account_id: "", amount: "", reference: "" });
      toast({ title: "Journal Entry Created" });
    },
    onError: (e: Error) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const logAudit = async (action: string, entityType: string, entityId: string | null, details: any) => {
    try {
      await supabase.from("audit_logs").insert({
        property_id: propertyId, user_id: user?.id, action, entity_type: entityType,
        entity_id: entityId, details,
      } as any);
    } catch {}
  };

  // Computed stats
  const totalIncome = transactions.filter(t => t.transaction_type === "income").reduce((s, t) => s + Number(t.amount), 0);
  const totalExpense = transactions.filter(t => t.transaction_type === "expense").reduce((s, t) => s + Number(t.amount), 0);
  const netBalance = totalIncome - totalExpense;

  const getAccountName = (id: string) => accounts.find(a => a.id === id)?.name || "—";

  const generateReport = () => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;
    const propName = properties.find(p => p.id === propertyId)?.name || "Property";
    const html = `<!DOCTYPE html><html><head><title>Financial Report</title>
    <style>
      body{font-family:Arial,sans-serif;padding:40px;color:#1a1a2e}
      h1{color:#16213e;border-bottom:2px solid #0f3460;padding-bottom:8px}
      h2{color:#0f3460;margin-top:30px}
      table{width:100%;border-collapse:collapse;margin:15px 0}
      th,td{border:1px solid #ddd;padding:8px;text-align:left;font-size:13px}
      th{background:#0f3460;color:#fff}
      .income{color:#16a34a}.expense{color:#dc2626}
      .summary-grid{display:grid;grid-template-columns:1fr 1fr 1fr;gap:20px;margin:20px 0}
      .summary-card{border:1px solid #ddd;border-radius:8px;padding:16px;text-align:center}
      .summary-card h3{font-size:14px;color:#666;margin:0 0 8px}
      .summary-card .value{font-size:24px;font-weight:bold}
      @media print{body{padding:20px}}
    </style></head><body>
    <h1>Financial Report — ${propName}</h1>
    <p>Generated on ${format(new Date(), "dd MMM yyyy, hh:mm a")}</p>
    <div class="summary-grid">
      <div class="summary-card"><h3>Total Income</h3><div class="value income">₹${totalIncome.toLocaleString("en-IN")}</div></div>
      <div class="summary-card"><h3>Total Expenses</h3><div class="value expense">₹${totalExpense.toLocaleString("en-IN")}</div></div>
      <div class="summary-card"><h3>Net Balance</h3><div class="value" style="color:${netBalance >= 0 ? '#16a34a' : '#dc2626'}">₹${netBalance.toLocaleString("en-IN")}</div></div>
    </div>
    <h2>Income & Expense Transactions</h2>
    <table><tr><th>Date</th><th>Type</th><th>Account</th><th>Category</th><th>Description</th><th>Payment Mode</th><th>Amount</th></tr>
    ${transactions.map(t => `<tr><td>${format(new Date(t.date), "dd/MM/yyyy")}</td><td class="${t.transaction_type}">${t.transaction_type.toUpperCase()}</td><td>${getAccountName(t.account_id)}</td><td>${t.category || "—"}</td><td>${t.description || "—"}</td><td>${t.payment_mode || "—"}</td><td class="${t.transaction_type}">₹${Number(t.amount).toLocaleString("en-IN")}</td></tr>`).join("")}
    </table>
    <h2>Journal Entries (Ledger)</h2>
    <table><tr><th>Date</th><th>Entry #</th><th>Description</th><th>Debit Account</th><th>Credit Account</th><th>Amount</th></tr>
    ${journalEntries.map(j => `<tr><td>${format(new Date(j.date), "dd/MM/yyyy")}</td><td>${j.entry_number}</td><td>${j.description}</td><td>${getAccountName(j.debit_account_id)}</td><td>${getAccountName(j.credit_account_id)}</td><td>₹${Number(j.amount).toLocaleString("en-IN")}</td></tr>`).join("")}
    </table>
    <h2>Account Summary (P&L)</h2>
    <table><tr><th>Account</th><th>Type</th><th>Total Amount</th></tr>
    ${accounts.map(a => {
      const total = transactions.filter(t => t.account_id === a.id).reduce((s, t) => s + Number(t.amount), 0);
      return `<tr><td>${a.name}</td><td>${a.account_type}</td><td>₹${total.toLocaleString("en-IN")}</td></tr>`;
    }).join("")}
    </table>
    </body></html>`;
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.print();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Accounting & Auditing</h1>
          <p className="text-muted-foreground text-sm">Manage finances, ledger entries, and audit trail</p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={propertyId} onValueChange={setSelectedProperty}>
            <SelectTrigger className="w-48"><SelectValue placeholder="Select Property" /></SelectTrigger>
            <SelectContent>
              {properties.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Income</p>
                <p className="text-2xl font-bold text-green-600">₹{totalIncome.toLocaleString("en-IN")}</p>
              </div>
              <div className="p-3 rounded-full bg-green-100"><ArrowUpRight className="h-5 w-5 text-green-600" /></div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Expenses</p>
                <p className="text-2xl font-bold text-red-600">₹{totalExpense.toLocaleString("en-IN")}</p>
              </div>
              <div className="p-3 rounded-full bg-red-100"><ArrowDownRight className="h-5 w-5 text-red-600" /></div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Net Balance</p>
                <p className={`text-2xl font-bold ${netBalance >= 0 ? "text-green-600" : "text-red-600"}`}>₹{netBalance.toLocaleString("en-IN")}</p>
              </div>
              <div className="p-3 rounded-full bg-blue-100"><IndianRupee className="h-5 w-5 text-blue-600" /></div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <TabsList>
            <TabsTrigger value="transactions" className="gap-1"><TrendingUp className="h-3.5 w-3.5" />Transactions</TabsTrigger>
            <TabsTrigger value="ledger" className="gap-1"><BookOpen className="h-3.5 w-3.5" />Ledger</TabsTrigger>
            <TabsTrigger value="accounts" className="gap-1"><ClipboardList className="h-3.5 w-3.5" />Accounts</TabsTrigger>
            <TabsTrigger value="audit" className="gap-1"><BarChart3 className="h-3.5 w-3.5" />Audit Trail</TabsTrigger>
          </TabsList>
          <div className="flex gap-2 flex-wrap">
            {activeTab === "transactions" && (
              <Dialog open={showTransactionDialog} onOpenChange={setShowTransactionDialog}>
                <DialogTrigger asChild><Button size="sm"><Plus className="h-4 w-4 mr-1" />Add Transaction</Button></DialogTrigger>
                <DialogContent className="max-w-lg">
                  <DialogHeader><DialogTitle>Record Transaction</DialogTitle></DialogHeader>
                  <div className="grid gap-4 py-2">
                    <div className="grid grid-cols-2 gap-3">
                      <div><Label>Type</Label>
                        <Select value={txnForm.transaction_type} onValueChange={v => setTxnForm(f => ({ ...f, transaction_type: v }))}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent><SelectItem value="income">Income</SelectItem><SelectItem value="expense">Expense</SelectItem></SelectContent>
                        </Select>
                      </div>
                      <div><Label>Amount (₹)</Label><Input type="number" value={txnForm.amount} onChange={e => setTxnForm(f => ({ ...f, amount: e.target.value }))} /></div>
                    </div>
                    <div><Label>Account</Label>
                      <Select value={txnForm.account_id} onValueChange={v => setTxnForm(f => ({ ...f, account_id: v }))}>
                        <SelectTrigger><SelectValue placeholder="Select account" /></SelectTrigger>
                        <SelectContent>{accounts.map(a => <SelectItem key={a.id} value={a.id}>{a.name} ({a.account_type})</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div><Label>Date</Label><Input type="date" value={txnForm.date} onChange={e => setTxnForm(f => ({ ...f, date: e.target.value }))} /></div>
                      <div><Label>Payment Mode</Label>
                        <Select value={txnForm.payment_mode} onValueChange={v => setTxnForm(f => ({ ...f, payment_mode: v }))}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>{PAYMENT_MODES.map(m => <SelectItem key={m} value={m}>{m.replace("_", " ").toUpperCase()}</SelectItem>)}</SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div><Label>Category</Label><Input value={txnForm.category} onChange={e => setTxnForm(f => ({ ...f, category: e.target.value }))} placeholder="e.g. Electricity, Rent" /></div>
                      <div><Label>Reference #</Label><Input value={txnForm.reference_number} onChange={e => setTxnForm(f => ({ ...f, reference_number: e.target.value }))} /></div>
                    </div>
                    <div><Label>Description</Label><Textarea value={txnForm.description} onChange={e => setTxnForm(f => ({ ...f, description: e.target.value }))} rows={2} /></div>
                    <Button onClick={() => createTransaction.mutate()} disabled={!txnForm.account_id || !txnForm.amount}>Record Transaction</Button>
                  </div>
                </DialogContent>
              </Dialog>
            )}
            {activeTab === "ledger" && (
              <Dialog open={showJournalDialog} onOpenChange={setShowJournalDialog}>
                <DialogTrigger asChild><Button size="sm"><Plus className="h-4 w-4 mr-1" />New Journal Entry</Button></DialogTrigger>
                <DialogContent className="max-w-lg">
                  <DialogHeader><DialogTitle>Create Journal Entry</DialogTitle></DialogHeader>
                  <div className="grid gap-4 py-2">
                    <div className="grid grid-cols-2 gap-3">
                      <div><Label>Entry Number</Label><Input value={journalForm.entry_number} onChange={e => setJournalForm(f => ({ ...f, entry_number: e.target.value }))} placeholder="JE-001" /></div>
                      <div><Label>Date</Label><Input type="date" value={journalForm.date} onChange={e => setJournalForm(f => ({ ...f, date: e.target.value }))} /></div>
                    </div>
                    <div><Label>Description</Label><Input value={journalForm.description} onChange={e => setJournalForm(f => ({ ...f, description: e.target.value }))} /></div>
                    <div className="grid grid-cols-2 gap-3">
                      <div><Label>Debit Account</Label>
                        <Select value={journalForm.debit_account_id} onValueChange={v => setJournalForm(f => ({ ...f, debit_account_id: v }))}>
                          <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                          <SelectContent>{accounts.map(a => <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>)}</SelectContent>
                        </Select>
                      </div>
                      <div><Label>Credit Account</Label>
                        <Select value={journalForm.credit_account_id} onValueChange={v => setJournalForm(f => ({ ...f, credit_account_id: v }))}>
                          <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                          <SelectContent>{accounts.map(a => <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>)}</SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div><Label>Amount (₹)</Label><Input type="number" value={journalForm.amount} onChange={e => setJournalForm(f => ({ ...f, amount: e.target.value }))} /></div>
                      <div><Label>Reference</Label><Input value={journalForm.reference} onChange={e => setJournalForm(f => ({ ...f, reference: e.target.value }))} /></div>
                    </div>
                    <Button onClick={() => createJournal.mutate()} disabled={!journalForm.entry_number || !journalForm.debit_account_id || !journalForm.credit_account_id || !journalForm.amount}>Create Entry</Button>
                  </div>
                </DialogContent>
              </Dialog>
            )}
            {activeTab === "accounts" && (
              <Dialog open={showAccountDialog} onOpenChange={setShowAccountDialog}>
                <DialogTrigger asChild><Button size="sm"><Plus className="h-4 w-4 mr-1" />Add Account</Button></DialogTrigger>
                <DialogContent>
                  <DialogHeader><DialogTitle>Create Account</DialogTitle></DialogHeader>
                  <div className="grid gap-4 py-2">
                    <div><Label>Account Name</Label><Input value={accountForm.name} onChange={e => setAccountForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Hostel Fees" /></div>
                    <div className="grid grid-cols-2 gap-3">
                      <div><Label>Code</Label><Input value={accountForm.code} onChange={e => setAccountForm(f => ({ ...f, code: e.target.value }))} placeholder="e.g. INC-001" /></div>
                      <div><Label>Type</Label>
                        <Select value={accountForm.account_type} onValueChange={v => setAccountForm(f => ({ ...f, account_type: v }))}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>{ACCOUNT_TYPES.map(t => <SelectItem key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</SelectItem>)}</SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div><Label>Description</Label><Textarea value={accountForm.description} onChange={e => setAccountForm(f => ({ ...f, description: e.target.value }))} rows={2} /></div>
                    <Button onClick={() => createAccount.mutate()} disabled={!accountForm.name}>Create Account</Button>
                  </div>
                </DialogContent>
              </Dialog>
            )}
            <Button size="sm" variant="outline" onClick={generateReport}><Download className="h-4 w-4 mr-1" />Export Report</Button>
          </div>
        </div>

        {/* Transactions Tab */}
        <TabsContent value="transactions">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead><TableHead>Type</TableHead><TableHead>Account</TableHead>
                    <TableHead>Category</TableHead><TableHead>Description</TableHead><TableHead>Mode</TableHead><TableHead className="text-right">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.length === 0 ? (
                    <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">No transactions recorded yet</TableCell></TableRow>
                  ) : transactions.map(t => (
                    <TableRow key={t.id}>
                      <TableCell className="text-sm">{format(new Date(t.date), "dd MMM yyyy")}</TableCell>
                      <TableCell><Badge variant={t.transaction_type === "income" ? "default" : "destructive"} className="text-xs">{t.transaction_type === "income" ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}{t.transaction_type}</Badge></TableCell>
                      <TableCell className="text-sm">{getAccountName(t.account_id)}</TableCell>
                      <TableCell className="text-sm">{t.category || "—"}</TableCell>
                      <TableCell className="text-sm max-w-[200px] truncate">{t.description || "—"}</TableCell>
                      <TableCell><Badge variant="outline" className="text-xs">{t.payment_mode}</Badge></TableCell>
                      <TableCell className={`text-right font-semibold ${t.transaction_type === "income" ? "text-green-600" : "text-red-600"}`}>₹{Number(t.amount).toLocaleString("en-IN")}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Ledger Tab */}
        <TabsContent value="ledger">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead><TableHead>Entry #</TableHead><TableHead>Description</TableHead>
                    <TableHead>Debit A/C</TableHead><TableHead>Credit A/C</TableHead><TableHead className="text-right">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {journalEntries.length === 0 ? (
                    <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">No journal entries yet</TableCell></TableRow>
                  ) : journalEntries.map(j => (
                    <TableRow key={j.id}>
                      <TableCell className="text-sm">{format(new Date(j.date), "dd MMM yyyy")}</TableCell>
                      <TableCell className="font-mono text-sm">{j.entry_number}</TableCell>
                      <TableCell className="text-sm">{j.description}</TableCell>
                      <TableCell className="text-sm text-green-600">{getAccountName(j.debit_account_id)}</TableCell>
                      <TableCell className="text-sm text-red-600">{getAccountName(j.credit_account_id)}</TableCell>
                      <TableCell className="text-right font-semibold">₹{Number(j.amount).toLocaleString("en-IN")}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Accounts Tab */}
        <TabsContent value="accounts">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Code</TableHead><TableHead>Name</TableHead><TableHead>Type</TableHead>
                    <TableHead>Description</TableHead><TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {accounts.length === 0 ? (
                    <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">No accounts created yet. Add accounts to start tracking finances.</TableCell></TableRow>
                  ) : accounts.map(a => (
                    <TableRow key={a.id}>
                      <TableCell className="font-mono text-sm">{a.code || "—"}</TableCell>
                      <TableCell className="font-medium">{a.name}</TableCell>
                      <TableCell><Badge variant="outline" className="capitalize">{a.account_type}</Badge></TableCell>
                      <TableCell className="text-sm text-muted-foreground max-w-[250px] truncate">{a.description || "—"}</TableCell>
                      <TableCell><Badge variant={a.is_active ? "default" : "secondary"}>{a.is_active ? "Active" : "Inactive"}</Badge></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Audit Trail Tab */}
        <TabsContent value="audit">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Timestamp</TableHead><TableHead>Action</TableHead><TableHead>Entity</TableHead><TableHead>Details</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {auditLogs.length === 0 ? (
                    <TableRow><TableCell colSpan={4} className="text-center py-8 text-muted-foreground">No audit logs yet. Actions will be logged automatically.</TableCell></TableRow>
                  ) : auditLogs.map(log => (
                    <TableRow key={log.id}>
                      <TableCell className="text-sm whitespace-nowrap">{format(new Date(log.created_at), "dd MMM yyyy, hh:mm a")}</TableCell>
                      <TableCell><Badge variant="outline" className="text-xs">{log.action}</Badge></TableCell>
                      <TableCell className="text-sm capitalize">{log.entity_type}</TableCell>
                      <TableCell className="text-sm text-muted-foreground max-w-[300px] truncate">{log.details ? JSON.stringify(log.details) : "—"}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
