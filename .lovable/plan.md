

## Generate Payroll: Multi-Employee Selection + Date Range

### What Changes

**File:** `src/pages/Payroll.tsx`

#### 1. Replace single-employee Select with multi-select checkboxes
- In the "Generate Payroll" dialog, replace the single `<Select>` for employee with a scrollable checkbox list of all active employees
- Add a "Select All" / "Deselect All" toggle at the top
- Store selected employee IDs in an array state (e.g., `selectedEmployeeIds`)

#### 2. Add date range to the individual Generate Payroll dialog
- Replace the single `<Input type="month">` with **Start Month** and **End Month** inputs (same as the bulk dialog)
- Add validation: start month must be ≤ end month

#### 3. Update generation logic
- When the form is submitted, iterate over each selected employee × each month in the range
- For each combination: compute salary using employee's saved defaults (basic, HRA, etc.), auto-calculate PT/TDS/LOP per month's calendar days
- Skip locked months (with toast notification)
- The detailed earnings/deductions override fields (currently shown for single employee) will be hidden when multiple employees are selected — bulk uses saved defaults
- When exactly 1 employee is selected, show the detailed form fields as they work today

#### 4. Consolidate with Bulk dialog
- The "Run Payroll for All" button remains as a quick shortcut (pre-selects all employees)
- The "Generate Payroll" dialog becomes the unified entry point supporting 1-to-many employees with date range

### Technical Details
- 1 file modified: `src/pages/Payroll.tsx`
- New state: `selectedEmployeeIds: string[]` replaces `payrollForm.employee_id`
- New state: `payrollStartMonth` / `payrollEndMonth` replace `payrollForm.month`
- Uses `getMonthsInRange()` helper already present in the file
- Multi-employee generation loops using same insert logic as `doGeneratePayroll` but with employee defaults
- No database changes needed

