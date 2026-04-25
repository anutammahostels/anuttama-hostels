import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !serviceRoleKey) {
      console.error("[reset-student-password] Missing env vars");
      return json({ error: "Server misconfigured: missing service credentials" }, 500);
    }

    const authHeader = req.headers.get("authorization") || req.headers.get("Authorization");
    if (!authHeader) {
      console.warn("[reset-student-password] No authorization header");
      return json({ error: "Missing authorization header" }, 401);
    }

    const adminClient = createClient(supabaseUrl, serviceRoleKey);

    const token = authHeader.replace(/^Bearer\s+/i, "");
    const { data: userData, error: authError } = await adminClient.auth.getUser(token);
    const callingUser = userData?.user;

    if (authError || !callingUser) {
      console.warn("[reset-student-password] Auth failed", authError?.message);
      return json({ error: "Unauthorized" }, 401);
    }

    // Check admin role (super_admin or tenant_admin only)
    const { data: roleData, error: roleError } = await adminClient
      .from("user_roles")
      .select("role")
      .eq("user_id", callingUser.id)
      .in("role", ["super_admin", "tenant_admin"])
      .maybeSingle();

    if (roleError) {
      console.error("[reset-student-password] Role lookup error", roleError.message);
      return json({ error: "Failed to verify role: " + roleError.message }, 500);
    }

    if (!roleData) {
      console.warn("[reset-student-password] User lacks admin role", callingUser.id);
      return json({ error: "Only admins can reset passwords" }, 403);
    }

    let body: any = {};
    try {
      body = await req.json();
    } catch (_) {
      return json({ error: "Invalid JSON body" }, 400);
    }

    const { user_id, new_password } = body;

    if (!user_id || typeof user_id !== "string") {
      return json({ error: "user_id is required and must be a string" }, 400);
    }

    // Validate password if provided
    let password: string;
    if (new_password && typeof new_password === "string" && new_password.length > 0) {
      if (new_password.length < 6) {
        return json({ error: "Password must be at least 6 characters long" }, 400);
      }
      password = new_password;
    } else {
      // Generate a secure random password
      password = crypto.randomUUID().slice(0, 12) + "A1!";
    }

    console.log("[reset-student-password] Resetting password for user:", user_id);

    const { error: updateError } = await adminClient.auth.admin.updateUserById(user_id, {
      password,
    });

    if (updateError) {
      console.error("[reset-student-password] Update failed:", updateError.message);
      return json({ error: updateError.message }, 400);
    }

    console.log("[reset-student-password] Success for user:", user_id);
    return json({ success: true, newPassword: password }, 200);
  } catch (err: any) {
    console.error("[reset-student-password] Unhandled error:", err?.message, err?.stack);
    return json({ error: err?.message || "Internal server error" }, 500);
  }
});
