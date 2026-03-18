import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useProperties } from "@/hooks/useProperties";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  UserPlus, FileText, Users, IndianRupee, Download, Trash2, Edit, Plus, Briefcase,
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
  status: string | null;
  created_at: string;
}

interface PayrollRecord {
  id: string;
  employee_id: string;
  property_id: string;
  month: string;
  basic_salary: number;
  allowances: number | null;
  deductions: number | null;
  net_salary: number;
  status: string | null;
  notes: string | null;
  generated_at: string | null;
  employees?: Employee;
}

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
    salary_amount: "", bank_account: "", bank_name: "",
  });

  // Payroll generation dialog
  const [payrollDialogOpen, setPayrollDialogOpen] = useState(false);
  const [payrollForm, setPayrollForm] = useState({
    employee_id: "", month: format(new Date(), "yyyy-MM"),
    allowances: "0", deductions: "0", notes: "",
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
    mutationFn: async (formData: typeof payrollForm) => {
      const employee = employees.find(e => e.id === formData.employee_id);
      if (!employee) throw new Error("Employee not found");
      const allowances = parseFloat(formData.allowances) || 0;
      const deductions = parseFloat(formData.deductions) || 0;
      const netSalary = employee.salary_amount + allowances - deductions;
      const { error } = await supabase.from("payroll_records").insert({
        employee_id: formData.employee_id,
        property_id: selectedPropertyId,
        month: formData.month,
        basic_salary: employee.salary_amount,
        allowances,
        deductions,
        net_salary: netSalary,
        notes: formData.notes || null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payroll_records"] });
      setPayrollDialogOpen(false);
      setPayrollForm({ employee_id: "", month: format(new Date(), "yyyy-MM"), allowances: "0", deductions: "0", notes: "" });
      toast({ title: "Payroll generated" });
    },
    onError: (err: any) => toast({ title: "Error", description: err.message, variant: "destructive" }),
  });

  const resetEmpForm = () => setEmpForm({ full_name: "", email: "", phone: "", designation: "", department: "", salary_amount: "", bank_account: "", bank_name: "" });

  const openEditEmployee = (emp: Employee) => {
    setEditingEmployee(emp);
    setEmpForm({
      full_name: emp.full_name, email: emp.email || "", phone: emp.phone || "",
      designation: emp.designation, department: emp.department || "",
      salary_amount: String(emp.salary_amount), bank_account: emp.bank_account || "",
      bank_name: emp.bank_name || "",
    });
    setEmpDialogOpen(true);
  };

  // PDF generation
  const generatePayslipPDF = (record: PayrollRecord) => {
    const emp = record.employees;
    const empName = emp?.full_name || "Unknown";
    const empDesignation = emp?.designation || "";
    const empDepartment = emp?.department || "";

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Payslip - ${empName} - ${record.month}</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: 'Segoe UI', Arial, sans-serif; padding: 40px; color: #1a1a2e; }
          .header { text-align: center; border-bottom: 3px solid #16697a; padding-bottom: 20px; margin-bottom: 30px; }
          .header h1 { font-size: 28px; color: #16697a; }
          .header p { color: #666; margin-top: 4px; }
          .badge { display: inline-block; background: #16697a; color: white; padding: 4px 16px; border-radius: 20px; font-size: 13px; margin-top: 10px; }
          .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 30px; }
          .info-box { background: #f8f9fa; border-radius: 8px; padding: 16px; }
          .info-box h3 { font-size: 12px; text-transform: uppercase; color: #888; margin-bottom: 8px; letter-spacing: 1px; }
          .info-box p { font-size: 15px; font-weight: 600; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
          th { background: #16697a; color: white; padding: 12px 16px; text-align: left; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px; }
          td { padding: 12px 16px; border-bottom: 1px solid #eee; font-size: 14px; }
          tr:last-child td { border-bottom: none; }
          .amount { text-align: right; font-weight: 600; }
          .net-row { background: #e8f4f8; font-weight: 700; font-size: 16px; }
          .net-row td { border-top: 2px solid #16697a; }
          .footer { text-align: center; color: #999; font-size: 12px; margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee; }
          @media print { body { padding: 20px; } }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Hostylia</h1>
          <p>Payslip for the month of <strong>${record.month}</strong></p>
          <span class="badge">${record.status === 'generated' ? 'Generated' : record.status}</span>
        </div>
        <div class="info-grid">
          <div class="info-box"><h3>Employee Name</h3><p>${empName}</p></div>
          <div class="info-box"><h3>Designation</h3><p>${empDesignation || 'N/A'}</p></div>
          <div class="info-box"><h3>Department</h3><p>${empDepartment || 'N/A'}</p></div>
          <div class="info-box"><h3>Generated On</h3><p>${record.generated_at ? format(new Date(record.generated_at), "dd MMM yyyy") : 'N/A'}</p></div>
        </div>
        <table>
          <thead><tr><th>Component</th><th style="text-align:right">Amount (₹)</th></tr></thead>
          <tbody>
            <tr><td>Basic Salary</td><td class="amount">₹${Number(record.basic_salary).toLocaleString('en-IN')}</td></tr>
            <tr><td>Allowances</td><td class="amount">₹${Number(record.allowances || 0).toLocaleString('en-IN')}</td></tr>
            <tr><td>Deductions</td><td class="amount">- ₹${Number(record.deductions || 0).toLocaleString('en-IN')}</td></tr>
            <tr class="net-row"><td>Net Salary</td><td class="amount">₹${Number(record.net_salary).toLocaleString('en-IN')}</td></tr>
          </tbody>
        </table>
        ${record.notes ? `<p style="margin-bottom:20px"><strong>Notes:</strong> ${record.notes}</p>` : ''}
        <div class="footer">
          <p>This is a system-generated payslip from Hostylia Management Suite.</p>
          <p>Generated on ${format(new Date(), "dd MMM yyyy, hh:mm a")}</p>
        </div>
      </body>
      </html>
    `;

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
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Payroll Management</h1>
          <p className="text-muted-foreground text-sm">Manage employees and generate payslips</p>
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
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loadingEmployees ? (
                      <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">Loading...</TableCell></TableRow>
                    ) : employees.length === 0 ? (
                      <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">No employees added yet</TableCell></TableRow>
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
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Generate Payroll</DialogTitle>
                </DialogHeader>
                <form onSubmit={(e) => { e.preventDefault(); payrollMutation.mutate(payrollForm); }} className="space-y-4">
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
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Allowances (₹)</Label>
                      <Input type="number" min="0" value={payrollForm.allowances} onChange={e => setPayrollForm(p => ({ ...p, allowances: e.target.value }))} />
                    </div>
                    <div className="space-y-2">
                      <Label>Deductions (₹)</Label>
                      <Input type="number" min="0" value={payrollForm.deductions} onChange={e => setPayrollForm(p => ({ ...p, deductions: e.target.value }))} />
                    </div>
                  </div>
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
                      <TableHead>Basic</TableHead>
                      <TableHead>Allowances</TableHead>
                      <TableHead>Deductions</TableHead>
                      <TableHead>Net Salary</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loadingPayroll ? (
                      <TableRow><TableCell colSpan={8} className="text-center py-8 text-muted-foreground">Loading...</TableCell></TableRow>
                    ) : payrollRecords.length === 0 ? (
                      <TableRow><TableCell colSpan={8} className="text-center py-8 text-muted-foreground">No payroll records yet</TableCell></TableRow>
                    ) : payrollRecords.map(record => (
                      <TableRow key={record.id}>
                        <TableCell className="font-medium">{(record.employees as any)?.full_name || "Unknown"}</TableCell>
                        <TableCell>{record.month}</TableCell>
                        <TableCell>₹{Number(record.basic_salary).toLocaleString("en-IN")}</TableCell>
                        <TableCell className="text-green-600">+₹{Number(record.allowances || 0).toLocaleString("en-IN")}</TableCell>
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
