import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const HDFC_MERCHANT_ID = Deno.env.get("HDFC_MERCHANT_ID")!;
const HDFC_API_KEY = Deno.env.get("HDFC_API_KEY")!;
const HDFC_CLIENT_ID = Deno.env.get("HDFC_CLIENT_ID")!;

const HDFC_RESELLER_ID = "hdfc_reseller";
const HDFC_API_BASE = HDFC_CLIENT_ID === "hdfcmaster"
  ? "https://smartgateway.hdfcuat.bank.in"
  : "https://smartgateway.hdfc.bank.in";

function jsonResponse(payload: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function buildBasicAuth(apiKey: string) {
  return `Basic ${btoa(`${apiKey}:`)}`;
}

function normalizePhone(phone?: string | null) {
  const digits = (phone ?? "").replace(/\D/g, "");
  return digits.length >= 10 ? digits.slice(-10) : "";
}

function splitName(fullName?: string | null) {
  const trimmed = (fullName ?? "").trim();

  if (!trimmed) {
    return { firstName: "Student", lastName: "" };
  }

  const parts = trimmed.split(/\s+/);
  return {
    firstName: parts[0].slice(0, 50),
    lastName: parts.slice(1).join(" ").slice(0, 50),
  };
}

function generateOrderId() {
  const timePart = Date.now().toString(36).toUpperCase().slice(-8);
  const randomPart = crypto.randomUUID().replace(/-/g, "").slice(0, 8).toUpperCase();
  return `H${timePart}${randomPart}`.slice(0, 20);
}

function getPaymentUrl(response: Record<string, unknown>) {
  const data = response as Record<string, any>;

  return data?.payment_links?.web
    ?? data?.payment_links?.mobile
    ?? data?.payment_links?.url
    ?? data?.payment_link
    ?? data?.payment_url
    ?? data?.url
    ?? data?.links?.web
    ?? null;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");

    if (!authHeader?.startsWith("Bearer ")) {
      return jsonResponse({ error: "Unauthorized" }, 401);
    }

    const userClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
    });

    const {
      data: { user },
      error: userError,
    } = await userClient.auth.getUser();

    if (userError || !user) {
      return jsonResponse({ error: "Unauthorized" }, 401);
    }

    const requestBody = await req.json().catch(() => null);
    const invoiceId = typeof requestBody?.invoice_id === "string" ? requestBody.invoice_id : "";
    const requestedAmount = Number(requestBody?.amount);

    if (!invoiceId || !Number.isFinite(requestedAmount) || requestedAmount <= 0) {
      return jsonResponse({ error: "invoice_id and a valid amount are required" }, 400);
    }

    const fallbackReturnUrl = `${req.headers.get("origin") ?? ""}/payment/status`;
    const rawReturnUrl = typeof requestBody?.return_url === "string" && requestBody.return_url
      ? requestBody.return_url
      : fallbackReturnUrl;

    let returnUrl = rawReturnUrl;
    try {
      const parsedReturnUrl = new URL(rawReturnUrl);
      parsedReturnUrl.search = "";
      parsedReturnUrl.hash = "";
      returnUrl = parsedReturnUrl.toString();
    } catch {
      return jsonResponse({ error: "Invalid return_url" }, 400);
    }

    const adminClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const { data: student, error: studentError } = await adminClient
      .from("students")
      .select("id, roll_number")
      .eq("user_id", user.id)
      .maybeSingle();

    if (studentError || !student) {
      return jsonResponse({ error: "Student not found" }, 404);
    }

    const { data: invoice, error: invoiceError } = await adminClient
      .from("invoices")
      .select("id, invoice_number, total_amount, paid_amount, student_id")
      .eq("id", invoiceId)
      .eq("student_id", student.id)
      .maybeSingle();

    if (invoiceError || !invoice) {
      return jsonResponse({ error: "Invoice not found" }, 404);
    }

    const balance = Number(invoice.total_amount) - Number(invoice.paid_amount || 0);
    if (requestedAmount > balance || requestedAmount <= 0) {
      return jsonResponse({ error: `Invalid amount. Balance due: ${balance}` }, 400);
    }

    const { data: profile } = await adminClient
      .from("profiles")
      .select("full_name, email, phone")
      .eq("id", user.id)
      .maybeSingle();

    const metadataFullName = typeof user.user_metadata?.full_name === "string"
      ? user.user_metadata.full_name
      : "";

    const customerEmail = (profile?.email ?? user.email ?? "").trim();
    const customerPhone = normalizePhone(profile?.phone ?? user.phone ?? "");

    if (!customerEmail && !customerPhone) {
      return jsonResponse({ error: "Student email or phone number is required to initiate payment" }, 400);
    }

    const { firstName, lastName } = splitName(profile?.full_name ?? metadataFullName);

    const { data: property, error: propertyError } = await adminClient
      .from("properties")
      .select("id")
      .order("created_at", { ascending: true })
      .limit(1)
      .maybeSingle();

    if (propertyError || !property?.id) {
      return jsonResponse({ error: "Property configuration not found" }, 500);
    }

    const orderId = generateOrderId();

    const sessionPayload: Record<string, string> = {
      order_id: orderId,
      amount: requestedAmount.toFixed(2),
      customer_id: student.id,
      customer_email: customerEmail,
      customer_phone: customerPhone,
      payment_page_client_id: HDFC_CLIENT_ID,
      action: "paymentPage",
      currency: "INR",
      return_url: returnUrl,
      description: `Fee payment for invoice ${invoice.invoice_number}`,
      first_name: firstName,
    };

    if (lastName) {
      sessionPayload.last_name = lastName;
    }

    const hdfcResponse = await fetch(`${HDFC_API_BASE}/session`, {
      method: "POST",
      headers: {
        Authorization: buildBasicAuth(HDFC_API_KEY),
        "Content-Type": "application/json",
        "x-merchantid": HDFC_MERCHANT_ID,
        "x-customerid": student.id,
        "x-resellerid": HDFC_RESELLER_ID,
      },
      body: JSON.stringify(sessionPayload),
    });

    const rawGatewayResponse = await hdfcResponse.text();
    let hdfcData: Record<string, unknown> = {};

    try {
      hdfcData = rawGatewayResponse ? JSON.parse(rawGatewayResponse) : {};
    } catch {
      hdfcData = { raw_response: rawGatewayResponse };
    }

    if (!hdfcResponse.ok) {
      console.error("HDFC error:", rawGatewayResponse);
      return jsonResponse({ error: "Payment gateway error", details: hdfcData }, 502);
    }

    const paymentUrl = getPaymentUrl(hdfcData);
    if (!paymentUrl) {
      console.error("HDFC missing payment URL:", rawGatewayResponse);
      return jsonResponse({
        error: "Payment gateway error",
        details: {
          message: "Missing payment URL in gateway response",
          gateway_response: hdfcData,
        },
      }, 502);
    }

    const { error: paymentInsertError } = await adminClient.from("payments").insert({
      invoice_id: invoice.id,
      student_id: student.id,
      property_id: property.id,
      amount: requestedAmount,
      payment_method: "online",
      status: "pending",
      transaction_id: orderId,
      transaction_reference: null,
      gateway_response: hdfcData,
      payment_label: `HDFC-${orderId}`,
      recorded_by: user.id,
    });

    if (paymentInsertError) {
      console.error("Failed to create payment record:", paymentInsertError);
      return jsonResponse({ error: "Failed to create pending payment" }, 500);
    }

    const nestedPaymentLinks = typeof (hdfcData as Record<string, any>).payment_links === "object"
      && (hdfcData as Record<string, any>).payment_links !== null
      ? (hdfcData as Record<string, any>).payment_links
      : {};

    return jsonResponse({
      order_id: orderId,
      payment_links: {
        ...hdfcData,
        url: paymentUrl,
        payment_links: {
          ...nestedPaymentLinks,
          web: nestedPaymentLinks.web ?? paymentUrl,
        },
      },
    });
  } catch (error) {
    console.error("hdfc-create-order error:", error);
    return jsonResponse({ error: "Internal server error" }, 500);
  }
});