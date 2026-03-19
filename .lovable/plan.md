

## Payroll Enhancement — ESI, PF & Detailed Salary Slip

### What Changes

Currently the payroll system has a single "allowances" and "deductions" field. We need to break these into proper Indian payroll components with auto-calculated statutory deductions.

### Database Changes

Add new columns to `payroll_records` table via migration:
- `hra` (numeric, default 0) — House Rent Allowance
- `da` (numeric, default 0) — Dearness Allowance  
- `travel_allowance` (numeric, default 0)
- `medical_allowance` (numeric, default 0)
- `other_allowance` (numeric, default 0)
- `pf_employee` (numeric, default 0) — Employee PF contribution (12% of basic)
- `pf_employer` (numeric, default 0) — Employer PF contribution (12% of basic)
- `esi_employee` (numeric, default 0) — Employee ESI (0.75% of gross)
- `esi_employer` (numeric, default 0) — Employer ESI (3.25% of gross)
- `professional_tax` (numeric, default 0)
- `tds` (numeric, default 0)
- `other_deduction` (numeric, default 0)
- `gross_salary` (numeric, default 0)

Also add `uan_number` and `esi_number` columns to `employees` table for PF/ESI identification.

### Generate Payroll Dialog Revamp

Replace the simple allowances/deductions fields with structured sections:

**Earnings Section** (auto-filled from employee salary, editable):
- Basic Salary (from employee record)
- HRA, DA, Travel Allowance, Medical Allowance, Other Allowance

**Deductions Section** (auto-calculated with toggles):
- PF (Employee) — auto-calculated as 12% of Basic, with checkbox to enable/disable
- ESI (Employee) — auto-calculated as 0.75% of Gross if gross ≤ ₹21,000, else 0
- Professional Tax — manual input
- TDS — manual input
- Other Deductions — manual input

**Summary** shown live:
- Gross Salary = Basic + all allowances
- Total Deductions = PF + ESI + PT + TDS + Other
- Net Salary = Gross - Total Deductions
- Employer contributions (PF 12%, ESI 3.25%) shown for reference

### Payroll Records Table Update

Show columns: Employee, Month, Gross, PF, ESI, Total Deductions, Net Salary, Status, Actions.

### PDF Payslip Revamp

Redesign the payslip HTML to show a professional Indian salary slip format:
- **Header**: Company name, payslip month, employee details (name, designation, department, UAN, ESI number, bank details)
- **Two-column layout**: Left = Earnings breakdown, Right = Deductions breakdown
- **Earnings**: Basic, HRA, DA, Travel, Medical, Other → Gross
- **Deductions**: PF, ESI, Professional Tax, TDS, Other → Total Deductions
- **Footer**: Net Pay (in words and figures), employer contributions (PF + ESI)

### Employee Form Update

Add UAN Number and ESI Number fields to the employee add/edit dialog.

### Files to Modify

1. **Migration SQL** — Add columns to `payroll_records` and `employees`
2. **`src/pages/Payroll.tsx`** — Revamp form, table, PDF generation, interfaces
3. **`src/integrations/supabase/types.ts`** — Auto-updated after migration

### Technical Details

- ESI applicability: Employee ESI at 0.75% and Employer ESI at 3.25% apply only when gross salary ≤ ₹21,000/month
- PF: Employee and Employer each contribute 12% of Basic Salary (capped at ₹15,000 basic for statutory minimum, but we allow full calculation)
- Professional Tax: Manual entry (varies by state, typically ₹200/month)
- Number-to-words utility for displaying net pay in words on payslip

