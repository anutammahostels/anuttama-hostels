export const STUDENT_CATEGORIES = [
  { value: "6th-10th", label: "6th - 10th" },
  { value: "11th-12th-dropper", label: "11th / 12th / Dropper" },
] as const;

export const PAYMENT_TYPES = [
  { value: "one-time", label: "One-Time" },
  { value: "installment", label: "Installment" },
] as const;

export type StudentCategory = (typeof STUDENT_CATEGORIES)[number]["value"];
export type PaymentType = (typeof PAYMENT_TYPES)[number]["value"];

const FEE_MATRIX: Record<StudentCategory, Record<PaymentType, number>> = {
  "6th-10th": { "one-time": 170000, installment: 180000 },
  "11th-12th-dropper": { "one-time": 180000, installment: 190000 },
};

export function calculateFinalFee(
  category: string | null | undefined,
  paymentType: string | null | undefined
): number | null {
  if (!category || !paymentType) return null;
  const categoryFees = FEE_MATRIX[category as StudentCategory];
  if (!categoryFees) return null;
  const fee = categoryFees[paymentType as PaymentType];
  return fee ?? null;
}

export function studentCategoryLabel(value: string | null | undefined): string {
  return STUDENT_CATEGORIES.find((c) => c.value === value)?.label ?? "—";
}

export function paymentTypeLabel(value: string | null | undefined): string {
  return PAYMENT_TYPES.find((p) => p.value === value)?.label ?? "—";
}
