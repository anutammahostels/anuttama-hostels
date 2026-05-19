// Shared fee-receipt HTML template (two side-by-side copies: Institute + Student)
// Mirrors the Anuttama Enterprises LLP fee receipt layout.

import { format } from "date-fns";

export interface ReceiptData {
  invoiceNumber: string;
  receiptDate: Date;
  paymentMethod: string;
  amountPaid: number;
  totalAmount: number;
  discounts: number;
  paidAmount: number;
  totalDue: number;
  billingMonth: Date;
  dueDate: Date;
  studentName: string;
  rollNumber?: string;
  enrollNumber?: string;
  gender?: string;
  course?: string;
  fatherName?: string;
  motherName?: string;
  lineItems: { date: string; type: string; due: number; paid: number; balance: number }[];
  note?: string;
}

// Indian-numbering number to words
function numberToWordsIndian(n: number): string {
  if (!n || isNaN(n)) return "Zero";
  n = Math.round(n);
  const a = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine",
    "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"];
  const b = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];
  const two = (x: number): string => x < 20 ? a[x] : `${b[Math.floor(x / 10)]}${x % 10 ? " " + a[x % 10] : ""}`;
  const three = (x: number): string => {
    const h = Math.floor(x / 100), r = x % 100;
    return (h ? a[h] + " Hundred" + (r ? " " : "") : "") + (r ? two(r) : "");
  };
  if (n === 0) return "Zero";
  const crore = Math.floor(n / 10000000); n %= 10000000;
  const lakh = Math.floor(n / 100000); n %= 100000;
  const thousand = Math.floor(n / 1000); n %= 1000;
  const hundred = n;
  let out = "";
  if (crore) out += three(crore) + " Crore ";
  if (lakh) out += two(lakh) + " Lakh ";
  if (thousand) out += two(thousand) + " Thousand ";
  if (hundred) out += three(hundred);
  return out.trim().replace(/\s+/g, " ");
}

const LOGO_URL = "/anuttama-logo.png";
const ORG_NAME = "ANUTTAMA HOSTELS";
const ORG_PHONE = "+91-9686923233";
const ORG_ADDRESS = "No. 106/2, B. Hosahalli Road (behind S2 Housing Avantikaa), Sarjapur Main Rd, Bengaluru, Karnataka 562125, India";

function copyHtml(data: ReceiptData, label: "INSTITUTE COPY" | "STUDENT COPY"): string {
  const fmtINR = (v: number) => Number(v || 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const words = numberToWordsIndian(data.paidAmount) + " Only";
  const discountWords = data.discounts > 0 ? numberToWordsIndian(data.discounts) + " Only" : "";
  return `
  <div class="copy">
    <div class="copy-head">
      <span class="head-title">Fee Receipt</span>
      <span class="head-label">${label}</span>
    </div>
    <div class="org">
      <img src="${LOGO_URL}" alt="logo" class="org-logo" />
      <div class="org-info">
        <div class="org-name">${ORG_NAME}</div>
        <div class="org-meta">${ORG_PHONE}</div>
        <div class="org-addr">${ORG_ADDRESS}</div>
      </div>
    </div>

    <div class="section-title">Payment Details</div>
    <div class="pay-grid">
      <div><div class="pay-v">${data.invoiceNumber}</div><div class="pay-l">Receipt No</div></div>
      <div><div class="pay-v">${format(data.receiptDate, "dd MMM yyyy")}</div><div class="pay-l">Date</div></div>
      <div><div class="pay-v">${data.paymentMethod}</div><div class="pay-l">Mode</div></div>
      <div class="pay-amt"><div class="pay-v">INR ${fmtINR(data.amountPaid)}</div><div class="pay-l">Amount Paid</div></div>
    </div>

    <div class="sd-grid">
      <div>
        <div class="section-title">Student Details</div>
        <div class="sd-name">${data.studentName}</div>
        <div class="sd-meta">
          ${data.gender ? `${data.gender} &nbsp;•&nbsp; ` : ""}
          ${data.course ? `${data.course} &nbsp;•&nbsp; ` : ""}
          Form No: ${data.rollNumber || "—"}
          ${data.enrollNumber ? ` &nbsp;•&nbsp; Enroll No: ${data.enrollNumber}` : ""}
        </div>
      </div>
      <div>
        <div class="section-title">Parents Details</div>
        <div class="parents">
          <div class="parent-cell"><div class="parent-tag">FATHER</div><div class="parent-name">${data.fatherName || "—"}</div></div>
          <div class="parent-cell"><div class="parent-tag">MOTHER</div><div class="parent-name">${data.motherName || "—"}</div></div>
        </div>
      </div>
    </div>

    <table class="inst-table">
      <thead><tr><th>Installment</th><th>Fee Type</th><th class="r">Due</th><th class="r">Paid</th><th class="r">Balance</th></tr></thead>
      <tbody>
        ${data.lineItems.map(li => `<tr>
          <td>${li.date}</td><td>${li.type}</td>
          <td class="r">${fmtINR(li.due)}</td>
          <td class="r">${fmtINR(li.paid)}</td>
          <td class="r">${fmtINR(li.balance)}</td>
        </tr>`).join("")}
      </tbody>
    </table>

    <div class="paid-row">
      <div class="paid-l">Paid amount</div>
      <div class="paid-r"><strong>INR ${fmtINR(data.paidAmount)}</strong><div class="words">(${words})</div></div>
    </div>
    ${data.discounts > 0 ? `<div class="paid-row">
      <div class="paid-l">Total discount</div>
      <div class="paid-r">-INR ${fmtINR(data.discounts)}<div class="words">(${discountWords})</div></div>
    </div>` : ""}

    <div class="section-title">Overview</div>
    <div class="ov-grid">
      <div class="ov-cell ov-c1"><div class="ov-v">INR ${fmtINR(data.totalAmount)}</div><div class="ov-l">Fee Applied</div></div>
      <div class="ov-cell ov-c2"><div class="ov-v">INR ${fmtINR(data.discounts)}</div><div class="ov-l">Total Discount</div></div>
      <div class="ov-cell ov-c3"><div class="ov-v">INR ${fmtINR(data.paidAmount)}</div><div class="ov-l">Total Paid</div></div>
      <div class="ov-cell ov-c4"><div class="ov-v">INR ${fmtINR(data.totalDue)}</div><div class="ov-l">Total Due</div></div>
    </div>

    ${data.note ? `<div class="note">Note: ${data.note}</div>` : ""}

    <div class="sign-block">
      <div class="sign-l">
        <div class="sign-lbl">Fee collected by</div>
        <div class="sign-org">${ORG_NAME}</div>
        <div class="sign-role">(Owner)</div>
      </div>
      <div class="sign-r">
        <div class="sign-line"></div>
        <div class="sign-cap">(Signature &amp; Stamp)</div>
      </div>
    </div>
    <div class="computer-gen">This is a computer generated receipt and does not need a signature</div>
  </div>`;
}

export function buildReceiptHtml(data: ReceiptData): string {
  return `<!DOCTYPE html><html><head><meta charset="utf-8" /><title>Fee Receipt ${data.invoiceNumber}</title>
<style>
  *{box-sizing:border-box}
  body{font-family:'Segoe UI',Arial,sans-serif;color:#1a1a2e;margin:0;padding:18px;background:#fff;font-size:11px;line-height:1.35}
  .sheet{display:grid;grid-template-columns:1fr 1fr;gap:0;border:1px solid #e5e7eb;border-radius:6px;overflow:hidden;position:relative}
  .sheet::after{content:"";position:absolute;top:0;bottom:0;left:50%;border-left:1.5px dashed #9ca3af}
  .copy{padding:14px 16px;position:relative;overflow:hidden}
  .copy::before{content:"";position:absolute;top:50%;left:50%;width:70%;aspect-ratio:1/1;transform:translate(-50%,-50%);background-image:url('${''}${LOGO_URL}');background-repeat:no-repeat;background-position:center;background-size:contain;opacity:0.15;pointer-events:none;z-index:0;-webkit-print-color-adjust:exact;print-color-adjust:exact}
  .copy > *{position:relative;z-index:1}
  .copy + .copy{border-left:0}
  .copy-head{display:flex;justify-content:space-between;align-items:center;background:#f3f4f6;margin:-14px -16px 12px;padding:8px 14px;border-bottom:1px solid #e5e7eb}
  .head-title{font-weight:600;font-size:13px}
  .head-label{font-size:11px;letter-spacing:1.5px;color:#374151;font-weight:600}
  .org{display:flex;gap:10px;align-items:flex-start;background:#f3f4f6;margin:-12px -16px 12px;padding:8px 14px;border-bottom:1px solid #e5e7eb}
  .org-logo{width:56px;height:56px;object-fit:contain;flex-shrink:0}
  .org-name{font-weight:700;font-size:13px;color:#0f172a}
  .org-meta{font-size:10.5px;color:#374151;margin-top:2px}
  .org-addr{font-size:10.5px;color:#374151;margin-top:2px;line-height:1.4}
  .section-title{font-size:10.5px;color:#6b7280;margin:10px 0 6px;font-weight:500}
  .pay-grid{display:grid;grid-template-columns:1fr 1fr 1fr 1fr;gap:8px;padding-bottom:10px;border-bottom:1px solid #e5e7eb}
  .pay-v{font-weight:700;font-size:11.5px;color:#0f172a}
  .pay-l{font-size:10px;color:#6b7280;margin-top:2px}
  .pay-amt{border-left:2px solid #34d399;padding-left:8px}
  .sd-grid{display:grid;grid-template-columns:1.2fr 1fr;gap:14px;padding:6px 0 10px;border-bottom:1px solid #e5e7eb}
  .sd-name{font-weight:700;font-size:12px;color:#0f172a}
  .sd-meta{font-size:10.5px;color:#374151;margin-top:3px;line-height:1.5}
  .parents{display:grid;grid-template-columns:1fr 1fr;gap:6px}
  .parent-cell{}
  .parent-tag{display:inline-block;background:#f3f4f6;padding:2px 8px;border-radius:3px;font-size:9.5px;font-weight:600;color:#374151;letter-spacing:0.5px}
  .parent-name{font-size:11px;color:#0f172a;margin-top:3px}
  .inst-table{width:100%;border-collapse:collapse;margin:10px 0;font-size:10.5px}
  .inst-table th{text-align:left;font-weight:600;color:#374151;padding:6px 4px;border-bottom:1px solid #e5e7eb;font-size:10.5px}
  .inst-table td{padding:5px 4px;border-bottom:1px solid #f3f4f6;color:#0f172a}
  .inst-table .r{text-align:right}
  .paid-row{display:flex;justify-content:space-between;align-items:flex-start;padding:6px 0;border-bottom:1px solid #f3f4f6}
  .paid-l{font-size:11px;color:#374151}
  .paid-r{text-align:right;font-size:11.5px;color:#0f172a}
  .words{font-size:9.5px;color:#6b7280;margin-top:2px;font-style:italic}
  .ov-grid{display:grid;grid-template-columns:1fr 1fr 1fr 1fr;gap:6px}
  .ov-cell{padding:6px 8px;border-left:2px solid #e5e7eb}
  .ov-c1{border-left-color:#fca5a5}
  .ov-c2{border-left-color:#7dd3fc}
  .ov-c3{border-left-color:#86efac}
  .ov-c4{border-left-color:#fda4af}
  .ov-v{font-weight:700;font-size:11px;color:#0f172a}
  .ov-l{font-size:10px;color:#6b7280;margin-top:2px}
  .note{font-size:10px;color:#374151;margin-top:10px;padding:6px 0;border-top:1px solid #e5e7eb;line-height:1.5;word-break:break-word}
  .sign-block{display:flex;justify-content:space-between;align-items:flex-end;margin-top:14px;gap:14px}
  .sign-lbl{font-size:10px;color:#6b7280}
  .sign-org{font-weight:700;font-size:11px;margin-top:3px}
  .sign-role{font-size:10px;color:#6b7280}
  .sign-r{min-width:130px;text-align:center}
  .sign-line{border-bottom:1px solid #0f172a;height:24px}
  .sign-cap{font-size:10px;color:#6b7280;margin-top:3px}
  .computer-gen{margin-top:10px;font-size:9.5px;color:#9ca3af;text-align:center;font-style:italic}
  @media print{
    body{padding:8px}
    @page{size:A4 landscape;margin:8mm}
  }
</style></head>
<body>
  <div class="sheet">
    ${copyHtml(data, "INSTITUTE COPY")}
    ${copyHtml(data, "STUDENT COPY")}
  </div>
  <script>window.onload=function(){setTimeout(function(){window.print();},300);};</script>
</body></html>`;
}

export function invoiceToReceipt(inv: any, opts: { studentName: string; rollNumber?: string; fatherName?: string; gender?: string; course?: string; }): ReceiptData {
  const total = Number(inv.total_amount) || 0;
  const discounts = Number(inv.discounts) || 0;
  const paid = Number(inv.paid_amount) || 0;
  const due = Math.max(0, total - paid);
  const items: ReceiptData["lineItems"] = [];
  const billingDate = inv.billing_month ? format(new Date(inv.billing_month), "dd MMM yyyy") : "—";
  const pushItem = (type: string, amt: number) => {
    if (!amt) return;
    const paidShare = total > 0 ? +(amt * (paid / total)).toFixed(2) : 0;
    items.push({ date: billingDate, type, due: amt, paid: paidShare, balance: +(amt - paidShare).toFixed(2) });
  };
  pushItem("Room Rent", Number(inv.room_rent) || 0);
  pushItem("Mess Charges", Number(inv.mess_charges) || 0);
  pushItem("Electricity", Number(inv.electricity_charges) || 0);
  pushItem("Other Charges", Number(inv.other_charges) || 0);
  if (items.length === 0) items.push({ date: billingDate, type: "Hostel Fee", due: total, paid, balance: due });

  return {
    invoiceNumber: inv.invoice_number,
    receiptDate: inv.payment_date ? new Date(inv.payment_date) : new Date(inv.created_at || Date.now()),
    paymentMethod: (inv.payment_method || "Cash").toString().replace(/_/g, " ").replace(/\b\w/g, (c: string) => c.toUpperCase()),
    amountPaid: paid || total,
    totalAmount: total,
    discounts,
    paidAmount: paid,
    totalDue: due,
    billingMonth: inv.billing_month ? new Date(inv.billing_month) : new Date(),
    dueDate: inv.due_date ? new Date(inv.due_date) : new Date(),
    studentName: opts.studentName,
    rollNumber: opts.rollNumber,
    fatherName: opts.fatherName,
    gender: opts.gender,
    course: opts.course,
    lineItems: items,
  };
}
