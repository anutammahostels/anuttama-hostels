import { useState } from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Plus, QrCode, Clock, CheckCircle, XCircle } from "lucide-react";
import { format } from "date-fns";
import { QRCodeSVG } from "qrcode.react";

export default function StudentGatePasses() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ pass_type: "day_out", reason: "", destination: "", out_date: "", expected_return: "" });

  const { data: student } = useQuery({
    queryKey: ["student-record", user?.id],
    queryFn: async () => {
      const { data } = await supabase.from("students").select("*").eq("user_id", user!.id).single();
      return data;
    },
    enabled: !!user,
  });

  const { data: passes = [] } = useQuery({
    queryKey: ["student-gate-passes", student?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from("gate_passes")
        .select("*")
        .eq("student_id", student!.id)
        .order("created_at", { ascending: false });
      return data || [];
    },
    enabled: !!student,
  });

  const handleSubmit = async () => {
    if (!student || !form.reason || !form.out_date || !form.expected_return) {
      toast({ title: "Error", description: "Please fill all required fields", variant: "destructive" });
      return;
    }
    setLoading(true);
    const qrCode = `GP-${Date.now()}-${student.id.slice(0, 8)}`;
    const { error } = await supabase.from("gate_passes").insert({
      student_id: student.id,
      pass_type: form.pass_type,
      reason: form.reason,
      destination: form.destination || null,
      out_date: form.out_date,
      expected_return: form.expected_return,
      qr_code: qrCode,
      status: "pending",
    });
    setLoading(false);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Gate pass requested", description: "Waiting for warden approval." });
      queryClient.invalidateQueries({ queryKey: ["student-gate-passes"] });
      setOpen(false);
      setForm({ pass_type: "day_out", reason: "", destination: "", out_date: "", expected_return: "" });
    }
  };

  const statusIcon = (s: string) => {
    if (s === "approved") return <CheckCircle className="h-4 w-4 text-green-500" />;
    if (s === "rejected") return <XCircle className="h-4 w-4 text-destructive" />;
    return <Clock className="h-4 w-4 text-amber-500" />;
  };

  return (
    <>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Gate Passes</h1>
            <p className="text-sm text-muted-foreground">Request and track your gate passes</p>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2"><Plus className="h-4 w-4" /> New Request</Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader><DialogTitle>Request Gate Pass</DialogTitle></DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Pass Type</Label>
                  <Select value={form.pass_type} onValueChange={(v) => setForm({ ...form, pass_type: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="day_out">Day Out</SelectItem>
                      <SelectItem value="night_out">Night Out</SelectItem>
                      <SelectItem value="vacation">Vacation</SelectItem>
                      <SelectItem value="emergency">Emergency</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Reason *</Label>
                  <Textarea value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} placeholder="Reason for leave" />
                </div>
                <div>
                  <Label>Destination</Label>
                  <Input value={form.destination} onChange={(e) => setForm({ ...form, destination: e.target.value })} placeholder="Where are you going?" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Out Date *</Label>
                    <Input type="datetime-local" value={form.out_date} onChange={(e) => setForm({ ...form, out_date: e.target.value })} />
                  </div>
                  <div>
                    <Label>Return *</Label>
                    <Input type="datetime-local" value={form.expected_return} onChange={(e) => setForm({ ...form, expected_return: e.target.value })} />
                  </div>
                </div>
                <Button onClick={handleSubmit} disabled={loading} className="w-full">
                  {loading ? "Submitting..." : "Submit Request"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="space-y-3">
          {passes.length === 0 ? (
            <Card><CardContent className="p-8 text-center text-muted-foreground">No gate passes yet. Create your first request!</CardContent></Card>
          ) : (
            passes.map((pass) => (
              <Card key={pass.id} className="border-border/50">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        {statusIcon(pass.status || "pending")}
                        <h3 className="font-semibold text-foreground">{pass.reason}</h3>
                      </div>
                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground mt-1">
                        <span>Type: {pass.pass_type.replace("_", " ")}</span>
                        {pass.destination && <span>To: {pass.destination}</span>}
                        <span>Out: {format(new Date(pass.out_date), "MMM d, h:mm a")}</span>
                        <span>Return: {format(new Date(pass.expected_return), "MMM d, h:mm a")}</span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <Badge variant={pass.status === "approved" ? "default" : pass.status === "rejected" ? "destructive" : "secondary"}>
                        {pass.status}
                      </Badge>
                      {pass.status === "approved" && pass.qr_code && (
                        <div className="p-1 bg-white rounded">
                          <QRCodeSVG value={pass.qr_code} size={48} />
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </StudentLayout>
  );
}
