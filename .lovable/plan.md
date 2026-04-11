

## Payroll Management — Gap Analysis & Phased Implementation Plan

### What's Already Implemented (No Changes Needed)
- Employee master with most fields (name, emp no, gender, designation, department, email, phone, work location, bank details, PAN, UAN, ESI, salary structure)
- PF calculation: 12% of Basic capped at ₹1,800 (correct per ₹15,000 wage ceiling)
- ESI: Employee 0.75% / Employer 3.25%, ₹21,000 threshold
- Payroll generation (single + bulk), lock month, payslip PDF, salary register Excel export
- Attendance tracking (total days, LOP, days worked)
- All earnings components (Basic, HRA, Special Allowance, Professional Fees, Contract Fees, Other Additions, OT, Incentives, Bonus)
- All deduction fields (PF, ESI, LWF, Salary Advance, PT, TDS, TDS 194C/J, Other Deductions)

### What's Missing — Organized in 3 Phases

---

### Phase 1: Employee Master Fixes & Validation Rules
**Scope: `src/pages/Payroll.tsx` + DB migration**

1. **Add `date_of_joining` to employee form** — the DB column exists but the Add/Edit Employee dialog has no input for it. Add a date picker field.

2. **PAN validation** — Format: `AAAAA9999A` (5 alpha + 4 numeric + 1 alpha). Validate on form submit.

3. **IFSC validation** — Format: 11 characters, first 4 alphabets, 5th character = 0, last 6 alphanumeric. Validate on form submit.

4. **Net Pay ≥ 0 alert** — When total deductions exceed total earnings during payroll generation, show a warning and require confirmation before proceeding.

---

### Phase 2: Auto-Calculated Statutory Deductions

1. **Auto PT (Karnataka slabs)** — When generating payroll, auto-calculate Professional Tax based on:
   - Gross < ₹25,000 → PT = ₹0
   - Gross ≥ ₹25,000 → PT = ₹200 (₹300 if month is February)
   - Currently defaults to ₹200 but doesn't handle the ₹25,000 threshold or February ₹300 rule.

2. **Auto TDS calculation (New Tax Regime FY 2025-26)** — Add a "Calculate TDS" button that:
   - Computes Annual Gross = Monthly Gross × 12
   - Deducts Standard Deduction of ₹75,000
   - Applies slab rates (₹0-4L: 0%, 4-8L: 5%, 8-12L: 10%, 12-16L: 15%, 16-20L: 20%, 20-24L: 25%, 24L+: 30%)
   - Adds 4% Health & Education Cess
   - Applies Section 87A rebate (taxable income ≤ ₹7,00,000 → Tax = NIL)
   - Shows Monthly TDS = Annual Tax / 12
   - Still allow manual override

3. **LOP deduction fix** — Currently applies pro-rata to net salary at the end. Per the doc, LOP Amount should be: `(Gross / Calendar Days in Month) × LOP Days`, deducted as a separate visible line item.

---

### Phase 3: Export Reports & Statements

Add export buttons on the Payroll Records tab for:

1. **PF Statement (ECR format)** — CSV/Text file with UAN, Employee Name, Gross Wages, EPF Wages, EPF Contribution (EE), EPF Contribution (ER), EPS Contribution, EDLI Contribution for EPFO upload.

2. **ESI Statement** — Excel/CSV with ESI Number, Employee Name, Gross Salary, Employee ESI (0.75%), Employer ESI (3.25%) for ESIC portal.

3. **PT Statement** — Excel with Employee Name, Gross Salary, PT deducted per month, annual total (Karnataka format).

4. **TDS Workings** — Excel with annual tax computation per employee: Annual Gross, Standard Deduction, Taxable Income, Tax per slab, Cess, Rebate, Annual Tax, Monthly TDS.

5. **Bank Transfer File** — Excel/CSV with Employee Name, Net Pay, Bank Name, Account Number, IFSC Code for NEFT/RTGS processing.

6. **Payslip refinements** — Add Department, Date of Payment, partially mask bank account number (show last 4 digits only) on the PDF payslip.

---

### Technical Details

- **Phase 1**: ~1 file changed (`Payroll.tsx`) + 0 DB migrations (date_of_joining column already exists)
- **Phase 2**: ~1 file changed (`Payroll.tsx`) — add TDS calculation utility function, auto-PT logic, LOP refactor
- **Phase 3**: ~1 file changed (`Payroll.tsx`) — add export functions using existing `exportToExcel` utility, update payslip HTML template
- No new database tables or columns needed — all required columns already exist
- All changes are frontend-only

