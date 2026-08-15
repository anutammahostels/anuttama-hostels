import * as XLSX from "xlsx";
import { format } from "date-fns";
import type { LedgerInvoice, LedgerPayment, LedgerRefund, LedgerStudent } from "@/hooks/useAccountingLedger";

const fmtDate = (d?: string | null) => (d ? format(new Date(d), "dd MMM yyyy") : "");
const method = (p?: LedgerPayment) => p?.payment_mode_label || p?.payment_method || "";

export type AccountingExportInput = {
  rows: LedgerStudent[];
  invoices: LedgerInvoice[];
  payments: LedgerPayment[];
  refunds: LedgerRefund[];
  studentMap: Map<string, LedgerStudent>;
  invoiceNumberMap: Map<string, string>;
  totals: {
    gross: number;
    discounts: number;
    received: number;
    refunded: number;
    net: number;
    studentCount: number;
    paidCount: number;
    partialCount: number;
    pendingCount: number;
  };
  txnStats: { count: number; online: number; offline: number; average: number; thisMonth: number };
  refundStats: { total: number; processed: number; processedCount: number; pending: number; pendingCount: number; count: number };
  centerLabel: string;
};

export function exportAccountingWorkbook(input: AccountingExportInput) {
  const { rows, invoices, payments, refunds, studentMap, invoiceNumberMap, totals, txnStats, refundStats } = input;

  const summary = [
    { Metric: "Center", Value: input.centerLabel },
    { Metric: "Generated On", Value: format(new Date(), "dd MMM yyyy HH:mm") },
    { Metric: "Students With Billing", Value: totals.studentCount },
    { Metric: "Gross Receivable", Value: totals.gross },
    { Metric: "Discounts", Value: totals.discounts },
    { Metric: "Amount Received", Value: totals.received },
    { Metric: "Refunded", Value: totals.refunded },
    { Metric: "Net Receivable", Value: totals.net },
    { Metric: "Fully Paid Students", Value: totals.paidCount },
    { Metric: "Partially Paid Students", Value: totals.partialCount },
    { Metric: "Not Started", Value: totals.pendingCount },
    { Metric: "Transactions", Value: txnStats.count },
    { Metric: "Online Collected", Value: txnStats.online },
    { Metric: "Offline Collected", Value: txnStats.offline },
    { Metric: "Collected This Month", Value: txnStats.thisMonth },
    { Metric: "Refund Records", Value: refundStats.count },
    { Metric: "Refunds Processed", Value: refundStats.processed },
    { Metric: "Refunds Pending", Value: refundStats.pending },
  ];

  const receivables = rows.map((r) => {
    const [p1, p2, p3] = r.installments;
    return {
      "Student Name": r.name,
      "Form Number": r.rollNumber,
      Center: r.propertyName,
      Status: r.status || "",
      "Gross Receivable": r.gross,
      Discounts: r.discounts,
      "Amount 1": p1?.amount || 0,
      "Amount 1 Date": fmtDate(p1?.paid_at),
      "Amount 1 Method": method(p1),
      "Amount 2": p2?.amount || 0,
      "Amount 2 Date": fmtDate(p2?.paid_at),
      "Amount 2 Method": method(p2),
      "Amount 3": p3?.amount || 0,
      "Amount 3 Date": fmtDate(p3?.paid_at),
      "Amount 3 Method": method(p3),
      "Total Received": r.received,
      Refunds: r.refunded,
      "Net Receivable": r.net,
      "Payment Status": r.paymentStatus,
    };
  });

  const transactions = payments.map((p) => {
    const s = p.student_id ? studentMap.get(p.student_id) : undefined;
    return {
      Date: fmtDate(p.paid_at),
      "Student Name": s?.name || "-",
      "Form Number": s?.rollNumber || "-",
      Center: s?.propertyName || "-",
      "Invoice Number": invoiceNumberMap.get(p.invoice_id) || "-",
      Amount: p.amount,
      Method: method(p) || "-",
      Reference: p.transaction_reference || p.transaction_id || "-",
      "Receipt No": p.id.slice(0, 8).toUpperCase(),
    };
  });

  const refundSheet = refunds.map((r) => {
    const s = r.student_id ? studentMap.get(r.student_id) : undefined;
    return {
      Date: fmtDate(r.created_at),
      "Student Name": s?.name || "-",
      "Form Number": s?.rollNumber || "-",
      "Invoice Number": invoiceNumberMap.get(r.invoice_id) || "-",
      Amount: r.amount,
      Method: r.refund_method || "-",
      Status: r.status || "pending",
      Details: r.reason || "-",
    };
  });

  const invoiceSheet = invoices.map((i) => {
    const s = i.student_id ? studentMap.get(i.student_id) : undefined;
    return {
      "Invoice #": i.invoice_number,
      "Student Name": s?.name || "-",
      "Form Number": s?.rollNumber || "-",
      Center: s?.propertyName || "-",
      "Billing Month": i.billing_month,
      Total: i.total_amount,
      Paid: i.paid_amount,
      Balance: i.total_amount - i.paid_amount,
      "Due Date": i.due_date,
      Status: i.status || "",
    };
  });

  const wb = XLSX.utils.book_new();
  const add = (name: string, data: Record<string, any>[]) =>
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(data.length ? data : [{}]), name);

  add("Summary", summary);
  add("Receivables", receivables);
  add("Transactions", transactions);
  add("Refunds", refundSheet);
  add("Invoices", invoiceSheet);

  XLSX.writeFile(wb, `accounting-${format(new Date(), "yyyy-MM-dd")}.xlsx`);
}
