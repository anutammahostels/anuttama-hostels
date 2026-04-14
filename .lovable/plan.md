

## Fix: Polling Window Too Short for HDFC Settlement

### Root Cause
Real payment data shows HDFC takes **26–65 seconds** (sometimes up to 5 minutes) to move from PENDING to CHARGED. The current polling (10 attempts × 2s = 20s) expires before HDFC settles, causing even successful payments to hit Phase 2 (DB check), which also finds "pending" and shows "Payment Status Unknown".

### Solution
Two changes to fix this:

#### 1. Extend polling with initial delay + longer window
- **Wait 5 seconds** before the first poll (HDFC needs time to process)
- Poll **15 times** at **3-second intervals** after that = ~50 seconds total window
- This covers the 26–65 second settlement window observed in production

#### 2. Fix Phase 2 fallback to also poll (not single check)
- Phase 2 currently does a single DB query — if payment is still "pending", it gives up
- Change to: poll the DB **5 times at 5-second intervals** (~25s more), looking for status change from "pending" to "completed" or "failed"
- If DB still shows "pending" after Phase 2, show a friendlier message: "Payment is being processed" instead of "Unknown"
- Total maximum wait: ~75 seconds (covers even slow settlements)

### Files Modified
1. **`src/pages/PaymentStatus.tsx`** — New polling timing + Phase 2 DB polling loop + "processing" state
2. **`src/pages/PaymentCallback.tsx`** — Same extended polling timing (no Phase 2 here, just longer HDFC polling)

### Technical Details
- No edge function or database changes needed
- The `hdfc-order-status` edge function already syncs payments when it sees SUCCESS/FAILED, so longer polling means it will catch the transition
- Add a new UI state "processing" (distinct from "not_found") for when DB has a pending payment — this gives the student confidence their payment is being handled

