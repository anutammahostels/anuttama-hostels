import { useState } from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { User, Phone, Mail, BookOpen, Calendar, Droplets, AlertCircle, Save } from "lucide-react";

export default function StudentProfile() {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [saving, setSaving] = useState(false);
  const [phone, setPhone] = useState(profile?.phone || "");

  const { data: student } = useQuery({
    queryKey: ["student-record", user?.id],
    queryFn: async () => {
      const { data } = await supabase.from("students").select("*").eq("user_id", user!.id).single();
      return data;
    },
    enabled: !!user,
  });

  const { data: bedInfo } = useQuery({
    queryKey: ["student-bed-info", student?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from("beds")
        .select("bed_number, room:rooms(room_number, floor:floors(floor_number, block:blocks(name)))")
        .eq("student_id", student!.id)
        .maybeSingle();
      return data;
    },
    enabled: !!student,
  });

  const handleUpdatePhone = async () => {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase.from("profiles").update({ phone }).eq("id", user.id);
    setSaving(false);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Phone updated" });
      queryClient.invalidateQueries({ queryKey: ["profile"] });
    }
  };

  return (
    <>
      <div className="space-y-6 max-w-2xl">
        <div>
          <h1 className="text-2xl font-bold text-foreground">My Profile</h1>
          <p className="text-sm text-muted-foreground">View and manage your profile information</p>
        </div>

        {/* Personal Info */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2"><User className="h-4 w-4" /> Personal Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label className="text-xs text-muted-foreground flex items-center gap-1"><User className="h-3 w-3" /> Full Name</Label>
                <p className="font-medium text-foreground">{profile?.full_name || "—"}</p>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground flex items-center gap-1"><Mail className="h-3 w-3" /> Email</Label>
                <p className="font-medium text-foreground">{profile?.email || user?.email || "—"}</p>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground flex items-center gap-1"><Phone className="h-3 w-3" /> Phone</Label>
                <div className="flex gap-2">
                  <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Phone number" className="h-9" />
                  <Button size="sm" onClick={handleUpdatePhone} disabled={saving} className="gap-1">
                    <Save className="h-3 w-3" /> {saving ? "..." : "Save"}
                  </Button>
                </div>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground flex items-center gap-1"><Droplets className="h-3 w-3" /> Blood Group</Label>
                <p className="font-medium text-foreground">{student?.blood_group || "—"}</p>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground flex items-center gap-1"><Calendar className="h-3 w-3" /> Date of Birth</Label>
                <p className="font-medium text-foreground">{student?.date_of_birth || "—"}</p>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground flex items-center gap-1"><AlertCircle className="h-3 w-3" /> Emergency Contact</Label>
                <p className="font-medium text-foreground">{student?.emergency_contact || "—"}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Academic Info */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2"><BookOpen className="h-4 w-4" /> Academic Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label className="text-xs text-muted-foreground">Roll Number</Label>
                <p className="font-medium text-foreground">{student?.roll_number || "—"}</p>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Course</Label>
                <p className="font-medium text-foreground">{student?.course || "—"}</p>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Department</Label>
                <p className="font-medium text-foreground">{student?.department || "—"}</p>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Year</Label>
                <p className="font-medium text-foreground">{student?.year || "—"}</p>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Admission Date</Label>
                <p className="font-medium text-foreground">{student?.admission_date || "—"}</p>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Status</Label>
                <p className="font-medium text-foreground capitalize">{student?.status || "—"}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Room Info */}
        {bedInfo && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Room Assignment</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs text-muted-foreground">Block</Label>
                  <p className="font-medium text-foreground">{bedInfo.room?.floor?.block?.name || "—"}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Floor</Label>
                  <p className="font-medium text-foreground">{bedInfo.room?.floor?.floor_number ?? "—"}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Room</Label>
                  <p className="font-medium text-foreground">{bedInfo.room?.room_number || "—"}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Bed</Label>
                  <p className="font-medium text-foreground">{bedInfo.bed_number || "—"}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </>
  );
}
