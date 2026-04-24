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

    const { data: roleData } = await adminClient
      .from("user_roles")
      .select("role")
      .eq("user_id", callingUser.id)
      .in("role", ["super_admin", "tenant_admin", "warden"])
      .maybeSingle();

    if (!roleData) {
      return new Response(JSON.stringify({ error: "Insufficient permissions" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json();
    const {
      full_name, email, phone, roll_number, course, department, year,
      date_of_birth, blood_group, emergency_contact, father_name, gender,
      // New finance fields
      final_fee, payment_date, account_number, alloted_room_no, remarks,
      // Installment 1
      payment_date_1, payment_mode_1, amount_1, transaction_details_1, utr_id_1,
      // Installment 2
      payment_date_2, payment_mode_2, amount_2, transaction_details_2, utr_id_2,
      // Installment 3
      payment_date_3, payment_mode_3, amount_3, transaction_details_3, utr_id_3,
      balance_payment,
    } = body;

    if (!full_name || !roll_number) {
      return new Response(JSON.stringify({ error: "Student name and enrollment number are required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const loginEmail = email || `${roll_number.toLowerCase().replace(/[^a-z0-9]/g, "")}@anuttama.student`;

    // Check if a student with this enrollment number already exists
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

    // Try to create the auth user
    const tempPassword = crypto.randomUUID().slice(0, 12) + "A1!";
    const { data: newUser, error: createError } = await adminClient.auth.admin.createUser({
      email: loginEmail,
      password: tempPassword,
      email_confirm: true,
      user_metadata: { full_name, phone, roll_number },
    });

    let userId: string;
    let finalPassword = tempPassword;

    if (createError) {
      if (createError.message?.includes("already been registered")) {
        const { data: allUsersData } = await adminClient.auth.admin.listUsers({ page: 1, perPage: 1000 });
        const existingAuthUser = allUsersData?.users?.find((u: any) => u.email === loginEmail);
        
        if (!existingAuthUser) {
          return new Response(JSON.stringify({ error: "Email is registered but user could not be found. Please contact support." }), {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        userId = existingAuthUser.id;
        const newPassword = crypto.randomUUID().slice(0, 12) + "A1!";
        await adminClient.auth.admin.updateUserById(userId, { password: newPassword });
        finalPassword = newPassword;

        const profileUpdate: Record<string, string> = { full_name };
        if (phone) profileUpdate.phone = phone;
        if (email) profileUpdate.email = email;
        await adminClient.from("profiles").upsert({ id: userId, ...profileUpdate });
      } else {
        return new Response(JSON.stringify({ error: createError.message }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    } else {
      userId = newUser.user.id;
      const profileUpdate: Record<string, string> = {};
      if (phone) profileUpdate.phone = phone;
      if (email) profileUpdate.email = email;
      if (Object.keys(profileUpdate).length > 0) {
        await adminClient.from("profiles").update(profileUpdate).eq("id", userId);
      }
    }

    // Create student record with new fields
    const parsedFinalFee = parseFloat(String(final_fee || "0").replace(/,/g, "")) || 0;

    const { data: student, error: studentError } = await adminClient
      .from("students")
      .insert({
        user_id: userId,
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
        final_fee: parsedFinalFee,
        payment_date: payment_date || null,
        account_number: account_number || null,
        alloted_room_no: alloted_room_no || null,
        remarks: remarks || null,
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
      { user_id: userId, role: "student" },
      { onConflict: "user_id,role" }
    );

    // Auto-create invoice and payment records if final_fee > 0
    if (parsedFinalFee > 0) {
      // Get property_id
      const { data: propData } = await adminClient.from("properties").select("id").limit(1).single();
      const propertyId = propData?.id;

      if (propertyId) {
        const parsedAmt1 = parseFloat(String(amount_1 || "0").replace(/,/g, "")) || 0;
        const parsedAmt2 = parseFloat(String(amount_2 || "0").replace(/,/g, "")) || 0;
        const totalPaid = parsedAmt1 + parsedAmt2;
        const invoiceStatus = totalPaid >= parsedFinalFee ? "paid" : (totalPaid > 0 ? "partial" : "pending");

        const invoiceNumber = `INV-${roll_number}-${Date.now().toString(36).toUpperCase()}`;
        const billingDate = payment_date || new Date().toISOString().split("T")[0];

        const noteParts: string[] = [];
        if (balance_payment) noteParts.push(`Balance: ${balance_payment}`);
        if (remarks) noteParts.push(`Remarks: ${remarks}`);

        const { data: invoice, error: invError } = await adminClient.from("invoices").insert({
          student_id: student.id,
          invoice_number: invoiceNumber,
          billing_month: billingDate,
          due_date: billingDate,
          total_amount: parsedFinalFee,
          paid_amount: totalPaid,
          room_rent: parsedFinalFee,
          status: invoiceStatus,
          notes: noteParts.join(" | ") || null,
        }).select().single();

        if (!invError && invoice) {
          // Create payment record for Amount 1
          if (parsedAmt1 > 0) {
            await adminClient.from("payments").insert({
              invoice_id: invoice.id,
              student_id: student.id,
              property_id: propertyId,
              amount: parsedAmt1,
              payment_method: (payment_mode_1 || "cash").toLowerCase(),
              payment_mode_label: payment_mode_1 || null,
              transaction_id: transaction_details_1 || null,
              transaction_reference: transaction_details_1 || null,
              payment_label: "Amount 1",
              status: "completed",
              paid_at: billingDate ? new Date(billingDate).toISOString() : new Date().toISOString(),
            });
          }

          // Create payment record for Amount 2
          if (parsedAmt2 > 0) {
            await adminClient.from("payments").insert({
              invoice_id: invoice.id,
              student_id: student.id,
              property_id: propertyId,
              amount: parsedAmt2,
              payment_method: (payment_mode_2 || "cash").toLowerCase(),
              payment_mode_label: payment_mode_2 || null,
              transaction_id: transaction_details_2 || null,
              transaction_reference: transaction_details_2 || null,
              payment_label: "Amount 2",
              status: "completed",
              paid_at: billingDate ? new Date(billingDate).toISOString() : new Date().toISOString(),
            });
          }
        }
      }
    }

    return new Response(
      JSON.stringify({ student, tempPassword: finalPassword, userId, loginId: roll_number }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});