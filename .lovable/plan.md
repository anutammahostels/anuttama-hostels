# Repeat Operational Data Wipe

Same scope as the previous reset. Current state shows new data has been added since the last wipe.

## Current Data (to be deleted)

| Entity | Count |
|---|---|
| students | 649 |
| invoices | 115 |
| payments | 145 |
| notifications | 1 |
| user_roles (student) | 649 |
| All other operational tables | 0 |

## To be DELETED
- **Financials**: `payments`, `invoices`, `payment_transactions`, `payment_logs`, `refunds`, `journal_entries`, `transactions`, `payroll_records`
- **Student data**: `students` (649), `admissions`, student rows in `user_roles` (649) and `profiles`
- **Operational logs**: `attendance`, `gate_passes`, `complaints`, `maintenance_tickets`, `mess_subscriptions`, `audit_logs`, `notifications`
- **Beds**: reset `student_id = NULL`, `status = 'vacant'`

## To be PRESERVED
- 11 Organizations
- 2 Properties + all blocks/floors/rooms/beds (structure only)
- All policy_settings, accounts, mess_plans, employees
- 11 non-student user_roles (super_admin, tenant_admin, warden, accountant) and their auth accounts

## Execution
1. **SQL migration** — single batch DELETE across the tables above + bed reset.
2. **Auth cleanup** — invoke existing `bulk-delete-students` edge function (already deployed) to purge ~649 orphaned `@anuttama.student` auth accounts. You'll run this from the browser console as super_admin, same as last time:
   ```js
   const { data, error } = await window.supabase.functions.invoke('bulk-delete-students');
   console.log(data, error);
   ```

No schema changes. No structural data touched. Reply **approve** to proceed.