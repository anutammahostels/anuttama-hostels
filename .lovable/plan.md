# Data Reset Plan — Operational Data Only

You asked to clear data you've entered (students, billing, receivables, etc.) while keeping the platform intact. Test organizations and admin accounts will be preserved.

## What WILL be deleted

| Table | Current rows | Notes |
|---|---|---|
| payment_logs | 99 | HDFC raw request/response logs |
| payment_transactions | 24 | HDFC order/txn records |
| payments | 79 | All payment receipts |
| refunds | 0 | (already empty) |
| invoices | 35 | All billing/receivables |
| journal_entries | 18 | Accounting ledger entries |
| transactions | 18 | Accounting transactions |
| payroll_records | 3 | Generated payslips |
| attendance | 0 | (already empty) |
| gate_passes | 0 | (already empty) |
| complaints | 0 | (already empty) |
| maintenance_tickets | 0 | (already empty) |
| mess_subscriptions | 0 | (already empty) |
| admissions | 2 | Pending admission entries |
| notifications | 124 | All in-app notifications |
| audit_logs | 0 | (already empty) |
| beds.student_id | — | Vacated (set to NULL, status='vacant') |
| students | 51 | All student records |
| user_roles (role='student') | 270 | Student role mappings |
| profiles (student users) | ~270 | Student profile rows |
| auth.users (student users) | ~270 | Student login accounts |

## What WILL be PRESERVED

- **All 11 organizations** and their owner admin accounts
- **Both properties** (Anuttama, Demo 2)
- **Property structure**: 1 block, 1 floor, 0 rooms, 0 beds (beds will just be vacated, none exist anyway)
- **1 employee** (Employee 1 — Accountant)
- **2 accounts** (Bank Account, Fee Income)
- **23 policy_settings** rows (fees, rules, configurations)
- **0 mess_plans, 0 notices** (already empty)
- **All non-student auth accounts**: super_admin, 8 tenant_admins, 1 warden, 1 accountant (11 users total) — including superadmin@hostylia.com, jeevijayit@gmail.com, anuttamaenterprises@gmail.com, warden@anuttama.com, etc.

## Execution Order (respects FK dependencies)

```text
1. payment_logs        → DELETE all
2. payment_transactions→ DELETE all
3. payments            → DELETE all
4. refunds             → DELETE all
5. journal_entries     → DELETE all
6. transactions        → DELETE all
7. payroll_records     → DELETE all
8. invoices            → DELETE all
9. attendance, gate_passes, complaints,
   maintenance_tickets, mess_subscriptions,
   admissions          → DELETE all
10. notifications (where user_id is a student) → DELETE
11. audit_logs         → DELETE all
12. UPDATE beds SET student_id=NULL, status='vacant'
13. Identify student user_ids: SELECT user_id FROM user_roles WHERE role='student'
14. DELETE FROM students
15. DELETE FROM user_roles WHERE role='student'
16. DELETE FROM profiles WHERE id IN (student_ids)
17. Delete auth.users for those student_ids via service-role
    (using a one-shot edge function or admin API call)
```

## Method

- Steps 1–16 will run as a single SQL migration (transactional where possible).
- Step 17 (deleting auth users) cannot run in raw SQL safely; I will create a temporary edge function `bulk-delete-students` invoked once, which uses the service role to call `auth.admin.deleteUser()` for each student user_id, then I will delete that function.

## Safety checks before execution

- I will re-run the row counts and show you the exact list of student emails to be removed (sample) before proceeding.
- Property/organization owners will be cross-checked to ensure none are accidentally in the student deletion list.

## Reversibility

This is a **destructive, irreversible** operation. Recommended: Lovable will offer a chat-revert point, but the database changes are NOT reverted by chat revert. If you want a safety net, say so and I'll first export current data to `/mnt/documents/backup_<date>.sql` before executing.

---

**Approve this plan to proceed.** Reply with "approve + backup" if you want a SQL backup dumped first.