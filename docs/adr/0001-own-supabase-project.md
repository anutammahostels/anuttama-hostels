# Migrate off Lovable Cloud to a self-owned Supabase project

The app was scaffolded with Lovable, which auto-provisioned a managed "Lovable Cloud" Supabase project (ref `riguxshscsoygimxzwaf`) as its backend. We're moving the backend to a Supabase project we own directly (ref `tzjdchzoriseyzzuzliq`), and eventually leaving the Lovable editor/hosting entirely — this migration is step one of that exit, done in isolation from the frontend-hosting move.

**Why:** ownership and control over the database (direct Postgres access, our own billing/scaling, no dependency on Lovable's infra) outweighs Lovable Cloud's convenience, now that the schema (61 migrations) and edge functions (17, including the HDFC payment integration) are stable enough to stand alone.

**Approach:** replay the repo's existing `supabase/migrations/` against the new project (not a raw pg_dump of schema) to preserve migration lineage; data-only dump/restore for table rows and `auth.users`/identities (supported Supabase-to-Supabase pattern, preserves password hashes so no forced resets); no Storage buckets in use, so nothing to move there. Source project (`riguxshscsoygimxzwaf`) is kept alive read-only as a fallback rather than deleted after cutover. This is pre-launch (no real user traffic), so no delta-sync/cutover-window machinery is needed.

**Consequences:** HDFC secrets and Supabase Auth settings (Site URL, redirect URLs) live outside the database and must be manually re-entered on the new project — they don't come across in any dump/restore.
