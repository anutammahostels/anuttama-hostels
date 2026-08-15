import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useCenter } from "@/contexts/CenterContext";

/**
 * Single source of truth for all accounting data (invoices, payments, refunds).
 * Every accounting view + export reads from here so totals can never disagree.
 */

const PAGE = 1000;

async function fetchAll<T>(build: (from: number, to: number) => any): Promise<T[]> {
  const out: T[] = [];
  let from = 0;
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const { data, error } = await build(from, from + PAGE - 1);
    if (error || !data || data.length === 0) break;
    out.push(...(data as T[]));
    if (data.length < PAGE) break;
    from += PAGE;
  }
  return out;
}

export type LedgerPayment = {
  id: string;
  invoice_id: string;
  student_id: string | null;
  property_id: string;
  amount: number;
  payment_method: string | null;
  payment_mode_label: string | null;
  transaction_reference: string | null;
  transaction_id: string | null;
  paid_at: string | null;
};

export type LedgerRefund = {
  id: string;
  invoice_id: string;
  student_id: string | null;
  property_id: string;
  amount: number;
  status: string | null;
  refund_method: string | null;
  reason: string | null;
  created_at: string;
};

export type LedgerInvoice = {
  id: string;
  student_id: string | null;
  invoice_number: string;
  billing_month: string;
  total_amount: number;
  paid_amount: number;
  discounts: number;
  due_date: string;
  status: string | null;
  payment_method: string | null;
};

export type LedgerStudent = {
  id: string;
  name: string;
  rollNumber: string;
  status: string | null;
  propertyId: string | null;
  propertyName: string;
  gross: number;
  discounts: number;
  received: number;
  refunded: number;
  net: number;
  installments: LedgerPayment[];
  invoices: LedgerInvoice[];
  refunds: LedgerRefund[];
  paymentModes: string;
  paymentStatus: "paid" | "partial" | "pending";
};

export const isRefundPending = (s: string | null) =>
  !["processed", "completed", "success", "failed", "rejected"].includes((s || "").toLowerCase());

export const isRefundProcessed = (s: string | null) =>
  ["processed", "completed", "success"].includes((s || "").toLowerCase());

export function useAccountingLedger() {
  const { centerId } = useCenter();

  const query = useQuery({
    queryKey: ["accounting-ledger", centerId],
    queryFn: async () => {
      const [students, invoices, payments, refunds, propertiesRes] = await Promise.all([
        fetchAll<any>((from, to) =>
          supabase.from("students").select("id, roll_number, user_id, status, property_id").range(from, to)
        ),
        fetchAll<any>((from, to) =>
          supabase
            .from("invoices")
            .select(
              "id, student_id, invoice_number, billing_month, total_amount, paid_amount, discounts, due_date, status, payment_method"
            )
            .range(from, to)
        ),
        fetchAll<any>((from, to) =>
          supabase
            .from("payments")
            .select(
              "id, invoice_id, student_id, property_id, amount, payment_method, payment_mode_label, transaction_reference, transaction_id, paid_at"
            )
            .eq("status", "completed")
            .order("paid_at", { ascending: true })
            .range(from, to)
        ),
        fetchAll<any>((from, to) =>
          supabase
            .from("refunds")
            .select("id, invoice_id, student_id, property_id, amount, status, refund_method, reason, created_at")
            .order("created_at", { ascending: false })
            .range(from, to)
        ),
        supabase.from("properties").select("id, name"),
      ]);

      const userIds = students.map((s) => s.user_id).filter(Boolean);
      const profiles: any[] = [];
      for (let i = 0; i < userIds.length; i += 500) {
        const { data } = await supabase
          .from("profiles")
          .select("id, full_name")
          .in("id", userIds.slice(i, i + 500));
        if (data) profiles.push(...data);
      }

      const propertyMap = new Map(((propertiesRes.data as any[]) || []).map((p) => [p.id, p.name]));
      const profileMap = new Map(profiles.map((p) => [p.id, p.full_name]));

      const inCenter = (propertyId: string | null | undefined) =>
        centerId === "all" || propertyId === centerId;

      const studentRows = new Map<string, LedgerStudent>();
      students.forEach((s) => {
        if (!inCenter(s.property_id)) return;
        studentRows.set(s.id, {
          id: s.id,
          name: profileMap.get(s.user_id) || "Unknown",
          rollNumber: s.roll_number || "-",
          status: s.status,
          propertyId: s.property_id,
          propertyName: propertyMap.get(s.property_id) || "-",
          gross: 0,
          discounts: 0,
          received: 0,
          refunded: 0,
          net: 0,
          installments: [],
          invoices: [],
          refunds: [],
          paymentModes: "-",
          paymentStatus: "pending",
        });
      });

      const scopedInvoices = invoices.filter((i) => i.student_id && studentRows.has(i.student_id));
      const scopedPayments = payments.filter((p) => p.student_id && studentRows.has(p.student_id));
      const scopedRefunds = refunds.filter(
        (r) => (r.student_id && studentRows.has(r.student_id)) || (!r.student_id && inCenter(r.property_id))
      );

      const normalizedInvoices: LedgerInvoice[] = scopedInvoices.map((i) => ({
        id: i.id,
        student_id: i.student_id,
        invoice_number: i.invoice_number,
        billing_month: i.billing_month,
        total_amount: Number(i.total_amount || 0),
        paid_amount: Number(i.paid_amount || 0),
        discounts: Number(i.discounts || 0),
        due_date: i.due_date,
        status: i.status,
        payment_method: i.payment_method,
      }));

      const normalizedPayments: LedgerPayment[] = scopedPayments.map((p) => ({
        id: p.id,
        invoice_id: p.invoice_id,
        student_id: p.student_id,
        property_id: p.property_id,
        amount: Number(p.amount || 0),
        payment_method: p.payment_method,
        payment_mode_label: p.payment_mode_label,
        transaction_reference: p.transaction_reference,
        transaction_id: p.transaction_id,
        paid_at: p.paid_at,
      }));

      const normalizedRefunds: LedgerRefund[] = scopedRefunds.map((r) => ({
        id: r.id,
        invoice_id: r.invoice_id,
        student_id: r.student_id,
        property_id: r.property_id,
        amount: Number(r.amount || 0),
        status: r.status,
        refund_method: r.refund_method,
        reason: r.reason,
        created_at: r.created_at,
      }));

      normalizedInvoices.forEach((inv) => {
        const row = studentRows.get(inv.student_id as string);
        if (!row) return;
        row.invoices.push(inv);
        row.gross += inv.total_amount;
        row.discounts += inv.discounts;
      });

      normalizedPayments.forEach((p) => {
        const row = studentRows.get(p.student_id as string);
        if (!row) return;
        row.installments.push(p);
        row.received += p.amount;
      });

      normalizedRefunds.forEach((r) => {
        if (!r.student_id) return;
        const row = studentRows.get(r.student_id);
        if (!row) return;
        row.refunds.push(r);
        row.refunded += r.amount;
      });

      const invoiceNumberMap = new Map(normalizedInvoices.map((i) => [i.id, i.invoice_number]));

      studentRows.forEach((row) => {
        row.net = row.gross - row.discounts - row.received;
        const modes = new Set(
          row.installments.map((p) => p.payment_mode_label || p.payment_method || "-").filter(Boolean)
        );
        row.paymentModes = Array.from(modes).join(", ") || "-";
        row.paymentStatus =
          row.gross > 0 && row.net <= 0 ? "paid" : row.received > 0 ? "partial" : "pending";
      });

      // Only students with billing activity belong in the ledger views
      const rows = Array.from(studentRows.values()).filter(
        (r) => r.invoices.length > 0 || r.installments.length > 0 || r.refunds.length > 0
      );

      return {
        rows,
        invoices: normalizedInvoices,
        payments: normalizedPayments,
        refunds: normalizedRefunds,
        studentMap: studentRows,
        invoiceNumberMap,
        propertyMap,
      };
    },
    staleTime: 60_000,
  });

  const data = query.data;
  const rows = data?.rows ?? [];
  const activeRows = rows.filter((r) => r.status !== "inactive");

  const totals = {
    gross: activeRows.reduce((s, r) => s + r.gross, 0),
    discounts: activeRows.reduce((s, r) => s + r.discounts, 0),
    // Amount received always counts every completed payment, including inactive students
    received: rows.reduce((s, r) => s + r.received, 0),
    refunded: rows.reduce((s, r) => s + r.refunded, 0),
    net: 0,
    studentCount: activeRows.length,
    paidCount: activeRows.filter((r) => r.paymentStatus === "paid").length,
    partialCount: activeRows.filter((r) => r.paymentStatus === "partial").length,
    pendingCount: activeRows.filter((r) => r.paymentStatus === "pending").length,
  };
  totals.net = totals.gross - totals.discounts - totals.received;

  const payments = data?.payments ?? [];
  const refunds = data?.refunds ?? [];

  const isOnline = (p: LedgerPayment) => {
    const m = (p.payment_mode_label || p.payment_method || "").toLowerCase();
    return m.includes("hdfc") || m.includes("card") || m.includes("online") || m.includes("gateway") || m.includes("netbank");
  };

  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);

  const txnStats = {
    count: payments.length,
    online: payments.filter(isOnline).reduce((s, p) => s + p.amount, 0),
    offline: payments.filter((p) => !isOnline(p)).reduce((s, p) => s + p.amount, 0),
    average: payments.length ? totals.received / payments.length : 0,
    thisMonth: payments
      .filter((p) => p.paid_at && new Date(p.paid_at) >= monthStart)
      .reduce((s, p) => s + p.amount, 0),
  };

  const refundStats = {
    total: refunds.reduce((s, r) => s + r.amount, 0),
    processed: refunds.filter((r) => isRefundProcessed(r.status)).reduce((s, r) => s + r.amount, 0),
    processedCount: refunds.filter((r) => isRefundProcessed(r.status)).length,
    pending: refunds.filter((r) => isRefundPending(r.status)).reduce((s, r) => s + r.amount, 0),
    pendingCount: refunds.filter((r) => isRefundPending(r.status)).length,
    count: refunds.length,
  };

  return {
    ...query,
    rows,
    activeRows,
    invoices: data?.invoices ?? [],
    payments,
    refunds,
    invoiceNumberMap: data?.invoiceNumberMap ?? new Map<string, string>(),
    studentMap: data?.studentMap ?? new Map<string, LedgerStudent>(),
    totals,
    txnStats,
    refundStats,
  };
}
