import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const email = "TESTSTUDENT1@anuttama.student";
    const password = "5c63bd64-4c0A1!";
    const roll = "TESTSTUDENT1";

    let userId: string | null = null;
    const { data: existingStudent } = await admin.from("students").select("id,user_id").eq("roll_number", roll).maybeSingle();
    if (existingStudent) {
      userId = existingStudent.user_id;
      await admin.auth.admin.updateUserById(userId!, { password, email_confirm: true });
    } else {
      const { data: created, error } = await admin.auth.admin.createUser({
        email, password, email_confirm: true,
        user_metadata: { full_name: "Test Student", roll_number: roll },
      });
      if (error) {
        if (error.message?.includes("already")) {
          const { data: list } = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 });
          const u = list.users.find((x: any) => (x.email || "").toLowerCase() === email.toLowerCase());
          userId = u?.id ?? null;
          if (userId) await admin.auth.admin.updateUserById(userId, { password });
        } else throw error;
      } else {
        userId = created.user.id;
      }
      if (!userId) throw new Error("Could not get user id");
      await admin.from("profiles").upsert({ id: userId, email, full_name: "Test Student" });
      await admin.from("students").insert({
        user_id: userId, roll_number: roll, status: "active",
        admission_date: new Date().toISOString().split("T")[0],
      });
      await admin.from("user_roles").upsert({ user_id: userId, role: "student" }, { onConflict: "user_id,role" });
    }

    // Wipe orphan auth users with student-style emails
    const keep = new Set<string>();
    const { data: roles } = await admin.from("user_roles").select("user_id");
    (roles ?? []).forEach((r: any) => keep.add(r.user_id));

    let page = 1, deleted = 0;
    while (true) {
      const { data, error } = await admin.auth.admin.listUsers({ page, perPage: 200 });
      if (error) throw error;
      if (!data.users.length) break;
      for (const u of data.users) {
        if (keep.has(u.id)) continue;
        const e = (u.email || "").toLowerCase();
        if (e.endsWith("@anuttama.student") || e.endsWith(".student")) {
          const { error: dErr } = await admin.auth.admin.deleteUser(u.id);
          if (!dErr) deleted++;
        }
      }
      if (data.users.length < 200) break;
      page++;
    }

    const { count: students } = await admin.from("students").select("*", { count: "exact", head: true });
    const { count: invoices } = await admin.from("invoices").select("*", { count: "exact", head: true });
    const { count: payments } = await admin.from("payments").select("*", { count: "exact", head: true });

    return new Response(JSON.stringify({ ok: true, userId, deleted_orphans: deleted, students, invoices, payments }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err?.message ?? String(err) }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
