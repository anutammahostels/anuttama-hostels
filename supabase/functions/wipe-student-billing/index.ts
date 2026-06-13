import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const admin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Authn + Authz: must be tenant_admin or super_admin
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    const userClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );
    const { data: { user } } = await userClient.auth.getUser();
    if (!user) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    const { data: roles } = await admin.from("user_roles").select("role").eq("user_id", user.id);
    const allowed = (roles ?? []).some((r: any) => r.role === "tenant_admin" || r.role === "super_admin");
    if (!allowed) return new Response(JSON.stringify({ error: "Forbidden" }), { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } });

    // Collect student user_ids before deletion
    const { data: studentRows } = await admin.from("students").select("user_id");
    const studentUserIds: string[] = (studentRows ?? []).map((r: any) => r.user_id).filter(Boolean);

    // Wipe operational tables
    const tables = [
      "payment_logs", "payment_transactions", "transactions", "refunds", "payments",
      "invoices", "journal_entries", "gate_passes", "complaints",
      "maintenance_tickets", "attendance", "mess_subscriptions", "notices",
      "admissions", "notifications", "audit_logs", "students",
    ];
    const results: Record<string, string> = {};
    for (const t of tables) {
      const { error } = await admin.from(t).delete().not("id", "is", null);
      results[t] = error ? `ERR: ${error.message}` : "ok";
    }

    // Reset beds
    const { error: bedErr } = await admin
      .from("beds")
      .update({ status: "vacant", student_id: null })
      .not("id", "is", null);
    results["beds_reset"] = bedErr ? `ERR: ${bedErr.message}` : "ok";

    // Delete student auth users + their roles + profiles
    let deletedUsers = 0;
    for (const uid of studentUserIds) {
      await admin.from("user_roles").delete().eq("user_id", uid).eq("role", "student");
      await admin.from("profiles").delete().eq("id", uid);
      const { error } = await admin.auth.admin.deleteUser(uid);
      if (!error) deletedUsers++;
    }

    return new Response(JSON.stringify({ ok: true, results, deletedUsers }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err?.message ?? String(err) }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
