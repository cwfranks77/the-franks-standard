# Security guardrails (Franks Standard + Supabase)

These rules exist so database and deploy mistakes do not reopen data leaks.

## Database (Supabase project `rochesyrxiyrxhzmkuwk`)

- **Never** add `USING (true)` read policies on: `profiles`, `orders`, `dropship_orders`, `dropship_events`, `distributors`, `seller_dropship_secrets`, `abl_licenses`, `ops_incidents`, `contact_messages`.
- **Public storefront** uses view `public_store_profiles` only — not direct `profiles` reads for anonymous users.
- Every live policy change needs a file in `supabase/migrations/`.
- Before merge/deploy: `node scripts/check-supabase-security.mjs`
- After RLS changes: run Supabase **Security Advisor** on the live project.

## Deploy

- Operator phrase: hash only in the built site (`opsAccessKeyHash`), never plain text in client bundles.
- `/owner` and `/ops` on GitHub Pages are protected by phrase only (no server-side gate).
- Operator phrase stays in **sessionStorage** for the browser tab only (not localStorage).

## CI

- `security-supabase-migrations.yml` — blocks dangerous migration patterns on push/PR.
- `deploy-supabase-functions.yml` — deploys edge functions when `supabase/functions/**` changes.

## Required security migrations (do not delete)

- `058_profiles_public_read_lockdown.sql`
- `059_security_hardening.sql`
- `060_security_hardening_followup.sql`
