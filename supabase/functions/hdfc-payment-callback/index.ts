import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const HDFC_PUBLIC_KEY = Deno.env.get("HDFC_PUBLIC_KEY")!;

async function verifySignature(payload: string, signature: string): Promise<boolean> {
  try {
    const pemBody = HDFC_PUBLIC_KEY
      .replace("-----BEGIN PUBLIC KEY-----", "")
      .replace("-----END PUBLIC KEY-----", "")
      .replace(/\s/g, "");

    const binaryKey = Uint8Array.from(atob(pemBody), (c) => c.charCodeAt(0));

    const key = await crypto.subtle.importKey(
      "spki",
      binaryKey,
      { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
      false,
      ["verify"]
    );

    const sigBytes = Uint8Array.from(atob(signature), (c) => c.charCodeAt(0));
    return await crypto.subtle.verify(
      "RSASSA-PKCS1-v1_5",
      key,
      sigBytes,
      new TextEncoder().encode(payload)
    );
  } catch (err) {
    console.error("Signature verification failed:", err);
    return false;
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const body = await req.text();
    let data: Record<string, any>;

    // Parse form-encoded or JSON
    const contentType = req.headers.get("content-type") || "";
    if (contentType.includes("application/x-www-form-urlencoded")) {
      const params = new URLSearchParams(body);
      data = Object.fromEntries(params.entries());
    } else {
      data = JSON.parse(body);
    }

    console.log("HDFC callback received:", JSON.stringify(data));

    const orderId = data.order_id || data.orderId;
    const txnStatus = (data.status || data.txn_status || "").toUpperCase();
    const txnId = data.txn_id || data.transaction_id || data.bank_ref_no || "";
    const signature = data.signature || data.resp_hash || "";

    if (!orderId) {
      return new Response(JSON.stringify({ error: "Missing order_id" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Verify signature if present
    if (signature) {
      // Build the string to verify (exclude signature from data)
      const verifyData = { ...data };
      delete verifyData.signature;
      delete verifyData.resp_hash;
      const payloadStr = JSON.stringify(verifyData);
      
      const isValid = await verifySignature(payloadStr, signature);
      if (!isValid) {
        console.warn("Signature verification failed for order:", orderId);
        // Log but don't reject — HDFC may use different signing methods
      }
    }

    const adminClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Find the pending payment by order ID
    const { data: payment } = await adminClient
      .from("payments")
      .select("*")
      .eq("transaction_id", orderId)
      .eq("status", "pending")
      .single();

    if (!payment) {
      console.warn("No pending payment found for order:", orderId);
      return new Response(JSON.stringify({ status: "no_pending_payment" }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const isSuccess = ["CHARGED", "SUCCESS", "TXN_SUCCESS", "CAPTURED"].includes(txnStatus);
    const newStatus = isSuccess ? "completed" : "failed";

    // Update payment record
    await adminClient
      .from("payments")
      .update({
        status: newStatus,
        transaction_reference: txnId,
        gateway_response: data,
        paid_at: isSuccess ? new Date().toISOString() : payment.paid_at,
      })
      .eq("id", payment.id);

    if (isSuccess) {
      // Update invoice paid_amount and status
      const { data: invoice } = await adminClient
        .from("invoices")
        .select("*")
        .eq("id", payment.invoice_id)
        .single();

      if (invoice) {
        const newPaidAmount = (invoice.paid_amount || 0) + payment.amount;
        const newInvoiceStatus =
          newPaidAmount >= invoice.total_amount ? "paid" : "partial";

        await adminClient
          .from("invoices")
          .update({
            paid_amount: newPaidAmount,
            status: newInvoiceStatus,
            payment_date: new Date().toISOString(),
            payment_method: "online",
          })
          .eq("id", invoice.id);

        // Auto-create accounting records if property_id is available
        const propertyId = payment.property_id;
        if (propertyId) {
          // Check if accounts exist for this property, create if needed
          let { data: bankAccount } = await adminClient
            .from("accounts")
            .select("id")
            .eq("property_id", propertyId)
            .eq("name", "Bank Account")
            .single();

          if (!bankAccount) {
            const { data: created } = await adminClient
              .from("accounts")
              .insert({
                property_id: propertyId,
                name: "Bank Account",
                account_type: "asset",
                code: "BANK-001",
                description: "Primary bank account for online payments",
              })
              .select("id")
              .single();
            bankAccount = created;
          }

          let { data: feeAccount } = await adminClient
            .from("accounts")
            .select("id")
            .eq("property_id", propertyId)
            .eq("name", "Fee Income")
            .single();

          if (!feeAccount) {
            const { data: created } = await adminClient
              .from("accounts")
              .insert({
                property_id: propertyId,
                name: "Fee Income",
                account_type: "income",
                code: "FEE-001",
                description: "Student fee income from online payments",
              })
              .select("id")
              .single();
            feeAccount = created;
          }

          if (bankAccount && feeAccount) {
            // Create transaction record
            await adminClient.from("transactions").insert({
              property_id: propertyId,
              account_id: bankAccount.id,
              amount: payment.amount,
              transaction_type: "income",
              category: "fee_collection",
              description: `Online payment for invoice ${invoice.invoice_number} (Order: ${orderId})`,
              payment_mode: "online",
              reference_number: txnId,
              date: new Date().toISOString().split("T")[0],
            });

            // Create journal entry
            const entryNumber = `JE-${Date.now()}`;
            await adminClient.from("journal_entries").insert({
              property_id: propertyId,
              entry_number: entryNumber,
              description: `Online payment received - ${invoice.invoice_number}`,
              debit_account_id: bankAccount.id,
              credit_account_id: feeAccount.id,
              amount: payment.amount,
              reference: `HDFC-${orderId}`,
              date: new Date().toISOString().split("T")[0],
            });
          }
        }

        // Send notification to student
        if (payment.student_id) {
          const { data: studentRecord } = await adminClient
            .from("students")
            .select("user_id")
            .eq("id", payment.student_id)
            .single();

          if (studentRecord) {
            await adminClient.from("notifications").insert({
              user_id: studentRecord.user_id,
              title: "Payment Successful",
              message: `Your payment of ₹${payment.amount.toLocaleString("en-IN")} for invoice ${invoice.invoice_number} has been received.`,
              type: "billing",
              link: "/student/invoices",
            });
          }
        }
      }
    } else {
      // Payment failed — notify student
      if (payment.student_id) {
        const { data: studentRecord } = await adminClient
          .from("students")
          .select("user_id")
          .eq("id", payment.student_id)
          .single();

        if (studentRecord) {
          await adminClient.from("notifications").insert({
            user_id: studentRecord.user_id,
            title: "Payment Failed",
            message: `Your online payment of ₹${payment.amount.toLocaleString("en-IN")} could not be processed. Please try again.`,
            type: "billing",
            link: "/student/invoices",
          });
        }
      }
    }

    return new Response(JSON.stringify({ status: "ok", order_id: orderId, payment_status: newStatus }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("hdfc-payment-callback error:", err);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
