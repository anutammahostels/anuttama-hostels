

## Payroll Overhaul: Match Payslip Format + Additional Requirements

### Summary of Changes

Based on the uploaded payslip template (XLSX) and the additional requirements PDF, the following gaps need to be addressed:

### Database Migration Required

Add missing columns to the `employees` table:
- `bank_ifsc` (text) — Bank IFSC code
- `pan_number` (text) — Employee PAN
- `last_working_day` (date) — LWD
- `hra` (numeric, default 0) — Employee-level HRA component
- `special_allowance` (numeric, default 0) — Employee-level Special Allowance
- `other_additions` (numeric, default 0) — Employee-level Other Additions
- `employer_pf_contribution` (numeric, default 0) — Employer PF contribution setting

Add `is_locked` (boolean, default false) column to `payroll_records` table for month locking.

### Changes to `src/pages/Payroll.tsx`

**1. Employee Form — Add salary structure fields + bank IFSC + PAN + LWD**
- Add inputs for Bank IFSC, PAN Number, Last Working Day
- Add salary component inputs at employee level: Basic (existing `salary_amount`), HRA, Special Allowance, Other Additions, Employer PF Contribution
- These become the defaults when generating payroll

**2. PF Calculation — Cap at ₹1,800**
- Change: `pfEmployee = Math.min(Math.round(basic * 0.12), 1800)`
- Same cap for employer PF

**3. Payslip PDF — Match uploaded template exactly**
- Add Company name, address, logo header
- Add Personal Details section: Employee Number, Name, Designation, DOJ, Pay Period, Paid Days, LOP Days, UAN No., ESIC No., Employee PAN, Bank Acct No.
- Two-column Earnings/Deductions tables (already present, minor layout tweaks)

**4. Bulk Payroll Run**
- Add "Run Payroll for All" button that generates payroll for all active employees for the selected month using their saved salary structure defaults
- Show confirmation dialog with employee count before running

**5. Month Locking**
- Add a "Lock Month" button on Payroll Records tab
- Once locked, prevent re-generation for that month
- Show lock badge on locked records

**6. Email Payslip**
- Add "Send Payslip" button next to Download on each payroll record
- Requires an edge function to send email via Supabase (will use a backend function)
- Only visible if employee has email

**7. Excel Export — Include bank details**
- Add Bank Account, Bank Name, Bank IFSC, PAN to salary register export
- Add month-wise filter/export option

**8. Employee Master Table — Show more columns**
- Show Employee Number, Bank Account, Bank Name, Bank IFSC in the employees table

**9. Auto-populate earnings from employee master**
- When selecting employee for payroll, auto-fill HRA, Special Allowance, Other Additions from their saved salary structure

### Files to Edit

| File | Changes |
|------|---------|
| Migration SQL | Add `bank_ifsc`, `pan_number`, `last_working_day`, `hra`, `special_allowance`, `other_additions`, `employer_pf_contribution` to employees; add `is_locked` to payroll_records |
| `src/pages/Payroll.tsx` | Full update: employee form, PF cap, bulk run, lock month, payslip template, export with bank details, auto-populate from employee master |
| Edge function (new) | `send-payslip` — sends payslip HTML email to employee |

### Technical Details

- PF cap: `Math.min(Math.round(basic * 0.12), 1800)` for both employee and employer
- Bulk payroll: loop through active employees, insert payroll records for each using their saved salary structure
- Lock: update `is_locked = true` for all records of a given month; check before allowing new generation
- Email: edge function receives payroll record ID, generates HTML payslip, sends via Supabase's built-in email or Resend

