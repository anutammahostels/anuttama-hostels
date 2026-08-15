# Unified "Accounting" Tab

Replace the three separate tabs (Billing, Receivables, Refunds) with one **Accounting** section that shares a single data layer, one configurable statistics strip, and one consolidated Excel export.

## Why the current setup is inconsistent

Each page independently queries and re-aggregates the same records:

- Billing reads `invoices`, `payments`, `refunds`
- Receivables reads `payments`, `payment_transactions`, `refunds`
- Refunds reads `refunds`, `payment_transactions`

Because each page joins and sums on its own, the same student can appear with different totals, and refund actions exist in two places. The underlying tables are correct — the duplication is in the frontend aggregation, so the fix is one shared ledger layer, not new tables.

## Step 1 — Single ledger data layer

Create one hook (`useAccountingLedger`) that is the only place financial data is read and aggregated. It loads invoices, completed payments, refunds, gateway transactions, students and centers once, then builds a normalized per-student ledger:

- gross billed, discounts, received (installment 1/2/3 split), refunded, net receivable
- payment status (paid / partial / pending / overdue), inactive students excluded from receivable totals
- per-transaction rows (online/offline, mode, reference, date) and per-refund rows (status, method, reason)

All views and exports read from this one source, so numbers can no longer disagree between views.

## Step 2 — One Accounting page with sub-views

Route `/dashboard/accounting`, replacing the three sidebar entries with a single "Accounting" item. Inside it, segmented sub-views over the same ledger:

- **Invoices** — invoice list, create/generate invoices, record offline payment
- **Receivables** — per-student dues with installment breakdown
- **Transactions** — every payment (online + offline) with receipts
- **Refunds** — refund list with the single refund action (HDFC real-money or offline with the detail modal)

The refund action lives here only once. Old routes `/dashboard/billing`, `/dashboard/receivables`, `/dashboard/refunds` redirect to the new tab so existing links keep working.

## Step 3 — Configurable statistics strip

A stat group selector above the sub-views, driven by the same ledger:

- **Collections** — gross billed, received, pending dues, collection %
- **Transactions** — transaction count, online vs offline split, average ticket, this-month collected
- **Refunds** — total refunded, processed vs pending count, pending refund amount
- **Occupancy/Students** — active students, fully paid, partially paid, not started

Selection persists per user (localStorage), and every card respects the active center filter and date range.

## Step 4 — Centralized Excel export

One export builder used by all sub-views, producing a single workbook with sheets:

1. `Summary` — the statistics for the current filters
2. `Receivables` — one row per student: gross, discount, Amount 1/2/3, received, refunded, net due, status
3. `Transactions` — one row per payment with mode, reference, date, receipt no.
4. `Refunds` — one row per refund with method, status, reason/bank details
5. `Invoices` — invoice-level rows (no mess/electricity/other/discount noise columns)

Exports honour the active center and filters, and exclude deleted/orphaned records.

## Step 5 — Cleanup and verification

- Delete the now-unused per-page query/aggregation code from the three old pages
- Verify the unified totals still match the confirmed figures (Amount Received ₹18,29,64,599 / Net Receivable ₹3,92,21,401) before and after the switch
- Check mobile layout of the new tab (cards on small screens, tables on desktop)

## Technical notes

- No schema changes; `invoices`, `payments`, `refunds`, `payment_transactions` stay as they are. "Centralized" means one frontend ledger module, keeping RLS center isolation intact.
- New files: `src/hooks/useAccountingLedger.ts`, `src/pages/Accounting.tsx`, `src/components/accounting/*` (sub-views, stat strip), `src/lib/exportAccounting.ts`.
- `src/App.tsx` gains the accounting route plus three redirects; `DashboardSidebar.tsx` collapses three items into one.