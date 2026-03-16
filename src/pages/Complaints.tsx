import { useState } from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { MessageSquare, Clock, CheckCircle, AlertCircle, Filter } from "lucide-react";
import { format } from "date-fns";

const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "outline" | "destructive"; icon: typeof Clock }> = {
  pending: { label: "Pending", variant: "outline", icon: Clock },
  in_progress: { label: "In Progress", variant: "secondary", icon: AlertCircle },
  resolved: { label: "Resolved", variant: "default", icon: CheckCircle },
};

export default function Complaints() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedComplaint, setSelectedComplaint] = useState<any>(null);
  const [resolutionNotes, setResolutionNotes] = useState("");
  const [newStatus, setNewStatus] = useState("");
  const [updating, setUpdating] = useState(false);

  const { data: complaints = [], isLoading } = useQuery({
    queryKey: ["admin-complaints", statusFilter],
    queryFn: async () => {
      let query = supabase
        .from("complaints")
        .select("*, student:students(id, roll_number, user_id)")
        .order("created_at", { ascending: false });

      if (statusFilter !== "all") {
        query = query.eq("status", statusFilter);
      }

      const { data, error } = await query;
      if (error) throw error;

      // Fetch student names from profiles
      const userIds = [...new Set((data || []).map((c: any) => c.student?.user_id).filter(Boolean))];
      if (userIds.length > 0) {
        const { data: profiles } = await supabase.from("profiles").select("id, full_name").in("id", userIds);
        const profileMap = new Map((profiles || []).map((p) => [p.id, p.full_name]));
        return (data || []).map((c: any) => ({
          ...c,
          student_name: c.student?.user_id ? profileMap.get(c.student.user_id) || "Unknown" : "Unknown",
          roll_number: c.student?.roll_number || "N/A",
        }));
      }
      return (data || []).map((c: any) => ({ ...c, student_name: "Unknown", roll_number: "N/A" }));
    },
  });

  const handleUpdate = async () => {
    if (!selectedComplaint || !newStatus) return;
    setUpdating(true);
    const updateData: any = { status: newStatus };
    if (newStatus === "resolved") {
      updateData.resolved_at = new Date().toISOString();
      updateData.resolved_by = user?.id;
      updateData.resolution_notes = resolutionNotes || null;
    }
    if (resolutionNotes && newStatus !== "resolved") {
      updateData.resolution_notes = resolutionNotes;
    }

    const { error } = await supabase.from("complaints").update(updateData).eq("id", selectedComplaint.id);
    setUpdating(false);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Complaint updated successfully" });
      queryClient.invalidateQueries({ queryKey: ["admin-complaints"] });
      setSelectedComplaint(null);
      setResolutionNotes("");
      setNewStatus("");
    }
  };

  const openDetail = (complaint: any) => {
    setSelectedComplaint(complaint);
    setNewStatus(complaint.status);
    setResolutionNotes(complaint.resolution_notes || "");
  };

  const counts = {
    total: complaints.length,
    pending: complaints.filter((c: any) => c.status === "pending").length,
    in_progress: complaints.filter((c: any) => c.status === "in_progress").length,
    resolved: complaints.filter((c: any) => c.status === "resolved").length,
  };

  return (
    <>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Complaint Management</h1>
          <p className="text-sm text-muted-foreground">Review and resolve student complaints</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Total", value: counts.total, color: "bg-primary/10 text-primary" },
            { label: "Pending", value: counts.pending, color: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400" },
            { label: "In Progress", value: counts.in_progress, color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" },
            { label: "Resolved", value: counts.resolved, color: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" },
          ].map((s) => (
            <Card key={s.label}>
              <CardContent className="p-4 text-center">
                <p className="text-2xl font-bold">{s.value}</p>
                <p className={`text-xs font-medium mt-1 inline-block px-2 py-0.5 rounded-full ${s.color}`}>{s.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Filter */}
        <div className="flex items-center gap-3">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Complaints</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="resolved">Resolved</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Complaints List */}
        {isLoading ? (
          <Card><CardContent className="p-8 text-center text-muted-foreground">Loading...</CardContent></Card>
        ) : complaints.length === 0 ? (
          <Card><CardContent className="p-8 text-center text-muted-foreground">No complaints found</CardContent></Card>
        ) : (
          <div className="space-y-3">
            {complaints.map((c: any) => {
              const config = statusConfig[c.status] || statusConfig.pending;
              const StatusIcon = config.icon;
              return (
                <Card
                  key={c.id}
                  className="cursor-pointer hover:shadow-md transition-shadow border-border/50"
                  onClick={() => openDetail(c)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <MessageSquare className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                          <h3 className="font-semibold text-foreground truncate">{c.subject}</h3>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {c.student_name} ({c.roll_number}) • {c.category} • {format(new Date(c.created_at), "MMM d, yyyy h:mm a")}
                        </p>
                        {c.description && (
                          <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{c.description}</p>
                        )}
                      </div>
                      <Badge variant={config.variant} className="flex items-center gap-1 flex-shrink-0">
                        <StatusIcon className="h-3 w-3" />
                        {config.label}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Detail / Update Dialog */}
        <Dialog open={!!selectedComplaint} onOpenChange={(o) => !o && setSelectedComplaint(null)}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Complaint Details</DialogTitle>
            </DialogHeader>
            {selectedComplaint && (
              <div className="space-y-4">
                <div>
                  <p className="text-xs text-muted-foreground">Student</p>
                  <p className="font-medium">{selectedComplaint.student_name} ({selectedComplaint.roll_number})</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Category</p>
                  <Badge variant="outline" className="capitalize">{selectedComplaint.category}</Badge>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Subject</p>
                  <p className="font-medium">{selectedComplaint.subject}</p>
                </div>
                {selectedComplaint.description && (
                  <div>
                    <p className="text-xs text-muted-foreground">Description</p>
                    <p className="text-sm">{selectedComplaint.description}</p>
                  </div>
                )}
                <div>
                  <p className="text-xs text-muted-foreground">Submitted</p>
                  <p className="text-sm">{format(new Date(selectedComplaint.created_at), "PPpp")}</p>
                </div>

                <hr className="border-border" />

                <div>
                  <p className="text-xs text-muted-foreground mb-1">Update Status</p>
                  <Select value={newStatus} onValueChange={setNewStatus}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="resolved">Resolved</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Resolution / Notes</p>
                  <Textarea
                    value={resolutionNotes}
                    onChange={(e) => setResolutionNotes(e.target.value)}
                    placeholder="Add resolution notes or comments..."
                    rows={3}
                  />
                </div>
                <Button onClick={handleUpdate} disabled={updating} className="w-full">
                  {updating ? "Updating..." : "Update Complaint"}
                </Button>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
