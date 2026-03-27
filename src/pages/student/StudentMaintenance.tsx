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
import { Plus, Wrench } from "lucide-react";
import { format } from "date-fns";
import { createNotification, getAdminUserIds } from "@/lib/notifications";

export default function StudentMaintenance() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", category: "plumbing", priority: "medium" });

  const { data: propertyId } = useQuery({
    queryKey: ["student-property-maint", user?.id],
    queryFn: async () => {
      const { data: student } = await supabase.from("students").select("id").eq("user_id", user!.id).single();
      if (!student) return null;
      const { data: bed } = await supabase
        .from("beds")
        .select("room:rooms(floor:floors(block:blocks(property_id)))")
        .eq("student_id", student.id)
        .maybeSingle();
      if (bed?.room?.floor?.block?.property_id) return bed.room.floor.block.property_id as string;
      const { data: props } = await supabase.from("properties").select("id").limit(1);
      return props?.[0]?.id || null;
    },
    enabled: !!user,
  });

  const { data: tickets = [] } = useQuery({
    queryKey: ["student-maint-tickets", user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from("maintenance_tickets")
        .select("*")
        .eq("reported_by", user!.id)
        .order("created_at", { ascending: false });
      return data || [];
    },
    enabled: !!user,
  });

  const handleSubmit = async () => {
    if (!user || !propertyId || !form.title) {
      toast({ title: "Error", description: "Please fill the title", variant: "destructive" });
      return;
    }
    setLoading(true);
    const { error } = await supabase.from("maintenance_tickets").insert({
      property_id: propertyId,
      reported_by: user.id,
      title: form.title,
      description: form.description || null,
      category: form.category,
      priority: form.priority,
    });
    setLoading(false);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Ticket submitted" });
      queryClient.invalidateQueries({ queryKey: ["student-maint-tickets"] });
      // Notify admins
      const adminIds = await getAdminUserIds();
      adminIds.forEach((adminId) =>
        createNotification(adminId, "New Maintenance Ticket", `New ticket: ${form.title}`, "maintenance", "/dashboard/maintenance")
      );
      setOpen(false);
      setForm({ title: "", description: "", category: "plumbing", priority: "medium" });
    }
  };

  return (
    <>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Maintenance</h1>
            <p className="text-sm text-muted-foreground">Report and track maintenance issues</p>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2"><Plus className="h-4 w-4" /> Report Issue</Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader><DialogTitle>Report Maintenance Issue</DialogTitle></DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Category</Label>
                  <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="plumbing">Plumbing</SelectItem>
                      <SelectItem value="electrical">Electrical</SelectItem>
                      <SelectItem value="furniture">Furniture</SelectItem>
                      <SelectItem value="cleaning">Cleaning</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Priority</Label>
                  <Select value={form.priority} onValueChange={(v) => setForm({ ...form, priority: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Title *</Label>
                  <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Brief title" />
                </div>
                <div>
                  <Label>Description</Label>
                  <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Describe the issue" rows={4} />
                </div>
                <Button onClick={handleSubmit} disabled={loading} className="w-full">
                  {loading ? "Submitting..." : "Submit Ticket"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="space-y-3">
          {tickets.length === 0 ? (
            <Card><CardContent className="p-8 text-center text-muted-foreground">No maintenance tickets</CardContent></Card>
          ) : (
            tickets.map((t) => (
              <Card key={t.id} className="border-border/50">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <Wrench className="h-4 w-4 text-muted-foreground" />
                        <h3 className="font-semibold text-foreground">{t.title}</h3>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">{t.category} • Priority: {t.priority} • {format(new Date(t.created_at), "MMM d, yyyy")}</p>
                      {t.description && <p className="text-sm text-muted-foreground mt-2">{t.description}</p>}
                    </div>
                    <Badge variant={t.status === "resolved" ? "default" : t.status === "in_progress" ? "secondary" : "outline"}>{t.status}</Badge>
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
