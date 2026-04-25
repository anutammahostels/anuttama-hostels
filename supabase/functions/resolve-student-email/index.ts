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
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const admin = createClient(supabaseUrl, serviceRoleKey);

    const { roll_number } = await req.json().catch(() => ({}));
    if (!roll_number || typeof roll_number !== "string") {
      return json({ error: "roll_number is required" }, 400);
    }

    // Find student by roll_number (case-insensitive)
    const { data: student, error: sErr } = await admin
      .from("students")
      .select("user_id")
      .ilike("roll_number", roll_number)
      .maybeSingle();

    if (sErr) {
      console.error("[resolve-student-email] students lookup error", sErr.message);
      return json({ error: "Lookup failed" }, 500);
    }
    if (!student?.user_id) {
      // Fallback to synthetic email so signIn surfaces invalid credentials uniformly
      const fallback = `${roll_number.toLowerCase().replace(/[^a-z0-9]/g, "")}@anuttama.student`;
      return json({ email: fallback }, 200);
    }

    const { data: userResp, error: uErr } = await admin.auth.admin.getUserById(student.user_id);
    if (uErr || !userResp?.user?.email) {
      console.error("[resolve-student-email] getUserById error", uErr?.message);
      const fallback = `${roll_number.toLowerCase().replace(/[^a-z0-9]/g, "")}@anuttama.student`;
      return json({ email: fallback }, 200);
    }

    return json({ email: userResp.user.email }, 200);
  } catch (err: any) {
    console.error("[resolve-student-email] error", err?.message);
    return json({ error: err?.message || "Internal error" }, 500);
  }
});
