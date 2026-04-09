import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

/* ------------------------------------------------------------------ */
/*  Helpers                                                           */
/* ------------------------------------------------------------------ */

function jsonResponse(payload: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function normalizePhone(phone?: string | null) {
  const digits = (phone ?? "").replace(/\D/g, "");
  return digits.length >= 10 ? digits.slice(-10) : "";
}

function splitName(fullName?: string | null) {
  const trimmed = (fullName ?? "").trim();
  if (!trimmed) return { firstName: "Student", lastName: "" };
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

function normalizePem(raw: string) {
  return raw.replace(/\\n/g, "\n").trim();
}

/* ------------------------------------------------------------------ */
/*  Base64-URL helpers (no node:buffer)                               */
/* ------------------------------------------------------------------ */

function b64urlEncode(data: Uint8Array): string {
  const binStr = Array.from(data, (b) => String.fromCharCode(b)).join("");
  return btoa(binStr).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function b64urlEncodeStr(str: string): string {
  return b64urlEncode(new TextEncoder().encode(str));
}

function b64urlDecode(input: string): Uint8Array {
  const normalized = input.replace(/-/g, "+").replace(/_/g, "/");
  const padding = "=".repeat((4 - (normalized.length % 4)) % 4);
  const binStr = atob(normalized + padding);
  return Uint8Array.from(binStr, (c) => c.charCodeAt(0));
}

/* ------------------------------------------------------------------ */
/*  PEM parsing                                                       */
/* ------------------------------------------------------------------ */

function pemToDer(pem: string): Uint8Array {
  const lines = pem.split("\n").filter((l) => !l.startsWith("-----") && l.trim());
  const b64 = lines.join("");
  const binStr = atob(b64);
  return Uint8Array.from(binStr, (c) => c.charCodeAt(0));
}

/**
 * Wraps a PKCS#1 RSAPrivateKey DER into a PKCS#8 PrivateKeyInfo envelope.
 * If the PEM is already PKCS#8, returns the DER as-is.
 */
function pkcs1ToPkcs8(pem: string): Uint8Array {
  const der = pemToDer(pem);

  // Already PKCS#8 ?
  if (pem.includes("BEGIN PRIVATE KEY")) return der;

  // PKCS#8 wrapper: SEQUENCE { version INTEGER 0, AlgorithmIdentifier, OCTET STRING { pkcs1 } }
  const algorithmIdentifier = new Uint8Array([
    0x30, 0x0d, // SEQUENCE len=13
    0x06, 0x09, // OID len=9  (rsaEncryption 1.2.840.113549.1.1.1)
    0x2a, 0x86, 0x48, 0x86, 0xf7, 0x0d, 0x01, 0x01, 0x01,
    0x05, 0x00, // NULL
  ]);

  const version = new Uint8Array([0x02, 0x01, 0x00]); // INTEGER 0

  // Wrap pkcs1 in OCTET STRING
  const octetStringHeader = asn1LengthPrefix(0x04, der.length);

  // Outer SEQUENCE length
  const innerLen = version.length + algorithmIdentifier.length + octetStringHeader.length + der.length;
  const outerHeader = asn1LengthPrefix(0x30, innerLen);

  const result = new Uint8Array(outerHeader.length + version.length + algorithmIdentifier.length + octetStringHeader.length + der.length);
  let offset = 0;
  result.set(outerHeader, offset); offset += outerHeader.length;
  result.set(version, offset); offset += version.length;
  result.set(algorithmIdentifier, offset); offset += algorithmIdentifier.length;
  result.set(octetStringHeader, offset); offset += octetStringHeader.length;
  result.set(der, offset);

  return result;
}

function asn1LengthPrefix(tag: number, contentLen: number): Uint8Array {
  if (contentLen < 0x80) {
    return new Uint8Array([tag, contentLen]);
  } else if (contentLen < 0x100) {
    return new Uint8Array([tag, 0x81, contentLen]);
  } else if (contentLen < 0x10000) {
    return new Uint8Array([tag, 0x82, (contentLen >> 8) & 0xff, contentLen & 0xff]);
  } else if (contentLen < 0x1000000) {
    return new Uint8Array([tag, 0x83, (contentLen >> 16) & 0xff, (contentLen >> 8) & 0xff, contentLen & 0xff]);
  } else {
    return new Uint8Array([tag, 0x84, (contentLen >> 24) & 0xff, (contentLen >> 16) & 0xff, (contentLen >> 8) & 0xff, contentLen & 0xff]);
  }
}

/* ------------------------------------------------------------------ */
/*  Web Crypto key imports (lazy, inside request handler)             */
/* ------------------------------------------------------------------ */

async function importPrivateKey(pem: string): Promise<CryptoKey> {
  const pkcs8Der = pkcs1ToPkcs8(pem);
  return crypto.subtle.importKey(
    "pkcs8",
    pkcs8Der,
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
    false,
    ["sign"],
  );
}

async function importPrivateKeyForDecrypt(pem: string): Promise<CryptoKey> {
  const pkcs8Der = pkcs1ToPkcs8(pem);
  return crypto.subtle.importKey(
    "pkcs8",
    pkcs8Der,
    { name: "RSA-OAEP", hash: "SHA-256" },
    false,
    ["decrypt"],
  );
}

async function importPublicKeyForEncrypt(pem: string): Promise<CryptoKey> {
  const der = pemToDer(pem);
  return crypto.subtle.importKey(
    "spki",
    der,
    { name: "RSA-OAEP", hash: "SHA-256" },
    false,
    ["encrypt"],
  );
}

async function importPublicKeyForVerify(pem: string): Promise<CryptoKey> {
  const der = pemToDer(pem);
  return crypto.subtle.importKey(
    "spki",
    der,
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
    false,
    ["verify"],
  );
}

/* ------------------------------------------------------------------ */
/*  JWS / JWE using Web Crypto                                       */
/* ------------------------------------------------------------------ */

async function signPayload(
  payload: Record<string, string>,
  privateKey: CryptoKey,
  keyUuid: string,
) {
  const header = b64urlEncodeStr(JSON.stringify({ alg: "RS256", kid: keyUuid }));
  const body = b64urlEncodeStr(JSON.stringify(payload));
  const signingInput = new TextEncoder().encode(`${header}.${body}`);
  const sigBytes = new Uint8Array(await crypto.subtle.sign("RSASSA-PKCS1-v1_5", privateKey, signingInput));
  return { header, payload: body, signature: b64urlEncode(sigBytes) };
}

async function encryptSignedPayload(
  signedPayload: { header: string; payload: string; signature: string },
  bankPubKey: CryptoKey,
  keyUuid: string,
) {
  const protectedHeader = b64urlEncodeStr(JSON.stringify({
    alg: "RSA-OAEP-256",
    enc: "A256GCM",
    cty: "JWT",
    kid: keyUuid,
  }));

  // Generate random CEK and IV
  const cek = crypto.getRandomValues(new Uint8Array(32));
  const iv = crypto.getRandomValues(new Uint8Array(12));

  // Import CEK as AES-GCM key
  const aesKey = await crypto.subtle.importKey("raw", cek, { name: "AES-GCM" }, false, ["encrypt"]);

  // Encrypt the signed payload with AES-256-GCM, using protectedHeader as AAD
  const plaintext = new TextEncoder().encode(JSON.stringify(signedPayload));
  const aadBytes = new TextEncoder().encode(protectedHeader);
  const ciphertextWithTag = new Uint8Array(
    await crypto.subtle.encrypt({ name: "AES-GCM", iv, additionalData: aadBytes, tagLength: 128 }, aesKey, plaintext),
  );

  // Web Crypto concatenates ciphertext + 16-byte tag
  const ciphertext = ciphertextWithTag.slice(0, ciphertextWithTag.length - 16);
  const tag = ciphertextWithTag.slice(ciphertextWithTag.length - 16);

  // Wrap CEK with bank's RSA public key (RSA-OAEP-256)
  const encryptedKey = new Uint8Array(
    await crypto.subtle.encrypt({ name: "RSA-OAEP" }, bankPubKey, cek),
  );

  return {
    header: protectedHeader,
    encryptedKey: b64urlEncode(encryptedKey),
    iv: b64urlEncode(iv),
    encryptedPayload: b64urlEncode(ciphertext),
    tag: b64urlEncode(tag),
  };
}

/* ------------------------------------------------------------------ */
/*  Decode gateway JWE/JWS response                                  */
/* ------------------------------------------------------------------ */

function isJwePayload(v: unknown): v is { header: string; encryptedKey: string; iv: string; encryptedPayload: string; tag: string } {
  if (!v || typeof v !== "object") return false;
  const o = v as Record<string, unknown>;
  return ["header", "encryptedKey", "iv", "encryptedPayload", "tag"].every((k) => typeof o[k] === "string");
}

function isJwsPayload(v: unknown): v is { header: string; payload: string; signature: string } {
  if (!v || typeof v !== "object") return false;
  const o = v as Record<string, unknown>;
  return ["header", "payload", "signature"].every((k) => typeof o[k] === "string");
}

async function decryptJwe(
  jwe: { header: string; encryptedKey: string; iv: string; encryptedPayload: string; tag: string },
  merchantDecryptKey: CryptoKey,
  bankVerifyKey: CryptoKey,
) {
  // Unwrap CEK
  const cek = new Uint8Array(
    await crypto.subtle.decrypt({ name: "RSA-OAEP" }, merchantDecryptKey, b64urlDecode(jwe.encryptedKey)),
  );

  const aesKey = await crypto.subtle.importKey("raw", cek, { name: "AES-GCM" }, false, ["decrypt"]);
  const iv = b64urlDecode(jwe.iv);
  const ct = b64urlDecode(jwe.encryptedPayload);
  const tag = b64urlDecode(jwe.tag);
  const aad = new TextEncoder().encode(jwe.header);

  // Concatenate ciphertext + tag for Web Crypto
  const combined = new Uint8Array(ct.length + tag.length);
  combined.set(ct);
  combined.set(tag, ct.length);

  const decryptedBytes = new Uint8Array(
    await crypto.subtle.decrypt({ name: "AES-GCM", iv, additionalData: aad, tagLength: 128 }, aesKey, combined),
  );

  const inner = JSON.parse(new TextDecoder().decode(decryptedBytes));

  // Inner should be JWS
  if (isJwsPayload(inner)) {
    const sigInput = new TextEncoder().encode(`${inner.header}.${inner.payload}`);
    const valid = await crypto.subtle.verify("RSASSA-PKCS1-v1_5", bankVerifyKey, b64urlDecode(inner.signature), sigInput);
    if (!valid) throw new Error("JWS signature verification failed");
    return JSON.parse(new TextDecoder().decode(b64urlDecode(inner.payload))) as Record<string, unknown>;
  }

  return inner as Record<string, unknown>;
}

async function decodeGatewayResponse(
  raw: unknown,
  merchantDecryptKey: CryptoKey,
  bankVerifyKey: CryptoKey,
): Promise<Record<string, unknown>> {
  if (isJwePayload(raw)) {
    return decryptJwe(raw, merchantDecryptKey, bankVerifyKey);
  }
  return raw as Record<string, unknown>;
}

/* ------------------------------------------------------------------ */
/*  Payment URL extraction                                            */
/* ------------------------------------------------------------------ */

function getPaymentUrl(data: Record<string, any>): string | null {
  return data?.payment_links?.web
    ?? data?.payment_links?.mobile
    ?? data?.payment_links?.url
    ?? data?.payment_link
    ?? data?.payment_url
    ?? data?.url
    ?? data?.links?.web
    ?? null;
}

/* ------------------------------------------------------------------ */
/*  Main handler                                                      */
/* ------------------------------------------------------------------ */

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const HDFC_MERCHANT_ID = Deno.env.get("HDFC_MERCHANT_ID")!;
    const HDFC_CLIENT_ID = Deno.env.get("HDFC_CLIENT_ID")!;
    const HDFC_KEY_UUID = Deno.env.get("HDFC_KEY_UUID")!;
    const HDFC_PRIVATE_KEY_PEM = normalizePem(Deno.env.get("HDFC_PRIVATE_KEY")!);
    const HDFC_PUBLIC_KEY_PEM = normalizePem(Deno.env.get("HDFC_PUBLIC_KEY")!);
    const HDFC_API_KEY = Deno.env.get("HDFC_API_KEY") ?? "";

    const HDFC_API_BASE = HDFC_CLIENT_ID === "hdfcmaster"
      ? "https://smartgateway.hdfcuat.bank.in"
      : "https://smartgateway.hdfc.bank.in";

    // Import keys lazily inside the handler
    const [merchantSignKey, bankEncryptKey, merchantDecryptKey, bankVerifyKey] = await Promise.all([
      importPrivateKey(HDFC_PRIVATE_KEY_PEM),
      importPublicKeyForEncrypt(HDFC_PUBLIC_KEY_PEM),
      importPrivateKeyForDecrypt(HDFC_PRIVATE_KEY_PEM),
      importPublicKeyForVerify(HDFC_PUBLIC_KEY_PEM),
    ]);

    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return jsonResponse({ error: "Unauthorized" }, 401);
    }

    const userClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user }, error: userError } = await userClient.auth.getUser();
    if (userError || !user) return jsonResponse({ error: "Unauthorized" }, 401);

    const requestBody = await req.json().catch(() => null) as Record<string, unknown> | null;
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
      const u = new URL(rawReturnUrl);
      u.search = "";
      u.hash = "";
      returnUrl = u.toString();
    } catch {
      return jsonResponse({ error: "Invalid return_url" }, 400);
    }

    const adminClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const { data: student, error: studentError } = await adminClient
      .from("students").select("id, roll_number").eq("user_id", user.id).maybeSingle();
    if (studentError || !student) return jsonResponse({ error: "Student not found" }, 404);

    const { data: invoice, error: invoiceError } = await adminClient
      .from("invoices").select("id, invoice_number, total_amount, paid_amount, student_id")
      .eq("id", invoiceId).eq("student_id", student.id).maybeSingle();
    if (invoiceError || !invoice) return jsonResponse({ error: "Invoice not found" }, 404);

    const balance = Number(invoice.total_amount) - Number(invoice.paid_amount || 0);
    if (requestedAmount > balance || requestedAmount <= 0) {
      return jsonResponse({ error: `Invalid amount. Balance due: ${balance}` }, 400);
    }

    const { data: profile } = await adminClient
      .from("profiles").select("full_name, email, phone").eq("id", user.id).maybeSingle();

    const customerEmail = (profile?.email ?? user.email ?? "").trim();
    const customerPhone = normalizePhone(profile?.phone ?? user.phone ?? "");
    if (!customerEmail && !customerPhone) {
      return jsonResponse({ error: "Student email or phone number is required" }, 400);
    }

    const metadataFullName = typeof user.user_metadata?.full_name === "string" ? user.user_metadata.full_name : "";
    const { firstName, lastName } = splitName(profile?.full_name ?? metadataFullName);

    const { data: property } = await adminClient
      .from("properties").select("id").order("created_at", { ascending: true }).limit(1).maybeSingle();
    if (!property?.id) return jsonResponse({ error: "Property not found" }, 500);

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
    if (lastName) sessionPayload.last_name = lastName;

    console.log("Creating HDFC session for order:", orderId);

    // Sign → Encrypt
    const signed = await signPayload(sessionPayload, merchantSignKey, HDFC_KEY_UUID);
    const encrypted = await encryptSignedPayload(signed, bankEncryptKey, HDFC_KEY_UUID);

    // Call HDFC /v4/session with Basic Auth + JWE payload
    const apiKeyB64 = btoa(`${HDFC_API_KEY}:`);
    console.log("HDFC request:", JSON.stringify({
      "x-merchantid": HDFC_MERCHANT_ID,
      "x-customerid": student.id,
      "api_key_len": HDFC_API_KEY.length,
      "api_base": HDFC_API_BASE,
      "key_uuid": HDFC_KEY_UUID,
      "auth_header": `Basic ${apiKeyB64.substring(0, 10)}...`,
    }));

    const hdfcRes = await fetch(`${HDFC_API_BASE}/v4/session`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Basic ${apiKeyB64}`,
        "x-merchantid": HDFC_MERCHANT_ID,
        "x-customerid": student.id,
        "x-resellerid": "hdfc_reseller",
      },
      body: JSON.stringify(encrypted),
    });

    const rawText = await hdfcRes.text();
    console.log("HDFC raw response status:", hdfcRes.status, "body length:", rawText.length);

    let parsed: unknown = {};
    try { parsed = rawText ? JSON.parse(rawText) : {}; } catch { parsed = { raw: rawText }; }

    let hdfcData: Record<string, unknown>;
    try {
      hdfcData = await decodeGatewayResponse(parsed, merchantDecryptKey, bankVerifyKey);
    } catch (decodeErr) {
      if (!hdfcRes.ok) {
        hdfcData = parsed as Record<string, unknown>;
      } else {
        console.error("Decode error:", decodeErr);
        return jsonResponse({ error: "Payment gateway error", details: { message: "Unable to decode response" } }, 502);
      }
    }

    if (!hdfcRes.ok) {
      console.error("HDFC error response:", JSON.stringify(hdfcData));
      return jsonResponse({ error: "Payment gateway error", details: hdfcData }, 502);
    }

    console.log("HDFC decoded response:", JSON.stringify(hdfcData));

    const paymentUrl = getPaymentUrl(hdfcData);
    if (!paymentUrl) {
      console.error("Missing payment URL in:", JSON.stringify(hdfcData));
      return jsonResponse({ error: "Payment gateway error", details: { message: "Missing payment URL", gateway_response: hdfcData } }, 502);
    }

    // Insert pending payment
    const { error: insertErr } = await adminClient.from("payments").insert({
      invoice_id: invoice.id,
      student_id: student.id,
      property_id: property.id,
      amount: requestedAmount,
      payment_method: "online",
      status: "pending",
      transaction_id: orderId,
      gateway_response: hdfcData,
      payment_label: `HDFC-${orderId}`,
      recorded_by: user.id,
    });

    if (insertErr) {
      console.error("Payment insert error:", insertErr);
      return jsonResponse({ error: "Failed to create pending payment" }, 500);
    }

    return jsonResponse({
      order_id: orderId,
      payment_links: {
        ...hdfcData,
        url: paymentUrl,
        payment_links: {
          web: (hdfcData as any)?.payment_links?.web ?? paymentUrl,
        },
      },
    });
  } catch (error) {
    console.error("hdfc-create-order error:", error);
    return jsonResponse({ error: "Internal server error" }, 500);
  }
});
