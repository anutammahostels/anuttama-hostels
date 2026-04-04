

## Plan: Clear All Financial & Payroll Records

### What Will Be Deleted

| Table | Current Records | Action |
|---|---|---|
| invoices | 110 | Delete all |
| payments | 28 | Delete all |
| refunds | 2 | Delete all |
| payroll_records | 5 | Delete all |
| transactions | 0 | Already empty |
| journal_entries | 0 | Already empty |
| accounts | 0 | Already empty |

### Execution

A single database migration will truncate the data tables in the correct order (payments/refunds first due to `invoice_id` references, then invoices, then payroll_records). This gives you a clean slate for billing, receivables, accounting, and payroll.

### Files Changed
- **1 migration** — DELETE statements for `payments`, `refunds`, `invoices`, and `payroll_records`

No code changes needed.

