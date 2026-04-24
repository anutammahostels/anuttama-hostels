import { useState, useMemo, useEffect } from "react";
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
  UserPlus, FileText, Users, IndianRupee, Download, Trash2, Edit, Plus, Lock, Unlock, PlayCircle, Calculator,
  AlertTriangle,
} from "lucide-react";
import { format } from "date-fns";
import { exportToExcel } from "@/lib/exportExcel";

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
  bank_ifsc: string | null;
  pan_number: string | null;
  last_working_day: string | null;
  uan_number: string | null;
  esi_number: string | null;
  status: string | null;
  created_at: string;
  employee_number: string | null;
  gender: string | null;
  work_location: string | null;
  hra: number;
  special_allowance: number;
  other_additions: number;
  employer_pf_contribution: number;
}

interface PayrollRecord {
  id: string;
  employee_id: string;
  property_id: string;
  month: string;
  basic_salary: number;
  hra: number;
  special_allowance: number;
  professional_fees: number;
  contract_fees: number;
  other_additions: number;
  ot: number;
  incentives: number;
  bonus: number;
  gross_salary: number;
  pf_employee: number;
  pf_employer: number;
  esi_employee: number;
  esi_employer: number;
  lwf: number;
  salary_advance: number;
  professional_tax: number;
  tds: number;
  tds_194c: number;
  tds_194j: number;
  other_deduction: number;
  total_days: number;
  lop: number;
  days_worked: number;
  allowances: number | null;
  deductions: number | null;
  net_salary: number;
  status: string | null;
  notes: string | null;
  generated_at: string | null;
  is_locked: boolean;
  employees?: Employee;
}

// ── Validation helpers ──
const PAN_REGEX = /^[A-Z]{5}[0-9]{4}[A-Z]$/;
const IFSC_REGEX = /^[A-Z]{4}0[A-Z0-9]{6}$/;

const validatePAN = (v: string) => !v || PAN_REGEX.test(v.toUpperCase());
const validateIFSC = (v: string) => !v || IFSC_REGEX.test(v.toUpperCase());

// ── Auto PT (Karnataka slabs) ──
// Accepts either ISO date "YYYY-MM-DD", legacy "YYYY-MM", or a period key.
const calculatePT = (gross: number, periodOrMonth: string): number => {
  if (gross < 25000) return 0;
  // Extract month number from the start of the string (works for YYYY-MM-DD, YYYY-MM, and period keys)
  const monthNum = parseInt(periodOrMonth.split("-")[1] || "0", 10);
  // February → ₹300, else ₹200
  return monthNum === 2 ? 300 : 200;
};

// ── TDS Calculator (New Tax Regime FY 2025-26) ──
const calculateMonthlyTDS = (monthlyGross: number): { annualTax: number; monthlyTds: number; taxableIncome: number } => {
  const annualGross = monthlyGross * 12;
  const standardDeduction = 75000;
  const taxableIncome = Math.max(annualGross - standardDeduction, 0);

  // Section 87A rebate
  if (taxableIncome <= 700000) return { annualTax: 0, monthlyTds: 0, taxableIncome };

  // Slab rates
  let tax = 0;
  const slabs = [
    { limit: 400000, rate: 0 },
    { limit: 400000, rate: 0.05 },
    { limit: 400000, rate: 0.10 },
    { limit: 400000, rate: 0.15 },
    { limit: 400000, rate: 0.20 },
    { limit: 400000, rate: 0.25 },
    { limit: Infinity, rate: 0.30 },
  ];
  let remaining = taxableIncome;
  for (const slab of slabs) {
    if (remaining <= 0) break;
    const taxable = Math.min(remaining, slab.limit);
    tax += taxable * slab.rate;
    remaining -= taxable;
  }

  // 4% Health & Education Cess
  const cess = Math.round(tax * 0.04);
  const annualTax = Math.round(tax + cess);
  const monthlyTds = Math.round(annualTax / 12);
  return { annualTax, monthlyTds, taxableIncome };
};

// ── LOP deduction (Gross / Calendar Days × LOP Days) ──
const calculateLOPDeduction = (gross: number, calendarDays: number, lopDays: number): number => {
  if (lopDays <= 0 || calendarDays <= 0) return 0;
  return Math.round((gross / calendarDays) * lopDays);
};

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
const maskAccount = (acc: string | null) => acc && acc.length > 4 ? "XXXX" + acc.slice(-4) : acc || "N/A";

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
    salary_amount: "", bank_account: "", bank_name: "", bank_ifsc: "", pan_number: "",
    uan_number: "", esi_number: "",
    employee_number: "", gender: "", work_location: "",
    hra: "0", special_allowance: "0", other_additions: "0", employer_pf_contribution: "0",
    date_of_joining: null as Date | null,
  });
  const [empFormErrors, setEmpFormErrors] = useState<{ pan?: string; ifsc?: string }>({});

  // Payroll generation dialog
  const [payrollDialogOpen, setPayrollDialogOpen] = useState(false);
  const [bulkDialogOpen, setBulkDialogOpen] = useState(false);
  const [netPayWarningOpen, setNetPayWarningOpen] = useState(false);
  const [tdsCalcOpen, setTdsCalcOpen] = useState(false);
  const todayIso = format(new Date(), "yyyy-MM-dd");
  const monthEndIso = format(new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0), "yyyy-MM-dd");
  const monthStartIso = format(new Date(new Date().getFullYear(), new Date().getMonth(), 1), "yyyy-MM-dd");
  const defaultPayrollForm = {
    employee_id: "", month: format(new Date(), "yyyy-MM"),
    hra: "0", special_allowance: "0", professional_fees: "0", contract_fees: "0",
    other_additions: "0", ot: "0", incentives: "0", bonus: "0",
    pf_enabled: true, esi_enabled: true,
    lwf: "0", salary_advance: "0", professional_tax: "200", tds: "0",
    tds_194c: "0", tds_194j: "0", other_deduction: "0",
    total_days: "30", lop: "0",
    notes: "",
  };
  const [payrollForm, setPayrollForm] = useState(defaultPayrollForm);
  const [bulkStartDate, setBulkStartDate] = useState(monthStartIso);
  const [bulkEndDate, setBulkEndDate] = useState(monthEndIso);

  // Multi-employee selection for Generate Payroll dialog
  const [selectedEmployeeIds, setSelectedEmployeeIds] = useState<string[]>([]);
  const [payrollStartDate, setPayrollStartDate] = useState(monthStartIso);
  const [payrollEndDate, setPayrollEndDate] = useState(monthEndIso);

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
      return data as unknown as Employee[];
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
      return data as unknown as PayrollRecord[];
    },
    enabled: !!selectedPropertyId,
  });

  // Selected employee for payroll calc (when exactly 1 selected)
  const selectedEmployee = useMemo(() => {
    const id = selectedEmployeeIds.length === 1 ? selectedEmployeeIds[0] : payrollForm.employee_id;
    return employees.find(e => e.id === id);
  }, [employees, selectedEmployeeIds, payrollForm.employee_id]);

  // Auto-populate from employee master when employee selected
  useEffect(() => {
    if (selectedEmployee) {
      setPayrollForm(p => ({
        ...p,
        hra: String(selectedEmployee.hra || 0),
        special_allowance: String(selectedEmployee.special_allowance || 0),
        other_additions: String(selectedEmployee.other_additions || 0),
      }));
    }
  }, [selectedEmployee?.id]);

  // Auto-set total days from selected start/end date range
  useEffect(() => {
    if (payrollStartDate && payrollEndDate && payrollStartDate <= payrollEndDate) {
      setPayrollForm(p => ({ ...p, total_days: String(daysBetween(payrollStartDate, payrollEndDate)) }));
    }
  }, [payrollStartDate, payrollEndDate, selectedEmployeeIds.length]);

  // Auto-calculate PT when gross changes (uses period start date for Feb rule)
  useEffect(() => {
    if (selectedEmployee) {
      const basic = selectedEmployee.salary_amount || 0;
      const hra = parseFloat(payrollForm.hra) || 0;
      const sa = parseFloat(payrollForm.special_allowance) || 0;
      const pf = parseFloat(payrollForm.professional_fees) || 0;
      const cf = parseFloat(payrollForm.contract_fees) || 0;
      const oa = parseFloat(payrollForm.other_additions) || 0;
      const ot = parseFloat(payrollForm.ot) || 0;
      const inc = parseFloat(payrollForm.incentives) || 0;
      const bon = parseFloat(payrollForm.bonus) || 0;
      const gross = basic + hra + sa + pf + cf + oa + ot + inc + bon;
      const autoPT = calculatePT(gross, payrollStartDate);
      setPayrollForm(p => ({ ...p, professional_tax: String(autoPT) }));
    }
  }, [selectedEmployee?.id, payrollForm.hra, payrollForm.special_allowance, payrollForm.professional_fees, payrollForm.contract_fees, payrollForm.other_additions, payrollForm.ot, payrollForm.incentives, payrollForm.bonus, payrollForm.month]);

  // Auto-calculations with PF cap at ₹1,800 and proper LOP
  const payrollCalc = useMemo(() => {
    const basic = selectedEmployee?.salary_amount || 0;
    const hra = parseFloat(payrollForm.hra) || 0;
    const specialAllowance = parseFloat(payrollForm.special_allowance) || 0;
    const professionalFees = parseFloat(payrollForm.professional_fees) || 0;
    const contractFees = parseFloat(payrollForm.contract_fees) || 0;
    const otherAdditions = parseFloat(payrollForm.other_additions) || 0;
    const ot = parseFloat(payrollForm.ot) || 0;
    const incentives = parseFloat(payrollForm.incentives) || 0;
    const bonus = parseFloat(payrollForm.bonus) || 0;
    const gross = basic + hra + specialAllowance + professionalFees + contractFees + otherAdditions + ot + incentives + bonus;

    // PF capped at ₹1,800
    const pfEmployee = payrollForm.pf_enabled ? Math.min(Math.round(basic * 0.12), 1800) : 0;
    const pfEmployer = payrollForm.pf_enabled ? Math.min(Math.round(basic * 0.12), 1800) : 0;
    const esiEmployee = payrollForm.esi_enabled && gross <= 21000 ? Math.round(gross * 0.0075) : 0;
    const esiEmployer = payrollForm.esi_enabled && gross <= 21000 ? Math.round(gross * 0.0325) : 0;
    const lwf = parseFloat(payrollForm.lwf) || 0;
    const salaryAdvance = parseFloat(payrollForm.salary_advance) || 0;
    const pt = parseFloat(payrollForm.professional_tax) || 0;
    const tds = parseFloat(payrollForm.tds) || 0;
    const tds194c = parseFloat(payrollForm.tds_194c) || 0;
    const tds194j = parseFloat(payrollForm.tds_194j) || 0;
    const otherDed = parseFloat(payrollForm.other_deduction) || 0;

    const totalDays = parseInt(payrollForm.total_days) || 30;
    const lop = parseInt(payrollForm.lop) || 0;
    const daysWorked = totalDays - lop;

    // LOP deduction = (Gross / Calendar Days) × LOP Days
    const lopDeduction = calculateLOPDeduction(gross, totalDays, lop);

    const totalDeductions = pfEmployee + esiEmployee + lwf + salaryAdvance + pt + tds + tds194c + tds194j + otherDed;
    const net = Math.round(gross - totalDeductions - lopDeduction);

    return {
      basic, hra, specialAllowance, professionalFees, contractFees, otherAdditions, ot, incentives, bonus, gross,
      pfEmployee, pfEmployer, esiEmployee, esiEmployer, lwf, salaryAdvance, pt, tds, tds194c, tds194j, otherDed,
      totalDeductions, totalDays, lop, daysWorked, lopDeduction, net,
    };
  }, [selectedEmployee, payrollForm]);

  // TDS calculation result
  const tdsCalcResult = useMemo(() => {
    if (!selectedEmployee) return null;
    return calculateMonthlyTDS(payrollCalc.gross);
  }, [payrollCalc.gross, selectedEmployee]);

  // Create/Update employee
  const employeeMutation = useMutation({
    mutationFn: async (formData: typeof empForm & { id?: string }) => {
      // Validate PAN & IFSC
      const errors: { pan?: string; ifsc?: string } = {};
      if (formData.pan_number && !validatePAN(formData.pan_number)) {
        errors.pan = "Invalid PAN format (e.g. ABCDE1234F)";
      }
      if (formData.bank_ifsc && !validateIFSC(formData.bank_ifsc)) {
        errors.ifsc = "Invalid IFSC format (e.g. SBIN0001234)";
      }
      if (Object.keys(errors).length > 0) {
        setEmpFormErrors(errors);
        throw new Error("Please fix validation errors");
      }
      setEmpFormErrors({});

      const payload: any = {
        property_id: selectedPropertyId,
        full_name: formData.full_name,
        email: formData.email || null,
        phone: formData.phone || null,
        designation: formData.designation,
        department: formData.department || null,
        date_of_joining: formData.date_of_joining ? format(formData.date_of_joining, "yyyy-MM-dd") : null,
        salary_amount: parseFloat(formData.salary_amount) || 0,
        bank_account: formData.bank_account || null,
        bank_name: formData.bank_name || null,
        bank_ifsc: formData.bank_ifsc ? formData.bank_ifsc.toUpperCase() : null,
        pan_number: formData.pan_number ? formData.pan_number.toUpperCase() : null,
        uan_number: formData.uan_number || null,
        esi_number: formData.esi_number || null,
        employee_number: formData.employee_number || null,
        gender: formData.gender || null,
        work_location: formData.work_location || null,
        hra: parseFloat(formData.hra) || 0,
        special_allowance: parseFloat(formData.special_allowance) || 0,
        other_additions: parseFloat(formData.other_additions) || 0,
        employer_pf_contribution: parseFloat(formData.employer_pf_contribution) || 0,
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

  // Generate payroll for single employee — with net pay warning
  const doGeneratePayroll = async () => {
    if (!selectedEmployee) throw new Error("Employee not found");
    const periodKey = buildPeriodKey(payrollStartDate, payrollEndDate);
    const existingLocked = payrollRecords.find(r => r.month === periodKey && r.is_locked);
    if (existingLocked) throw new Error("This period is locked. Cannot generate new payroll.");
    const c = payrollCalc;
    const { error } = await supabase.from("payroll_records").insert({
      employee_id: payrollForm.employee_id,
      property_id: selectedPropertyId,
      month: periodKey,
      basic_salary: c.basic,
      hra: c.hra,
      special_allowance: c.specialAllowance,
      professional_fees: c.professionalFees,
      contract_fees: c.contractFees,
      other_additions: c.otherAdditions,
      ot: c.ot,
      incentives: c.incentives,
      bonus: c.bonus,
      gross_salary: c.gross,
      pf_employee: c.pfEmployee,
      pf_employer: c.pfEmployer,
      esi_employee: c.esiEmployee,
      esi_employer: c.esiEmployer,
      lwf: c.lwf,
      salary_advance: c.salaryAdvance,
      professional_tax: c.pt,
      tds: c.tds,
      tds_194c: c.tds194c,
      tds_194j: c.tds194j,
      other_deduction: c.otherDed,
      total_days: c.totalDays,
      lop: c.lop,
      days_worked: c.daysWorked,
      allowances: c.hra + c.specialAllowance + c.professionalFees + c.contractFees + c.otherAdditions + c.ot + c.incentives + c.bonus,
      deductions: c.totalDeductions + c.lopDeduction,
      net_salary: c.net,
      notes: payrollForm.notes || null,
    });
    if (error) throw error;
  };

  const payrollMutation = useMutation({
    mutationFn: async () => {
      const isSingle = selectedEmployeeIds.length === 1;

      if (isSingle) {
        // Single employee with detailed form — use existing logic
        if (payrollCalc.net < 0) {
          setNetPayWarningOpen(true);
          throw new Error("__NET_PAY_WARNING__");
        }
        // Set employee_id from selectedEmployeeIds for doGeneratePayroll
        payrollForm.employee_id = selectedEmployeeIds[0];
        await doGeneratePayroll();
      } else {
        // Multi-employee bulk: ONE record per employee covering the full date range
        if (selectedEmployeeIds.length === 0) throw new Error("No employees selected");
        if (!payrollStartDate || !payrollEndDate || payrollStartDate > payrollEndDate) {
          throw new Error("Invalid date range");
        }
        const periodKey = buildPeriodKey(payrollStartDate, payrollEndDate);
        if (isMonthLocked(periodKey)) {
          throw new Error("This period is already locked. Unlock it first to regenerate.");
        }
        const totalDays = daysBetween(payrollStartDate, payrollEndDate);

        const selectedEmps = activeEmployees.filter(e => selectedEmployeeIds.includes(e.id));
        const records = selectedEmps.map(emp => {
          const basic = emp.salary_amount || 0;
          const hra = emp.hra || 0;
          const sa = emp.special_allowance || 0;
          const oa = emp.other_additions || 0;
          const gross = basic + hra + sa + oa;
          const pfEmp = Math.min(Math.round(basic * 0.12), 1800);
          const pfEr = Math.min(Math.round(basic * 0.12), 1800);
          const esiEmp = gross <= 21000 ? Math.round(gross * 0.0075) : 0;
          const esiEr = gross <= 21000 ? Math.round(gross * 0.0325) : 0;
          const pt = calculatePT(gross, payrollStartDate);
          const totalDed = pfEmp + esiEmp + pt;
          const net = Math.round(gross - totalDed);
          return {
            employee_id: emp.id, property_id: selectedPropertyId, month: periodKey,
            basic_salary: basic, hra, special_allowance: sa, other_additions: oa,
            professional_fees: 0, contract_fees: 0, ot: 0, incentives: 0, bonus: 0,
            gross_salary: gross, pf_employee: pfEmp, pf_employer: pfEr,
            esi_employee: esiEmp, esi_employer: esiEr, lwf: 0, salary_advance: 0,
            professional_tax: pt, tds: 0, tds_194c: 0, tds_194j: 0, other_deduction: 0,
            total_days: totalDays, lop: 0, days_worked: totalDays,
            allowances: hra + sa + oa, deductions: totalDed, net_salary: net,
          };
        });
        if (records.length === 0) return 0;
        const { error } = await supabase.from("payroll_records").insert(records);
        if (error) throw error;
        return records.length;
      }
    },
    onSuccess: (count) => {
      queryClient.invalidateQueries({ queryKey: ["payroll_records"] });
      setPayrollDialogOpen(false);
      setPayrollForm(defaultPayrollForm);
      setSelectedEmployeeIds([]);
      const msg = selectedEmployeeIds.length === 1
        ? "Payroll generated successfully"
        : `Payroll generated: ${count} records`;
      toast({ title: msg });
    },
    onError: (err: any) => {
      if (err.message === "__NET_PAY_WARNING__") return;
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });

  const confirmNegativePayroll = useMutation({
    mutationFn: () => {
      payrollForm.employee_id = selectedEmployeeIds[0];
      return doGeneratePayroll();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payroll_records"] });
      setPayrollDialogOpen(false);
      setNetPayWarningOpen(false);
      setPayrollForm(defaultPayrollForm);
      setSelectedEmployeeIds([]);
      toast({ title: "Payroll generated (negative net pay)" });
    },
    onError: (err: any) => toast({ title: "Error", description: err.message, variant: "destructive" }),
  });

  // ── Period helpers (date-range payroll) ──
  // The DB `month` text column stores either a legacy "YYYY-MM" or a period key "YYYY-MM-DD_to_YYYY-MM-DD".
  const buildPeriodKey = (start: string, end: string) => `${start}_to_${end}`;

  const parsePeriodKey = (m: string): { start: Date; end: Date } => {
    if (m && m.includes("_to_")) {
      const [s, e] = m.split("_to_");
      return { start: new Date(s), end: new Date(e) };
    }
    // Backward compat: legacy "YYYY-MM"
    const [y, mo] = (m || "").split("-").map(Number);
    if (!y || !mo) return { start: new Date(), end: new Date() };
    return { start: new Date(y, mo - 1, 1), end: new Date(y, mo, 0) };
  };

  const daysBetween = (start: string, end: string): number => {
    const s = new Date(start);
    const e = new Date(end);
    if (isNaN(s.getTime()) || isNaN(e.getTime())) return 0;
    return Math.max(1, Math.round((e.getTime() - s.getTime()) / 86400000) + 1);
  };

  const formatPeriodDisplay = (m: string): string => {
    const { start, end } = parsePeriodKey(m);
    if (isNaN(start.getTime()) || isNaN(end.getTime())) return m;
    return `${format(start, "dd MMM yyyy")} → ${format(end, "dd MMM yyyy")}`;
  };

  // Bulk payroll run — date-range based: ONE record per employee for the chosen period
  const bulkPayrollMutation = useMutation({
    mutationFn: async () => {
      if (!bulkStartDate || !bulkEndDate || bulkStartDate > bulkEndDate) {
        throw new Error("Invalid date range");
      }
      const periodKey = buildPeriodKey(bulkStartDate, bulkEndDate);
      if (isMonthLocked(periodKey)) {
        throw new Error("This period is already locked. Unlock it first to regenerate.");
      }
      const totalDays = daysBetween(bulkStartDate, bulkEndDate);
      const records = activeEmployees.map(emp => {
        const basic = emp.salary_amount || 0;
        const hra = emp.hra || 0;
        const sa = emp.special_allowance || 0;
        const oa = emp.other_additions || 0;
        const gross = basic + hra + sa + oa;
        const pfEmp = Math.min(Math.round(basic * 0.12), 1800);
        const pfEr = Math.min(Math.round(basic * 0.12), 1800);
        const esiEmp = gross <= 21000 ? Math.round(gross * 0.0075) : 0;
        const esiEr = gross <= 21000 ? Math.round(gross * 0.0325) : 0;
        const pt = calculatePT(gross, bulkStartDate);
        const totalDed = pfEmp + esiEmp + pt;
        const net = Math.round(gross - totalDed);
        return {
          employee_id: emp.id, property_id: selectedPropertyId, month: periodKey,
          basic_salary: basic, hra, special_allowance: sa, other_additions: oa,
          professional_fees: 0, contract_fees: 0, ot: 0, incentives: 0, bonus: 0,
          gross_salary: gross, pf_employee: pfEmp, pf_employer: pfEr,
          esi_employee: esiEmp, esi_employer: esiEr, lwf: 0, salary_advance: 0,
          professional_tax: pt, tds: 0, tds_194c: 0, tds_194j: 0, other_deduction: 0,
          total_days: totalDays, lop: 0, days_worked: totalDays,
          allowances: hra + sa + oa, deductions: totalDed, net_salary: net,
        };
      });
      if (records.length === 0) return 0;
      const { error } = await supabase.from("payroll_records").insert(records);
      if (error) throw error;
      return records.length;
    },
    onSuccess: (count) => {
      queryClient.invalidateQueries({ queryKey: ["payroll_records"] });
      setBulkDialogOpen(false);
      toast({ title: `Payroll generated: ${count} records for the selected period` });
    },
    onError: (err: any) => toast({ title: "Error", description: err.message, variant: "destructive" }),
  });

  // Lock month
  const lockMonthMutation = useMutation({
    mutationFn: async (month: string) => {
      const ids = payrollRecords.filter(r => r.month === month).map(r => r.id);
      if (ids.length === 0) throw new Error("No records for this month");
      const { error } = await supabase.from("payroll_records").update({ is_locked: true } as any).in("id", ids);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payroll_records"] });
      toast({ title: "Month locked successfully" });
    },
    onError: (err: any) => toast({ title: "Error", description: err.message, variant: "destructive" }),
  });

  // Unlock month
  const unlockMonthMutation = useMutation({
    mutationFn: async (month: string) => {
      const ids = payrollRecords.filter(r => r.month === month).map(r => r.id);
      if (ids.length === 0) throw new Error("No records for this month");
      const { error } = await supabase.from("payroll_records").update({ is_locked: false } as any).in("id", ids);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payroll_records"] });
      toast({ title: "Month unlocked — payroll records can now be edited" });
    },
    onError: (err: any) => toast({ title: "Error", description: err.message, variant: "destructive" }),
  });

  const resetEmpForm = () => {
    setEmpForm({
      full_name: "", email: "", phone: "", designation: "", department: "",
      salary_amount: "", bank_account: "", bank_name: "", bank_ifsc: "", pan_number: "",
      uan_number: "", esi_number: "", employee_number: "", gender: "", work_location: "",
      hra: "0", special_allowance: "0", other_additions: "0", employer_pf_contribution: "0",
      date_of_joining: null,
    });
    setEmpFormErrors({});
  };

  const openEditEmployee = (emp: Employee) => {
    setEditingEmployee(emp);
    setEmpForm({
      full_name: emp.full_name, email: emp.email || "", phone: emp.phone || "",
      designation: emp.designation, department: emp.department || "",
      salary_amount: String(emp.salary_amount), bank_account: emp.bank_account || "",
      bank_name: emp.bank_name || "", bank_ifsc: emp.bank_ifsc || "", pan_number: emp.pan_number || "",
      uan_number: emp.uan_number || "", esi_number: emp.esi_number || "",
      employee_number: emp.employee_number || "", gender: emp.gender || "", work_location: emp.work_location || "",
      hra: String(emp.hra || 0), special_allowance: String(emp.special_allowance || 0),
      other_additions: String(emp.other_additions || 0), employer_pf_contribution: String(emp.employer_pf_contribution || 0),
      date_of_joining: emp.date_of_joining ? new Date(emp.date_of_joining) : null,
    });
    setEmpFormErrors({});
    setEmpDialogOpen(true);
  };

  // ── Phase 3: Export functions ──
  const exportPFStatement = () => {
    const data = payrollRecords.map(r => {
      const emp = r.employees;
      return {
        "UAN": emp?.uan_number || "",
        "Employee Name": emp?.full_name || "",
        "Gross Wages": r.gross_salary,
        "EPF Wages (Basic)": r.basic_salary,
        "EPF Contribution (EE)": r.pf_employee,
        "EPF Contribution (ER)": r.pf_employer,
        "EPS Contribution": Math.min(Math.round((r.basic_salary || 0) * 0.0833), 1250),
        "EDLI Contribution": Math.min(Math.round((r.basic_salary || 0) * 0.005), 75),
        "Period": formatPeriodDisplay(r.month),
      };
    });
    exportToExcel(data, `PF-ECR-${format(new Date(), "yyyy-MM-dd")}`, "PF ECR");
  };

  const exportESIStatement = () => {
    const data = payrollRecords
      .filter(r => Number(r.esi_employee) > 0)
      .map(r => ({
        "ESI Number": r.employees?.esi_number || "",
        "Employee Name": r.employees?.full_name || "",
        "Gross Salary": r.gross_salary,
        "Employee ESI (0.75%)": r.esi_employee,
        "Employer ESI (3.25%)": r.esi_employer,
        "Period": formatPeriodDisplay(r.month),
      }));
    exportToExcel(data, `ESI-Statement-${format(new Date(), "yyyy-MM-dd")}`, "ESI");
  };

  const exportPTStatement = () => {
    const data = payrollRecords.map(r => ({
      "Employee Name": r.employees?.full_name || "",
      "Emp No.": r.employees?.employee_number || "",
      "Gross Salary": r.gross_salary,
      "PT Deducted": r.professional_tax,
      "Period": formatPeriodDisplay(r.month),
    }));
    exportToExcel(data, `PT-Statement-${format(new Date(), "yyyy-MM-dd")}`, "PT Statement");
  };

  const exportTDSWorkings = () => {
    // Group by employee, compute annual
    const empMap = new Map<string, { emp: Employee; records: PayrollRecord[] }>();
    payrollRecords.forEach(r => {
      if (!r.employees) return;
      const key = r.employee_id;
      if (!empMap.has(key)) empMap.set(key, { emp: r.employees, records: [] });
      empMap.get(key)!.records.push(r);
    });
    const data = Array.from(empMap.values()).map(({ emp, records }) => {
      const avgGross = records.reduce((s, r) => s + Number(r.gross_salary), 0) / records.length;
      const calc = calculateMonthlyTDS(avgGross);
      return {
        "Employee Name": emp.full_name,
        "PAN": emp.pan_number || "",
        "Avg Monthly Gross": Math.round(avgGross),
        "Annual Gross (Projected)": Math.round(avgGross * 12),
        "Standard Deduction": 75000,
        "Taxable Income": calc.taxableIncome,
        "Annual Tax (incl. Cess)": calc.annualTax,
        "Monthly TDS": calc.monthlyTds,
        "Section 87A Rebate": calc.taxableIncome <= 700000 ? "Applied" : "N/A",
      };
    });
    exportToExcel(data, `TDS-Workings-${format(new Date(), "yyyy-MM-dd")}`, "TDS Workings");
  };

  const exportBankTransfer = () => {
    const data = payrollRecords.map(r => ({
      "Employee Name": r.employees?.full_name || "",
      "Net Pay": r.net_salary,
      "Bank Name": r.employees?.bank_name || "",
      "Account Number": r.employees?.bank_account || "",
      "IFSC Code": r.employees?.bank_ifsc || "",
      "Period": formatPeriodDisplay(r.month),
    }));
    exportToExcel(data, `Bank-Transfer-${format(new Date(), "yyyy-MM-dd")}`, "Bank Transfer");
  };

  // PDF Payslip generation — updated with Department, payment date, masked bank acct
  const generatePayslipPDF = (record: PayrollRecord) => {
    const emp = record.employees;
    const empName = emp?.full_name || "Unknown";
    const totalDeductions = Number(record.pf_employee || 0) + Number(record.esi_employee || 0) + Number(record.lwf || 0) + Number(record.salary_advance || 0) + Number(record.professional_tax || 0) + Number(record.tds || 0) + Number(record.tds_194c || 0) + Number(record.tds_194j || 0) + Number(record.other_deduction || 0);
    const lopDed = Number(record.gross_salary || 0) - Number(record.net_salary || 0) - totalDeductions;
    const propName = properties?.[0]?.name || "Hostylia";
    const propAddr = [properties?.[0]?.address, properties?.[0]?.city, properties?.[0]?.state].filter(Boolean).join(", ");

    const htmlContent = `<!DOCTYPE html><html><head><title>Payslip - ${empName} - ${formatPeriodDisplay(record.month)}</title>
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:'Segoe UI',Arial,sans-serif;padding:20px;color:#1a1a2e;font-size:12px}
.header{text-align:center;border-bottom:3px solid #16697a;padding-bottom:12px;margin-bottom:16px}
.header h1{font-size:20px;color:#16697a;margin-bottom:2px}
.header .addr{color:#666;font-size:11px}
.badge{display:inline-block;background:#16697a;color:white;padding:3px 14px;border-radius:20px;font-size:10px;margin-top:6px}
.personal{border:1px solid #ddd;border-radius:6px;padding:10px;margin-bottom:14px}
.personal h3{font-size:11px;text-transform:uppercase;color:#16697a;margin-bottom:8px;letter-spacing:0.5px}
.p-grid{display:grid;grid-template-columns:1fr 1fr 1fr;gap:6px}
.p-item{display:flex;gap:4px;font-size:11px}
.p-item .lbl{color:#888;min-width:80px;font-size:10px}
.p-item .val{font-weight:600}
.two-col{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:14px}
.section h3{font-size:11px;text-transform:uppercase;letter-spacing:1px;color:#16697a;margin-bottom:6px;padding-bottom:3px;border-bottom:1px solid #e0e0e0}
table{width:100%;border-collapse:collapse}
td{padding:4px 0;font-size:11px}
td:last-child{text-align:right;font-weight:600}
.total-row{border-top:2px solid #16697a;font-weight:700;font-size:12px}
.total-row td{padding-top:8px}
.net-box{background:#e8f4f8;border:2px solid #16697a;border-radius:6px;padding:12px;text-align:center;margin-bottom:12px}
.net-box .amount{font-size:20px;font-weight:800;color:#16697a}
.net-box .words{font-size:10px;color:#555;margin-top:3px;font-style:italic}
.employer-box{background:#f8f9fa;border-radius:6px;padding:10px;margin-bottom:12px}
.employer-box h4{font-size:10px;text-transform:uppercase;color:#888;margin-bottom:4px;letter-spacing:0.5px}
.employer-box .row{display:flex;justify-content:space-between;padding:2px 0;font-size:11px}
.footer{text-align:center;color:#999;font-size:9px;margin-top:16px;padding-top:12px;border-top:1px solid #eee}
@media print{body{padding:10px}}
</style></head><body>
<div class="header">
  <h1>${propName.toUpperCase()}</h1>
  ${propAddr ? `<p class="addr">${propAddr}</p>` : ''}
  <span class="badge">PAYSLIP — ${formatPeriodDisplay(record.month)}</span>
</div>
<div class="personal">
  <h3>Employee Details</h3>
  <div class="p-grid">
    <div class="p-item"><span class="lbl">Emp No.</span><span class="val">${emp?.employee_number || 'N/A'}</span></div>
    <div class="p-item"><span class="lbl">Name</span><span class="val">${empName}</span></div>
    <div class="p-item"><span class="lbl">Designation</span><span class="val">${emp?.designation || 'N/A'}</span></div>
    <div class="p-item"><span class="lbl">Department</span><span class="val">${emp?.department || 'N/A'}</span></div>
    <div class="p-item"><span class="lbl">DOJ</span><span class="val">${emp?.date_of_joining ? format(new Date(emp.date_of_joining), "dd MMM yyyy") : 'N/A'}</span></div>
    <div class="p-item"><span class="lbl">Gender</span><span class="val">${emp?.gender || 'N/A'}</span></div>
    <div class="p-item"><span class="lbl">Pay Period</span><span class="val">${formatPeriodDisplay(record.month)}</span></div>
    <div class="p-item"><span class="lbl">Date of Payment</span><span class="val">${record.generated_at ? format(new Date(record.generated_at), "dd MMM yyyy") : format(new Date(), "dd MMM yyyy")}</span></div>
    <div class="p-item"><span class="lbl">Paid Days</span><span class="val">${record.days_worked || 30}</span></div>
    <div class="p-item"><span class="lbl">LOP Days</span><span class="val">${record.lop || 0}</span></div>
    <div class="p-item"><span class="lbl">Total Days</span><span class="val">${record.total_days || 30}</span></div>
    <div class="p-item"><span class="lbl">UAN No.</span><span class="val">${emp?.uan_number || 'N/A'}</span></div>
    <div class="p-item"><span class="lbl">ESIC No.</span><span class="val">${emp?.esi_number || 'N/A'}</span></div>
    <div class="p-item"><span class="lbl">PAN</span><span class="val">${emp?.pan_number || 'N/A'}</span></div>
    <div class="p-item"><span class="lbl">Bank Acct</span><span class="val">${maskAccount(emp?.bank_account || null)}</span></div>
    <div class="p-item"><span class="lbl">Bank</span><span class="val">${emp?.bank_name || 'N/A'}</span></div>
    <div class="p-item"><span class="lbl">IFSC</span><span class="val">${emp?.bank_ifsc || 'N/A'}</span></div>
  </div>
</div>
<div class="two-col">
  <div class="section">
    <h3>Earnings</h3>
    <table>
      <tr><td>Basic Salary</td><td>₹${fmt(record.basic_salary)}</td></tr>
      <tr><td>House Rent Allowance</td><td>₹${fmt(record.hra)}</td></tr>
      <tr><td>Special Allowance</td><td>₹${fmt(record.special_allowance)}</td></tr>
      <tr><td>Professional Fees</td><td>₹${fmt(record.professional_fees)}</td></tr>
      <tr><td>Contract Fees</td><td>₹${fmt(record.contract_fees)}</td></tr>
      <tr><td>Other Additions</td><td>₹${fmt(record.other_additions)}</td></tr>
      <tr><td>OT</td><td>₹${fmt(record.ot)}</td></tr>
      <tr><td>Incentives</td><td>₹${fmt(record.incentives)}</td></tr>
      <tr><td>Bonus</td><td>₹${fmt(record.bonus)}</td></tr>
      <tr class="total-row"><td>Gross Salary</td><td>₹${fmt(record.gross_salary)}</td></tr>
    </table>
  </div>
  <div class="section">
    <h3>Deductions</h3>
    <table>
      <tr><td>Employee PF (max ₹1,800)</td><td>₹${fmt(record.pf_employee)}</td></tr>
      <tr><td>Employee ESI @ 0.75%</td><td>₹${fmt(record.esi_employee)}</td></tr>
      <tr><td>LWF</td><td>₹${fmt(record.lwf)}</td></tr>
      <tr><td>Salary Advance</td><td>₹${fmt(record.salary_advance)}</td></tr>
      <tr><td>Professional Tax</td><td>₹${fmt(record.professional_tax)}</td></tr>
      <tr><td>Income Tax (TDS)</td><td>₹${fmt(record.tds)}</td></tr>
      <tr><td>TDS 194C</td><td>₹${fmt(record.tds_194c)}</td></tr>
      <tr><td>TDS 194J</td><td>₹${fmt(record.tds_194j)}</td></tr>
      <tr><td>Other Deductions</td><td>₹${fmt(record.other_deduction)}</td></tr>
      ${lopDed > 0 ? `<tr><td>LOP Deduction</td><td>₹${fmt(lopDed)}</td></tr>` : ''}
      <tr class="total-row"><td>Total Deductions</td><td>₹${fmt(totalDeductions + (lopDed > 0 ? lopDed : 0))}</td></tr>
    </table>
  </div>
</div>
<div class="net-box">
  <div class="amount">Net Pay: ₹${fmt(record.net_salary)}</div>
  <div class="words">${numberToWords(Number(record.net_salary))}</div>
</div>
<div class="employer-box">
  <h4>Employer Contributions (Not deducted from salary)</h4>
  <div class="row"><span>Employer PF (max ₹1,800)</span><span>₹${fmt(record.pf_employer)}</span></div>
  <div class="row"><span>Employer ESI @ 3.25%</span><span>₹${fmt(record.esi_employer)}</span></div>
</div>
${record.notes ? `<p style="margin-bottom:10px;font-size:11px"><strong>Notes:</strong> ${record.notes}</p>` : ''}
<div class="footer">
  <p>This is a system-generated payslip from ${propName}.</p>
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

  // Get unique months from payroll records
  const uniqueMonths = useMemo(() => {
    const months = new Set(payrollRecords.map(r => r.month));
    return Array.from(months).sort().reverse();
  }, [payrollRecords]);

  // Check if a month has any locked records
  const isMonthLocked = (month: string) => payrollRecords.some(r => r.month === month && r.is_locked);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Payroll Management</h1>
          <p className="text-muted-foreground text-sm">Manage employees, generate payslips with ESI & PF (capped at ₹1,800)</p>
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
        <TabsList className="w-full sm:w-auto overflow-x-auto flex-wrap h-auto">
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
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>{editingEmployee ? "Edit Employee" : "Add New Employee"}</DialogTitle>
                </DialogHeader>
                <form onSubmit={(e) => { e.preventDefault(); employeeMutation.mutate({ ...empForm, id: editingEmployee?.id }); }} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2 sm:col-span-2">
                      <Label>Full Name *</Label>
                      <Input required value={empForm.full_name} onChange={e => setEmpForm(p => ({ ...p, full_name: e.target.value }))} />
                    </div>
                    <div className="space-y-2">
                      <Label>Employee Number</Label>
                      <Input value={empForm.employee_number} onChange={e => setEmpForm(p => ({ ...p, employee_number: e.target.value }))} placeholder="e.g. EMP001" />
                    </div>
                    <div className="space-y-2">
                      <Label>Gender</Label>
                      <Select value={empForm.gender} onValueChange={v => setEmpForm(p => ({ ...p, gender: v }))}>
                        <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="male">Male</SelectItem>
                          <SelectItem value="female">Female</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Date of Joining</Label>
                      <Input
                        type="date"
                        value={empForm.date_of_joining ? format(empForm.date_of_joining, "yyyy-MM-dd") : ""}
                        onChange={e => setEmpForm(p => ({ ...p, date_of_joining: e.target.value ? new Date(e.target.value) : null }))}
                      />
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
                      <Label>Work Location</Label>
                      <Input value={empForm.work_location} onChange={e => setEmpForm(p => ({ ...p, work_location: e.target.value }))} />
                    </div>
                  </div>

                  <Separator />
                  <h4 className="text-sm font-semibold text-foreground">Salary Structure</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Basic Salary (₹) *</Label>
                      <Input required type="number" min="0" value={empForm.salary_amount} onChange={e => setEmpForm(p => ({ ...p, salary_amount: e.target.value }))} />
                    </div>
                    <div className="space-y-2">
                      <Label>HRA (₹)</Label>
                      <Input type="number" min="0" value={empForm.hra} onChange={e => setEmpForm(p => ({ ...p, hra: e.target.value }))} />
                    </div>
                    <div className="space-y-2">
                      <Label>Special Allowance (₹)</Label>
                      <Input type="number" min="0" value={empForm.special_allowance} onChange={e => setEmpForm(p => ({ ...p, special_allowance: e.target.value }))} />
                    </div>
                    <div className="space-y-2">
                      <Label>Other Additions (₹)</Label>
                      <Input type="number" min="0" value={empForm.other_additions} onChange={e => setEmpForm(p => ({ ...p, other_additions: e.target.value }))} />
                    </div>
                    <div className="space-y-2">
                      <Label>Employer PF Contribution (₹)</Label>
                      <Input type="number" min="0" value={empForm.employer_pf_contribution} onChange={e => setEmpForm(p => ({ ...p, employer_pf_contribution: e.target.value }))} />
                    </div>
                  </div>

                  <Separator />
                  <h4 className="text-sm font-semibold text-foreground">Bank & Statutory</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Bank Name</Label>
                      <Input value={empForm.bank_name} onChange={e => setEmpForm(p => ({ ...p, bank_name: e.target.value }))} />
                    </div>
                    <div className="space-y-2">
                      <Label>Bank Account No.</Label>
                      <Input value={empForm.bank_account} onChange={e => setEmpForm(p => ({ ...p, bank_account: e.target.value }))} />
                    </div>
                    <div className="space-y-2">
                      <Label>Bank IFSC</Label>
                      <Input value={empForm.bank_ifsc} onChange={e => setEmpForm(p => ({ ...p, bank_ifsc: e.target.value }))} placeholder="e.g. SBIN0001234" className={empFormErrors.ifsc ? "border-destructive" : ""} />
                      {empFormErrors.ifsc && <p className="text-xs text-destructive">{empFormErrors.ifsc}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label>PAN Number</Label>
                      <Input value={empForm.pan_number} onChange={e => setEmpForm(p => ({ ...p, pan_number: e.target.value }))} placeholder="e.g. ABCDE1234F" className={empFormErrors.pan ? "border-destructive" : ""} />
                      {empFormErrors.pan && <p className="text-xs text-destructive">{empFormErrors.pan}</p>}
                    </div>
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
              {/* Mobile card view */}
              <div className="sm:hidden divide-y divide-border">
                {loadingEmployees ? (
                  <div className="p-8 text-center text-muted-foreground">Loading...</div>
                ) : employees.length === 0 ? (
                  <div className="p-8 text-center text-muted-foreground">No employees added yet</div>
                ) : employees.map(emp => (
                  <div key={emp.id} className="p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{emp.full_name}</p>
                        <p className="text-xs text-muted-foreground">{emp.designation} {emp.department ? `· ${emp.department}` : ""}</p>
                      </div>
                      <Badge variant={emp.status === "active" ? "default" : "secondary"}>{emp.status}</Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div><span className="text-muted-foreground">Basic:</span> ₹{Number(emp.salary_amount).toLocaleString("en-IN")}</div>
                      <div><span className="text-muted-foreground">Emp #:</span> {emp.employee_number || "N/A"}</div>
                      {emp.date_of_joining && <div><span className="text-muted-foreground">DOJ:</span> {format(new Date(emp.date_of_joining), "dd MMM yyyy")}</div>}
                    </div>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm" onClick={() => openEditEmployee(emp)}><Edit className="h-4 w-4 mr-1" /> Edit</Button>
                      <Button variant="ghost" size="sm" className="text-destructive" onClick={() => { if (confirm("Delete this employee?")) deleteEmployeeMutation.mutate(emp.id); }}><Trash2 className="h-4 w-4 mr-1" /> Delete</Button>
                    </div>
                  </div>
                ))}
              </div>
              {/* Desktop table view */}
              <div className="hidden sm:block overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Employee</TableHead>
                      <TableHead>Emp No.</TableHead>
                      <TableHead>DOJ</TableHead>
                      <TableHead>Designation</TableHead>
                      <TableHead>Department</TableHead>
                      <TableHead>Basic Salary</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loadingEmployees ? (
                      <TableRow><TableCell colSpan={8} className="text-center py-8 text-muted-foreground">Loading...</TableCell></TableRow>
                    ) : employees.length === 0 ? (
                      <TableRow><TableCell colSpan={8} className="text-center py-8 text-muted-foreground">No employees added yet</TableCell></TableRow>
                    ) : employees.map(emp => (
                      <TableRow key={emp.id}>
                        <TableCell className="font-medium">{emp.full_name}</TableCell>
                        <TableCell>{emp.employee_number || "-"}</TableCell>
                        <TableCell>{emp.date_of_joining ? format(new Date(emp.date_of_joining), "dd MMM yyyy") : "-"}</TableCell>
                        <TableCell>{emp.designation}</TableCell>
                        <TableCell>{emp.department || "-"}</TableCell>
                        <TableCell>₹{Number(emp.salary_amount).toLocaleString("en-IN")}</TableCell>
                        <TableCell>
                          <Badge variant={emp.status === "active" ? "default" : "secondary"}>{emp.status}</Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="icon" onClick={() => openEditEmployee(emp)}><Edit className="h-4 w-4" /></Button>
                          <Button variant="ghost" size="icon" className="text-destructive" onClick={() => { if (confirm("Delete this employee?")) deleteEmployeeMutation.mutate(emp.id); }}><Trash2 className="h-4 w-4" /></Button>
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
          <div className="flex flex-wrap justify-end gap-2">
            {/* Lock/Unlock Month */}
            {uniqueMonths.length > 0 && (
              <Select onValueChange={(month) => {
                const locked = isMonthLocked(month);
                if (locked) {
                  if (confirm(`Unlock payroll for ${formatPeriodDisplay(month)}? This will allow edits to payroll records.`)) {
                    unlockMonthMutation.mutate(month);
                  }
                } else {
                  if (confirm(`Lock payroll for ${formatPeriodDisplay(month)}? Payroll records will be read-only.`)) {
                    lockMonthMutation.mutate(month);
                  }
                }
              }}>
                <SelectTrigger className="w-[260px]">
                  <Lock className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Lock / Unlock Period" />
                </SelectTrigger>
                <SelectContent>
                  {uniqueMonths.map(m => (
                    <SelectItem key={m} value={m}>
                      <span className="flex items-center gap-2">
                        {isMonthLocked(m) ? <Lock className="h-3 w-3" /> : <Unlock className="h-3 w-3" />}
                        {formatPeriodDisplay(m)} — {isMonthLocked(m) ? "Locked" : "Unlocked"}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            {/* Bulk Payroll */}
            <Dialog open={bulkDialogOpen} onOpenChange={setBulkDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline"><PlayCircle className="h-4 w-4 mr-2" />Run Payroll for All</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Bulk Payroll Run</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    This will generate payroll for <strong>{activeEmployees.length}</strong> active employees using their saved salary structure defaults. Select a date range — total days will be auto-calculated.
                  </p>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Start Date *</Label>
                      <Input type="date" value={bulkStartDate} onChange={e => setBulkStartDate(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <Label>End Date *</Label>
                      <Input type="date" value={bulkEndDate} onChange={e => setBulkEndDate(e.target.value)} />
                    </div>
                  </div>
                  {bulkStartDate > bulkEndDate ? (
                    <p className="text-sm text-destructive font-medium">⚠️ Start date must be on or before end date.</p>
                  ) : (
                    <p className="text-xs text-muted-foreground">
                      Total days: <strong>{daysBetween(bulkStartDate, bulkEndDate)}</strong>
                    </p>
                  )}
                  <Button className="w-full" onClick={() => bulkPayrollMutation.mutate()} disabled={bulkPayrollMutation.isPending || bulkStartDate > bulkEndDate || activeEmployees.length === 0}>
                    {bulkPayrollMutation.isPending ? "Processing..." : `Generate for ${activeEmployees.length} Employees`}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>

            {/* Export dropdown */}
            <Select onValueChange={(v) => {
              if (payrollRecords.length === 0) { toast({ title: "No records to export" }); return; }
              switch (v) {
                case "salary": exportToExcel(payrollRecords.map(r => ({
                  "Employee": (r.employees as any)?.full_name || "",
                  "Emp No.": (r.employees as any)?.employee_number || "",
                  "Period": formatPeriodDisplay(r.month),
                  "Basic": r.basic_salary, "HRA": r.hra, "Special Allowance": r.special_allowance,
                  "Professional Fees": r.professional_fees, "Contract Fees": r.contract_fees,
                  "Other Additions": r.other_additions, "OT": r.ot, "Incentives": r.incentives, "Bonus": r.bonus,
                  "Gross": r.gross_salary, "PF (Emp)": r.pf_employee, "ESI (Emp)": r.esi_employee,
                  "LWF": r.lwf, "Salary Advance": r.salary_advance, "PT": r.professional_tax,
                  "TDS": r.tds, "TDS 194C": r.tds_194c, "TDS 194J": r.tds_194j,
                  "Total Deductions": r.deductions, "Total Days": r.total_days, "LOP": r.lop,
                  "Days Worked": r.days_worked, "Net Salary": r.net_salary, "Status": r.status,
                })), `payroll-${format(new Date(), "yyyy-MM-dd")}`, "Payroll"); break;
                case "pf": exportPFStatement(); break;
                case "esi": exportESIStatement(); break;
                case "pt": exportPTStatement(); break;
                case "tds": exportTDSWorkings(); break;
                case "bank": exportBankTransfer(); break;
              }
            }}>
              <SelectTrigger className="w-[180px]">
                <Download className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Export Reports" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="salary">Salary Register</SelectItem>
                <SelectItem value="pf">PF Statement (ECR)</SelectItem>
                <SelectItem value="esi">ESI Statement</SelectItem>
                <SelectItem value="pt">PT Statement</SelectItem>
                <SelectItem value="tds">TDS Workings</SelectItem>
                <SelectItem value="bank">Bank Transfer File</SelectItem>
              </SelectContent>
            </Select>

            <Dialog open={payrollDialogOpen} onOpenChange={(open) => {
              setPayrollDialogOpen(open);
              if (!open) { setSelectedEmployeeIds([]); setPayrollForm(defaultPayrollForm); setPayrollStartDate(monthStartIso); setPayrollEndDate(monthEndIso); }
            }}>
              <DialogTrigger asChild>
                <Button><Plus className="h-4 w-4 mr-2" /> Generate Payroll</Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Generate Payroll</DialogTitle>
                </DialogHeader>
                <form onSubmit={(e) => { e.preventDefault(); payrollMutation.mutate(); }} className="space-y-4">
                  {/* Employee Selection */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label>Select Employees *</Label>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="text-xs h-7"
                        onClick={() => {
                          if (selectedEmployeeIds.length === activeEmployees.length) {
                            setSelectedEmployeeIds([]);
                          } else {
                            setSelectedEmployeeIds(activeEmployees.map(e => e.id));
                          }
                        }}
                      >
                        {selectedEmployeeIds.length === activeEmployees.length ? "Deselect All" : "Select All"}
                      </Button>
                    </div>
                    <div className="border rounded-md max-h-40 overflow-y-auto p-2 space-y-1">
                      {activeEmployees.map(emp => (
                        <label key={emp.id} className="flex items-center gap-2 p-1.5 rounded hover:bg-muted/50 cursor-pointer text-sm">
                          <Checkbox
                            checked={selectedEmployeeIds.includes(emp.id)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setSelectedEmployeeIds(prev => [...prev, emp.id]);
                              } else {
                                setSelectedEmployeeIds(prev => prev.filter(id => id !== emp.id));
                              }
                            }}
                          />
                          <span className="flex-1">{emp.full_name}</span>
                          <span className="text-muted-foreground text-xs">₹{Number(emp.salary_amount).toLocaleString("en-IN")}</span>
                        </label>
                      ))}
                      {activeEmployees.length === 0 && (
                        <p className="text-sm text-muted-foreground text-center py-2">No active employees</p>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">{selectedEmployeeIds.length} employee(s) selected</p>
                  </div>

                  {/* Date Range */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Start Date *</Label>
                      <Input type="date" value={payrollStartDate} onChange={e => setPayrollStartDate(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <Label>End Date *</Label>
                      <Input type="date" value={payrollEndDate} onChange={e => setPayrollEndDate(e.target.value)} />
                    </div>
                  </div>
                  {payrollStartDate > payrollEndDate ? (
                    <p className="text-sm text-destructive font-medium">⚠️ Start date must be on or before end date.</p>
                  ) : (
                    <p className="text-xs text-muted-foreground">
                      Total days: <strong>{daysBetween(payrollStartDate, payrollEndDate)}</strong>
                    </p>
                  )}

                  {/* Show detailed form only when exactly 1 employee selected */}
                  {selectedEmployeeIds.length === 1 && selectedEmployee && (
                    <>
                      {/* Attendance */}
                      <div>
                        <h4 className="text-sm font-semibold text-foreground mb-3">Attendance</h4>
                        <div className="grid grid-cols-3 gap-3">
                          <div className="space-y-1">
                            <Label className="text-xs">Total Days</Label>
                            <Input type="number" value={payrollForm.total_days} disabled />
                            <p className="text-[10px] text-muted-foreground">Auto from date range</p>
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs">LOP (Days)</Label>
                            <Input type="number" min="0" value={payrollForm.lop} onChange={e => setPayrollForm(p => ({ ...p, lop: e.target.value }))} />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs">Days Worked</Label>
                            <Input disabled value={payrollCalc.daysWorked} />
                          </div>
                        </div>
                      </div>

                      <Separator />

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
                            <Label className="text-xs">Special Allowance (₹)</Label>
                            <Input type="number" min="0" value={payrollForm.special_allowance} onChange={e => setPayrollForm(p => ({ ...p, special_allowance: e.target.value }))} />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs">Professional Fees (₹)</Label>
                            <Input type="number" min="0" value={payrollForm.professional_fees} onChange={e => setPayrollForm(p => ({ ...p, professional_fees: e.target.value }))} />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs">Contract Fees (₹)</Label>
                            <Input type="number" min="0" value={payrollForm.contract_fees} onChange={e => setPayrollForm(p => ({ ...p, contract_fees: e.target.value }))} />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs">Other Additions (₹)</Label>
                            <Input type="number" min="0" value={payrollForm.other_additions} onChange={e => setPayrollForm(p => ({ ...p, other_additions: e.target.value }))} />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs">OT (₹)</Label>
                            <Input type="number" min="0" value={payrollForm.ot} onChange={e => setPayrollForm(p => ({ ...p, ot: e.target.value }))} />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs">Incentives (₹)</Label>
                            <Input type="number" min="0" value={payrollForm.incentives} onChange={e => setPayrollForm(p => ({ ...p, incentives: e.target.value }))} />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs">Bonus (₹)</Label>
                            <Input type="number" min="0" value={payrollForm.bonus} onChange={e => setPayrollForm(p => ({ ...p, bonus: e.target.value }))} />
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
                                <p className="text-sm font-medium">Employee PF @ 12% (max ₹1,800)</p>
                                <p className="text-xs text-muted-foreground">Employer also contributes (capped at ₹1,800)</p>
                              </div>
                            </div>
                            <span className="font-semibold text-sm">₹{payrollCalc.pfEmployee.toLocaleString("en-IN")}</span>
                          </div>
                          <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                            <div className="flex items-center gap-2">
                              <Checkbox checked={payrollForm.esi_enabled} onCheckedChange={v => setPayrollForm(p => ({ ...p, esi_enabled: !!v }))} />
                              <div>
                                <p className="text-sm font-medium">Employee ESI @ 0.75% of Gross</p>
                                <p className="text-xs text-muted-foreground">
                                  {payrollCalc.gross > 21000 ? "Not applicable (Gross > ₹21,000)" : "Employer contributes 3.25%"}
                                </p>
                              </div>
                            </div>
                            <span className="font-semibold text-sm">₹{payrollCalc.esiEmployee.toLocaleString("en-IN")}</span>
                          </div>
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                            <div className="space-y-1">
                              <Label className="text-xs">LWF (₹)</Label>
                              <Input type="number" min="0" value={payrollForm.lwf} onChange={e => setPayrollForm(p => ({ ...p, lwf: e.target.value }))} />
                            </div>
                            <div className="space-y-1">
                              <Label className="text-xs">Salary Advance (₹)</Label>
                              <Input type="number" min="0" value={payrollForm.salary_advance} onChange={e => setPayrollForm(p => ({ ...p, salary_advance: e.target.value }))} />
                            </div>
                            <div className="space-y-1">
                              <Label className="text-xs">Professional Tax (₹)</Label>
                              <Input type="number" min="0" value={payrollForm.professional_tax} onChange={e => setPayrollForm(p => ({ ...p, professional_tax: e.target.value }))} />
                              <p className="text-[10px] text-muted-foreground">Auto: Karnataka slabs</p>
                            </div>
                            <div className="space-y-1">
                              <Label className="text-xs">Income Tax / TDS (₹)</Label>
                              <div className="flex gap-1">
                                <Input type="number" min="0" value={payrollForm.tds} onChange={e => setPayrollForm(p => ({ ...p, tds: e.target.value }))} />
                                <Button type="button" variant="outline" size="icon" className="shrink-0" title="Calculate TDS" onClick={() => setTdsCalcOpen(true)}>
                                  <Calculator className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                            <div className="space-y-1">
                              <Label className="text-xs">TDS 194C (₹)</Label>
                              <Input type="number" min="0" value={payrollForm.tds_194c} onChange={e => setPayrollForm(p => ({ ...p, tds_194c: e.target.value }))} />
                            </div>
                            <div className="space-y-1">
                              <Label className="text-xs">TDS 194J (₹)</Label>
                              <Input type="number" min="0" value={payrollForm.tds_194j} onChange={e => setPayrollForm(p => ({ ...p, tds_194j: e.target.value }))} />
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
                        <div className="flex justify-between text-sm text-destructive"><span>Statutory Deductions</span><span className="font-semibold">- ₹{payrollCalc.totalDeductions.toLocaleString("en-IN")}</span></div>
                        {payrollCalc.lopDeduction > 0 && (
                          <div className="flex justify-between text-sm text-destructive"><span>LOP Deduction ({payrollCalc.lop} days)</span><span className="font-semibold">- ₹{payrollCalc.lopDeduction.toLocaleString("en-IN")}</span></div>
                        )}
                        <div className="flex justify-between text-xs text-muted-foreground"><span>Days Worked / Total Days</span><span>{payrollCalc.daysWorked} / {payrollCalc.totalDays}</span></div>
                        <Separator />
                        <div className={cn("flex justify-between text-base font-bold", payrollCalc.net < 0 ? "text-destructive" : "text-primary")}>
                          <span>Net Salary</span><span>₹{payrollCalc.net.toLocaleString("en-IN")}</span>
                        </div>
                        {payrollCalc.net < 0 && (
                          <p className="text-xs text-destructive flex items-center gap-1"><AlertTriangle className="h-3 w-3" /> Net pay is negative. You will be asked to confirm.</p>
                        )}
                        <p className="text-xs text-muted-foreground">Employer PF: ₹{payrollCalc.pfEmployer.toLocaleString("en-IN")} | Employer ESI: ₹{payrollCalc.esiEmployer.toLocaleString("en-IN")}</p>
                      </div>
                    </>
                  )}

                  {/* Multi-employee info */}
                  {selectedEmployeeIds.length > 1 && (
                    <div className="bg-muted/30 rounded-lg p-4 space-y-1">
                      <p className="text-sm font-medium">Bulk generation mode</p>
                      <p className="text-xs text-muted-foreground">
                        Payroll will be generated for <strong>{selectedEmployeeIds.length}</strong> employees for the period <strong>{formatPeriodDisplay(buildPeriodKey(payrollStartDate, payrollEndDate))}</strong> ({daysBetween(payrollStartDate, payrollEndDate)} days) using their saved salary defaults. If this period is locked, generation will be blocked.
                      </p>
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label>Notes</Label>
                    <Textarea value={payrollForm.notes} onChange={e => setPayrollForm(p => ({ ...p, notes: e.target.value }))} placeholder="Optional notes..." />
                  </div>
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={payrollMutation.isPending || selectedEmployeeIds.length === 0 || payrollStartDate > payrollEndDate}
                  >
                    {payrollMutation.isPending ? "Processing..." : selectedEmployeeIds.length === 1 ? "Generate Payroll" : `Generate for ${selectedEmployeeIds.length} Employees`}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <Card>
            <CardContent className="p-0">
              {/* Mobile card view */}
              <div className="sm:hidden divide-y divide-border">
                {loadingPayroll ? (
                  <div className="p-8 text-center text-muted-foreground">Loading...</div>
                ) : payrollRecords.length === 0 ? (
                  <div className="p-8 text-center text-muted-foreground">No payroll records yet</div>
                ) : payrollRecords.map(record => (
                  <div key={record.id} className="p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{(record.employees as any)?.full_name || "Unknown"}</p>
                        <p className="text-xs text-muted-foreground">{formatPeriodDisplay(record.month)} {record.is_locked && "🔒"}</p>
                      </div>
                      <Badge variant={record.is_locked ? "secondary" : "outline"}>{record.is_locked ? "Locked" : record.status}</Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div><span className="text-muted-foreground">Gross:</span> ₹{Number(record.gross_salary || 0).toLocaleString("en-IN")}</div>
                      <div><span className="text-muted-foreground">Net:</span> <span className="font-bold">₹{Number(record.net_salary).toLocaleString("en-IN")}</span></div>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => generatePayslipPDF(record)}><Download className="h-4 w-4 mr-1" /> Payslip</Button>
                  </div>
                ))}
              </div>
              {/* Desktop table view */}
              <div className="hidden sm:block overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Employee</TableHead>
                      <TableHead>Period</TableHead>
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
                        <TableCell>
                          <div className="flex items-center gap-1">
                            {formatPeriodDisplay(record.month)}
                            {record.is_locked && <Lock className="h-3 w-3 text-muted-foreground" />}
                          </div>
                        </TableCell>
                        <TableCell>₹{Number(record.gross_salary || 0).toLocaleString("en-IN")}</TableCell>
                        <TableCell className="text-muted-foreground">₹{Number(record.pf_employee || 0).toLocaleString("en-IN")}</TableCell>
                        <TableCell className="text-muted-foreground">₹{Number(record.esi_employee || 0).toLocaleString("en-IN")}</TableCell>
                        <TableCell className="text-destructive">-₹{Number(record.deductions || 0).toLocaleString("en-IN")}</TableCell>
                        <TableCell className="font-bold">₹{Number(record.net_salary).toLocaleString("en-IN")}</TableCell>
                        <TableCell>
                          <Badge variant={record.is_locked ? "secondary" : "outline"}>{record.is_locked ? "Locked" : record.status}</Badge>
                        </TableCell>
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

      {/* Net Pay Warning Dialog */}
      <Dialog open={netPayWarningOpen} onOpenChange={setNetPayWarningOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" /> Negative Net Pay Warning
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              The net pay for this employee is <strong className="text-destructive">₹{payrollCalc.net.toLocaleString("en-IN")}</strong> (negative).
              Total deductions (₹{(payrollCalc.totalDeductions + payrollCalc.lopDeduction).toLocaleString("en-IN")}) exceed total earnings (₹{payrollCalc.gross.toLocaleString("en-IN")}).
            </p>
            <p className="text-sm">Are you sure you want to proceed?</p>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setNetPayWarningOpen(false)}>Cancel</Button>
              <Button variant="destructive" onClick={() => confirmNegativePayroll.mutate()} disabled={confirmNegativePayroll.isPending}>
                {confirmNegativePayroll.isPending ? "Processing..." : "Confirm & Generate"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* TDS Calculator Dialog */}
      <Dialog open={tdsCalcOpen} onOpenChange={setTdsCalcOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Calculator className="h-5 w-5" /> TDS Calculator (New Regime FY 2025-26)
            </DialogTitle>
          </DialogHeader>
          {tdsCalcResult && (
            <div className="space-y-4">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-muted-foreground">Monthly Gross</span><span>₹{payrollCalc.gross.toLocaleString("en-IN")}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Annual Gross (×12)</span><span>₹{(payrollCalc.gross * 12).toLocaleString("en-IN")}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Standard Deduction</span><span>- ₹75,000</span></div>
                <Separator />
                <div className="flex justify-between font-medium"><span>Taxable Income</span><span>₹{tdsCalcResult.taxableIncome.toLocaleString("en-IN")}</span></div>
                {tdsCalcResult.taxableIncome <= 700000 && (
                  <p className="text-xs text-green-600 font-medium">✓ Section 87A Rebate applied — No tax payable</p>
                )}
                <div className="flex justify-between"><span className="text-muted-foreground">Annual Tax (incl. 4% Cess)</span><span>₹{tdsCalcResult.annualTax.toLocaleString("en-IN")}</span></div>
                <Separator />
                <div className="flex justify-between text-base font-bold text-primary"><span>Monthly TDS</span><span>₹{tdsCalcResult.monthlyTds.toLocaleString("en-IN")}</span></div>
              </div>
              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setTdsCalcOpen(false)}>Cancel</Button>
                <Button onClick={() => {
                  setPayrollForm(p => ({ ...p, tds: String(tdsCalcResult.monthlyTds) }));
                  setTdsCalcOpen(false);
                }}>Apply ₹{tdsCalcResult.monthlyTds.toLocaleString("en-IN")}</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Payroll;
