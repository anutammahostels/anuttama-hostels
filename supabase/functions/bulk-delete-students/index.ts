import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const authHeader = req.headers.get("authorization") ?? "";

    const admin = createClient(supabaseUrl, serviceRoleKey);

    // Verify caller is super_admin
    const token = authHeader.replace("Bearer ", "");
    const { data: { user } } = await admin.auth.getUser(token);
    if (!user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const { data: roleRow } = await admin
      .from("user_roles").select("role").eq("user_id", user.id).eq("role", "super_admin").maybeSingle();
    if (!roleRow) {
      return new Response(JSON.stringify({ error: "Only super_admin can run this" }), {
        status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Find auth users that are NOT in user_roles (orphaned student auth accounts after data wipe)
    const keepIds = new Set<string>();
    const { data: keepRows } = await admin.from("user_roles").select("user_id");
    (keepRows ?? []).forEach((r: any) => keepIds.add(r.user_id));

    const deleted: string[] = [];
    const failed: { id: string; error: string }[] = [];
    let page = 1;
    const perPage = 200;
    while (true) {
      const { data, error } = await admin.auth.admin.listUsers({ page, perPage });
      if (error) throw error;
      const users = data.users ?? [];
      if (users.length === 0) break;
      for (const u of users) {
        if (keepIds.has(u.id)) continue;
        // Only delete student-style emails to be extra safe
        const email = (u.email ?? "").toLowerCase();
        const isStudent = email.endsWith("@anuttama.student") || email.endsWith(".student");
        if (!isStudent) continue;
        const { error: delErr } = await admin.auth.admin.deleteUser(u.id);
        if (delErr) failed.push({ id: u.id, error: delErr.message });
        else deleted.push(u.id);
      }
      if (users.length < perPage) break;
      page += 1;
    }

    return new Response(JSON.stringify({ deleted_count: deleted.length, failed }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err?.message ?? String(err) }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
