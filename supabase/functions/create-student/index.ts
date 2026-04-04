import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const authHeader = req.headers.get("authorization")!;

    const adminClient = createClient(supabaseUrl, serviceRoleKey);

    const token = authHeader.replace("Bearer ", "");
    const { data: { user: callingUser }, error: authError } = await adminClient.auth.getUser(token);
    if (authError || !callingUser) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const callingUserId = callingUser.id;

    const { data: roleData } = await adminClient
      .from("user_roles")
      .select("role")
      .eq("user_id", callingUserId)
      .in("role", ["super_admin", "tenant_admin", "warden"])
      .maybeSingle();

    if (!roleData) {
      return new Response(JSON.stringify({ error: "Insufficient permissions" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json();
    const { full_name, email, phone, roll_number, course, department, year, date_of_birth, blood_group, emergency_contact, father_name, gender } = body;

    if (!full_name || !roll_number) {
      return new Response(JSON.stringify({ error: "Student name and enrollment number are required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Use enrollment number as login identifier
    // Generate a deterministic email from enrollment number for Supabase Auth
    const loginEmail = email || `${roll_number.toLowerCase().replace(/[^a-z0-9]/g, "")}@anuttama.student`;

    // Check if a student with this enrollment number already exists in the students table
    const { data: existingStudent } = await adminClient
      .from("students")
      .select("id, user_id, roll_number")
      .eq("roll_number", roll_number)
      .maybeSingle();

    if (existingStudent) {
      return new Response(JSON.stringify({ 
        error: `A student with enrollment number "${roll_number}" already exists.`,
        existing: true 
      }), {
        status: 409,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Also check if auth user with this email exists (e.g. from a previous partial creation)
    const { data: { users: existingUsers } } = await adminClient.auth.admin.listUsers();
    const existingAuthUserRecord = existingUsers?.find((u: any) => u.email === loginEmail);
    if (existingAuthUserRecord) {
      // Auth user exists but no student record - clean up by using existing auth user
      // Update profile
      const profileUpdate: Record<string, string> = { full_name };
      if (phone) profileUpdate.phone = phone;
      if (email) profileUpdate.email = email;
      await adminClient.from("profiles").update(profileUpdate).eq("id", existingAuthUserRecord.id);

      // Create student record linked to existing auth user
      const { data: student, error: studentError } = await adminClient
        .from("students")
        .insert({
          user_id: existingAuthUserRecord.id,
          roll_number: roll_number || null,
          course: course || null,
          department: department || null,
          year: year ? parseInt(year) : null,
          date_of_birth: date_of_birth || null,
          blood_group: blood_group || null,
          emergency_contact: emergency_contact || null,
          father_name: father_name || null,
          gender: gender || null,
          admission_date: new Date().toISOString().split("T")[0],
          status: "active",
        })
        .select()
        .single();

      if (studentError) {
        return new Response(JSON.stringify({ error: studentError.message }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Ensure student role exists
      await adminClient.from("user_roles").upsert(
        { user_id: existingAuthUserRecord.id, role: "student" },
        { onConflict: "user_id,role" }
      );

      // Generate a new password for the existing auth user
      const tempPassword = crypto.randomUUID().slice(0, 12) + "A1!";
      await adminClient.auth.admin.updateUser(existingAuthUser.user.id, { password: tempPassword });

      return new Response(
        JSON.stringify({ student, tempPassword, userId: existingAuthUser.user.id, loginId: roll_number }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create auth user with enrollment number as the login credential
    const tempPassword = crypto.randomUUID().slice(0, 12) + "A1!";
    const { data: newUser, error: createError } = await adminClient.auth.admin.createUser({
      email: loginEmail,
      password: tempPassword,
      email_confirm: true,
      user_metadata: { full_name, phone, roll_number },
    });

    if (createError) {
      return new Response(JSON.stringify({ error: createError.message }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Update profile with phone and email
    const profileUpdate: Record<string, string> = {};
    if (phone) profileUpdate.phone = phone;
    if (email) profileUpdate.email = email;
    if (Object.keys(profileUpdate).length > 0) {
      await adminClient.from("profiles").update(profileUpdate).eq("id", newUser.user.id);
    }

    // Create student record
    const { data: student, error: studentError } = await adminClient
      .from("students")
      .insert({
        user_id: newUser.user.id,
        roll_number: roll_number || null,
        course: course || null,
        department: department || null,
        year: year ? parseInt(year) : null,
        date_of_birth: date_of_birth || null,
        blood_group: blood_group || null,
        emergency_contact: emergency_contact || null,
        father_name: father_name || null,
        gender: gender || null,
        admission_date: new Date().toISOString().split("T")[0],
        status: "active",
      })
      .select()
      .single();

    if (studentError) {
      return new Response(JSON.stringify({ error: studentError.message }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Assign student role
    await adminClient.from("user_roles").insert({ user_id: newUser.user.id, role: "student" });

    return new Response(
      JSON.stringify({ student, tempPassword, userId: newUser.user.id, loginId: roll_number }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
