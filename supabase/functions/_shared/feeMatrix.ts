export type StudentCategory = "6th-10th" | "11th-12th-dropper";
export type PaymentType = "one-time" | "installment";

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
