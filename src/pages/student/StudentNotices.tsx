
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Bell } from "lucide-react";
import { format } from "date-fns";

export default function StudentNotices() {
  const { data: notices = [] } = useQuery({
    queryKey: ["student-all-notices"],
    queryFn: async () => {
      const { data } = await supabase
        .from("notices")
        .select("*")
        .eq("is_active", true)
        .order("created_at", { ascending: false });
      return data || [];
    },
  });

  return (
    <>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Notices</h1>
          <p className="text-sm text-muted-foreground">Stay updated with hostel announcements</p>
        </div>

        <div className="space-y-3">
          {notices.length === 0 ? (
            <Card><CardContent className="p-8 text-center text-muted-foreground">No notices at the moment</CardContent></Card>
          ) : (
            notices.map((notice) => (
              <Card key={notice.id} className={`border-border/50 ${notice.priority === "high" ? "border-l-4 border-l-destructive" : notice.priority === "medium" ? "border-l-4 border-l-amber-400" : ""}`}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Bell className="h-4 w-4 text-muted-foreground" />
                        <h3 className="font-semibold text-foreground">{notice.title}</h3>
                        {notice.priority === "high" && <Badge variant="destructive" className="text-[10px]">Urgent</Badge>}
                        {notice.priority === "medium" && <Badge className="text-[10px] bg-amber-500">Important</Badge>}
                      </div>
                      <p className="text-sm text-muted-foreground mt-2 whitespace-pre-wrap">{notice.content}</p>
                      <p className="text-xs text-muted-foreground mt-3">{format(new Date(notice.created_at), "MMM d, yyyy h:mm a")}</p>
                    </div>
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
