import { useState, useEffect } from "react";
import { TablePagination } from "@/components/ui/table-pagination";
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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserPlus, Clock, CheckCircle, XCircle, Eye, Users } from "lucide-react";
import { format } from "date-fns";
import { createNotification } from "@/lib/notifications";

type Admission = {
  id: string; property_id: string; full_name: string; email: string | null;
  phone: string | null; date_of_birth: string | null; gender: string | null;
  course: string | null; department: string | null; year: number | null;
  roll_number: string | null; blood_group: string | null; address: string | null;
  city: string | null; state: string | null; pincode: string | null;
  parent_name: string | null; parent_phone: string | null; parent_email: string | null;
  parent_relationship: string | null; parent_address: string | null;
  room_type_preference: string | null; admission_date: string | null;
  status: string | null; notes: string | null; reviewed_by: string | null;
  reviewed_at: string | null; created_at: string; updated_at: string;
};

const emptyForm = {
  full_name: "", email: "", phone: "", date_of_birth: "", gender: "",
  course: "", department: "", year: "", roll_number: "", blood_group: "",
  address: "", city: "", state: "", pincode: "",
  parent_name: "", parent_phone: "", parent_email: "", parent_relationship: "father", parent_address: "",
  room_type_preference: "", notes: "",
};

export default function Admissions() {
  const { user } = useAuth();
  const { properties } = useProperties();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedProperty, setSelectedProperty] = useState<string>("");
  const [showFormDialog, setShowFormDialog] = useState(false);
  const [showViewDialog, setShowViewDialog] = useState(false);
  const [viewAdmission, setViewAdmission] = useState<Admission | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [filterStatus, setFilterStatus] = useState("all");

  const propertyId = selectedProperty || properties[0]?.id || "";

  const { data: admissions = [], isLoading } = useQuery({
    queryKey: ["admissions", propertyId],
    queryFn: async () => {
      const { data, error } = await supabase.from("admissions").select("*").eq("property_id", propertyId).order("created_at", { ascending: false });
      if (error) throw error;
      return data as Admission[];
    },
    enabled: !!propertyId,
  });

  const createAdmission = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("admissions").insert({
        ...form, year: form.year ? Number(form.year) : null,
        property_id: propertyId,
      } as any);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admissions"] });
      setShowFormDialog(false);
      setForm(emptyForm);
      toast({ title: "Admission Submitted", description: "New admission application has been recorded." });
    },
    onError: (e: Error) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase.from("admissions").update({
        status, reviewed_by: user?.id, reviewed_at: new Date().toISOString(),
      } as any).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admissions"] });
      toast({ title: "Status Updated" });
    },
    onError: (e: Error) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const enrollStudent = useMutation({
    mutationFn: async (admission: Admission) => {
      if (!admission.roll_number) throw new Error("Enrollment number is required for enrollment");

      // Call edge function to create auth user + student record
      const { data, error } = await supabase.functions.invoke("create-student", {
        body: {
          full_name: admission.full_name,
          email: admission.email,
          phone: admission.phone,
          roll_number: admission.roll_number,
          course: admission.course,
          department: admission.department,
          year: admission.year,
          date_of_birth: admission.date_of_birth,
          blood_group: admission.blood_group,
          emergency_contact: admission.parent_phone,
        },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      // Update admission status to enrolled
      const { error: updateError } = await supabase.from("admissions").update({
        status: "enrolled",
        reviewed_by: user?.id,
        reviewed_at: new Date().toISOString(),
      } as any).eq("id", admission.id);
      if (updateError) throw updateError;

      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["admissions"] });
      queryClient.invalidateQueries({ queryKey: ["students"] });
      toast({
        title: "Student Enrolled",
        description: `Student account created. Temporary password: ${data?.tempPassword}`,
      });
      // Notify the newly created student
      if (data?.userId) {
        createNotification(data.userId, "Welcome!", "Your hostel account has been created. Please update your password.", "admission", "/student/profile");
      }
    },
    onError: (e: Error) => toast({ title: "Enrollment Failed", description: e.message, variant: "destructive" }),
  });

  const filteredAdmissions = filterStatus === "all" ? admissions : admissions.filter(a => a.status === filterStatus);
  const counts = {
    all: admissions.length,
    pending: admissions.filter(a => a.status === "pending").length,
    approved: admissions.filter(a => a.status === "approved").length,
    rejected: admissions.filter(a => a.status === "rejected").length,
    enrolled: admissions.filter(a => a.status === "enrolled").length,
  };

  const updateField = (key: string, value: string) => setForm(f => ({ ...f, [key]: value }));

  const statusColors: Record<string, string> = {
    pending: "bg-yellow-100 text-yellow-800",
    approved: "bg-green-100 text-green-800",
    rejected: "bg-red-100 text-red-800",
    enrolled: "bg-blue-100 text-blue-800",
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Admissions</h1>
          <p className="text-muted-foreground text-sm">Manage new student admission applications</p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={propertyId} onValueChange={setSelectedProperty}>
            <SelectTrigger className="w-48"><SelectValue placeholder="Select Property" /></SelectTrigger>
            <SelectContent>{properties.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}</SelectContent>
          </Select>
          <Dialog open={showFormDialog} onOpenChange={setShowFormDialog}>
            <DialogTrigger asChild><Button><UserPlus className="h-4 w-4 mr-2" />New Admission</Button></DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
              <DialogHeader><DialogTitle>New Admission Form</DialogTitle></DialogHeader>
              <div className="space-y-6 py-2">
                {/* Student Details */}
                <div>
                  <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">Student Information</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div><Label>Full Name *</Label><Input value={form.full_name} onChange={e => updateField("full_name", e.target.value)} placeholder="Enter full name" /></div>
                    <div><Label>Email</Label><Input type="email" value={form.email} onChange={e => updateField("email", e.target.value)} /></div>
                    <div><Label>Phone</Label><Input value={form.phone} onChange={e => updateField("phone", e.target.value)} placeholder="+91..." /></div>
                    <div><Label>Date of Birth</Label><Input type="date" value={form.date_of_birth} onChange={e => updateField("date_of_birth", e.target.value)} /></div>
                    <div><Label>Gender</Label>
                      <Select value={form.gender} onValueChange={v => updateField("gender", v)}>
                        <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                        <SelectContent><SelectItem value="male">Male</SelectItem><SelectItem value="female">Female</SelectItem><SelectItem value="other">Other</SelectItem></SelectContent>
                      </Select>
                    </div>
                    <div><Label>Blood Group</Label>
                      <Select value={form.blood_group} onValueChange={v => updateField("blood_group", v)}>
                        <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                        <SelectContent>{["A+","A-","B+","B-","AB+","AB-","O+","O-"].map(bg => <SelectItem key={bg} value={bg}>{bg}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                {/* Academic Details */}
                <div>
                  <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">Academic Details</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div><Label>Course</Label><Input value={form.course} onChange={e => updateField("course", e.target.value)} placeholder="e.g. B.Tech" /></div>
                    <div><Label>Department</Label><Input value={form.department} onChange={e => updateField("department", e.target.value)} placeholder="e.g. Computer Science" /></div>
                    <div><Label>Year</Label><Input type="number" min={1} max={6} value={form.year} onChange={e => updateField("year", e.target.value)} /></div>
                    <div><Label>Roll Number</Label><Input value={form.roll_number} onChange={e => updateField("roll_number", e.target.value)} /></div>
                  </div>
                </div>

                {/* Address */}
                <div>
                  <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">Address</h3>
                  <div className="grid grid-cols-1 gap-3">
                    <div><Label>Address</Label><Textarea value={form.address} onChange={e => updateField("address", e.target.value)} rows={2} /></div>
                    <div className="grid grid-cols-3 gap-3">
                      <div><Label>City</Label><Input value={form.city} onChange={e => updateField("city", e.target.value)} /></div>
                      <div><Label>State</Label><Input value={form.state} onChange={e => updateField("state", e.target.value)} /></div>
                      <div><Label>Pincode</Label><Input value={form.pincode} onChange={e => updateField("pincode", e.target.value)} /></div>
                    </div>
                  </div>
                </div>

                {/* Parent/Guardian Details */}
                <div>
                  <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">Parent / Guardian Details</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div><Label>Parent Name</Label><Input value={form.parent_name} onChange={e => updateField("parent_name", e.target.value)} /></div>
                    <div><Label>Relationship</Label>
                      <Select value={form.parent_relationship} onValueChange={v => updateField("parent_relationship", v)}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent><SelectItem value="father">Father</SelectItem><SelectItem value="mother">Mother</SelectItem><SelectItem value="guardian">Guardian</SelectItem></SelectContent>
                      </Select>
                    </div>
                    <div><Label>Parent Phone</Label><Input value={form.parent_phone} onChange={e => updateField("parent_phone", e.target.value)} /></div>
                    <div><Label>Parent Email</Label><Input type="email" value={form.parent_email} onChange={e => updateField("parent_email", e.target.value)} /></div>
                    <div className="sm:col-span-2"><Label>Parent Address</Label><Textarea value={form.parent_address} onChange={e => updateField("parent_address", e.target.value)} rows={2} placeholder="Leave blank if same as student" /></div>
                  </div>
                </div>

                {/* Preferences */}
                <div>
                  <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">Preferences</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div><Label>Room Type Preference</Label>
                      <Select value={form.room_type_preference} onValueChange={v => updateField("room_type_preference", v)}>
                        <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                        <SelectContent><SelectItem value="single">Single</SelectItem><SelectItem value="shared">Shared (2)</SelectItem><SelectItem value="triple">Triple (3)</SelectItem><SelectItem value="dormitory">Dormitory</SelectItem></SelectContent>
                      </Select>
                    </div>
                    <div><Label>Notes</Label><Input value={form.notes} onChange={e => updateField("notes", e.target.value)} placeholder="Any special requirements" /></div>
                  </div>
                </div>

                <Button onClick={() => createAdmission.mutate()} disabled={!form.full_name} className="w-full">Submit Admission Application</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {[
          { label: "Total", count: counts.all, icon: Users, color: "text-foreground" },
          { label: "Pending", count: counts.pending, icon: Clock, color: "text-yellow-600" },
          { label: "Approved", count: counts.approved, icon: CheckCircle, color: "text-green-600" },
          { label: "Rejected", count: counts.rejected, icon: XCircle, color: "text-red-600" },
          { label: "Enrolled", count: counts.enrolled, icon: UserPlus, color: "text-blue-600" },
        ].map(s => (
          <Card key={s.label} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setFilterStatus(s.label.toLowerCase())}>
            <CardContent className="pt-4 pb-3 px-4">
              <div className="flex items-center gap-2">
                <s.icon className={`h-4 w-4 ${s.color}`} />
                <span className="text-xs text-muted-foreground">{s.label}</span>
              </div>
              <p className={`text-2xl font-bold mt-1 ${s.color}`}>{s.count}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex justify-between items-center">
            <CardTitle className="text-lg">Applications {filterStatus !== "all" && <Badge variant="outline" className="ml-2 capitalize">{filterStatus}</Badge>}</CardTitle>
            {filterStatus !== "all" && <Button variant="ghost" size="sm" onClick={() => setFilterStatus("all")}>Show All</Button>}
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {/* Mobile card view */}
          <div className="sm:hidden divide-y divide-border">
            {filteredAdmissions.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">No applications found</div>
            ) : filteredAdmissions.map(a => (
              <div key={a.id} className="p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{a.full_name}</p>
                    <p className="text-xs text-muted-foreground">{a.course ? `${a.course}${a.year ? ` - Year ${a.year}` : ""}` : "—"}</p>
                  </div>
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[a.status || "pending"]}`}>{a.status || "pending"}</span>
                </div>
                <div className="text-sm text-muted-foreground">
                  <p>{a.phone || "—"} • Parent: {a.parent_name || "—"}</p>
                  <p className="text-xs">{format(new Date(a.created_at), "dd MMM yyyy")}</p>
                </div>
                <div className="flex gap-1 flex-wrap">
                  <Button size="sm" variant="ghost" className="h-7" onClick={() => { setViewAdmission(a); setShowViewDialog(true); }}><Eye className="h-3.5 w-3.5 mr-1" /> View</Button>
                  {a.status === "pending" && (
                    <>
                      <Button size="sm" variant="outline" className="h-7 text-green-600" onClick={() => updateStatus.mutate({ id: a.id, status: "approved" })}><CheckCircle className="h-3.5 w-3.5" /></Button>
                      <Button size="sm" variant="outline" className="h-7 text-red-600" onClick={() => updateStatus.mutate({ id: a.id, status: "rejected" })}><XCircle className="h-3.5 w-3.5" /></Button>
                    </>
                  )}
                  {a.status === "approved" && (
                    <Button size="sm" className="h-7" onClick={() => enrollStudent.mutate(a)}><UserPlus className="h-3.5 w-3.5 mr-1" /> Enroll</Button>
                  )}
                </div>
              </div>
            ))}
          </div>
          {/* Desktop table view */}
          <div className="hidden sm:block overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead><TableHead>Course</TableHead><TableHead>Phone</TableHead>
                <TableHead>Parent</TableHead><TableHead>Applied</TableHead><TableHead>Status</TableHead><TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAdmissions.length === 0 ? (
                <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">No applications found</TableCell></TableRow>
              ) : filteredAdmissions.map(a => (
                <TableRow key={a.id}>
                  <TableCell className="font-medium">{a.full_name}</TableCell>
                  <TableCell className="text-sm">{a.course ? `${a.course}${a.year ? ` - Year ${a.year}` : ""}` : "—"}</TableCell>
                  <TableCell className="text-sm">{a.phone || "—"}</TableCell>
                  <TableCell className="text-sm">{a.parent_name || "—"}</TableCell>
                  <TableCell className="text-sm">{format(new Date(a.created_at), "dd MMM yyyy")}</TableCell>
                  <TableCell><span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[a.status || "pending"]}`}>{a.status || "pending"}</span></TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button size="sm" variant="ghost" onClick={() => { setViewAdmission(a); setShowViewDialog(true); }}><Eye className="h-3.5 w-3.5" /></Button>
                      {a.status === "pending" && (
                        <>
                          <Button size="sm" variant="ghost" className="text-green-600" onClick={() => updateStatus.mutate({ id: a.id, status: "approved" })}><CheckCircle className="h-3.5 w-3.5" /></Button>
                          <Button size="sm" variant="ghost" className="text-red-600" onClick={() => updateStatus.mutate({ id: a.id, status: "rejected" })}><XCircle className="h-3.5 w-3.5" /></Button>
                        </>
                      )}
                      {a.status === "approved" && (
                        <Button size="sm" className="h-7" onClick={() => enrollStudent.mutate(a)}>
                          <UserPlus className="h-3.5 w-3.5 mr-1" /> Enroll
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          </div>
        </CardContent>
      </Card>

      {/* View Admission Detail Dialog */}
      <Dialog open={showViewDialog} onOpenChange={setShowViewDialog}>
        <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Admission Details</DialogTitle></DialogHeader>
          {viewAdmission && (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2">Student</h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div><span className="text-muted-foreground">Name:</span> <span className="font-medium">{viewAdmission.full_name}</span></div>
                  <div><span className="text-muted-foreground">Email:</span> {viewAdmission.email || "—"}</div>
                  <div><span className="text-muted-foreground">Phone:</span> {viewAdmission.phone || "—"}</div>
                  <div><span className="text-muted-foreground">DOB:</span> {viewAdmission.date_of_birth ? format(new Date(viewAdmission.date_of_birth), "dd MMM yyyy") : "—"}</div>
                  <div><span className="text-muted-foreground">Gender:</span> {viewAdmission.gender || "—"}</div>
                  <div><span className="text-muted-foreground">Blood Group:</span> {viewAdmission.blood_group || "—"}</div>
                </div>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2">Academic</h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div><span className="text-muted-foreground">Course:</span> {viewAdmission.course || "—"}</div>
                  <div><span className="text-muted-foreground">Department:</span> {viewAdmission.department || "—"}</div>
                  <div><span className="text-muted-foreground">Year:</span> {viewAdmission.year || "—"}</div>
                  <div><span className="text-muted-foreground">Roll #:</span> {viewAdmission.roll_number || "—"}</div>
                </div>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2">Address</h3>
                <p className="text-sm">{[viewAdmission.address, viewAdmission.city, viewAdmission.state, viewAdmission.pincode].filter(Boolean).join(", ") || "—"}</p>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2">Parent / Guardian</h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div><span className="text-muted-foreground">Name:</span> {viewAdmission.parent_name || "—"}</div>
                  <div><span className="text-muted-foreground">Relation:</span> {viewAdmission.parent_relationship || "—"}</div>
                  <div><span className="text-muted-foreground">Phone:</span> {viewAdmission.parent_phone || "—"}</div>
                  <div><span className="text-muted-foreground">Email:</span> {viewAdmission.parent_email || "—"}</div>
                </div>
                {viewAdmission.parent_address && <p className="text-sm mt-1"><span className="text-muted-foreground">Address:</span> {viewAdmission.parent_address}</p>}
              </div>
              {viewAdmission.room_type_preference && (
                <div><span className="text-sm text-muted-foreground">Room Preference:</span> <Badge variant="outline" className="capitalize ml-1">{viewAdmission.room_type_preference}</Badge></div>
              )}
              {viewAdmission.notes && <div><span className="text-sm text-muted-foreground">Notes:</span> <p className="text-sm">{viewAdmission.notes}</p></div>}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
