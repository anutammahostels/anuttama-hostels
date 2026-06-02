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

// Coerce arbitrary input (number, null, undefined, string) to a trimmed string.
function safeStr(v: any): string {
  if (v === null || v === undefined) return "";
  return String(v).trim();
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
    const rawBody = body || {};
    // Coerce all string-ish fields to safe trimmed strings (Excel cells often arrive as numbers / null)
    const full_name = safeStr(rawBody.full_name);
    const email = safeStr(rawBody.email);
    const phone = safeStr(rawBody.phone);
    const roll_number = safeStr(rawBody.roll_number);
    const course = safeStr(rawBody.course);
    const department = safeStr(rawBody.department);
    const year = rawBody.year;
    const date_of_birth = rawBody.date_of_birth;
    const blood_group = safeStr(rawBody.blood_group);
    const emergency_contact = safeStr(rawBody.emergency_contact);
    const father_name = safeStr(rawBody.father_name);
    const mother_name = safeStr(rawBody.mother_name);
    const gender = safeStr(rawBody.gender);
    const final_fee = rawBody.final_fee;
    const payment_date = rawBody.payment_date;
    const account_number = safeStr(rawBody.account_number);
    const alloted_room_no = safeStr(rawBody.alloted_room_no);
    const remarks = safeStr(rawBody.remarks);
    const payment_date_1 = rawBody.payment_date_1;
    const payment_mode_1 = safeStr(rawBody.payment_mode_1);
    const amount_1 = rawBody.amount_1;
    const transaction_details_1 = safeStr(rawBody.transaction_details_1);
    const utr_id_1 = safeStr(rawBody.utr_id_1);
    const payment_date_2 = rawBody.payment_date_2;
    const payment_mode_2 = safeStr(rawBody.payment_mode_2);
    const amount_2 = rawBody.amount_2;
    const transaction_details_2 = safeStr(rawBody.transaction_details_2);
    const utr_id_2 = safeStr(rawBody.utr_id_2);
    const payment_date_3 = rawBody.payment_date_3;
    const payment_mode_3 = safeStr(rawBody.payment_mode_3);
    const amount_3 = rawBody.amount_3;
    const transaction_details_3 = safeStr(rawBody.transaction_details_3);
    const utr_id_3 = safeStr(rawBody.utr_id_3);
    const balance_payment = rawBody.balance_payment;

    if (!full_name || !roll_number) {
      return new Response(JSON.stringify({ error: "Student name and enrollment number are required", code: "MISSING_REQUIRED" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const sanitizedRoll = roll_number.toLowerCase().replace(/[^a-z0-9]/g, "");
    if (!sanitizedRoll) {
      return new Response(JSON.stringify({ error: `Invalid enrollment number: "${roll_number}"`, code: "INVALID_ROLL_NUMBER" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const loginEmail = email || `${sanitizedRoll}@anuttama.student`;

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
        mother_name: mother_name || null,
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
    const invoiceErrors: string[] = [];
    let invoicesCreated = 0;
    if (parsedFinalFee > 0) {
      // Get or auto-create a default property so payments can be recorded.
      let propertyId: string | null = null;
      const { data: propData } = await adminClient.from("properties").select("id").limit(1).maybeSingle();
      propertyId = propData?.id ?? null;

      if (!propertyId) {
        // Ensure an organization exists for this admin
        let orgId: string | null = null;
        const { data: existingOrg } = await adminClient
          .from("organizations")
          .select("id")
          .eq("owner_id", callingUser.id)
          .maybeSingle();
        orgId = existingOrg?.id ?? null;
        if (!orgId) {
          const { data: newOrg, error: orgErr } = await adminClient
            .from("organizations")
            .insert({ name: "Anuttama Hostels", type: "hostel", owner_id: callingUser.id })
            .select("id")
            .single();
          if (orgErr) invoiceErrors.push(`org: ${orgErr.message}`);
          orgId = newOrg?.id ?? null;
        }
        const { data: newProp, error: propErr } = await adminClient
          .from("properties")
          .insert({ name: "Main Property", organization_id: orgId, owner_id: callingUser.id, status: "active" })
          .select("id")
          .single();
        if (propErr) invoiceErrors.push(`property: ${propErr.message}`);
        propertyId = newProp?.id ?? null;
      }

      if (propertyId) {
        const toAmt = (v: any) => parseFloat(String(v ?? "0").replace(/,/g, "")) || 0;
        const installments = [
          { n: 1, amt: toAmt(amount_1), mode: payment_mode_1, txn: transaction_details_1, utr: utr_id_1, date: payment_date_1 || payment_date },
          { n: 2, amt: toAmt(amount_2), mode: payment_mode_2, txn: transaction_details_2, utr: utr_id_2, date: payment_date_2 },
          { n: 3, amt: toAmt(amount_3), mode: payment_mode_3, txn: transaction_details_3, utr: utr_id_3, date: payment_date_3 },
        ];
        const todayStr = new Date().toISOString().split("T")[0];
        const baseBillingDate = toDateOnly(payment_date_1, undefined) || toDateOnly(payment_date, undefined) || todayStr;

        const nonZeroInstallments = installments.filter((i) => i.amt > 0);
        const totalPaid = nonZeroInstallments.reduce((s, i) => s + i.amt, 0);

        const baseRemarks = remarks ? `Remarks: ${remarks}` : "";
        const balanceNote = balance_payment ? `Balance: ${balance_payment}` : "";

        const tsToken = Date.now().toString(36).toUpperCase();

        for (const inst of nonZeroInstallments) {
          const billingDate = toDateOnly(inst.date, undefined) || baseBillingDate;
          const invoiceNumber = `INV-${roll_number}-P${inst.n}-${tsToken}`;
          const noteParts: string[] = [`Installment ${inst.n} of ${installments.length}`];
          if (inst.n === installments.length && balanceNote) noteParts.push(balanceNote);
          if (baseRemarks) noteParts.push(baseRemarks);

          const { data: invoice, error: invError } = await adminClient.from("invoices").insert({
            student_id: student.id,
            invoice_number: invoiceNumber,
            billing_month: billingDate,
            due_date: billingDate,
            total_amount: inst.amt,
            paid_amount: inst.amt,
            room_rent: inst.amt,
            status: "paid",
            payment_method: (inst.mode || "cash").toLowerCase(),
            payment_date: toIsoTimestamp(inst.date, toIsoTimestamp(billingDate)),
            notes: noteParts.join(" | "),
          }).select().single();

          if (invError) {
            invoiceErrors.push(`invoice P${inst.n}: ${invError.message}`);
          } else if (invoice) {
            invoicesCreated++;
            const { error: payErr } = await adminClient.from("payments").insert({
              invoice_id: invoice.id,
              student_id: student.id,
              property_id: propertyId,
              amount: inst.amt,
              payment_method: (inst.mode || "cash").toLowerCase(),
              payment_mode_label: inst.mode || null,
              transaction_id: inst.txn || null,
              transaction_reference: inst.utr || null,
              payment_label: `Installment ${inst.n}`,
              status: "completed",
              paid_at: toIsoTimestamp(inst.date, toIsoTimestamp(billingDate)),
            });
            if (payErr) invoiceErrors.push(`payment P${inst.n}: ${payErr.message}`);
          }
        }

        const outstanding = parsedFinalFee - totalPaid;
        if (outstanding > 0) {
          const invoiceNumber = `INV-${roll_number}-BAL-${tsToken}`;
          const balDueDate = toDateOnly(balance_payment, undefined) || baseBillingDate;
          const noteParts: string[] = ["Outstanding balance"];
          if (balanceNote) noteParts.push(balanceNote);
          if (baseRemarks) noteParts.push(baseRemarks);

          const { error: balErr } = await adminClient.from("invoices").insert({
            student_id: student.id,
            invoice_number: invoiceNumber,
            billing_month: baseBillingDate,
            due_date: balDueDate,
            total_amount: outstanding,
            paid_amount: 0,
            room_rent: outstanding,
            status: "pending",
            notes: noteParts.join(" | "),
          });
          if (balErr) invoiceErrors.push(`balance invoice: ${balErr.message}`);
          else invoicesCreated++;
        }
      } else {
        invoiceErrors.push("No property available to record payments");
      }
    }

    return new Response(
      JSON.stringify({ student, tempPassword: finalPassword, userId, loginId: roll_number, invoicesCreated, invoiceErrors }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err: any) {
    console.error("[create-student] failed", { message: err?.message, stack: err?.stack });
    return new Response(JSON.stringify({ error: err?.message ?? String(err), code: "UNHANDLED" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});