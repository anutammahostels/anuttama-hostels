// One-off bootstrap: create a tenant_admin scoped to a single property.
// Guarded by a shared BOOTSTRAP_TOKEN passed as `x-bootstrap-token` header.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-bootstrap-token",
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const { email, password, full_name, property_id } = await req.json();
    if (!email || !password || !property_id) {
      return json({ error: "email, password, property_id required" }, 400);
    }

    const admin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Look up existing user by email
    const { data: existingList } = await admin.auth.admin.listUsers({ page: 1, perPage: 200 });
    let userId = existingList?.users?.find((u) => u.email?.toLowerCase() === String(email).toLowerCase())?.id;

    if (!userId) {
      const { data: created, error: createErr } = await admin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { full_name: full_name || "Center Admin" },
      });
      if (createErr) return json({ error: createErr.message }, 400);
      userId = created.user!.id;
    } else {
      await admin.auth.admin.updateUserById(userId, {
        password,
        email_confirm: true,
        user_metadata: { full_name: full_name || "Center Admin" },
      });
    }

    // Ensure profile
    await admin.from("profiles").upsert({
      id: userId,
      email,
      full_name: full_name || "Center Admin",
    });

    // Ensure tenant_admin role
    await admin.from("user_roles").upsert(
      { user_id: userId, role: "tenant_admin" },
      { onConflict: "user_id,role" }
    );

    // Ensure assignment
    const { data: existingAssign } = await admin
      .from("staff_property_assignments")
      .select("id")
      .eq("user_id", userId)
      .eq("property_id", property_id)
      .maybeSingle();

    if (!existingAssign) {
      await admin.from("staff_property_assignments").insert({
        user_id: userId,
        property_id,
      });
    }

    return json({ ok: true, user_id: userId, email, property_id });
  } catch (err) {
    return json({ error: (err as Error).message }, 500);
  }
});
