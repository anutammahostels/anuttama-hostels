## Fix bulk student upload null `.replace()` crash

**Root cause:** Edge function `create-student` calls `.toLowerCase().replace(...)` and similar string methods on fields coming from Excel that may arrive as numbers (e.g. FORM NO `2460862837`) or `null`. When `roll_number` is a number, `roll_number.toLowerCase` is `undefined` and the chain throws `Cannot read properties of null (reading 'replace')`. The client also masks per-row errors by throwing on `fnError` before reading `data.error`.

### Changes

**1. `supabase/functions/create-student/index.ts`**
- Add a `safeStr(v)` helper: `String(v ?? "").trim()` and apply it to every incoming string field before any `.toLowerCase` / `.replace` / `.match` / `.split` call. Fields: `roll_number`, `full_name`, `email`, `phone`, `course`, `department`, `blood_group`, `gender`, `emergency_contact`, `father_name`, `mother_name`, `account_number`, `alloted_room_no`, `remarks`, `balance_payment`, and all `payment_mode_*`, `transaction_details_*`, `utr_id_*`.
- Make the deterministic email fallback null-safe (use the sanitized `roll_number`; if empty, return 400 with a clear message instead of crashing).
- Validate `roll_number` is non-empty after coercion → return `400 { error: "roll_number is required", code: "MISSING_ROLL_NUMBER" }`.
- Improve `catch`: `console.error("[create-student] failed", { message: err?.message, stack: err?.stack, row: roll_number })` and always return `{ error, code }` with CORS headers.

**2. `src/pages/Students.tsx → handleBulkUpload`**
- Stop discarding the response body on non-2xx. Order of error extraction per row:
  1. `data?.error` (real server message)
  2. `fnError?.message`
  3. Generic fallback
- Treat `data?.existing === true` as "skipped" (not failed) regardless of status.
- Defense-in-depth: coerce `roll_number` and `phone` to trimmed strings in the payload before invoking.

### Out of scope
- No template change (the xlsx is valid).
- No DB migration.
- No concurrency/rate-limit changes (current parallelism is fine once the crash is fixed).

### Verification
After deploy, re-upload the same 132-row file. Expected: rows succeed, or surface specific per-row reasons (e.g. duplicate roll number) instead of the generic non-2xx message.