import { StudentLayout } from "@/components/student/StudentLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { UtensilsCrossed } from "lucide-react";
import { format } from "date-fns";

export default function StudentMess() {
  const { user } = useAuth();

  const { data: student } = useQuery({
    queryKey: ["student-record", user?.id],
    queryFn: async () => {
      const { data } = await supabase.from("students").select("*").eq("user_id", user!.id).single();
      return data;
    },
    enabled: !!user,
  });

  const { data: subscriptions = [] } = useQuery({
    queryKey: ["student-mess-subs", student?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from("mess_subscriptions")
        .select("*, plan:mess_plans(*)")
        .eq("student_id", student!.id)
        .order("start_date", { ascending: false });
      return data || [];
    },
    enabled: !!student,
  });

  const { data: allPlans = [] } = useQuery({
    queryKey: ["mess-plans"],
    queryFn: async () => {
      const { data } = await supabase.from("mess_plans").select("*").eq("is_active", true);
      return data || [];
    },
  });

  const activeSub = subscriptions.find((s) => s.status === "active");

  return (
    <StudentLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Mess Management</h1>
          <p className="text-sm text-muted-foreground">Your mess plan and subscriptions</p>
        </div>

        {/* Active Subscription */}
        <Card className={activeSub ? "border-green-200 bg-green-50/30" : ""}>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <UtensilsCrossed className="h-4 w-4 text-green-500" /> Current Subscription
            </CardTitle>
          </CardHeader>
          <CardContent>
            {activeSub ? (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-foreground">{activeSub.plan?.name}</h3>
                  <Badge className="bg-green-500">Active</Badge>
                </div>
                <p className="text-sm text-muted-foreground">{activeSub.plan?.description}</p>
                <div className="flex gap-4 text-sm text-muted-foreground">
                  <span>₹{activeSub.plan?.monthly_price}/month</span>
                  <span>From: {format(new Date(activeSub.start_date), "MMM d, yyyy")}</span>
                  <span>To: {format(new Date(activeSub.end_date), "MMM d, yyyy")}</span>
                </div>
                {activeSub.plan?.meal_types && (
                  <div className="flex gap-1 mt-2">
                    {activeSub.plan.meal_types.map((m: string) => (
                      <Badge key={m} variant="outline" className="text-xs capitalize">{m}</Badge>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-4">No active mess subscription</p>
            )}
          </CardContent>
        </Card>

        {/* Available Plans */}
        {allPlans.length > 0 && (
          <div>
            <h2 className="text-lg font-semibold text-foreground mb-3">Available Plans</h2>
            <div className="grid md:grid-cols-2 gap-3">
              {allPlans.map((plan) => (
                <Card key={plan.id} className="border-border/50">
                  <CardContent className="p-4">
                    <h3 className="font-semibold text-foreground">{plan.name}</h3>
                    <p className="text-sm text-muted-foreground mt-1">{plan.description}</p>
                    <p className="text-lg font-bold text-primary mt-2">₹{plan.monthly_price}<span className="text-xs text-muted-foreground font-normal">/month</span></p>
                    {plan.meal_types && (
                      <div className="flex gap-1 mt-2">
                        {plan.meal_types.map((m: string) => (
                          <Badge key={m} variant="outline" className="text-xs capitalize">{m}</Badge>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Subscription History */}
        {subscriptions.length > 1 && (
          <div>
            <h2 className="text-lg font-semibold text-foreground mb-3">Subscription History</h2>
            <div className="space-y-2">
              {subscriptions.filter((s) => s.status !== "active").map((sub) => (
                <Card key={sub.id}>
                  <CardContent className="p-3 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-foreground">{sub.plan?.name}</p>
                      <p className="text-xs text-muted-foreground">{format(new Date(sub.start_date), "MMM yyyy")} - {format(new Date(sub.end_date), "MMM yyyy")}</p>
                    </div>
                    <Badge variant="secondary">{sub.status}</Badge>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </StudentLayout>
  );
}
