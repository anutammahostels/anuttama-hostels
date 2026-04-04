import { useState, useRef, useMemo, useCallback } from "react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Plus, Search, Filter, MoreVertical, Upload, Users, UserCheck, UserX, Clock, Loader2, Copy, CheckCircle2, Download, AlertCircle, BedDouble, Pencil, Trash2, LogOut, IndianRupee, KeyRound, X } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { useStudents, type StudentWithProfile } from "@/hooks/useStudents";
import { useRooms } from "@/hooks/useRooms";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { Progress } from "@/components/ui/progress";
import { createNotification } from "@/lib/notifications";

const Students = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdCredentials, setCreatedCredentials] = useState<{ enrollmentNumber: string; password: string } | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [bulkDialogOpen, setBulkDialogOpen] = useState(false);
  const [bulkUploading, setBulkUploading] = useState(false);
  const [bulkProgress, setBulkProgress] = useState(0);
  const [bulkResults, setBulkResults] = useState<{ success: { enrollmentNumber: string; password: string; name: string }[]; errors: { row: number; name: string; error: string }[] } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Edit student state
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<StudentWithProfile | null>(null);
  const [editForm, setEditForm] = useState({
    roll_number: "",
    course: "",
    department: "",
    year: "",
    date_of_birth: "",
    blood_group: "",
    emergency_contact: "",
    status: "",
  });
  const [isUpdating, setIsUpdating] = useState(false);

  // Assign room state
  const [assignRoomOpen, setAssignRoomOpen] = useState(false);
  const [assigningStudent, setAssigningStudent] = useState<StudentWithProfile | null>(null);
  const [selectedBlockId, setSelectedBlockId] = useState("");
  const [selectedFloorId, setSelectedFloorId] = useState("");
  const [selectedRoomId, setSelectedRoomId] = useState("");
  const [selectedBedId, setSelectedBedId] = useState("");

  // Filter state
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterCourse, setFilterCourse] = useState("all");
  const [filterYear, setFilterYear] = useState("all");
  const [filterRoom, setFilterRoom] = useState("all");
  const [deleteConfirmStudent, setDeleteConfirmStudent] = useState<StudentWithProfile | null>(null);

  // Reset password state
  const [resetPasswordOpen, setResetPasswordOpen] = useState(false);
  const [resetPasswordStudent, setResetPasswordStudent] = useState<StudentWithProfile | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [resetResult, setResetResult] = useState<{ password: string } | null>(null);
  const [isResetting, setIsResetting] = useState(false);

  // Exit student state
  const [exitDialogOpen, setExitDialogOpen] = useState(false);
  const [exitingStudent, setExitingStudent] = useState<StudentWithProfile | null>(null);
  const [exitInvoices, setExitInvoices] = useState<any[]>([]);
  const [exitRefunds, setExitRefunds] = useState<Record<string, { amount: string; reason: string; method: string; enabled: boolean }>>({});
  const [exitLoading, setExitLoading] = useState(false);
  const [exitProcessing, setExitProcessing] = useState(false);

  // Bulk selection state
  const [selectedStudents, setSelectedStudents] = useState<Set<string>>(new Set());
  const [bulkDeleteConfirmOpen, setBulkDeleteConfirmOpen] = useState(false);
  const [bulkProcessing, setBulkProcessing] = useState(false);

  const { students, stats, isLoading, error, updateStudent, deleteStudent } = useStudents();
  const { rooms } = useRooms();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Derive unique courses for filter
  const uniqueCourses = useMemo(() => {
    const courses = students.map(s => s.course).filter((c): c is string => !!c);
    return [...new Set(courses)].sort();
  }, [students]);

  // Derive cascading data for assign room dialog - extract unique blocks from rooms data
  const assignBlocks = rooms
    .map(r => r.floor?.block)
    .filter((b): b is NonNullable<typeof b> => !!b)
    .filter((b, i, arr) => arr.findIndex(x => x.id === b.id) === i)
    .sort((a, b) => a.name.localeCompare(b.name));
  const assignFloors = rooms
    .map(r => r.floor)
    .filter((f): f is NonNullable<typeof f> => !!f && f.block?.id === selectedBlockId)
    .filter((f, i, arr) => arr.findIndex(x => x.id === f.id) === i)
    .sort((a, b) => (a.floor_number ?? 0) - (b.floor_number ?? 0));
  const assignRooms = rooms
    .filter(r => r.floor?.id === selectedFloorId)
    .sort((a, b) => a.room_number.localeCompare(b.room_number));
  const assignBeds = (assignRooms.find(r => r.id === selectedRoomId)?.beds || [])
    .filter(bed => !bed.student_id && bed.status === "vacant");

  const parseCSV = (text: string) => {
    const lines = text.split(/\r?\n/).filter(l => l.trim());
    if (lines.length < 2) return [];
    const headers = lines[0].split(",").map(h => h.trim().toLowerCase().replace(/\s+/g, "_"));
    return lines.slice(1).map(line => {
      const values = line.split(",").map(v => v.trim());
      const obj: Record<string, string> = {};
      headers.forEach((h, i) => { obj[h] = values[i] || ""; });
      return obj;
    });
  };

  const parseExcel = async (file: File): Promise<Record<string, string>[]> => {
    const XLSX = await import("xlsx");
    const data = await file.arrayBuffer();
    const wb = XLSX.read(data, { type: "array", cellDates: true });
    const ws = wb.Sheets[wb.SheetNames[0]];

    // Auto-detect header row: find first row containing "Student Details" or "Enrollment number"
    const range = XLSX.utils.decode_range(ws["!ref"] || "A1");
    let headerRow = range.s.r; // default to first row
    const knownHeaders = ["student details", "enrollment number", "full_name", "email", "sr. no.", "form no", "student name", "father name", "contact no1", "gender", "grade", "stream"];
    for (let r = range.s.r; r <= Math.min(range.s.r + 20, range.e.r); r++) {
      const cellValues: string[] = [];
      for (let c = range.s.c; c <= range.e.c; c++) {
        const addr = XLSX.utils.encode_cell({ r, c });
        const cell = ws[addr];
        if (cell?.v) cellValues.push(String(cell.v).trim().toLowerCase());
      }
      if (cellValues.some(v => knownHeaders.includes(v))) {
        headerRow = r;
        break;
      }
    }

    // Parse from detected header row
    const jsonData = XLSX.utils.sheet_to_json<Record<string, any>>(ws, {
      defval: "",
      range: headerRow,
      raw: false,
    });

    return jsonData
      .filter(row => {
        // Skip completely empty rows and summary/total rows
        const vals = Object.values(row).filter(v => v !== "" && v != null);
        return vals.length >= 3;
      })
      .map(row => {
        const normalized: Record<string, string> = {};
        Object.keys(row).forEach(key => {
          const normalizedKey = key.trim().toLowerCase().replace(/\s+/g, "_");
          normalized[normalizedKey] = String(row[key] ?? "").trim();
        });
        return normalized;
      });
  };

  const parseAmount = (val: string | undefined): number => {
    if (!val) return 0;
    const str = String(val).trim();
    // Handle sum expressions like "90,000 + 21,000"
    if (str.includes("+")) {
      return str.split("+").reduce((sum, part) => sum + parseAmount(part.trim()), 0);
    }
    // Remove Indian-style commas and parse
    return parseFloat(str.replace(/,/g, "")) || 0;
  };

  const downloadTemplate = async () => {
    const XLSX = await import("xlsx");
    const headers = [
      "S.NO", "FORM NO", "STUDENT NAME", "FATHER NAME",
      "Gender", "CONTACT NO1", "CONTACT NO 2", "GRADE", "STREAM",
      "DATE OF THE PAYMENT", "FINAL FEE", "PAYMENT MODE-1", "AMOUNT 1",
      "TRANSCETION DETAILS-1", "PAYMENT MODE-2", "AMOUNT 2",
      "BALANCE PAYMENT DATE/AMT", "TRANSCETION DETAILS-2",
      "ACCOUNT NUMBER", "ALLOTED ROOM NO", "REMARKS"
    ];
    const sampleRow = [
      1, "CS2026001", "Rahul Sharma", "Ramesh Sharma",
      "Male", "9876543210", "9876543211", "B.Tech CSE", "Computer Science",
      "01-04-2026", "1,80,000", "RTGS", "1,00,000",
      "UTR123456", "UPI", "80,000",
      "", "", "1234567890", "A-101", ""
    ];

    const ws = XLSX.utils.aoa_to_sheet([headers, sampleRow]);
    ws["!cols"] = headers.map(h => ({ wch: Math.max(h.length + 2, 18) }));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Students");
    XLSX.writeFile(wb, "hostel_payment_template.xlsx");
  };

  const handleBulkUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const fileName = file.name.toLowerCase();
    const isExcel = fileName.endsWith(".xlsx") || fileName.endsWith(".xls") || fileName.endsWith(".xlsb") || fileName.endsWith(".xlsm");
    
    let rows: Record<string, string>[];
    try {
      if (isExcel) {
        rows = await parseExcel(file);
      } else {
        const text = await file.text();
        rows = parseCSV(text);
      }
    } catch (err: any) {
      toast({ title: "File Error", description: "Could not parse the file. Please use the template format.", variant: "destructive" });
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }
    
    if (rows.length === 0) {
      toast({ title: "Invalid CSV", description: "No data rows found. Please check the file format.", variant: "destructive" });
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    setBulkDialogOpen(true);
    setBulkUploading(true);
    setBulkProgress(0);
    const results: { success: { enrollmentNumber: string; password: string; name: string }[]; errors: { row: number; name: string; error: string }[] } = { success: [], errors: [] };

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      // Map all columns from row keys (already lowercased & underscored)
      const keys = Object.keys(row);
      const findCol = (patterns: string[]) => {
        for (const p of patterns) {
          const found = keys.find(k => k.includes(p));
          if (found && row[found]) return row[found];
        }
        return "";
      };

      // Transaction details columns: there are two with same header "transcetion_details-1"
      // First occurrence → transaction_details_1, second → transaction_details_2
      // In the normalized keys they may appear as transcetion_details-1 or similar
      const txnKeys = keys.filter(k => k.includes("transcetion") || k.includes("transaction"));
      const txn1 = txnKeys.length > 0 ? row[txnKeys[0]] || "" : "";
      const txn2 = txnKeys.length > 1 ? row[txnKeys[1]] || "" : "";

      const formData = {
        full_name: row.student_name || row.student_details || row.full_name || row.name || "",
        email: row.email || "",
        phone: row.contact_no1 || row.phone_number || row.phone || "",
        roll_number: row.form_no || row.enrollment_number || row.roll_number || "",
        course: row.grade || row.class || row.course || "",
        department: row.stream || row.department || "",
        year: row.year || "",
        date_of_birth: row.date_of_birth || "",
        blood_group: row.blood_group || "",
        emergency_contact: row.contact_no_2 || row.emergency_contact || "",
        father_name: row.father_name || "",
        gender: row.gender || "",
        // Finance fields
        payment_date: findCol(["date_of_the_payment", "payment_date"]),
        final_fee: String(parseAmount(findCol(["final_fee"]))),
        payment_mode_1: findCol(["payment_mode-1", "payment_mode_1"]),
        amount_1: String(parseAmount(findCol(["amount_1", "amount1"]))),
        transaction_details_1: txn1,
        payment_mode_2: findCol(["payment_mode-2", "payment_mode_2"]),
        amount_2: String(parseAmount(findCol(["amount_2", "amount2"]))),
        balance_payment: findCol(["balance_payment", "balance"]),
        transaction_details_2: txn2,
        account_number: findCol(["account_number"]),
        alloted_room_no: findCol(["alloted_room", "alloted_room_no"]),
        remarks: findCol(["remarks"]),
      };

      if (!formData.full_name || !formData.roll_number) {
        results.errors.push({ row: i + 2, name: formData.full_name || "Unknown", error: "Student name (STUDENT NAME) and Form No (FORM NO) are required" });
        setBulkProgress(((i + 1) / rows.length) * 100);
        continue;
      }

      try {
        const { data, error: fnError } = await supabase.functions.invoke("create-student", { body: formData });
        if (fnError) throw fnError;
        if (data?.existing) {
          results.errors.push({ row: i + 2, name: formData.full_name, error: `Enrollment ${formData.roll_number} already exists (skipped)` });
        } else if (data?.error) {
          throw new Error(data.error);
        } else {
          results.success.push({ enrollmentNumber: formData.roll_number, password: data.tempPassword, name: formData.full_name });
        }
      } catch (err: any) {
        results.errors.push({ row: i + 2, name: formData.full_name, error: err.message || "Failed" });
      }
      setBulkProgress(((i + 1) / rows.length) * 100);
    }

    setBulkResults(results);
    setBulkUploading(false);
    queryClient.invalidateQueries({ queryKey: ["students"] });
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const downloadCredentials = () => {
    if (!bulkResults) return;
    const csv = "name,enrollment_number,temporary_password\n" + bulkResults.success.map(s => `${s.name},${s.enrollmentNumber},${s.password}`).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "student_credentials.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  // Form state
  const [form, setForm] = useState({
    full_name: "",
    email: "",
    phone: "",
    roll_number: "",
    course: "",
    department: "",
    year: "",
    date_of_birth: "",
    blood_group: "",
    emergency_contact: "",
    father_name: "",
    gender: "",
  });

  const resetForm = () => {
    setForm({ full_name: "", email: "", phone: "", roll_number: "", course: "", department: "", year: "", date_of_birth: "", blood_group: "", emergency_contact: "", father_name: "", gender: "" });
    setCreatedCredentials(null);
  };

  const handleSubmit = async () => {
    if (!form.full_name.trim() || !form.roll_number.trim()) {
      toast({ title: "Validation Error", description: "Student name and enrollment number are required.", variant: "destructive" });
      return;
    }

    setIsSubmitting(true);
    try {
      const { data, error: fnError } = await supabase.functions.invoke("create-student", {
        body: form,
      });

      if (fnError) throw fnError;
      if (data?.error) throw new Error(data.error);

      setCreatedCredentials({ enrollmentNumber: form.roll_number, password: data.tempPassword });
      queryClient.invalidateQueries({ queryKey: ["students"] });
      toast({ title: "Student Added", description: `${form.full_name} has been registered successfully.` });
    } catch (err: any) {
      toast({ title: "Error", description: err.message || "Failed to create student", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopy = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    resetForm();
  };

  // Edit student handlers
  const openEditDialog = (student: StudentWithProfile) => {
    setEditingStudent(student);
    setEditForm({
      roll_number: student.roll_number || "",
      course: student.course || "",
      department: student.department || "",
      year: student.year?.toString() || "",
      date_of_birth: student.date_of_birth || "",
      blood_group: student.blood_group || "",
      emergency_contact: student.emergency_contact || "",
      status: student.status || "active",
    });
    setEditDialogOpen(true);
  };

  const handleEditSubmit = async () => {
    if (!editingStudent) return;
    setIsUpdating(true);
    try {
      await updateStudent.mutateAsync({
        id: editingStudent.id,
        roll_number: editForm.roll_number || null,
        course: editForm.course || null,
        department: editForm.department || null,
        year: editForm.year ? parseInt(editForm.year) : null,
        date_of_birth: editForm.date_of_birth || null,
        blood_group: editForm.blood_group || null,
        emergency_contact: editForm.emergency_contact || null,
        status: editForm.status || "active",
      });
      setEditDialogOpen(false);
      setEditingStudent(null);
    } catch (err: any) {
      // toast handled by hook
    } finally {
      setIsUpdating(false);
    }
  };

  // Assign room handlers
  const openAssignRoom = (student: StudentWithProfile) => {
    setAssigningStudent(student);
    setSelectedBlockId("");
    setSelectedFloorId("");
    setSelectedRoomId("");
    setSelectedBedId("");
    setAssignRoomOpen(true);
  };

  const handleAssignRoom = async () => {
    if (!assigningStudent || !selectedBedId) return;
    try {
      const { error } = await supabase
        .from("beds")
        .update({ student_id: assigningStudent.id, status: "occupied" })
        .eq("id", selectedBedId);
      if (error) throw error;
      queryClient.invalidateQueries({ queryKey: ["students"] });
      queryClient.invalidateQueries({ queryKey: ["rooms"] });
      toast({ title: "Room Assigned", description: `${assigningStudent.profile?.full_name} has been assigned to the selected bed.` });
      // Notify student
      createNotification(assigningStudent.user_id, "Room Assigned", "You have been assigned a room. Check your profile for details.", "general", "/student/profile");
      setAssignRoomOpen(false);
      setAssigningStudent(null);
    } catch (err: any) {
      toast({ title: "Error", description: err.message || "Failed to assign room", variant: "destructive" });
    }
  };

  const handleVacateBed = async (student: StudentWithProfile) => {
    if (!student.bed) return;
    try {
      const { error } = await supabase
        .from("beds")
        .update({ student_id: null, status: "vacant" })
        .eq("id", student.bed.id);
      if (error) throw error;
      queryClient.invalidateQueries({ queryKey: ["students"] });
      queryClient.invalidateQueries({ queryKey: ["rooms"] });
      toast({ title: "Bed Vacated", description: `${student.profile?.full_name} has been removed from the room.` });
    } catch (err: any) {
      toast({ title: "Error", description: err.message || "Failed to vacate bed", variant: "destructive" });
    }
  };

  // Reset password handler
  const handleResetPassword = async () => {
    if (!resetPasswordStudent) return;
    setIsResetting(true);
    try {
      const { data, error: fnError } = await supabase.functions.invoke("reset-student-password", {
        body: {
          user_id: resetPasswordStudent.user_id,
          new_password: newPassword.trim() || undefined,
        },
      });
      if (fnError) throw fnError;
      if (data?.error) throw new Error(data.error);
      setResetResult({ password: data.newPassword });
      toast({ title: "Password Reset", description: `Password updated for ${resetPasswordStudent.profile?.full_name}` });
    } catch (err: any) {
      toast({ title: "Error", description: err.message || "Failed to reset password", variant: "destructive" });
    } finally {
      setIsResetting(false);
    }
  };

  const openResetPassword = (student: StudentWithProfile) => {
    setResetPasswordStudent(student);
    setNewPassword("");
    setResetResult(null);
    setResetPasswordOpen(true);
  };

  // Exit student handlers
  const openExitDialog = async (student: StudentWithProfile) => {
    setExitingStudent(student);
    setExitDialogOpen(true);
    setExitLoading(true);
    setExitRefunds({});
    try {
      const { data: invoices } = await supabase
        .from("invoices")
        .select("*")
        .eq("student_id", student.id)
        .order("billing_month", { ascending: false });
      const inv = invoices || [];
      setExitInvoices(inv);
      const refundDefaults: Record<string, { amount: string; reason: string; method: string; enabled: boolean }> = {};
      inv.forEach((invoice: any) => {
        const paidAmt = Number(invoice.paid_amount || 0);
        if (paidAmt > 0 && invoice.status !== "refunded") {
          refundDefaults[invoice.id] = {
            amount: paidAmt.toString(),
            reason: "Student exit - pro-rata refund",
            method: "bank_transfer",
            enabled: true,
          };
        }
      });
      setExitRefunds(refundDefaults);
    } catch {
      setExitInvoices([]);
    } finally {
      setExitLoading(false);
    }
  };

  const handleExitStudent = async () => {
    if (!exitingStudent) return;
    setExitProcessing(true);
    try {
      // 1. Process refunds
      const selectedRefunds = Object.entries(exitRefunds).filter(([, v]) => v.enabled && Number(v.amount) > 0);
      const { data: properties } = await supabase.from("properties").select("id").limit(1);
      const propertyId = properties?.[0]?.id;
      
      for (const [invoiceId, refund] of selectedRefunds) {
        if (!propertyId) continue;
        const { error: refundErr } = await supabase.from("refunds").insert({
          invoice_id: invoiceId,
          student_id: exitingStudent.id,
          property_id: propertyId,
          amount: Number(refund.amount),
          reason: refund.reason,
          refund_method: refund.method,
          status: "processed",
        });
        if (refundErr) throw refundErr;
      }

      // 2. Vacate bed
      if (exitingStudent.bed) {
        const { error: bedErr } = await supabase
          .from("beds")
          .update({ student_id: null, status: "vacant" })
          .eq("id", exitingStudent.bed.id);
        if (bedErr) throw bedErr;
      }

      // 3. Mark student inactive
      const { error: statusErr } = await supabase
        .from("students")
        .update({ status: "inactive" })
        .eq("id", exitingStudent.id);
      if (statusErr) throw statusErr;

      queryClient.invalidateQueries({ queryKey: ["students"] });
      queryClient.invalidateQueries({ queryKey: ["rooms"] });
      toast({
        title: "Student Exited",
        description: `${exitingStudent.profile?.full_name} has been marked inactive.${selectedRefunds.length > 0 ? ` ${selectedRefunds.length} refund(s) processed.` : ""}`,
      });
      // Notify student
      createNotification(exitingStudent.user_id, "Account Deactivated", "Your hostel account has been deactivated. Contact admin for queries.", "general", "/student/profile");
      setExitDialogOpen(false);
      setExitingStudent(null);
    } catch (err: any) {
      toast({ title: "Error", description: err.message || "Failed to process exit", variant: "destructive" });
    } finally {
      setExitProcessing(false);
    }
  };

  // Filter students based on search and filters
  const activeFilterCount = [filterStatus, filterCourse, filterYear, filterRoom].filter(f => f !== "all").length;

  const filteredStudents = students.filter(student => {
    const name = student.profile?.full_name?.toLowerCase() || "";
    const rollNumber = student.roll_number?.toLowerCase() || "";
    const query = searchQuery.toLowerCase();
    const matchesSearch = name.includes(query) || rollNumber.includes(query);
    const matchesStatus = filterStatus === "all" || student.status === filterStatus;
    const matchesCourse = filterCourse === "all" || student.course === filterCourse;
    const matchesYear = filterYear === "all" || student.year?.toString() === filterYear;
    const matchesRoom = filterRoom === "all" || 
      (filterRoom === "allocated" ? !!student.bed : !student.bed);
    return matchesSearch && matchesStatus && matchesCourse && matchesYear && matchesRoom;
  });

  // Bulk selection helpers
  const toggleStudent = useCallback((id: string) => {
    setSelectedStudents(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }, []);

  const toggleAll = useCallback(() => {
    if (selectedStudents.size === filteredStudents.length) {
      setSelectedStudents(new Set());
    } else {
      setSelectedStudents(new Set(filteredStudents.map(s => s.id)));
    }
  }, [filteredStudents, selectedStudents.size]);

  const clearSelection = useCallback(() => setSelectedStudents(new Set()), []);

  const handleBulkStatusUpdate = async (status: string) => {
    setBulkProcessing(true);
    try {
      const ids = [...selectedStudents];
      const { error } = await supabase.from("students").update({ status }).in("id", ids);
      if (error) throw error;
      queryClient.invalidateQueries({ queryKey: ["students"] });
      toast({ title: "Status Updated", description: `${ids.length} student(s) marked as ${status}.` });
      clearSelection();
    } catch (err: any) {
      toast({ title: "Error", description: err.message || "Failed to update status", variant: "destructive" });
    } finally {
      setBulkProcessing(false);
    }
  };

  const handleBulkDelete = async () => {
    setBulkProcessing(true);
    try {
      const ids = [...selectedStudents];
      // Vacate beds first
      const { error: bedErr } = await supabase.from("beds").update({ student_id: null, status: "vacant" }).in("student_id", ids);
      if (bedErr) throw bedErr;
      const { error } = await supabase.from("students").delete().in("id", ids);
      if (error) throw error;
      queryClient.invalidateQueries({ queryKey: ["students"] });
      queryClient.invalidateQueries({ queryKey: ["rooms"] });
      toast({ title: "Students Deleted", description: `${ids.length} student(s) deleted.` });
      clearSelection();
      setBulkDeleteConfirmOpen(false);
    } catch (err: any) {
      toast({ title: "Error", description: err.message || "Failed to delete students", variant: "destructive" });
    } finally {
      setBulkProcessing(false);
    }
  };

  const handleBulkVacateRooms = async () => {
    setBulkProcessing(true);
    try {
      const ids = [...selectedStudents];
      const { error } = await supabase.from("beds").update({ student_id: null, status: "vacant" }).in("student_id", ids);
      if (error) throw error;
      queryClient.invalidateQueries({ queryKey: ["students"] });
      queryClient.invalidateQueries({ queryKey: ["rooms"] });
      toast({ title: "Rooms Vacated", description: `Beds vacated for ${ids.length} student(s).` });
      clearSelection();
    } catch (err: any) {
      toast({ title: "Error", description: err.message || "Failed to vacate rooms", variant: "destructive" });
    } finally {
      setBulkProcessing(false);
    }
  };

  const getStatusColor = (status: string | null) => {
    switch (status) {
      case "active": return "bg-green-500/10 text-green-600";
      case "on_leave": return "bg-yellow-500/10 text-yellow-600";
      case "inactive": return "bg-red-500/10 text-red-600";
      default: return "bg-gray-500/10 text-gray-600";
    }
  };

  const getRoomDisplay = (student: StudentWithProfile) => {
    if (!student.bed?.room) return "Not Allocated";
    const room = student.bed.room;
    const floor = room.floor;
    const block = floor?.block;
    return `${block?.name || "Block"} - ${room.room_number} - Bed ${student.bed.bed_number}`;
  };

  const statsData = [
    { label: "Total Students", value: stats.total.toString(), icon: Users, color: "text-primary" },
    { label: "Active", value: stats.active.toString(), icon: UserCheck, color: "text-green-500" },
    { label: "On Leave", value: stats.onLeave.toString(), icon: Clock, color: "text-yellow-500" },
    { label: "Inactive", value: stats.inactive.toString(), icon: UserX, color: "text-red-500" },
  ];

  if (error) {
    return (
      <>
        <div className="flex items-center justify-center h-64">
          <p className="text-destructive">Error loading students: {error.message}</p>
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
            <h1 className="text-2xl font-bold text-foreground">Students</h1>
            <p className="text-muted-foreground">Manage student profiles and allocations</p>
          </div>
          <div className="flex gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,.xlsx,.xls,.xlsb,.xlsm"
              className="hidden"
              onChange={handleBulkUpload}
            />
            <Button variant="outline" onClick={downloadTemplate}>
              <Download className="h-4 w-4 mr-2" />
              Download Template
            </Button>
            <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
              <Upload className="h-4 w-4 mr-2" />
              Bulk Upload
            </Button>
            <Button className="gradient-primary text-white" onClick={() => setDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Student
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {statsData.map((stat) => (
            <Card key={stat.label} className="border-border/50">
              <CardContent className="p-3 sm:p-4">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg bg-muted ${stat.color}`}>
                    <stat.icon className="h-4 w-4 sm:h-5 sm:w-5" />
                  </div>
                  <div>
                    <p className="text-xl sm:text-2xl font-bold">{stat.value}</p>
                    <p className="text-xs sm:text-sm text-muted-foreground">{stat.label}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Search */}
        <Card className="border-border/50">
          <CardContent className="p-3 sm:p-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search by name or roll number..." className="pl-10" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
              </div>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm" className="relative">
                    <Filter className="h-4 w-4 mr-2" /> Filters
                    {activeFilterCount > 0 && (
                      <Badge className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center text-[10px] bg-primary text-primary-foreground">
                        {activeFilterCount}
                      </Badge>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-72 space-y-4" align="end">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold">Status</Label>
                    <Select value={filterStatus} onValueChange={setFilterStatus}>
                      <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Statuses</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="on_leave">On Leave</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold">Course</Label>
                    <Select value={filterCourse} onValueChange={setFilterCourse}>
                      <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Courses</SelectItem>
                        {uniqueCourses.map(c => (
                          <SelectItem key={c} value={c}>{c}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold">Year</Label>
                    <Select value={filterYear} onValueChange={setFilterYear}>
                      <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Years</SelectItem>
                        <SelectItem value="1">1st Year</SelectItem>
                        <SelectItem value="2">2nd Year</SelectItem>
                        <SelectItem value="3">3rd Year</SelectItem>
                        <SelectItem value="4">4th Year</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold">Room Status</Label>
                    <Select value={filterRoom} onValueChange={setFilterRoom}>
                      <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All</SelectItem>
                        <SelectItem value="allocated">Allocated</SelectItem>
                        <SelectItem value="not_allocated">Not Allocated</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {activeFilterCount > 0 && (
                    <Button variant="ghost" size="sm" className="w-full text-xs" onClick={() => {
                      setFilterStatus("all");
                      setFilterCourse("all");
                      setFilterYear("all");
                      setFilterRoom("all");
                    }}>
                      Clear All Filters
                    </Button>
                  )}
                </PopoverContent>
              </Popover>
            </div>
          </CardContent>
        </Card>

        {/* Students Table / Cards */}
        <Card className="border-border/50">
          <CardHeader className="p-3 sm:p-6">
            <CardTitle className="text-base sm:text-lg">All Students</CardTitle>
            <CardDescription className="text-xs sm:text-sm">
              {isLoading ? "Loading..." : `${filteredStudents.length} students found`}
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0 sm:p-6 sm:pt-0">
            {isLoading ? (
              <div className="flex items-center justify-center h-32">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : filteredStudents.length === 0 ? (
              <div className="text-center py-12 px-4">
                <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No students found</h3>
                <p className="text-muted-foreground mb-4 text-sm">
                  {searchQuery ? "Try adjusting your search" : "Add your first student to get started"}
                </p>
                <Button className="gradient-primary text-white" onClick={() => setDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" /> Add Student
                </Button>
              </div>
            ) : (
              <>
                {/* Mobile cards */}
                <div className="sm:hidden space-y-2 p-3">
                  {filteredStudents.map((student) => (
                    <Card key={student.id} className="border-border/50">
                      <CardContent className="p-3">
                        <div className="flex items-center gap-3">
                          <Checkbox
                            checked={selectedStudents.has(student.id)}
                            onCheckedChange={() => toggleStudent(student.id)}
                          />
                          <Avatar className="h-9 w-9">
                            <AvatarImage src={student.profile?.avatar_url || ""} />
                            <AvatarFallback className="bg-primary/10 text-primary text-xs">
                              {student.profile?.full_name?.split(" ").map(n => n[0]).join("") || "?"}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-sm truncate">{student.profile?.full_name || "Unknown"}</p>
                            <p className="text-xs text-muted-foreground">{student.roll_number || "No Roll #"} • {student.course || "-"}</p>
                          </div>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="bg-popover">
                              <DropdownMenuItem onClick={() => openEditDialog(student)}>
                                <Pencil className="h-4 w-4 mr-2" /> Edit Details
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => openResetPassword(student)}>
                                <KeyRound className="h-4 w-4 mr-2" /> Reset Password
                              </DropdownMenuItem>
                              {student.bed ? (
                                <DropdownMenuItem onClick={() => handleVacateBed(student)} className="text-destructive">
                                  <BedDouble className="h-4 w-4 mr-2" /> Vacate Room
                                </DropdownMenuItem>
                              ) : (
                                <DropdownMenuItem onClick={() => openAssignRoom(student)}>
                                  <BedDouble className="h-4 w-4 mr-2" /> Assign Room
                                </DropdownMenuItem>
                              )}
                              {student.status === "active" && (
                                <>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem onClick={() => openExitDialog(student)} className="text-orange-600">
                                    <LogOut className="h-4 w-4 mr-2" /> Exit Student
                                  </DropdownMenuItem>
                                </>
                              )}
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={() => setDeleteConfirmStudent(student)} className="text-destructive">
                                <Trash2 className="h-4 w-4 mr-2" /> Delete Student
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                        <div className="flex items-center justify-between mt-2">
                          <p className="text-xs text-muted-foreground">Room: {getRoomDisplay(student)}</p>
                          <Badge variant="secondary" className={`${getStatusColor(student.status)} text-[10px]`}>
                            {student.status || "unknown"}
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* Desktop table */}
                <div className="hidden sm:block overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[40px]">
                          <Checkbox
                            checked={filteredStudents.length > 0 && selectedStudents.size === filteredStudents.length}
                            onCheckedChange={toggleAll}
                          />
                        </TableHead>
                        <TableHead>Student</TableHead>
                        <TableHead>Room</TableHead>
                        <TableHead>Course</TableHead>
                        <TableHead>Final Fee</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="w-[50px]"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredStudents.map((student) => (
                        <TableRow key={student.id} data-state={selectedStudents.has(student.id) ? "selected" : undefined}>
                          <TableCell>
                            <Checkbox
                              checked={selectedStudents.has(student.id)}
                              onCheckedChange={() => toggleStudent(student.id)}
                            />
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <Avatar className="h-9 w-9">
                                <AvatarImage src={student.profile?.avatar_url || ""} />
                                <AvatarFallback className="bg-primary/10 text-primary">
                                  {student.profile?.full_name?.split(" ").map(n => n[0]).join("") || "?"}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium">{student.profile?.full_name || "Unknown"}</p>
                                <p className="text-sm text-muted-foreground">{student.roll_number || "No Roll #"}</p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <p className="text-sm">{getRoomDisplay(student)}</p>
                            {(student as any).alloted_room_no && !student.bed?.room && (
                              <p className="text-xs text-muted-foreground">Allotted: {(student as any).alloted_room_no}</p>
                            )}
                          </TableCell>
                          <TableCell>
                            <p className="text-sm">{student.course || "-"}</p>
                            <p className="text-xs text-muted-foreground">{student.year ? `Year ${student.year}` : ""}</p>
                          </TableCell>
                          <TableCell>
                            {(student as any).final_fee > 0 ? (
                              <p className="text-sm font-medium">₹{Number((student as any).final_fee).toLocaleString("en-IN")}</p>
                            ) : (
                              <p className="text-sm text-muted-foreground">-</p>
                            )}
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary" className={getStatusColor(student.status)}>
                              {student.status || "unknown"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="bg-popover">
                                <DropdownMenuItem onClick={() => openEditDialog(student)}>
                                  <Pencil className="h-4 w-4 mr-2" /> Edit Details
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => openResetPassword(student)}>
                                  <KeyRound className="h-4 w-4 mr-2" /> Reset Password
                                </DropdownMenuItem>
                                {student.bed ? (
                                  <DropdownMenuItem onClick={() => handleVacateBed(student)} className="text-destructive">
                                    <BedDouble className="h-4 w-4 mr-2" /> Vacate Room
                                  </DropdownMenuItem>
                                ) : (
                                  <DropdownMenuItem onClick={() => openAssignRoom(student)}>
                                    <BedDouble className="h-4 w-4 mr-2" /> Assign Room
                                  </DropdownMenuItem>
                                )}
                                {student.status === "active" && (
                                  <>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem onClick={() => openExitDialog(student)} className="text-orange-600">
                                      <LogOut className="h-4 w-4 mr-2" /> Exit Student
                                    </DropdownMenuItem>
                                  </>
                                )}
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => setDeleteConfirmStudent(student)} className="text-destructive">
                                  <Trash2 className="h-4 w-4 mr-2" /> Delete Student
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

        {/* Bulk Action Bar */}
        {selectedStudents.size > 0 && (
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-card border border-border shadow-lg rounded-lg px-4 py-3 flex items-center gap-3 flex-wrap">
            <span className="text-sm font-medium">{selectedStudents.size} selected</span>
            <Separator orientation="vertical" className="h-6" />
            <Button size="sm" variant="outline" onClick={() => handleBulkStatusUpdate("active")} disabled={bulkProcessing}>
              <UserCheck className="h-4 w-4 mr-1" /> Mark Active
            </Button>
            <Button size="sm" variant="outline" onClick={() => handleBulkStatusUpdate("inactive")} disabled={bulkProcessing}>
              <UserX className="h-4 w-4 mr-1" /> Mark Inactive
            </Button>
            <Button size="sm" variant="outline" onClick={handleBulkVacateRooms} disabled={bulkProcessing}>
              <BedDouble className="h-4 w-4 mr-1" /> Vacate Rooms
            </Button>
            <Button size="sm" variant="destructive" onClick={() => setBulkDeleteConfirmOpen(true)} disabled={bulkProcessing}>
              <Trash2 className="h-4 w-4 mr-1" /> Delete
            </Button>
            <Button size="sm" variant="ghost" onClick={clearSelection} disabled={bulkProcessing}>
              <X className="h-4 w-4 mr-1" /> Clear
            </Button>
          </div>
        )}

        {/* Bulk Delete Confirmation */}
        <AlertDialog open={bulkDeleteConfirmOpen} onOpenChange={setBulkDeleteConfirmOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete {selectedStudents.size} Students?</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently remove {selectedStudents.size} student(s) and vacate their beds. This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={bulkProcessing}>Cancel</AlertDialogCancel>
              <AlertDialogAction
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                onClick={handleBulkDelete}
                disabled={bulkProcessing}
              >
                {bulkProcessing ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Deleting...</> : "Delete All"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

      <Dialog open={dialogOpen} onOpenChange={(open) => { if (!open) handleCloseDialog(); else setDialogOpen(true); }}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          {!createdCredentials ? (
            <>
              <DialogHeader>
                <DialogTitle>Add New Student</DialogTitle>
                <DialogDescription>Fill in the student details. A login account will be created automatically.</DialogDescription>
              </DialogHeader>

              <div className="space-y-4 py-2">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="sm:col-span-2">
                    <Label className="text-xs font-semibold">Student Name *</Label>
                    <Input placeholder="e.g. Rahul Sharma" value={form.full_name} onChange={(e) => setForm(f => ({ ...f, full_name: e.target.value }))} />
                  </div>
                  <div>
                    <Label className="text-xs font-semibold">Form No (Enrollment Number) *</Label>
                    <Input placeholder="CS2026001" value={form.roll_number} onChange={(e) => setForm(f => ({ ...f, roll_number: e.target.value }))} />
                  </div>
                  <div>
                    <Label className="text-xs font-semibold">Father Name</Label>
                    <Input placeholder="e.g. Ramesh Sharma" value={form.father_name} onChange={(e) => setForm(f => ({ ...f, father_name: e.target.value }))} />
                  </div>
                  <div>
                    <Label className="text-xs font-semibold">Gender</Label>
                    <Select value={form.gender} onValueChange={(v) => setForm(f => ({ ...f, gender: v }))}>
                      <SelectTrigger><SelectValue placeholder="Select gender" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Male">Male</SelectItem>
                        <SelectItem value="Female">Female</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-xs font-semibold">Contact No 1</Label>
                    <Input placeholder="+91 9876543210" value={form.phone} onChange={(e) => setForm(f => ({ ...f, phone: e.target.value }))} />
                  </div>
                  <div>
                    <Label className="text-xs font-semibold">Contact No 2</Label>
                    <Input placeholder="+91 9876543210" value={form.emergency_contact} onChange={(e) => setForm(f => ({ ...f, emergency_contact: e.target.value }))} />
                  </div>
                  <div>
                    <Label className="text-xs font-semibold">Email</Label>
                    <Input type="email" placeholder="student@email.com (optional)" value={form.email} onChange={(e) => setForm(f => ({ ...f, email: e.target.value }))} />
                  </div>
                  <div>
                    <Label className="text-xs font-semibold">Grade</Label>
                    <Input placeholder="B.Tech CSE" value={form.course} onChange={(e) => setForm(f => ({ ...f, course: e.target.value }))} />
                  </div>
                  <div>
                    <Label className="text-xs font-semibold">Stream</Label>
                    <Input placeholder="Computer Science" value={form.department} onChange={(e) => setForm(f => ({ ...f, department: e.target.value }))} />
                  </div>
                  <div>
                    <Label className="text-xs font-semibold">Year</Label>
                    <Select value={form.year} onValueChange={(v) => setForm(f => ({ ...f, year: v }))}>
                      <SelectTrigger><SelectValue placeholder="Select year" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1st Year</SelectItem>
                        <SelectItem value="2">2nd Year</SelectItem>
                        <SelectItem value="3">3rd Year</SelectItem>
                        <SelectItem value="4">4th Year</SelectItem>
                        <SelectItem value="5">5th Year</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-xs font-semibold">Date of Birth</Label>
                    <Input type="date" value={form.date_of_birth} onChange={(e) => setForm(f => ({ ...f, date_of_birth: e.target.value }))} />
                  </div>
                  <div>
                    <Label className="text-xs font-semibold">Blood Group</Label>
                    <Select value={form.blood_group} onValueChange={(v) => setForm(f => ({ ...f, blood_group: v }))}>
                      <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                      <SelectContent>
                        {["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"].map(bg => (
                          <SelectItem key={bg} value={bg}>{bg}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={handleCloseDialog}>Cancel</Button>
                <Button className="gradient-primary text-white" onClick={handleSubmit} disabled={isSubmitting}>
                  {isSubmitting ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Creating...</> : <><Plus className="h-4 w-4 mr-2" /> Add Student</>}
                </Button>
              </DialogFooter>
            </>
          ) : (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-500" /> Student Created!
                </DialogTitle>
                <DialogDescription>Share these login credentials with the student. They will use their enrollment number to sign in.</DialogDescription>
              </DialogHeader>

              <div className="space-y-3 py-4">
                <div className="bg-muted rounded-lg p-4 space-y-3">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Enrollment Number (Login ID)</p>
                    <div className="flex items-center gap-2">
                      <code className="flex-1 text-sm font-mono bg-background rounded px-2 py-1">{createdCredentials.enrollmentNumber}</code>
                      <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => handleCopy(createdCredentials.enrollmentNumber, "enrollment")}>
                        {copiedField === "enrollment" ? <CheckCircle2 className="h-3.5 w-3.5 text-green-500" /> : <Copy className="h-3.5 w-3.5" />}
                      </Button>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Temporary Password</p>
                    <div className="flex items-center gap-2">
                      <code className="flex-1 text-sm font-mono bg-background rounded px-2 py-1">{createdCredentials.password}</code>
                      <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => handleCopy(createdCredentials.password, "password")}>
                        {copiedField === "password" ? <CheckCircle2 className="h-3.5 w-3.5 text-green-500" /> : <Copy className="h-3.5 w-3.5" />}
                      </Button>
                    </div>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">⚠️ Make sure to copy the password now. It won't be shown again.</p>
              </div>

              <DialogFooter>
                <Button className="gradient-primary text-white w-full" onClick={handleCloseDialog}>Done</Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Bulk Upload Dialog */}
      <Dialog open={bulkDialogOpen} onOpenChange={(open) => { if (!bulkUploading) { setBulkDialogOpen(open); if (!open) setBulkResults(null); } }}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{bulkUploading ? "Uploading Students..." : bulkResults ? "Upload Complete" : "Bulk Upload"}</DialogTitle>
            <DialogDescription>
              {bulkUploading ? "Please wait while students are being created." : bulkResults ? `${bulkResults.success.length} created, ${bulkResults.errors.length} failed.` : "Upload a CSV or Excel file (.xlsx, .xls) to add multiple students."}
            </DialogDescription>
          </DialogHeader>

          {bulkUploading && (
            <div className="py-4 space-y-3">
              <Progress value={bulkProgress} className="h-2" />
              <p className="text-sm text-muted-foreground text-center">{Math.round(bulkProgress)}% complete</p>
            </div>
          )}

          {bulkResults && !bulkUploading && (
            <div className="space-y-4 py-2">
              {bulkResults.success.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    {bulkResults.success.length} students created successfully
                  </div>
                  <Button variant="outline" size="sm" onClick={downloadCredentials} className="w-full">
                    <Download className="h-4 w-4 mr-2" />
                    Download Credentials CSV
                  </Button>
                  <p className="text-xs text-muted-foreground">⚠️ Download credentials now. Passwords cannot be retrieved later.</p>
                </div>
              )}

              {bulkResults.errors.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm font-medium text-destructive">
                    <AlertCircle className="h-4 w-4" />
                    {bulkResults.errors.length} rows failed
                  </div>
                  <div className="bg-muted rounded-lg p-3 max-h-40 overflow-y-auto space-y-1">
                    {bulkResults.errors.map((err, i) => (
                      <p key={i} className="text-xs">
                        <span className="font-medium">Row {err.row}</span> ({err.name}): {err.error}
                      </p>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {!bulkUploading && !bulkResults && (
            <div className="py-4 space-y-3">
              <Button variant="outline" size="sm" onClick={downloadTemplate} className="w-full">
                <Download className="h-4 w-4 mr-2" />
                Download Excel Template
              </Button>
              <p className="text-xs text-muted-foreground">
                Required columns: <code className="bg-muted px-1 rounded">STUDENT NAME</code>, <code className="bg-muted px-1 rounded">FORM NO</code>. Optional: FATHER NAME, Gender, CONTACT NO1/2, GRADE, STREAM, DATE OF THE PAYMENT, FINAL FEE, PAYMENT MODE-1/2, AMOUNT 1/2, TRANSACTION DETAILS, BALANCE PAYMENT, ACCOUNT NUMBER, ALLOTED ROOM NO, REMARKS.
              </p>
            </div>
          )}

          <DialogFooter>
            {!bulkUploading && (
              <Button onClick={() => { setBulkDialogOpen(false); setBulkResults(null); }}>
                Done
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Student Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Student Details</DialogTitle>
            <DialogDescription>
              Update details for {editingStudent?.profile?.full_name || "student"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <Label className="text-xs font-semibold">Roll Number</Label>
                <Input value={editForm.roll_number} onChange={(e) => setEditForm(f => ({ ...f, roll_number: e.target.value }))} />
              </div>
              <div>
                <Label className="text-xs font-semibold">Course</Label>
                <Input value={editForm.course} onChange={(e) => setEditForm(f => ({ ...f, course: e.target.value }))} />
              </div>
              <div>
                <Label className="text-xs font-semibold">Department</Label>
                <Input value={editForm.department} onChange={(e) => setEditForm(f => ({ ...f, department: e.target.value }))} />
              </div>
              <div>
                <Label className="text-xs font-semibold">Year</Label>
                <Select value={editForm.year} onValueChange={(v) => setEditForm(f => ({ ...f, year: v }))}>
                  <SelectTrigger><SelectValue placeholder="Select year" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1st Year</SelectItem>
                    <SelectItem value="2">2nd Year</SelectItem>
                    <SelectItem value="3">3rd Year</SelectItem>
                    <SelectItem value="4">4th Year</SelectItem>
                    <SelectItem value="5">5th Year</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs font-semibold">Date of Birth</Label>
                <Input type="date" value={editForm.date_of_birth} onChange={(e) => setEditForm(f => ({ ...f, date_of_birth: e.target.value }))} />
              </div>
              <div>
                <Label className="text-xs font-semibold">Blood Group</Label>
                <Select value={editForm.blood_group} onValueChange={(v) => setEditForm(f => ({ ...f, blood_group: v }))}>
                  <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>
                    {["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"].map(bg => (
                      <SelectItem key={bg} value={bg}>{bg}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs font-semibold">Emergency Contact</Label>
                <Input value={editForm.emergency_contact} onChange={(e) => setEditForm(f => ({ ...f, emergency_contact: e.target.value }))} />
              </div>
              <div>
                <Label className="text-xs font-semibold">Status</Label>
                <Select value={editForm.status} onValueChange={(v) => setEditForm(f => ({ ...f, status: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="on_leave">On Leave</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>Cancel</Button>
            <Button className="gradient-primary text-white" onClick={handleEditSubmit} disabled={isUpdating}>
              {isUpdating ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Saving...</> : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Assign Room Dialog */}
      <Dialog open={assignRoomOpen} onOpenChange={setAssignRoomOpen}>
        <DialogContent className="bg-background">
          <DialogHeader>
            <DialogTitle>Assign Room</DialogTitle>
            <DialogDescription>
              Select a bed for {assigningStudent?.profile?.full_name || "student"}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            {/* Block */}
            <div className="space-y-1.5">
              <Label>Block</Label>
              <Select value={selectedBlockId} onValueChange={(v) => { setSelectedBlockId(v); setSelectedFloorId(""); setSelectedRoomId(""); setSelectedBedId(""); }}>
                <SelectTrigger><SelectValue placeholder="Select block..." /></SelectTrigger>
                <SelectContent className="bg-popover">
                  {assignBlocks.map(b => (
                    <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Floor */}
            {selectedBlockId && (
              <div className="space-y-1.5">
                <Label>Floor</Label>
                <Select value={selectedFloorId} onValueChange={(v) => { setSelectedFloorId(v); setSelectedRoomId(""); setSelectedBedId(""); }}>
                  <SelectTrigger><SelectValue placeholder="Select floor..." /></SelectTrigger>
                  <SelectContent className="bg-popover">
                    {assignFloors.map(f => (
                      <SelectItem key={f.id} value={f.id}>Floor {f.floor_number}{f.name ? ` - ${f.name}` : ""}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {assignFloors.length === 0 && <p className="text-xs text-muted-foreground">No floors in this block</p>}
              </div>
            )}

            {/* Room */}
            {selectedFloorId && (
              <div className="space-y-1.5">
                <Label>Room</Label>
                <Select value={selectedRoomId} onValueChange={(v) => { setSelectedRoomId(v); setSelectedBedId(""); }}>
                  <SelectTrigger><SelectValue placeholder="Select room..." /></SelectTrigger>
                  <SelectContent className="bg-popover">
                    {assignRooms.map(r => (
                      <SelectItem key={r.id} value={r.id}>Room {r.room_number} ({r.room_type})</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {assignRooms.length === 0 && <p className="text-xs text-muted-foreground">No rooms on this floor</p>}
              </div>
            )}

            {/* Bed */}
            {selectedRoomId && (
              <div className="space-y-1.5">
                <Label>Bed</Label>
                <Select value={selectedBedId} onValueChange={setSelectedBedId}>
                  <SelectTrigger><SelectValue placeholder="Select bed..." /></SelectTrigger>
                  <SelectContent className="bg-popover">
                    {assignBeds.map(bed => (
                      <SelectItem key={bed.id} value={bed.id}>Bed {bed.bed_number}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {assignBeds.length === 0 && <p className="text-xs text-muted-foreground">No vacant beds in this room</p>}
              </div>
            )}

            {!assignBlocks.length && (
              <p className="text-sm text-muted-foreground text-center py-4">No blocks found. Please add property structure first.</p>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAssignRoomOpen(false)}>Cancel</Button>
            <Button className="gradient-primary text-white" onClick={handleAssignRoom} disabled={!selectedBedId}>
              Assign
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Student Confirmation */}
      <AlertDialog open={!!deleteConfirmStudent} onOpenChange={(open) => { if (!open) setDeleteConfirmStudent(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Student?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove {deleteConfirmStudent?.profile?.full_name || "this student"} from the system.
              {deleteConfirmStudent?.bed && " Their bed assignment will also be vacated."}
              {" "}This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                if (deleteConfirmStudent) {
                  deleteStudent.mutate(deleteConfirmStudent.id);
                  setDeleteConfirmStudent(null);
                }
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Exit Student Dialog */}
      <Dialog open={exitDialogOpen} onOpenChange={(open) => { if (!exitProcessing) { setExitDialogOpen(open); if (!open) setExitingStudent(null); } }}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <LogOut className="h-5 w-5" /> Exit Student
            </DialogTitle>
            <DialogDescription>
              Process the exit for {exitingStudent?.profile?.full_name || "this student"}. This will vacate their bed, mark them inactive, and process any refunds.
            </DialogDescription>
          </DialogHeader>

          {exitLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="space-y-6 py-2">
              {/* Student Summary */}
              <div className="bg-muted rounded-lg p-4 space-y-2">
                <h4 className="text-sm font-semibold">Student Summary</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-muted-foreground">Name:</span>{" "}
                    <span className="font-medium">{exitingStudent?.profile?.full_name || "Unknown"}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Roll No:</span>{" "}
                    <span className="font-medium">{exitingStudent?.roll_number || "N/A"}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Room:</span>{" "}
                    <span className="font-medium">{exitingStudent ? getRoomDisplay(exitingStudent) : "N/A"}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Admission:</span>{" "}
                    <span className="font-medium">{exitingStudent?.admission_date || "N/A"}</span>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Invoices & Refunds */}
              <div className="space-y-3">
                <h4 className="text-sm font-semibold flex items-center gap-2">
                  <IndianRupee className="h-4 w-4" /> Refund Processing
                </h4>
                {exitInvoices.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No invoices found for this student.</p>
                ) : (
                  <div className="space-y-3">
                    {exitInvoices.map((invoice: any) => {
                      const paidAmt = Number(invoice.paid_amount || 0);
                      const refund = exitRefunds[invoice.id];
                      const isRefundable = paidAmt > 0 && invoice.status !== "refunded";

                      return (
                        <div key={invoice.id} className="border rounded-lg p-3 space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="text-sm">
                              <span className="font-medium">{invoice.invoice_number}</span>
                              <span className="text-muted-foreground ml-2">
                                ({invoice.billing_month}) — ₹{Number(invoice.total_amount).toLocaleString("en-IN")}
                              </span>
                            </div>
                            <Badge variant="secondary" className={
                              invoice.status === "paid" ? "bg-green-500/10 text-green-600" :
                              invoice.status === "pending" ? "bg-yellow-500/10 text-yellow-600" :
                              "bg-muted text-muted-foreground"
                            }>
                              {invoice.status}
                            </Badge>
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Paid: ₹{paidAmt.toLocaleString("en-IN")} / Total: ₹{Number(invoice.total_amount).toLocaleString("en-IN")}
                          </div>

                          {isRefundable && refund && (
                            <div className="bg-muted/50 rounded p-3 space-y-2 mt-1">
                              <div className="flex items-center gap-2">
                                <input
                                  type="checkbox"
                                  checked={refund.enabled}
                                  onChange={(e) => setExitRefunds(prev => ({
                                    ...prev,
                                    [invoice.id]: { ...prev[invoice.id], enabled: e.target.checked }
                                  }))}
                                  className="rounded"
                                />
                                <Label className="text-xs font-semibold">Process Refund</Label>
                              </div>
                              {refund.enabled && (
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                                  <div>
                                    <Label className="text-xs">Amount (₹)</Label>
                                    <Input
                                      type="number"
                                      value={refund.amount}
                                      max={paidAmt}
                                      onChange={(e) => setExitRefunds(prev => ({
                                        ...prev,
                                        [invoice.id]: { ...prev[invoice.id], amount: e.target.value }
                                      }))}
                                      className="h-8 text-sm"
                                    />
                                  </div>
                                  <div>
                                    <Label className="text-xs">Method</Label>
                                    <Select
                                      value={refund.method}
                                      onValueChange={(v) => setExitRefunds(prev => ({
                                        ...prev,
                                        [invoice.id]: { ...prev[invoice.id], method: v }
                                      }))}
                                    >
                                      <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                                        <SelectItem value="cash">Cash</SelectItem>
                                        <SelectItem value="upi">UPI</SelectItem>
                                        <SelectItem value="cheque">Cheque</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>
                                  <div className="sm:col-span-1">
                                    <Label className="text-xs">Reason</Label>
                                    <Input
                                      value={refund.reason}
                                      onChange={(e) => setExitRefunds(prev => ({
                                        ...prev,
                                        [invoice.id]: { ...prev[invoice.id], reason: e.target.value }
                                      }))}
                                      className="h-8 text-sm"
                                      placeholder="Reason for refund"
                                    />
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              <Separator />

              {/* Confirmation Summary */}
              <div className="bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-800 rounded-lg p-4 space-y-2">
                <h4 className="text-sm font-semibold text-orange-700 dark:text-orange-400">Actions on Confirm</h4>
                <ul className="text-sm text-orange-600 dark:text-orange-400 space-y-1">
                  {exitingStudent?.bed && <li>• Vacate bed: {getRoomDisplay(exitingStudent)}</li>}
                  <li>• Mark student as <strong>inactive</strong></li>
                  {Object.values(exitRefunds).filter(r => r.enabled && Number(r.amount) > 0).length > 0 && (
                    <li>
                      • Process {Object.values(exitRefunds).filter(r => r.enabled && Number(r.amount) > 0).length} refund(s) totalling ₹
                      {Object.values(exitRefunds)
                        .filter(r => r.enabled && Number(r.amount) > 0)
                        .reduce((sum, r) => sum + Number(r.amount), 0)
                        .toLocaleString("en-IN")}
                    </li>
                  )}
                </ul>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => { setExitDialogOpen(false); setExitingStudent(null); }} disabled={exitProcessing}>
              Cancel
            </Button>
            <Button
              className="bg-orange-600 hover:bg-orange-700 text-white"
              onClick={handleExitStudent}
              disabled={exitProcessing || exitLoading}
            >
              {exitProcessing ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Processing...</> : <><LogOut className="h-4 w-4 mr-2" /> Confirm Exit</>}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reset Password Dialog */}
      <Dialog open={resetPasswordOpen} onOpenChange={(open) => { if (!isResetting) { setResetPasswordOpen(open); if (!open) { setResetPasswordStudent(null); setResetResult(null); } } }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <KeyRound className="h-5 w-5" /> Reset Student Password
            </DialogTitle>
            <DialogDescription>
              Reset password for {resetPasswordStudent?.profile?.full_name || "student"} ({resetPasswordStudent?.profile?.email})
            </DialogDescription>
          </DialogHeader>

          {resetResult ? (
            <div className="space-y-4">
              <div className="rounded-lg border border-border bg-muted/50 p-4 space-y-3">
                <div>
                  <Label className="text-xs text-muted-foreground">Email</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <code className="text-sm font-mono bg-background px-2 py-1 rounded flex-1">{resetPasswordStudent?.profile?.email}</code>
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { navigator.clipboard.writeText(resetPasswordStudent?.profile?.email || ""); setCopiedField("reset-email"); setTimeout(() => setCopiedField(null), 2000); }}>
                      {copiedField === "reset-email" ? <CheckCircle2 className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">New Password</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <code className="text-sm font-mono bg-background px-2 py-1 rounded flex-1">{resetResult.password}</code>
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { navigator.clipboard.writeText(resetResult.password); setCopiedField("reset-pass"); setTimeout(() => setCopiedField(null), 2000); }}>
                      {copiedField === "reset-pass" ? <CheckCircle2 className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">Share these credentials securely with the student.</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <Label htmlFor="new-password">New Password (leave empty to auto-generate)</Label>
                <Input
                  id="new-password"
                  type="text"
                  placeholder="Enter new password or leave blank"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="mt-1"
                />
                <p className="text-xs text-muted-foreground mt-1">If left empty, a secure random password will be generated.</p>
              </div>
            </div>
          )}

          <DialogFooter>
            {resetResult ? (
              <Button onClick={() => { setResetPasswordOpen(false); setResetPasswordStudent(null); setResetResult(null); }}>
                Done
              </Button>
            ) : (
              <>
                <Button variant="outline" onClick={() => setResetPasswordOpen(false)} disabled={isResetting}>Cancel</Button>
                <Button onClick={handleResetPassword} disabled={isResetting}>
                  {isResetting ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Resetting...</> : "Reset Password"}
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default Students;
