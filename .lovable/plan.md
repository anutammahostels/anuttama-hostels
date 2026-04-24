
## Problem

The Payroll generator currently accepts Start Date / End Date and stores the period as `YYYY-MM-DD_to_YYYY-MM-DD`, but every salary component (Basic, HRA, Special Allowance, PF, ESI, PT, TDS, etc.) is still treated as a **single month's amount**. So whether the user picks 1 Apr → 30 Apr (30 days) or 1 Apr → 31 May (61 days) or 1 Apr → 15 Apr (15 days), the payout is identical — one month's salary. That is why "it is still generating only single month's payroll."

The fix is to **pro-rate every earnings/deduction line by the number of days in the chosen period**, using the employee's stored monthly figures as the per-month baseline.

## Core formula

For every record we will introduce a `periodFactor`:

```
standardMonthDays = 30          // canonical working month (Indian payroll convention)
totalDays         = daysBetween(startDate, endDate)   // already computed
daysWorked        = totalDays - lop
periodFactor      = daysWorked / standardMonthDays
```

Every per-month component is multiplied by `periodFactor` *before* statutory caps and slabs are applied:

| Component | New formula |
|---|---|
| Basic | `emp.salary_amount × periodFactor` |
| HRA | `emp.hra × periodFactor` |
| Special Allowance | `emp.special_allowance × periodFactor` |
| Other Additions | `emp.other_additions × periodFactor` |
| Professional Fees / Contract Fees / OT / Incentives / Bonus | manual input × `periodFactor` (single-employee form keeps user-entered totals — see "UI behaviour" below) |
| Gross | sum of all pro-rated earnings |
| PF Employee / Employer | `min(proRatedBasic × 12%, 1800 × periodFactor)` — cap also scales so a 2-month run caps at ₹3,600 |
| ESI Employee / Employer | only if **monthly** gross (`gross / periodFactor`) ≤ ₹21,000 → then `proRatedGross × 0.75% / 3.25%` |
| Professional Tax | apply Karnataka slab on **monthly-equivalent gross**, then multiply the slab amount by the count of distinct calendar months the period covers (so a 2-month range = 2× PT, Feb included → ₹300 for that month) |
| LWF / Salary Advance / Other Ded | user-entered, taken as-is (one-off amounts) |
| TDS (annual regime) | computed on annualised gross = `monthlyEquivalentGross × 12`, then `monthlyTds × monthsCovered` |
| LOP deduction | `(proRatedGross / totalDays) × lopDays` (already correct, just feed pro-rated gross) |
| Net | `gross − totalDeductions − lopDeduction` |

Helpers to add:

```ts
const STANDARD_MONTH_DAYS = 30;

const monthsCovered = (start: string, end: string): number => {
  // Inclusive count of distinct YYYY-MM buckets the range touches.
  const s = new Date(start), e = new Date(end);
  return (e.getFullYear() - s.getFullYear()) * 12 + (e.getMonth() - s.getMonth()) + 1;
};

const periodFactor = (totalDays: number) => totalDays / STANDARD_MONTH_DAYS;
```

Update `calculatePT` to accept the full range and sum PT per month it covers (Feb = ₹300, others = ₹200, only when monthly-equivalent gross ≥ ₹25,000).

## Files to change — `src/pages/Payroll.tsx` only

1. **Add helpers** (near `calculatePT`, ~line 100):
   - `STANDARD_MONTH_DAYS = 30`
   - `monthsCovered(start, end)`
   - `periodFactor(totalDays)`
   - Refactor `calculatePT` → `calculatePTForPeriod(monthlyEquivalentGross, startIso, endIso)` that walks each month in the range and accumulates ₹200 / ₹300.

2. **`payrollCalc` useMemo (~line 307)** — single-employee dialog:
   - Compute `factor = periodFactor(totalDays)` (totalDays already auto-set from range).
   - Pro-rate `basic`, `hra`, `specialAllowance`, `otherAdditions` from the employee record using `factor`.
   - Keep user-entered `professionalFees / contractFees / ot / incentives / bonus / lwf / salaryAdvance / otherDed` as literal one-off totals (these are usually entered by the admin already aware of the period).
   - PF cap = `1800 × factor`, ESI gating uses monthly-equivalent gross.
   - Replace `pt` auto-fill effect to use `calculatePTForPeriod(monthlyGross, payrollStartDate, payrollEndDate)`.
   - TDS auto-suggest (in `tdsCalcResult`) uses monthly-equivalent gross × `monthsCovered`.

3. **Multi-employee branch in `payrollMutation` (~line 482)** and **`bulkPayrollMutation` (~line 586)** — apply the same pro-rating to every record they build:
   ```ts
   const factor = totalDays / STANDARD_MONTH_DAYS;
   const months = monthsCovered(startDate, endDate);
   const basic = (emp.salary_amount || 0) * factor;
   const hra   = (emp.hra || 0) * factor;
   const sa    = (emp.special_allowance || 0) * factor;
   const oa    = (emp.other_additions || 0) * factor;
   const gross = Math.round(basic + hra + sa + oa);
   const pfCap = Math.round(1800 * factor);
   const pfEmp = Math.min(Math.round(basic * 0.12), pfCap);
   const pfEr  = pfEmp;
   const monthlyGross = gross / factor;
   const esiEmp = monthlyGross <= 21000 ? Math.round(gross * 0.0075) : 0;
   const esiEr  = monthlyGross <= 21000 ? Math.round(gross * 0.0325) : 0;
   const pt     = calculatePTForPeriod(monthlyGross, startDate, endDate);
   ```
   Round all stored values to whole rupees with `Math.round`.

4. **UI hints** in the Generate Payroll & Bulk Generate dialogs:
   - Below the date range show: `Total Days: 61 (~2.03 months) · Pay multiplier ×2.03`.
   - In the single-employee Earnings section, mark Basic/HRA/SA/OA inputs as read-only, displaying the pro-rated value with a tooltip `Monthly ₹X × period factor Y`.
   - Update the "Professional Tax" auto-fill label to "Auto (sum across months in period)".

5. **Payslip PDF and Excel exports** (Salary Register, PF, ESI, Form 16-style, payslip):
   - Already use `formatPeriodDisplay`. Add a new column "Period Factor" (e.g. 2.03) and show "Monthly Equivalent Gross" alongside "Period Gross" so auditors can see both.
   - Payslip header: replace "Pay Month" with "Pay Period: 01 Apr 2026 → 31 May 2026 (61 days, 2.03 months)".

6. **Backward compatibility**: legacy records with `month = "YYYY-MM"` continue to render via `parsePeriodKey` (already handles it) and will be treated as 30-day periods (factor = 1) — existing data remains correct.

## What stays the same

- DB schema (no migration needed — `month` text column already stores the period key).
- Lock / Unlock by period.
- All existing exports and UI tables (only labels/extra columns added).

## Quick sanity examples

- 1 Apr → 30 Apr (30 days) on ₹30,000 basic → factor 1.00 → Basic ₹30,000, PF ₹1,800, PT ₹200.
- 1 Apr → 15 Apr (15 days) on ₹30,000 basic → factor 0.50 → Basic ₹15,000, PF ₹900, PT ₹0 (monthly gross ₹30k → slab ₹200, but only half a month = ₹100? — we keep PT at full slab once the period contains any portion of a month, so PT = ₹200 for April).
- 1 Apr → 31 May (61 days) on ₹30,000 basic → factor 2.033 → Basic ₹61,000, PF ₹3,660 (cap 2×₹1,800 = ₹3,600 → ₹3,600), PT ₹400 (Apr ₹200 + May ₹200).
- 1 Feb → 31 Mar on ₹30,000 → factor ≈ 1.97 → PT = ₹300 (Feb) + ₹200 (Mar) = ₹500.

## Approval

Once you approve, I'll implement all of the above in `src/pages/Payroll.tsx` in one pass and update the payslip / export labels accordingly.
