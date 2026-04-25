import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Robust date parser: handles DD/MM/YYYY, DD-MM-YYYY, YYYY-MM-DD, and ISO strings.
// Returns a Date in UTC or null if unparseable.
function parseDate(input: any): Date | null {
  if (input === null || input === undefined || input === "") return null;
  if (input instanceof Date) return isNaN(input.getTime()) ? null : input;
  const str = String(input).trim();
  if (!str) return null;

  // DD/MM/YYYY or DD-MM-YYYY
  const dmy = str.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})$/);
  if (dmy) {
    let [, d, m, y] = dmy;
    let yearNum = parseInt(y, 10);
    if (yearNum < 100) yearNum += 2000;
    const dayNum = parseInt(d, 10);
    const monthNum = parseInt(m, 10);
    if (monthNum < 1 || monthNum > 12 || dayNum < 1 || dayNum > 31) return null;
    const result = new Date(Date.UTC(yearNum, monthNum - 1, dayNum));
    if (result.getUTCDate() !== dayNum || result.getUTCMonth() !== monthNum - 1) return null;
    return result;
  }

  // YYYY-MM-DD
  const iso = str.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
  if (iso) {
    const result = new Date(Date.UTC(+iso[1], +iso[2] - 1, +iso[3]));
    if (isNaN(result.getTime())) return null;
    return result;
  }

  // Fallback to native parsing for anything else (full ISO timestamps, etc.)
  const fallback = new Date(str);
  return isNaN(fallback.getTime()) ? null : fallback;
}

// Safe ISO date string (YYYY-MM-DD) for date columns
function toDateOnly(input: any, fallback?: string): string | null {
  const d = parseDate(input);
  if (d) return d.toISOString().split("T")[0];
  return fallback ?? null;
}

// Safe full ISO timestamp for timestamptz columns
function toIsoTimestamp(input: any, fallback?: string): string {
  const d = parseDate(input);
  if (d) return d.toISOString();
  return fallback ?? new Date().toISOString();
}

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
        date_of_birth: toDateOnly(date_of_birth),
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
        const toAmt = (v: any) => parseFloat(String(v ?? "0").replace(/,/g, "")) || 0;
        const installments = [
          { n: 1, amt: toAmt(amount_1), mode: payment_mode_1, txn: transaction_details_1, utr: utr_id_1, date: payment_date_1 || payment_date },
          { n: 2, amt: toAmt(amount_2), mode: payment_mode_2, txn: transaction_details_2, utr: utr_id_2, date: payment_date_2 },
          { n: 3, amt: toAmt(amount_3), mode: payment_mode_3, txn: transaction_details_3, utr: utr_id_3, date: payment_date_3 },
        ];
        const totalPaid = installments.reduce((s, i) => s + i.amt, 0);
        const invoiceStatus = totalPaid >= parsedFinalFee ? "paid" : (totalPaid > 0 ? "partial" : "pending");

        const invoiceNumber = `INV-${roll_number}-${Date.now().toString(36).toUpperCase()}`;
        const todayStr = new Date().toISOString().split("T")[0];
        const billingDate = toDateOnly(payment_date_1, undefined) || toDateOnly(payment_date, undefined) || todayStr;

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
          // Create one payment row per non-zero installment
          for (const inst of installments) {
            if (inst.amt <= 0) continue;
            const paidAt = toIsoTimestamp(inst.date, toIsoTimestamp(billingDate));
            await adminClient.from("payments").insert({
              invoice_id: invoice.id,
              student_id: student.id,
              property_id: propertyId,
              amount: inst.amt,
              payment_method: (inst.mode || "cash").toLowerCase(),
              payment_mode_label: inst.mode || null,
              transaction_id: inst.txn || null,
              transaction_reference: inst.utr || null,
              payment_label: `Amount ${inst.n}`,
              status: "completed",
              paid_at: paidAt,
            });
          }
        }
      }
    }

    return new Response(
      JSON.stringify({ student, tempPassword: finalPassword, userId, loginId: roll_number }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err?.message ?? String(err) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});