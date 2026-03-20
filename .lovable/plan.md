

## Update Payroll Form, Calculations & Payslip to Match Requirements

### Gap Analysis

**Current state** vs **Required**:

| Area | Current | Required |
|------|---------|----------|
| Earnings fields | HRA, DA, Travel, Medical, Other Allowance | HRA, Special Allowance, Professional Fees, Contract Fees, Other Additions, OT, Incentives, Bonus |
| Deduction fields | PF, ESI, PT, TDS, Other Deduction | PF, ESI, LWF, Salary Advance, PT, Income Tax (TDS), TDS 194C, TDS 194J, Other Deduction |
| Attendance | Not tracked | Total Days, LOP, Days Worked |
| Payslip general info | Name, Designation, Department, DOJ, UAN, ESI | Employee Number, Name, Gender, Designation, Work Location, DOJ, Total Days, LOP, Days Worked |
| Gross calculation | Basic + HRA + DA + Travel + Medical + Other | Basic + HRA + Special Allowance + Professional Fees + Contract Fees + Other Additions + OT + Incentives + Bonus |
| Net calculation | Gross - (PF + ESI + PT + TDS + Other) | Prorated by days worked; deductions include LWF, Salary Advance, TDS 194C, TDS 194J |

DB columns already exist — no migration needed.

### Changes to `src/pages/Payroll.tsx`

1. **Update `PayrollRecord` interface** — add all new fields (special_allowance, professional_fees, contract_fees, other_additions, ot, incentives, bonus, lwf, salary_advance, tds_194c, tds_194j, total_days, lop, days_worked)

2. **Update `payrollForm` state** — replace DA/Travel/Medical with new earning fields; add LWF, Salary Advance, TDS 194C, TDS 194J; add total_days, lop

3. **Update `payrollCalc`** — new gross = Basic + HRA + Special Allowance + Professional Fees + Contract Fees + Other Additions + OT + Incentives + Bonus; new total deductions = PF + ESI + LWF + Salary Advance + PT + TDS + TDS 194C + TDS 194J + Other Deduction; days_worked = total_days - lop; net = (gross - totalDeductions) prorated if needed

4. **Update Generate Payroll form UI** — replace old earning inputs with new ones; add LWF/Salary Advance/TDS 194C/TDS 194J inputs; add Total Days/LOP/Days Worked row

5. **Update mutation** — save all new fields to DB

6. **Update payslip PDF** — show Employee Number, Gender, Work Location, Total Days, LOP, Days Worked in general info section; earnings table shows all new components; deductions table shows all new components including LWF, Salary Advance, TDS 194C, TDS 194J

### File
- `src/pages/Payroll.tsx` — single file, full rewrite of form/calc/PDF sections

