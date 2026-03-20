

## Comprehensive Billing, Payroll & Reporting Enhancements

### 1. Excel Export (All Data Pages)

Add Excel (.xlsx) export alongside existing CSV/PDF exports using the `xlsx` npm package (SheetJS) on the following pages:
- **Billing** — Export invoices as .xlsx
- **Payroll** — Export payroll records as .xlsx
- **Accounting** — Export transactions/journal entries as .xlsx
- **Student Receivables Report** (new, see below)

### 2. Discount During Invoice Creation

The `invoices` table already has a `discounts` column. Changes needed:
- **`src/pages/Billing.tsx`** — Add a "Discount (₹)" input field in the Generate Invoices dialog, subtract discount from `total_amount` calculation
- Show discount column in invoice table and PDF invoice

### 3. Refund Mechanism

- **DB Migration**: Create a `refunds` table (id, invoice_id, student_id, property_id, amount, reason, refund_method, status, processed_by, created_at)
- **`src/pages/Billing.tsx`** — Add "Process Refund" option in invoice dropdown menu; opens dialog to enter refund amount, reason, and method
- **`src/hooks/useInvoices.ts`** — Add `processRefund` mutation that inserts into refunds table and updates invoice paid_amount

### 4. Student Receivables Report

- **New page**: `src/pages/Receivables.tsx` with route `/dashboard/receivables`
- Columns: Student Name, Roll No, Gross Receivable, Discounts, Amount Received, Payment Mode, Net Receivable
- Summary row with totals
- Export to Excel and PDF
- Add sidebar link under Billing section

### 5. Enhanced Payroll Fields

**DB Migration** — Add columns to `employees` table:
- `employee_number` (text), `gender` (text), `work_location` (text)

**DB Migration** — Add columns to `payroll_records` table:
- `special_allowance`, `professional_fees`, `contract_fees`, `other_additions`, `ot`, `incentives`, `bonus` (all numeric, default 0) — Earnings
- `lwf`, `salary_advance`, `tds_194c`, `tds_194j` (all numeric, default 0) — Deductions
- `total_days` (integer, default 30), `lop` (integer, default 0), `days_worked` (integer, default 30)

**`src/pages/Payroll.tsx`** changes:
- Employee form: Add Employee Number, Gender, Work Location fields
- Payroll generation form: Add all new earning fields (Special Allowance, Professional Fees, Contract Fees, Other Additions, OT, Incentives, Bonus) and deduction fields (LWF, Salary Advance, TDS 194C, TDS 194J) plus Total Days, LOP, Days Worked
- Update gross/net salary calculations to include new fields
- Update payslip PDF template with all new fields matching the required layout
- Add Excel export for payroll records

### Files to Create/Edit

| File | Action |
|------|--------|
| `package.json` | Add `xlsx` dependency |
| DB Migration | `refunds` table + new columns on `employees` and `payroll_records` |
| `src/pages/Billing.tsx` | Discount field, refund dialog, Excel export |
| `src/hooks/useInvoices.ts` | Add refund mutation |
| `src/pages/Payroll.tsx` | New fields in forms, updated calculations, updated payslip PDF, Excel export |
| `src/pages/Receivables.tsx` | New receivables report page |
| `src/pages/Accounting.tsx` | Excel export button |
| `src/App.tsx` | Add receivables route |
| `src/components/dashboard/DashboardSidebar.tsx` | Add receivables link |

### Technical Notes
- Excel export uses SheetJS (`xlsx` package) for proper .xlsx generation with formatting
- Refunds table has RLS policies for admin-only access
- Payroll calculations updated: Gross = Basic + HRA + Special Allowance + Professional Fees + Contract Fees + Other Additions + OT + Incentives + Bonus; Total Deductions = PF + ESI + LWF + Salary Advance + PT + TDS + TDS 194C + TDS 194J + Other Deduction; Days Worked = Total Days - LOP; effective salary prorated by days worked
- ESI employer rate updated to 3.25% per requirement

