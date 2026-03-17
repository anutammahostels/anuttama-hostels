import { useState, useRef } from "react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Search, Filter, MoreVertical, Upload, Users, UserCheck, UserX, Clock, Loader2, Copy, CheckCircle2, Download, AlertCircle, BedDouble, Pencil } from "lucide-react";
import { useStudents, type StudentWithProfile } from "@/hooks/useStudents";
import { useRooms } from "@/hooks/useRooms";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { Progress } from "@/components/ui/progress";

const Students = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdCredentials, setCreatedCredentials] = useState<{ email: string; password: string } | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [bulkDialogOpen, setBulkDialogOpen] = useState(false);
  const [bulkUploading, setBulkUploading] = useState(false);
  const [bulkProgress, setBulkProgress] = useState(0);
  const [bulkResults, setBulkResults] = useState<{ success: { email: string; password: string; name: string }[]; errors: { row: number; name: string; error: string }[] } | null>(null);
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

  const { students, stats, isLoading, error, updateStudent } = useStudents();
  const { rooms, blocks } = useRooms();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Derive cascading data for assign room dialog
  const assignBlocks = blocks || [];
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

  const downloadTemplate = () => {
    const csv = "full_name,email,phone,roll_number,course,department,year,date_of_birth,blood_group,emergency_contact\nRahul Sharma,rahul@example.com,+919876543210,CS2026001,B.Tech CSE,Computer Science,1,2005-01-15,A+,+919876543211";
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "students_template.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleBulkUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const text = await file.text();
    const rows = parseCSV(text);
    
    if (rows.length === 0) {
      toast({ title: "Invalid CSV", description: "No data rows found. Please check the file format.", variant: "destructive" });
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    setBulkDialogOpen(true);
    setBulkUploading(true);
    setBulkProgress(0);
    const results: { success: { email: string; password: string; name: string }[]; errors: { row: number; name: string; error: string }[] } = { success: [], errors: [] };

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const formData = {
        full_name: row.full_name || row.name || "",
        email: row.email || "",
        phone: row.phone || "",
        roll_number: row.roll_number || "",
        course: row.course || "",
        department: row.department || "",
        year: row.year || "",
        date_of_birth: row.date_of_birth || "",
        blood_group: row.blood_group || "",
        emergency_contact: row.emergency_contact || "",
      };

      if (!formData.full_name || !formData.email) {
        results.errors.push({ row: i + 2, name: formData.full_name || "Unknown", error: "Name and email are required" });
        setBulkProgress(((i + 1) / rows.length) * 100);
        continue;
      }

      try {
        const { data, error: fnError } = await supabase.functions.invoke("create-student", { body: formData });
        if (fnError) throw fnError;
        if (data?.error) throw new Error(data.error);
        results.success.push({ email: formData.email, password: data.tempPassword, name: formData.full_name });
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
    const csv = "name,email,temporary_password\n" + bulkResults.success.map(s => `${s.name},${s.email},${s.password}`).join("\n");
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
  });

  const resetForm = () => {
    setForm({ full_name: "", email: "", phone: "", roll_number: "", course: "", department: "", year: "", date_of_birth: "", blood_group: "", emergency_contact: "" });
    setCreatedCredentials(null);
  };

  const handleSubmit = async () => {
    if (!form.full_name.trim() || !form.email.trim()) {
      toast({ title: "Validation Error", description: "Name and email are required.", variant: "destructive" });
      return;
    }

    setIsSubmitting(true);
    try {
      const { data, error: fnError } = await supabase.functions.invoke("create-student", {
        body: form,
      });

      if (fnError) throw fnError;
      if (data?.error) throw new Error(data.error);

      setCreatedCredentials({ email: form.email, password: data.tempPassword });
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

  // Filter students based on search
  const filteredStudents = students.filter(student => {
    const name = student.profile?.full_name?.toLowerCase() || "";
    const rollNumber = student.roll_number?.toLowerCase() || "";
    const query = searchQuery.toLowerCase();
    return name.includes(query) || rollNumber.includes(query);
  });

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
              accept=".csv"
              className="hidden"
              onChange={handleBulkUpload}
            />
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
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" /> Filters
              </Button>
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
                              {student.bed ? (
                                <DropdownMenuItem onClick={() => handleVacateBed(student)} className="text-destructive">
                                  <BedDouble className="h-4 w-4 mr-2" /> Vacate Room
                                </DropdownMenuItem>
                              ) : (
                                <DropdownMenuItem onClick={() => openAssignRoom(student)}>
                                  <BedDouble className="h-4 w-4 mr-2" /> Assign Room
                                </DropdownMenuItem>
                              )}
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
                        <TableHead>Student</TableHead>
                        <TableHead>Room</TableHead>
                        <TableHead>Course</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="w-[50px]"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredStudents.map((student) => (
                        <TableRow key={student.id}>
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
                          <TableCell><p className="text-sm">{getRoomDisplay(student)}</p></TableCell>
                          <TableCell>
                            <p className="text-sm">{student.course || "-"}</p>
                            <p className="text-xs text-muted-foreground">{student.year ? `Year ${student.year}` : ""}</p>
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
                                {student.bed ? (
                                  <DropdownMenuItem onClick={() => handleVacateBed(student)} className="text-destructive">
                                    <BedDouble className="h-4 w-4 mr-2" /> Vacate Room
                                  </DropdownMenuItem>
                                ) : (
                                  <DropdownMenuItem onClick={() => openAssignRoom(student)}>
                                    <BedDouble className="h-4 w-4 mr-2" /> Assign Room
                                  </DropdownMenuItem>
                                )}
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

      {/* Add Student Dialog */}
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
                    <Label className="text-xs font-semibold">Full Name *</Label>
                    <Input placeholder="e.g. Rahul Sharma" value={form.full_name} onChange={(e) => setForm(f => ({ ...f, full_name: e.target.value }))} />
                  </div>
                  <div>
                    <Label className="text-xs font-semibold">Email *</Label>
                    <Input type="email" placeholder="student@email.com" value={form.email} onChange={(e) => setForm(f => ({ ...f, email: e.target.value }))} />
                  </div>
                  <div>
                    <Label className="text-xs font-semibold">Phone</Label>
                    <Input placeholder="+91 9876543210" value={form.phone} onChange={(e) => setForm(f => ({ ...f, phone: e.target.value }))} />
                  </div>
                  <div>
                    <Label className="text-xs font-semibold">Roll Number</Label>
                    <Input placeholder="CS2026001" value={form.roll_number} onChange={(e) => setForm(f => ({ ...f, roll_number: e.target.value }))} />
                  </div>
                  <div>
                    <Label className="text-xs font-semibold">Course</Label>
                    <Input placeholder="B.Tech CSE" value={form.course} onChange={(e) => setForm(f => ({ ...f, course: e.target.value }))} />
                  </div>
                  <div>
                    <Label className="text-xs font-semibold">Department</Label>
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
                  <div>
                    <Label className="text-xs font-semibold">Emergency Contact</Label>
                    <Input placeholder="+91 9876543210" value={form.emergency_contact} onChange={(e) => setForm(f => ({ ...f, emergency_contact: e.target.value }))} />
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
                <DialogDescription>Share these login credentials with the student. The password cannot be retrieved later.</DialogDescription>
              </DialogHeader>

              <div className="space-y-3 py-4">
                <div className="bg-muted rounded-lg p-4 space-y-3">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Email</p>
                    <div className="flex items-center gap-2">
                      <code className="flex-1 text-sm font-mono bg-background rounded px-2 py-1">{createdCredentials.email}</code>
                      <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => handleCopy(createdCredentials.email, "email")}>
                        {copiedField === "email" ? <CheckCircle2 className="h-3.5 w-3.5 text-green-500" /> : <Copy className="h-3.5 w-3.5" />}
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
              {bulkUploading ? "Please wait while students are being created." : bulkResults ? `${bulkResults.success.length} created, ${bulkResults.errors.length} failed.` : "Upload a CSV file to add multiple students."}
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
                Download CSV Template
              </Button>
              <p className="text-xs text-muted-foreground">
                Required columns: <code className="bg-muted px-1 rounded">full_name</code>, <code className="bg-muted px-1 rounded">email</code>. Optional: phone, roll_number, course, department, year, date_of_birth, blood_group, emergency_contact.
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
    </>
  );
};

export default Students;
