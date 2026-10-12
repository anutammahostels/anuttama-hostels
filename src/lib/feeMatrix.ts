// Centralized class-wise fee structure — SINGLE SOURCE OF TRUTH.
// Mirrored in supabase/functions/_shared/feeMatrix.ts for server-side validation.
// Keep both files numerically identical when these rates change.

export const CLASSES = [
  { value: "Class 6", label: "Class 6" },
  { value: "Class 7", label: "Class 7" },
  { value: "Class 8", label: "Class 8" },
  { value: "Class 9", label: "Class 9" },
  { value: "Class 10", label: "Class 10" },
  { value: "Class 11", label: "Class 11" },
  { value: "Class 12", label: "Class 12" },
] as const;

export const PAYMENT_TYPES = [
  { value: "one-time", label: "One-Time" },
  { value: "installment", label: "Installment" },
] as const;

export type ClassValue = (typeof CLASSES)[number]["value"];
export type PaymentType = (typeof PAYMENT_TYPES)[number]["value"];

// "Class 13" is the post-12th dropper/repeater year. It isn't a selectable option in the
// admission form (only Class 6-12 are) but existing student records use it, and it has always
// been billed at the same rate as Class 11/12 — kept here so fee lookups for those records
// still resolve correctly.
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

/** Primary fee lookup: exact class + payment type. */
export function calculateFeeByClass(
  classValue: string | null | undefined,
  paymentType: string | null | undefined
): number | null {
  if (!classValue || !paymentType) return null;
  const fees = CLASS_FEE_MATRIX[classValue.trim()];
  if (!fees) return null;
  return fees[paymentType as PaymentType] ?? null;
}

export function classLabel(value: string | null | undefined): string {
  return CLASSES.find((c) => c.value === value)?.label ?? value ?? "—";
}

export function paymentTypeLabel(value: string | null | undefined): string {
  return PAYMENT_TYPES.find((p) => p.value === value)?.label ?? "—";
}

// ---------------------------------------------------------------------------
// Legacy 2-bucket category support. `students.student_category` is a DB enum
// ('6th-10th' | '11th-12th-dropper') kept for backward compatibility with
// existing filters/reports. It is always derived FROM the selected class —
// never edited directly — so the class-wise matrix above remains the one
// source of truth for fee amounts.
// ---------------------------------------------------------------------------

export const STUDENT_CATEGORIES = [
  { value: "6th-10th", label: "6th - 10th" },
  { value: "11th-12th-dropper", label: "11th / 12th / Dropper" },
] as const;

export type StudentCategory = (typeof STUDENT_CATEGORIES)[number]["value"];

const SENIOR_CLASSES = new Set(["Class 11", "Class 12", "Class 13"]);

/** Maps a specific class (e.g. "Class 8") to the legacy broad category enum. */
export function categoryForClass(classValue: string | null | undefined): StudentCategory {
  return classValue && SENIOR_CLASSES.has(classValue.trim()) ? "11th-12th-dropper" : "6th-10th";
}

export function studentCategoryLabel(value: string | null | undefined): string {
  return STUDENT_CATEGORIES.find((c) => c.value === value)?.label ?? "—";
}

/**
 * Legacy fee lookup by broad category (used only as a fallback when a record has no
 * specific class on file). Uses a representative class per tier so the numbers always
 * stay in sync with CLASS_FEE_MATRIX above instead of being duplicated.
 */
export function calculateFinalFee(
  category: string | null | undefined,
  paymentType: string | null | undefined
): number | null {
  if (!category) return null;
  const representativeClass = category === "11th-12th-dropper" ? "Class 12" : "Class 10";
  return calculateFeeByClass(representativeClass, paymentType);
}
