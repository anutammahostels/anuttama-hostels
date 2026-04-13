

## Payroll: Unlock Month & Date-Range Payroll Generation

### Changes Required

#### 1. Make Lock/Unlock toggle for months
**File:** `src/pages/Payroll.tsx`

- Add an `unlockMonthMutation` that sets `is_locked = false` for all records in a given month (mirrors `lockMonthMutation` but sets `false`)
- Replace the current Lock Month `<Select>` with a dropdown that shows both locked and unlocked months:
  - Unlocked months show a "Lock" action
  - Locked months show an "Unlock" action
- Remove the "This cannot be undone" language from the confirm dialog
- When unlocking, show a confirmation: "Unlock payroll for {month}? This will allow edits to payroll records."
- When a month is unlocked, the existing edit/regenerate restrictions are lifted automatically (since `isMonthLocked()` will return false)

#### 2. Add date-range based payroll generation
**File:** `src/pages/Payroll.tsx`

- In the "Run Payroll for All" (bulk) dialog, replace the single `<Input type="month">` with two date pickers: **Start Date** and **End Date**
- The bulk mutation will:
  - Calculate the number of months spanned (e.g., Jan 2025 to Mar 2025 = 3 months)
  - For each month in the range, generate payroll records for all active employees
  - Use each month's calendar days for LOP/PT calculations
  - Skip months that are already locked (with a toast notification)
- In the single-employee "Generate Payroll" dialog, similarly replace the month input with start/end date pickers, generating one record per month in the range
- The `month` field stored in DB remains `yyyy-MM` format for each individual month's record

### Technical Details
- 1 file modified: `src/pages/Payroll.tsx`
- No database changes — `is_locked` column already exists as a boolean
- The unlock mutation is a simple `.update({ is_locked: false })` query
- Date range uses `eachMonthOfInterval` from `date-fns` to iterate months

