

## Fix HDFC Basic Auth Format

### Problem
The "Invalid API Key" error is caused by incorrect Basic Auth encoding. HDFC/Juspay expects Basic Auth in `username:password` format where the API key is the username and password is empty — so it must be `btoa(API_KEY + ":")`.

- `hdfc-create-order` correctly uses `btoa(\`${API_KEY}:\`)` (with colon)
- `hdfc-order-status`, `hdfc-create-session`, and `hdfc-refund` all use `btoa(API_KEY)` (missing colon)

### Changes

**1. Fix `supabase/functions/hdfc-order-status/index.ts` (line 31)**
Change `btoa(API_KEY)` to `btoa(API_KEY + ":")`

**2. Fix `supabase/functions/hdfc-create-session/index.ts` (line 122)**
Change `btoa(API_KEY)` to `btoa(API_KEY + ":")`

**3. Fix `supabase/functions/hdfc-refund/index.ts` (line 44)**
Change `btoa(API_KEY)` to `btoa(API_KEY + ":")`

**4. Deploy and test**
Deploy all three functions, then test `hdfc-order-status` to confirm the API key is accepted.

