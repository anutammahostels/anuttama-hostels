

## Refund Reflection Across Dashboard + Cross-Wiring Payroll/Accounting

### What Needs to Change

Currently, refunds are stored in the `refunds` table but are **not reflected** anywhere outside the Students exit dialog. They need to appear in 5 places, and existing payroll/accounting data needs cross-wiring where relevant.

---

### 1. Dashboard Stats — Add "Refunds Processed" metric & adjust Dues

**File: `src/hooks/useDashboard.ts`**
- Query `refunds` table: `SUM(amount)` for current month
- Subtract refunded amounts from `pendingDues` calculation (so dues reflect net after refunds)
- Return new `totalRefunds` and `refundsCount` fields in stats

**File: `src/components/dashboard/DashboardStats.tsx`**
- Add a 5th stat card: "Refunds" showing total refunded amount with count as subtitle
- Use `Undo2` icon with a red/orange gradient

---

### 2. Billing Page — Add Refunds Tab

**File: `src/pages/Billing.tsx`**
- Add a new "Refunds" tab alongside Invoices and Payment History
- Query `refunds` table joined with student profiles and invoice numbers
- Display table: Date, Student, Invoice #, Amount, Method, Reason, Status
- Show total refunded at top as a summary card

---

### 3. Receivables — Add Refunds Column

**File: `src/pages/Receivables.tsx`**
- Query `refunds` table grouped by `student_id`
- Add "Refunds" column to the table between "Received" and "Net Receivable"
- Adjust Net Receivable formula: `Gross - Discounts - Received + Refunds` (refunds increase net receivable since money went back)
- Update Excel and PDF exports to include Refunds column

---

### 4. Accounting — Wire Refunds into Fee Collections & P&L

**File: `src/pages/Accounting.tsx`**
- **Fee Collections tab**: Query `refunds` table alongside payments. Show refunds as negative/outflow entries (red) in the same table, or add a "Refunds" subsection below collections with a net summary
- **P&L tab**: Subtract total refunds from income to show "Net Fee Income = Fee Collections - Refunds"
- **Transactions tab**: No auto-insert (manual accounting entries), but add a summary badge showing "Unrecorded Refunds: ₹X" if refunds exist without matching transaction entries

---

### 5. Cross-Wiring: Payroll to Accounting & Dashboard

Currently payroll data lives independently. Wire it as follows:

**Accounting P&L tab** (`src/pages/Accounting.tsx`):
- Query `payroll_records` table: sum `net_salary` grouped by month
- Add "Staff Salaries" as an expense line in P&L, so P&L shows: `Net Income = (Fee Collections - Refunds) - (Expenses + Salaries)`

**Dashboard Stats** (`src/hooks/useDashboard.ts` + `DashboardStats.tsx`):
- No change needed — payroll is operational, not a dashboard KPI for hostel management

**Accounting Transactions tab**:
- No auto-wiring — payroll payments are recorded manually as transactions. But show an info banner if payroll total for a month doesn't match any recorded salary expense transactions.

---

### Files to Edit

| File | Changes |
|------|---------|
| `src/hooks/useDashboard.ts` | Add refunds query, return `totalRefunds` in stats, adjust `pendingDues` |
| `src/components/dashboard/DashboardStats.tsx` | Add 5th "Refunds" stat card |
| `src/pages/Billing.tsx` | Add "Refunds" tab with refunds table |
| `src/pages/Receivables.tsx` | Add refunds column, adjust net formula, update exports |
| `src/pages/Accounting.tsx` | Wire refunds into Fee Collections & P&L; wire payroll salaries into P&L as expense |

### No DB Changes Required
All data already exists in `refunds` and `payroll_records` tables with appropriate RLS policies.

