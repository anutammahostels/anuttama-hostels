import { useState } from "react";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Plus, MessageSquare } from "lucide-react";
import { format } from "date-fns";
import { createNotification, getAdminUserIds } from "@/lib/notifications";

export default function StudentComplaints() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ subject: "", description: "", category: "general" });

  const { data: student } = useQuery({
    queryKey: ["student-record", user?.id],
    queryFn: async () => {
      const { data } = await supabase.from("students").select("*").eq("user_id", user!.id).single();
      return data;
    },
    enabled: !!user,
  });

  // We need the student's property. Get it from beds -> rooms -> floors -> blocks -> property
  const { data: propertyId } = useQuery({
    queryKey: ["student-property", student?.id],
    queryFn: async () => {
      // Try to get property from bed assignment
      const { data: bed } = await supabase
        .from("beds")
        .select("room:rooms(floor:floors(block:blocks(property_id)))")
        .eq("student_id", student!.id)
        .maybeSingle();
      if (bed?.room?.floor?.block?.property_id) return bed.room.floor.block.property_id as string;
      // Fallback: get first property
      const { data: props } = await supabase.from("properties").select("id").limit(1);
      return props?.[0]?.id || null;
    },
    enabled: !!student,
  });

  const { data: complaints = [] } = useQuery({
    queryKey: ["student-complaints-all", student?.id],
    queryFn: async () => {
      const { data } = await supabase.from("complaints").select("*").eq("student_id", student!.id).order("created_at", { ascending: false });
      return data || [];
    },
    enabled: !!student,
  });

  const handleSubmit = async () => {
    if (!student || !propertyId || !form.subject) {
      toast({ title: "Error", description: "Please fill the subject", variant: "destructive" });
      return;
    }
    setLoading(true);
    const { error } = await supabase.from("complaints").insert({
      student_id: student.id,
      property_id: propertyId,
      subject: form.subject,
      description: form.description || null,
      category: form.category,
    });
    setLoading(false);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Complaint submitted" });
      queryClient.invalidateQueries({ queryKey: ["student-complaints-all"] });
      // Notify admins
      const adminIds = await getAdminUserIds();
      adminIds.forEach((adminId) =>
        createNotification(adminId, "New Complaint", `New complaint: ${form.subject}`, "complaint", "/dashboard/complaints")
      );
      setOpen(false);
      setForm({ subject: "", description: "", category: "general" });
    }
  };

  return (
    <>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Complaints</h1>
            <p className="text-sm text-muted-foreground">Submit and track complaints</p>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2"><Plus className="h-4 w-4" /> New Complaint</Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader><DialogTitle>Submit Complaint</DialogTitle></DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Category</Label>
                  <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="general">General</SelectItem>
                      <SelectItem value="maintenance">Maintenance</SelectItem>
                      <SelectItem value="mess">Mess / Food</SelectItem>
                      <SelectItem value="hygiene">Hygiene</SelectItem>
                      <SelectItem value="security">Security</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Subject *</Label>
                  <Input value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} placeholder="Brief subject" />
                </div>
                <div>
                  <Label>Description</Label>
                  <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Describe the issue in detail" rows={4} />
                </div>
                <Button onClick={handleSubmit} disabled={loading} className="w-full">
                  {loading ? "Submitting..." : "Submit Complaint"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="space-y-3">
          {complaints.length === 0 ? (
            <Card><CardContent className="p-8 text-center text-muted-foreground">No complaints submitted yet</CardContent></Card>
          ) : (
            complaints.map((c) => (
              <Card key={c.id} className="border-border/50">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <MessageSquare className="h-4 w-4 text-muted-foreground" />
                        <h3 className="font-semibold text-foreground">{c.subject}</h3>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">{c.category} • {format(new Date(c.created_at), "MMM d, yyyy")}</p>
                      {c.description && <p className="text-sm text-muted-foreground mt-2">{c.description}</p>}
                      {c.resolution_notes && (
                        <div className="mt-2 p-2 bg-green-50 rounded text-xs text-green-700">
                          <strong>Resolution:</strong> {c.resolution_notes}
                        </div>
                      )}
                    </div>
                    <Badge variant={c.status === "resolved" ? "default" : c.status === "in_progress" ? "secondary" : "outline"} className="text-xs">{c.status}</Badge>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </>
  );
}
