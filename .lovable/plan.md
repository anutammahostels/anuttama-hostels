

## Fix "Payment Status Unknown" — Root Cause and Solution

### Root Cause

The `hdfc-order-status` edge function **works correctly** when called directly (confirmed via testing — it returns `SUCCESS` for the latest payment). However, when called from the browser on the PaymentStatus page, it fails silently due to **two issues**:

1. **Incomplete CORS headers** — The edge function only allows `authorization, x-client-info, apikey, content-type` but the Supabase JS client sends additional headers (`x-supabase-client-platform`, etc.). The browser's CORS preflight rejects the request.

2. **No auth session on redirect** — The PaymentStatus page is outside `ProtectedRoute` (intentionally, so HDFC redirects work). But `supabase.functions.invoke()` sends an auth token from the current session. After HDFC redirects the user to `hostylia.com`, the auth session may not be restored yet, causing the function call to fail with 401. The DB polling fallback also fails because RLS requires authentication.

### Solution (3 files)

#### 1. Update CORS headers on `hdfc-order-status`
**File:** `supabase/functions/hdfc-order-status/index.ts`
- Expand `Access-Control-Allow-Headers` to include all Supabase client headers:
  `authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version`

#### 2. Call the edge function directly (bypass auth) from PaymentStatus
**File:** `src/pages/PaymentStatus.tsx`
- Instead of using `getOrderStatus()` (which goes through `supabase.functions.invoke()` requiring auth), call the edge function directly via `fetch()` using the public Supabase URL + anon key. The function already has `verify_jwt = false` in config, so it doesn't need a user token.
- This eliminates the auth dependency entirely on this page.

#### 3. Update CORS on `hdfc-create-session` too (preventive)
**File:** `supabase/functions/hdfc-create-session/index.ts`
- Same CORS header expansion to prevent similar issues.

#### 4. Redeploy both edge functions
- Deploy `hdfc-order-status` and `hdfc-create-session` after the CORS fix.

### Why This Will Work
- The curl test proved the function logic is correct (returns SUCCESS for CHARGED payments)
- Removing the auth dependency and fixing CORS ensures the browser can actually reach the function
- No database or schema changes needed

