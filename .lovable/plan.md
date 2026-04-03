

## Comprehensive Student Management Integrity Audit & Fixes

### Current State Assessment

After thorough review, the database constraints are **correctly configured**:
- Financial tables (`refunds`, `invoices`, `payments`): `ON DELETE SET NULL` — preserves records
- Operational tables (`complaints`, `gate_passes`, `attendance`, `mess_subscriptions`): `ON DELETE CASCADE` — auto-cleanup
- `beds`: `ON DELETE SET NULL` (but code also vacates before delete)

However, there are **several code-level issues** that need fixing:

### Issues Found

**1. Receivables page doesn't handle null `student_id`**
- `inv.student_id` is now nullable, but line 39-40 in `Receivables.tsx` uses it directly as a Map key without null-checking
- Invoices for deleted students will group under a `null` key and show as "Unknown" — should show "Deleted Student" and handle the null key gracefully

**2. Invoice hook join fails silently for null `student_id`**
- `useInvoices` does `student:students(id, roll_number, user_id)` — when `student_id` is null, the join returns null, which is fine, but the code at line 49 does `.map(inv => inv.student?.user_id)` which handles it
- However, invoices with null `student_id` won't show student names anywhere — should display "Deleted Student"

**3. Billing page invoice list doesn't handle deleted students**
- `filteredInvoices` searches by `invoice.student?.profile?.full_name` — works for null (just won't match name searches)
- Invoice rows likely display blank names for deleted students — should show "Deleted Student"

**4. Bulk delete doesn't handle `mess_subscriptions` FK**
- `mess_subscriptions.student_id` has `ON DELETE CASCADE` but is `NOT NULL` — this works fine with cascade
- Confirmed: no issue here

**5. Payment recording assumes student has a bed for property lookup**
- In `useInvoices.ts` line 161-168, when recording payment, if no `propertyId` is passed, it looks up via the student's bed — but if the student was deleted (null student_id on invoice), this lookup fails silently and no payment record is created in the `payments` table

### Plan

| # | File | Change |
|---|------|--------|
| 1 | `src/pages/Receivables.tsx` | Filter out invoices with null `student_id` or group them under a "Deleted Student" entry |
| 2 | `src/pages/Billing.tsx` | Show "Deleted Student" fallback in invoice rows, payment history, and refunds where student reference is null |
| 3 | `src/hooks/useInvoices.ts` | Handle null `student_id` in the invoice query — provide a fallback student object with "Deleted Student" name |
| 4 | `src/pages/Accounting.tsx` | No changes needed — already handles refunds without student references |

### Technical Details

- In `useInvoices.ts`: When mapping invoice results, if `invoice.student` is null (deleted student), set a fallback: `{ id: '', roll_number: '-', user_id: '', profile: { full_name: 'Deleted Student', email: null, phone: null } }`
- In `Receivables.tsx`: Skip or label invoices where `student_id` is null, preventing them from corrupting the receivables calculation
- In `Billing.tsx`: Already handles refunds with "Deleted Student" (line 109). Need to also handle invoice list rows where `student` is null

