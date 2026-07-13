
# Plan: Center-Isolated Admin + HDFC Refund UI

## Part 1 — Yelhanka isolated admin account

### Credentials to provision
- **Email:** `yelhanka@anuttamahostels.com`
- **Password:** `yelhanka$951951`
- **Display name:** `Yelhanka Admin`
- **Role:** `tenant_admin`
- **Center assignment:** Yelhanka property only (via `staff_property_assignments`)

### Database changes (migration)
1. Create the auth user via `supabase.auth.admin.createUser` in a one-off edge function invocation (auto-confirmed email, since managed email is off).
2. Insert `profiles` row (`full_name = "Yelhanka Admin"`).
3. Insert `user_roles` row (`role = 'tenant_admin'`).
4. Insert `staff_property_assignments` row linking the new user to Yelhanka's `property_id`.
5. Add a helper SQL function `public.user_assigned_property_ids(_user_id uuid) returns setof uuid` (SECURITY DEFINER) that returns property IDs from `staff_property_assignments`, or **all** property IDs if the user is `super_admin`.
6. Tighten RLS across financial + operational tables so non–super-admin staff see rows only for their assigned properties. Tables to update:
   - `students`, `invoices`, `payments`, `refunds`, `payment_transactions`
   - `beds`, `rooms`, `floors`, `blocks`, `properties`
   - `notices`, `complaints`, `maintenance_tickets`, `gate_passes`, `attendance`
   - `admissions`, `mess_subscriptions`, `employees`, `payroll_records`
   - `staff_property_assignments` itself
   
   Policy pattern for each table with a `property_id` (direct or via join):
   ```sql
   USING (
     has_role(auth.uid(), 'super_admin')
     OR property_id IN (SELECT public.user_assigned_property_ids(auth.uid()))
   )
   ```
   Tables without a direct `property_id` (e.g. `payments`, `invoices`) join through `students.property_id` or `beds → rooms → floors → blocks.property_id`.

### Frontend changes
- `CenterContext`: when the current user is **not** `super_admin` and has exactly one assignment, force `centerId` to that property and ignore localStorage overrides.
- `CenterFilter`: hide the dropdown (or render read-only chip showing "Yelhanka") for single-assignment users.
- `useProperties`: already returns only visible properties post-RLS, so admin will naturally see one center.
- `DashboardStats`, `Students`, `Billing`, `Receivables`, `Accounting`, `Properties`, `Reports`: no code changes needed — they consume `centerId` from context and are RLS-filtered.
- `ProtectedRoute`: `tenant_admin` continues to land on `/dashboard`.

### Verification
- Log in as `yelhanka@…` → dashboard shows Yelhanka totals only, Students/Billing/Receivables/Properties list Yelhanka rows only, center filter is locked.
- Log in as super admin → all centers still visible with switcher.

---

## Part 2 — HDFC refund UI (Billing + Receivables)

Backend already exists: `supabase/functions/hdfc-refund/index.ts` handles the HDFC call, validates staff role, persists a `refunds` row, and returns status. Only UI wiring is needed.

### New component: `src/components/billing/RefundDialog.tsx`
Props: `{ open, onOpenChange, payment, invoice, onRefunded }`.
Fields:
- Original charged amount (read-only)
- Already refunded amount (read-only, sum of prior `refunds.amount` for this invoice)
- Refundable balance = charged − already refunded (read-only)
- **Amount** input (default = refundable balance; allow partial; zod-validated `> 0` and `≤ refundable`)
- **Reason** textarea (required, max 500 chars)
- Confirm checkbox: "This will refund to the original card/UPI via HDFC"

On submit: call `initiateRefund(order_id, amount, undefined, reason)` from `src/lib/hdfc.ts`; on success toast the gateway status (`SUCCESS` / `PENDING`) and refetch invoices/refunds. Handle `MANUAL_REVIEW` and error codes surfaced by the edge function.

### Billing page (`src/pages/Billing.tsx`)
Add a **Refund** action to the row action menu for any payment where `payment_method = 'online'`, `status = 'completed'`, and a linked `payment_transactions.order_id` exists with HDFC `status = 'SUCCESS'`. Disable (with tooltip) when already fully refunded. Opens `RefundDialog`.

### Receivables page (`src/pages/Receivables.tsx`)
Add a **Refund** button in the invoice detail drawer/row for invoices with any refundable HDFC payment. Same dialog.

### Refund history visibility
- Show a small "Refunds" section in the invoice detail view listing `refunds` rows (amount, status, reason, date, processed_by).
- Poll `hdfc-order-status` once after a `PENDING` refund is created so the row's status self-corrects (reuses existing reconciliation pattern).

### Guardrails
- Client blocks amount > refundable; server (`hdfc-refund`) already re-validates via HDFC.
- Only `super_admin`, `tenant_admin`, `accountant` see the Refund action (matches edge function's role check).

---

## Technical notes

- `staff_property_assignments` already exists with `staff_has_property_access` helper; the new `user_assigned_property_ids` function complements it for `IN (...)` filters.
- RLS rewrite is the largest surface — will be done in a single migration with policies dropped and recreated per table to keep it auditable.
- Auth user creation runs via a throwaway invocation of a new edge function `bootstrap-center-admin` (service-role) so we never expose service key to the client; function is removed after use or gated to super_admin.
- No changes to `hdfc-refund` edge function or `supabase/config.toml`.
- Credentials will be echoed back in chat after the migration runs: **`yelhanka@anuttamahostels.com` / `yelhanka$951951`**.
