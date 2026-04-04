

## Create Warden Account

Create a new Edge Function `create-warden` that provisions a warden account with predefined credentials, following the same pattern as the existing `create-super-admin` function.

### Warden Credentials
- **Email**: `warden@anuttama.com`
- **Password**: `Warden@2026`

### Changes

**1. Create Edge Function `supabase/functions/create-warden/index.ts`**
- Uses service role key to create auth user with email confirmed
- Sets `full_name: "Warden"` in user metadata
- Inserts `warden` role into `user_roles` table
- Handles idempotency (if user already exists, ensures role is assigned)
- Returns success message with user ID

**2. Update `supabase/config.toml`**
- Add `[functions.create-warden]` block with `verify_jwt = false`

**3. Deploy and invoke the function**
- Deploy the edge function
- Call it once to create the warden account

### Result
You will be able to log in as a warden using:
- **Email**: `warden@anuttama.com`
- **Password**: `Warden@2026`

