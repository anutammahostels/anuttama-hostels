import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useProperties } from "@/hooks/useProperties";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import {
  UserPlus, FileText, Users, IndianRupee, Download, Trash2, Edit, Plus,
} from "lucide-react";
import { format } from "date-fns";

interface Employee {
  id: string;
  property_id: string;
  full_name: string;
  email: string | null;
  phone: string | null;
  designation: string;
  department: string | null;
  date_of_joining: string | null;
  salary_amount: number;
  bank_account: string | null;
  bank_name: string | null;
  uan_number: string | null;
  esi_number: string | null;
  status: string | null;
  created_at: string;
}

interface PayrollRecord {
  id: string;
  employee_id: string;
  property_id: string;
  month: string;
  basic_salary: number;
  hra: number;
  da: number;
  travel_allowance: number;
  medical_allowance: number;
  other_allowance: number;
  gross_salary: number;
  pf_employee: number;
  pf_employer: number;
  esi_employee: number;
  esi_employer: number;
  professional_tax: number;
  tds: number;
  other_deduction: number;
  allowances: number | null;
  deductions: number | null;
  net_salary: number;
  status: string | null;
  notes: string | null;
  generated_at: string | null;
  employees?: Employee;
}

// Number to words for Indian currency
const numberToWords = (num: number): string => {
  if (num === 0) return "Zero";
  const ones = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine",
    "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"];
  const tens = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];

  const convertGroup = (n: number): string => {
    if (n === 0) return "";
    if (n < 20) return ones[n];
    if (n < 100) return tens[Math.floor(n / 10)] + (n % 10 ? " " + ones[n % 10] : "");
    return ones[Math.floor(n / 100)] + " Hundred" + (n % 100 ? " and " + convertGroup(n % 100) : "");
  };

  const absNum = Math.abs(Math.round(num));
  if (absNum === 0) return "Zero";

  const crore = Math.floor(absNum / 10000000);
  const lakh = Math.floor((absNum % 10000000) / 100000);
  const thousand = Math.floor((absNum % 100000) / 1000);
  const remainder = absNum % 1000;

  let result = "";
  if (crore) result += convertGroup(crore) + " Crore ";
  if (lakh) result += convertGroup(lakh) + " Lakh ";
  if (thousand) result += convertGroup(thousand) + " Thousand ";
  if (remainder) result += convertGroup(remainder);

  return result.trim() + " Rupees Only";
};

const fmt = (n: number) => Number(n || 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const Payroll = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { properties } = useProperties();
  const selectedPropertyId = properties?.[0]?.id || "";

  // Employee dialog state
  const [empDialogOpen, setEmpDialogOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [empForm, setEmpForm] = useState({
    full_name: "", email: "", phone: "", designation: "", department: "",
    salary_amount: "", bank_account: "", bank_name: "", uan_number: "", esi_number: "",
  });

  // Payroll generation dialog
  const [payrollDialogOpen, setPayrollDialogOpen] = useState(false);
  const [payrollForm, setPayrollForm] = useState({
    employee_id: "", month: format(new Date(), "yyyy-MM"),
    hra: "0", da: "0", travel_allowance: "0", medical_allowance: "0", other_allowance: "0",
    pf_enabled: true, esi_enabled: true,
    professional_tax: "200", tds: "0", other_deduction: "0", notes: "",
  });

  // Fetch employees
  const { data: employees = [], isLoading: loadingEmployees } = useQuery({
    queryKey: ["employees", selectedPropertyId],
    queryFn: async () => {
      if (!selectedPropertyId) return [];
      const { data, error } = await supabase
        .from("employees")
        .select("*")
        .eq("property_id", selectedPropertyId)
        .order("full_name");
      if (error) throw error;
      return data as Employee[];
    },
    enabled: !!selectedPropertyId,
  });

  // Fetch payroll records
  const { data: payrollRecords = [], isLoading: loadingPayroll } = useQuery({
    queryKey: ["payroll_records", selectedPropertyId],
    queryFn: async () => {
      if (!selectedPropertyId) return [];
      const { data, error } = await supabase
        .from("payroll_records")
        .select("*, employees(*)")
        .eq("property_id", selectedPropertyId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as PayrollRecord[];
    },
    enabled: !!selectedPropertyId,
  });

  // Selected employee for payroll calc
  const selectedEmployee = useMemo(() =>
    employees.find(e => e.id === payrollForm.employee_id),
    [employees, payrollForm.employee_id]
  );

  // Auto-calculations
  const payrollCalc = useMemo(() => {
    const basic = selectedEmployee?.salary_amount || 0;
    const hra = parseFloat(payrollForm.hra) || 0;
    const da = parseFloat(payrollForm.da) || 0;
    const travel = parseFloat(payrollForm.travel_allowance) || 0;
    const medical = parseFloat(payrollForm.medical_allowance) || 0;
    const otherAllow = parseFloat(payrollForm.other_allowance) || 0;
    const gross = basic + hra + da + travel + medical + otherAllow;

    const pfEmployee = payrollForm.pf_enabled ? Math.round(basic * 0.12) : 0;
    const pfEmployer = payrollForm.pf_enabled ? Math.round(basic * 0.12) : 0;
    const esiEmployee = payrollForm.esi_enabled && gross <= 21000 ? Math.round(gross * 0.0075) : 0;
    const esiEmployer = payrollForm.esi_enabled && gross <= 21000 ? Math.round(gross * 0.0325) : 0;
    const pt = parseFloat(payrollForm.professional_tax) || 0;
    const tds = parseFloat(payrollForm.tds) || 0;
    const otherDed = parseFloat(payrollForm.other_deduction) || 0;

    const totalDeductions = pfEmployee + esiEmployee + pt + tds + otherDed;
    const totalAllowances = hra + da + travel + medical + otherAllow;
    const net = gross - totalDeductions;

    return { basic, hra, da, travel, medical, otherAllow, gross, pfEmployee, pfEmployer, esiEmployee, esiEmployer, pt, tds, otherDed, totalDeductions, totalAllowances, net };
  }, [selectedEmployee, payrollForm]);

  // Create/Update employee
  const employeeMutation = useMutation({
    mutationFn: async (formData: typeof empForm & { id?: string }) => {
      const payload = {
        property_id: selectedPropertyId,
        full_name: formData.full_name,
        email: formData.email || null,
        phone: formData.phone || null,
        designation: formData.designation,
        department: formData.department || null,
        salary_amount: parseFloat(formData.salary_amount) || 0,
        bank_account: formData.bank_account || null,
        bank_name: formData.bank_name || null,
        uan_number: formData.uan_number || null,
        esi_number: formData.esi_number || null,
      };
      if (formData.id) {
        const { error } = await supabase.from("employees").update(payload).eq("id", formData.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("employees").insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employees"] });
      setEmpDialogOpen(false);
      setEditingEmployee(null);
      resetEmpForm();
      toast({ title: editingEmployee ? "Employee updated" : "Employee added" });
    },
    onError: (err: any) => toast({ title: "Error", description: err.message, variant: "destructive" }),
  });

  // Delete employee
  const deleteEmployeeMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("employees").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employees"] });
      toast({ title: "Employee removed" });
    },
    onError: (err: any) => toast({ title: "Error", description: err.message, variant: "destructive" }),
  });

  // Generate payroll
  const payrollMutation = useMutation({
    mutationFn: async () => {
      if (!selectedEmployee) throw new Error("Employee not found");
      const c = payrollCalc;
      const { error } = await supabase.from("payroll_records").insert({
        employee_id: payrollForm.employee_id,
        property_id: selectedPropertyId,
        month: payrollForm.month,
        basic_salary: c.basic,
        hra: c.hra,
        da: c.da,
        travel_allowance: c.travel,
        medical_allowance: c.medical,
        other_allowance: c.otherAllow,
        gross_salary: c.gross,
        pf_employee: c.pfEmployee,
        pf_employer: c.pfEmployer,
        esi_employee: c.esiEmployee,
        esi_employer: c.esiEmployer,
        professional_tax: c.pt,
        tds: c.tds,
        other_deduction: c.otherDed,
        allowances: c.totalAllowances,
        deductions: c.totalDeductions,
        net_salary: c.net,
        notes: payrollForm.notes || null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payroll_records"] });
      setPayrollDialogOpen(false);
      setPayrollForm({ employee_id: "", month: format(new Date(), "yyyy-MM"), hra: "0", da: "0", travel_allowance: "0", medical_allowance: "0", other_allowance: "0", pf_enabled: true, esi_enabled: true, professional_tax: "200", tds: "0", other_deduction: "0", notes: "" });
      toast({ title: "Payroll generated successfully" });
    },
    onError: (err: any) => toast({ title: "Error", description: err.message, variant: "destructive" }),
  });

  const resetEmpForm = () => setEmpForm({ full_name: "", email: "", phone: "", designation: "", department: "", salary_amount: "", bank_account: "", bank_name: "", uan_number: "", esi_number: "" });

  const openEditEmployee = (emp: Employee) => {
    setEditingEmployee(emp);
    setEmpForm({
      full_name: emp.full_name, email: emp.email || "", phone: emp.phone || "",
      designation: emp.designation, department: emp.department || "",
      salary_amount: String(emp.salary_amount), bank_account: emp.bank_account || "",
      bank_name: emp.bank_name || "", uan_number: emp.uan_number || "", esi_number: emp.esi_number || "",
    });
    setEmpDialogOpen(true);
  };

  // PDF Payslip generation
  const generatePayslipPDF = (record: PayrollRecord) => {
    const emp = record.employees;
    const empName = emp?.full_name || "Unknown";
    const totalDeductions = Number(record.pf_employee || 0) + Number(record.esi_employee || 0) + Number(record.professional_tax || 0) + Number(record.tds || 0) + Number(record.other_deduction || 0);

    const htmlContent = `<!DOCTYPE html><html><head><title>Payslip - ${empName} - ${record.month}</title>
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:'Segoe UI',Arial,sans-serif;padding:30px;color:#1a1a2e;font-size:13px}
.header{text-align:center;border-bottom:3px solid #16697a;padding-bottom:16px;margin-bottom:20px}
.header h1{font-size:24px;color:#16697a;margin-bottom:2px}
.header .subtitle{color:#666;font-size:12px}
.badge{display:inline-block;background:#16697a;color:white;padding:3px 14px;border-radius:20px;font-size:11px;margin-top:8px}
.emp-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:20px}
.emp-item{display:flex;gap:6px}
.emp-item .label{color:#888;min-width:100px;font-size:11px;text-transform:uppercase;letter-spacing:0.5px}
.emp-item .value{font-weight:600}
.two-col{display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-bottom:20px}
.section h3{font-size:13px;text-transform:uppercase;letter-spacing:1px;color:#16697a;margin-bottom:8px;padding-bottom:4px;border-bottom:1px solid #e0e0e0}
table{width:100%;border-collapse:collapse}
td{padding:6px 0;font-size:13px}
td:last-child{text-align:right;font-weight:600}
.total-row{border-top:2px solid #16697a;font-weight:700;font-size:14px}
.total-row td{padding-top:10px}
.net-box{background:#e8f4f8;border:2px solid #16697a;border-radius:8px;padding:16px;text-align:center;margin-bottom:16px}
.net-box .amount{font-size:24px;font-weight:800;color:#16697a}
.net-box .words{font-size:11px;color:#555;margin-top:4px;font-style:italic}
.employer-box{background:#f8f9fa;border-radius:8px;padding:12px;margin-bottom:16px}
.employer-box h4{font-size:11px;text-transform:uppercase;color:#888;margin-bottom:6px;letter-spacing:0.5px}
.employer-box .row{display:flex;justify-content:space-between;padding:3px 0;font-size:12px}
.footer{text-align:center;color:#999;font-size:10px;margin-top:20px;padding-top:16px;border-top:1px solid #eee}
@media print{body{padding:15px}}
</style></head><body>
<div class="header">
  <h1>HOSTYLIA</h1>
  <p class="subtitle">Hostel Management Suite</p>
  <span class="badge">PAYSLIP — ${record.month}</span>
</div>
<div class="emp-grid">
  <div class="emp-item"><span class="label">Employee</span><span class="value">${empName}</span></div>
  <div class="emp-item"><span class="label">Designation</span><span class="value">${emp?.designation || 'N/A'}</span></div>
  <div class="emp-item"><span class="label">Department</span><span class="value">${emp?.department || 'N/A'}</span></div>
  <div class="emp-item"><span class="label">Date of Joining</span><span class="value">${emp?.date_of_joining ? format(new Date(emp.date_of_joining), "dd MMM yyyy") : 'N/A'}</span></div>
  <div class="emp-item"><span class="label">UAN Number</span><span class="value">${emp?.uan_number || 'N/A'}</span></div>
  <div class="emp-item"><span class="label">ESI Number</span><span class="value">${emp?.esi_number || 'N/A'}</span></div>
  <div class="emp-item"><span class="label">Bank</span><span class="value">${emp?.bank_name || 'N/A'}</span></div>
  <div class="emp-item"><span class="label">Account No.</span><span class="value">${emp?.bank_account || 'N/A'}</span></div>
</div>
<div class="two-col">
  <div class="section">
    <h3>Earnings</h3>
    <table>
      <tr><td>Basic Salary</td><td>₹${fmt(record.basic_salary)}</td></tr>
      <tr><td>HRA</td><td>₹${fmt(record.hra)}</td></tr>
      <tr><td>Dearness Allowance</td><td>₹${fmt(record.da)}</td></tr>
      <tr><td>Travel Allowance</td><td>₹${fmt(record.travel_allowance)}</td></tr>
      <tr><td>Medical Allowance</td><td>₹${fmt(record.medical_allowance)}</td></tr>
      <tr><td>Other Allowance</td><td>₹${fmt(record.other_allowance)}</td></tr>
      <tr class="total-row"><td>Gross Salary</td><td>₹${fmt(record.gross_salary)}</td></tr>
    </table>
  </div>
  <div class="section">
    <h3>Deductions</h3>
    <table>
      <tr><td>PF (Employee)</td><td>₹${fmt(record.pf_employee)}</td></tr>
      <tr><td>ESI (Employee)</td><td>₹${fmt(record.esi_employee)}</td></tr>
      <tr><td>Professional Tax</td><td>₹${fmt(record.professional_tax)}</td></tr>
      <tr><td>TDS</td><td>₹${fmt(record.tds)}</td></tr>
      <tr><td>Other Deductions</td><td>₹${fmt(record.other_deduction)}</td></tr>
      <tr class="total-row"><td>Total Deductions</td><td>₹${fmt(totalDeductions)}</td></tr>
    </table>
  </div>
</div>
<div class="net-box">
  <div class="amount">Net Pay: ₹${fmt(record.net_salary)}</div>
  <div class="words">${numberToWords(Number(record.net_salary))}</div>
</div>
<div class="employer-box">
  <h4>Employer Contributions (Not deducted from salary)</h4>
  <div class="row"><span>PF (Employer — 12% of Basic)</span><span>₹${fmt(record.pf_employer)}</span></div>
  <div class="row"><span>ESI (Employer — 3.25% of Gross)</span><span>₹${fmt(record.esi_employer)}</span></div>
</div>
${record.notes ? `<p style="margin-bottom:12px;font-size:12px"><strong>Notes:</strong> ${record.notes}</p>` : ''}
<div class="footer">
  <p>This is a system-generated payslip from Hostylia Management Suite.</p>
  <p>Generated on ${format(new Date(), "dd MMM yyyy, hh:mm a")}</p>
</div>
</body></html>`;

    const printWindow = window.open("", "_blank");
    if (printWindow) {
      printWindow.document.write(htmlContent);
      printWindow.document.close();
      setTimeout(() => printWindow.print(), 500);
    }
  };

  const activeEmployees = employees.filter(e => e.status === "active");
  const totalSalaryBill = activeEmployees.reduce((sum, e) => sum + Number(e.salary_amount), 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Payroll Management</h1>
          <p className="text-muted-foreground text-sm">Manage employees, generate payslips with ESI & PF</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10"><Users className="h-5 w-5 text-primary" /></div>
            <div>
              <p className="text-sm text-muted-foreground">Total Employees</p>
              <p className="text-xl font-bold">{activeEmployees.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-green-500/10"><IndianRupee className="h-5 w-5 text-green-600" /></div>
            <div>
              <p className="text-sm text-muted-foreground">Monthly Salary Bill</p>
              <p className="text-xl font-bold">₹{totalSalaryBill.toLocaleString("en-IN")}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-500/10"><FileText className="h-5 w-5 text-blue-600" /></div>
            <div>
              <p className="text-sm text-muted-foreground">Payslips Generated</p>
              <p className="text-xl font-bold">{payrollRecords.length}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="employees" className="space-y-4">
        <TabsList>
          <TabsTrigger value="employees"><Users className="h-4 w-4 mr-1" /> Employees</TabsTrigger>
          <TabsTrigger value="payroll"><FileText className="h-4 w-4 mr-1" /> Payroll Records</TabsTrigger>
        </TabsList>

        {/* Employees Tab */}
        <TabsContent value="employees" className="space-y-4">
          <div className="flex justify-end">
            <Dialog open={empDialogOpen} onOpenChange={(open) => {
              setEmpDialogOpen(open);
              if (!open) { setEditingEmployee(null); resetEmpForm(); }
            }}>
              <DialogTrigger asChild>
                <Button><UserPlus className="h-4 w-4 mr-2" /> Add Employee</Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>{editingEmployee ? "Edit Employee" : "Add New Employee"}</DialogTitle>
                </DialogHeader>
                <form onSubmit={(e) => { e.preventDefault(); employeeMutation.mutate({ ...empForm, id: editingEmployee?.id }); }} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2 col-span-2">
                      <Label>Full Name *</Label>
                      <Input required value={empForm.full_name} onChange={e => setEmpForm(p => ({ ...p, full_name: e.target.value }))} />
                    </div>
                    <div className="space-y-2">
                      <Label>Email</Label>
                      <Input type="email" value={empForm.email} onChange={e => setEmpForm(p => ({ ...p, email: e.target.value }))} />
                    </div>
                    <div className="space-y-2">
                      <Label>Phone</Label>
                      <Input value={empForm.phone} onChange={e => setEmpForm(p => ({ ...p, phone: e.target.value }))} />
                    </div>
                    <div className="space-y-2">
                      <Label>Designation *</Label>
                      <Input required value={empForm.designation} onChange={e => setEmpForm(p => ({ ...p, designation: e.target.value }))} />
                    </div>
                    <div className="space-y-2">
                      <Label>Department</Label>
                      <Input value={empForm.department} onChange={e => setEmpForm(p => ({ ...p, department: e.target.value }))} />
                    </div>
                    <div className="space-y-2">
                      <Label>Monthly Salary (₹) *</Label>
                      <Input required type="number" min="0" value={empForm.salary_amount} onChange={e => setEmpForm(p => ({ ...p, salary_amount: e.target.value }))} />
                    </div>
                    <div className="space-y-2">
                      <Label>Bank Name</Label>
                      <Input value={empForm.bank_name} onChange={e => setEmpForm(p => ({ ...p, bank_name: e.target.value }))} />
                    </div>
                    <div className="space-y-2 col-span-2">
                      <Label>Bank Account No.</Label>
                      <Input value={empForm.bank_account} onChange={e => setEmpForm(p => ({ ...p, bank_account: e.target.value }))} />
                    </div>
                    <Separator className="col-span-2" />
                    <div className="space-y-2">
                      <Label>UAN Number (PF)</Label>
                      <Input placeholder="e.g. 100123456789" value={empForm.uan_number} onChange={e => setEmpForm(p => ({ ...p, uan_number: e.target.value }))} />
                    </div>
                    <div className="space-y-2">
                      <Label>ESI Number</Label>
                      <Input placeholder="e.g. 3112345678" value={empForm.esi_number} onChange={e => setEmpForm(p => ({ ...p, esi_number: e.target.value }))} />
                    </div>
                  </div>
                  <Button type="submit" className="w-full" disabled={employeeMutation.isPending}>
                    {editingEmployee ? "Update Employee" : "Add Employee"}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Designation</TableHead>
                      <TableHead>Department</TableHead>
                      <TableHead>Salary</TableHead>
                      <TableHead>UAN</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loadingEmployees ? (
                      <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">Loading...</TableCell></TableRow>
                    ) : employees.length === 0 ? (
                      <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">No employees added yet</TableCell></TableRow>
                    ) : employees.map(emp => (
                      <TableRow key={emp.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{emp.full_name}</p>
                            {emp.email && <p className="text-xs text-muted-foreground">{emp.email}</p>}
                          </div>
                        </TableCell>
                        <TableCell>{emp.designation}</TableCell>
                        <TableCell>{emp.department || "-"}</TableCell>
                        <TableCell className="font-semibold">₹{Number(emp.salary_amount).toLocaleString("en-IN")}</TableCell>
                        <TableCell className="text-xs text-muted-foreground">{emp.uan_number || "-"}</TableCell>
                        <TableCell>
                          <Badge variant={emp.status === "active" ? "default" : "secondary"}>
                            {emp.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            <Button variant="ghost" size="icon" onClick={() => openEditEmployee(emp)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="text-destructive" onClick={() => deleteEmployeeMutation.mutate(emp.id)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Payroll Records Tab */}
        <TabsContent value="payroll" className="space-y-4">
          <div className="flex justify-end">
            <Dialog open={payrollDialogOpen} onOpenChange={setPayrollDialogOpen}>
              <DialogTrigger asChild>
                <Button><Plus className="h-4 w-4 mr-2" /> Generate Payroll</Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Generate Payroll</DialogTitle>
                </DialogHeader>
                <form onSubmit={(e) => { e.preventDefault(); payrollMutation.mutate(); }} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Employee *</Label>
                      <Select value={payrollForm.employee_id} onValueChange={v => setPayrollForm(p => ({ ...p, employee_id: v }))}>
                        <SelectTrigger><SelectValue placeholder="Select employee" /></SelectTrigger>
                        <SelectContent>
                          {activeEmployees.map(emp => (
                            <SelectItem key={emp.id} value={emp.id}>{emp.full_name} — ₹{Number(emp.salary_amount).toLocaleString("en-IN")}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Month *</Label>
                      <Input type="month" required value={payrollForm.month} onChange={e => setPayrollForm(p => ({ ...p, month: e.target.value }))} />
                    </div>
                  </div>

                  {selectedEmployee && (
                    <>
                      {/* Earnings */}
                      <div>
                        <h4 className="text-sm font-semibold text-foreground mb-3">Earnings</h4>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <Label className="text-xs">Basic Salary</Label>
                            <Input disabled value={selectedEmployee.salary_amount} />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs">HRA (₹)</Label>
                            <Input type="number" min="0" value={payrollForm.hra} onChange={e => setPayrollForm(p => ({ ...p, hra: e.target.value }))} />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs">DA (₹)</Label>
                            <Input type="number" min="0" value={payrollForm.da} onChange={e => setPayrollForm(p => ({ ...p, da: e.target.value }))} />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs">Travel Allowance (₹)</Label>
                            <Input type="number" min="0" value={payrollForm.travel_allowance} onChange={e => setPayrollForm(p => ({ ...p, travel_allowance: e.target.value }))} />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs">Medical Allowance (₹)</Label>
                            <Input type="number" min="0" value={payrollForm.medical_allowance} onChange={e => setPayrollForm(p => ({ ...p, medical_allowance: e.target.value }))} />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs">Other Allowance (₹)</Label>
                            <Input type="number" min="0" value={payrollForm.other_allowance} onChange={e => setPayrollForm(p => ({ ...p, other_allowance: e.target.value }))} />
                          </div>
                        </div>
                        <p className="text-sm font-semibold mt-2 text-primary">Gross Salary: ₹{payrollCalc.gross.toLocaleString("en-IN")}</p>
                      </div>

                      <Separator />

                      {/* Deductions */}
                      <div>
                        <h4 className="text-sm font-semibold text-foreground mb-3">Deductions</h4>
                        <div className="space-y-3">
                          <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                            <div className="flex items-center gap-2">
                              <Checkbox checked={payrollForm.pf_enabled} onCheckedChange={v => setPayrollForm(p => ({ ...p, pf_enabled: !!v }))} />
                              <div>
                                <p className="text-sm font-medium">PF (Employee — 12% of Basic)</p>
                                <p className="text-xs text-muted-foreground">Employer also contributes 12%</p>
                              </div>
                            </div>
                            <span className="font-semibold text-sm">₹{payrollCalc.pfEmployee.toLocaleString("en-IN")}</span>
                          </div>
                          <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                            <div className="flex items-center gap-2">
                              <Checkbox checked={payrollForm.esi_enabled} onCheckedChange={v => setPayrollForm(p => ({ ...p, esi_enabled: !!v }))} />
                              <div>
                                <p className="text-sm font-medium">ESI (Employee — 0.75% of Gross)</p>
                                <p className="text-xs text-muted-foreground">
                                  {payrollCalc.gross > 21000 ? "Not applicable (Gross > ₹21,000)" : "Employer contributes 3.25%"}
                                </p>
                              </div>
                            </div>
                            <span className="font-semibold text-sm">₹{payrollCalc.esiEmployee.toLocaleString("en-IN")}</span>
                          </div>
                          <div className="grid grid-cols-3 gap-3">
                            <div className="space-y-1">
                              <Label className="text-xs">Professional Tax (₹)</Label>
                              <Input type="number" min="0" value={payrollForm.professional_tax} onChange={e => setPayrollForm(p => ({ ...p, professional_tax: e.target.value }))} />
                            </div>
                            <div className="space-y-1">
                              <Label className="text-xs">TDS (₹)</Label>
                              <Input type="number" min="0" value={payrollForm.tds} onChange={e => setPayrollForm(p => ({ ...p, tds: e.target.value }))} />
                            </div>
                            <div className="space-y-1">
                              <Label className="text-xs">Other Deductions (₹)</Label>
                              <Input type="number" min="0" value={payrollForm.other_deduction} onChange={e => setPayrollForm(p => ({ ...p, other_deduction: e.target.value }))} />
                            </div>
                          </div>
                        </div>
                      </div>

                      <Separator />

                      {/* Summary */}
                      <div className="bg-muted/30 rounded-lg p-4 space-y-2">
                        <div className="flex justify-between text-sm"><span>Gross Salary</span><span className="font-semibold">₹{payrollCalc.gross.toLocaleString("en-IN")}</span></div>
                        <div className="flex justify-between text-sm text-destructive"><span>Total Deductions</span><span className="font-semibold">- ₹{payrollCalc.totalDeductions.toLocaleString("en-IN")}</span></div>
                        <Separator />
                        <div className="flex justify-between text-base font-bold text-primary"><span>Net Salary</span><span>₹{payrollCalc.net.toLocaleString("en-IN")}</span></div>
                        <p className="text-xs text-muted-foreground">Employer PF: ₹{payrollCalc.pfEmployer.toLocaleString("en-IN")} | Employer ESI: ₹{payrollCalc.esiEmployer.toLocaleString("en-IN")}</p>
                      </div>
                    </>
                  )}

                  <div className="space-y-2">
                    <Label>Notes</Label>
                    <Textarea value={payrollForm.notes} onChange={e => setPayrollForm(p => ({ ...p, notes: e.target.value }))} placeholder="Optional notes..." />
                  </div>
                  <Button type="submit" className="w-full" disabled={payrollMutation.isPending || !payrollForm.employee_id}>
                    Generate Payroll
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Employee</TableHead>
                      <TableHead>Month</TableHead>
                      <TableHead>Gross</TableHead>
                      <TableHead>PF</TableHead>
                      <TableHead>ESI</TableHead>
                      <TableHead>Deductions</TableHead>
                      <TableHead>Net Salary</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loadingPayroll ? (
                      <TableRow><TableCell colSpan={9} className="text-center py-8 text-muted-foreground">Loading...</TableCell></TableRow>
                    ) : payrollRecords.length === 0 ? (
                      <TableRow><TableCell colSpan={9} className="text-center py-8 text-muted-foreground">No payroll records yet</TableCell></TableRow>
                    ) : payrollRecords.map(record => (
                      <TableRow key={record.id}>
                        <TableCell className="font-medium">{(record.employees as any)?.full_name || "Unknown"}</TableCell>
                        <TableCell>{record.month}</TableCell>
                        <TableCell>₹{Number(record.gross_salary || 0).toLocaleString("en-IN")}</TableCell>
                        <TableCell className="text-muted-foreground">₹{Number(record.pf_employee || 0).toLocaleString("en-IN")}</TableCell>
                        <TableCell className="text-muted-foreground">₹{Number(record.esi_employee || 0).toLocaleString("en-IN")}</TableCell>
                        <TableCell className="text-destructive">-₹{Number(record.deductions || 0).toLocaleString("en-IN")}</TableCell>
                        <TableCell className="font-bold">₹{Number(record.net_salary).toLocaleString("en-IN")}</TableCell>
                        <TableCell><Badge variant="outline">{record.status}</Badge></TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="icon" onClick={() => generatePayslipPDF(record)} title="Download Payslip">
                            <Download className="h-4 w-4" />
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
      </Tabs>
    </div>
  );
};

export default Payroll;
