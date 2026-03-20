

## Remove Auditing Feature from Accounting Page

### Changes to `src/pages/Accounting.tsx`

1. **Remove the `AuditLog` type** (lines 38-41)
2. **Remove the `auditLogs` query** (lines 97-105) — the `useQuery` for `audit_logs`
3. **Remove the `logAudit` function** (lines 157-164) and all calls to it in mutation `onSuccess` handlers (lines 115, 132, 149)
4. **Remove the "Audit Trail" tab trigger** (line 281)
5. **Remove the entire Audit Trail `TabsContent`** (lines 474-499)
6. **Update page title** from "Accounting & Auditing" to "Accounting" and subtitle accordingly (line 224-225)
7. **Remove unused `BarChart3` icon import** if only used by audit tab

No database changes needed — the `audit_logs` table stays but just won't be used from this page.

