// Centralized class-wise fee structure — SINGLE SOURCE OF TRUTH (server side).
// Mirrored in src/lib/feeMatrix.ts for the frontend. Keep both numerically identical.

export type PaymentType = "one-time" | "installment";

// "Class 13" is the post-12th dropper/repeater year — not a selectable admission-form
// option, but existing records use it and it has always been billed at the Class 11/12 rate.
const CLASS_FEE_MATRIX: Record<string, Record<PaymentType, number>> = {
  "Class 6": { "one-time": 170000, installment: 180000 },
  "Class 7": { "one-time": 170000, installment: 180000 },
  "Class 8": { "one-time": 170000, installment: 180000 },
  "Class 9": { "one-time": 170000, installment: 180000 },
  "Class 10": { "one-time": 170000, installment: 180000 },
  "Class 11": { "one-time": 180000, installment: 190000 },
  "Class 12": { "one-time": 180000, installment: 190000 },
  "Class 13": { "one-time": 180000, installment: 190000 },
};

export function calculateFeeByClass(
  classValue: string | null | undefined,
  paymentType: string | null | undefined
): number | null {
  if (!classValue || !paymentType) return null;
  const fees = CLASS_FEE_MATRIX[classValue.trim()];
  if (!fees) return null;
  return fees[paymentType as PaymentType] ?? null;
}

// Legacy 2-bucket category fallback — only used when a record has no specific class on
// file. Derived from the same matrix above (representative class per tier) so there is
// still a single source of truth for the actual amounts.
export type StudentCategory = "6th-10th" | "11th-12th-dropper";

export function calculateFinalFee(
  category: string | null | undefined,
  paymentType: string | null | undefined
): number | null {
  if (!category) return null;
  const representativeClass = category === "11th-12th-dropper" ? "Class 12" : "Class 10";
  return calculateFeeByClass(representativeClass, paymentType);
}
