# Launch checklist (thefranksstandard.com)

## GitHub Pages
- Settings - Pages - Source: GitHub Actions (not branch-only) or the site 404s.

## Required GitHub Actions secrets
- NUXT_PUBLIC_SUPABASE_URL, NUXT_PUBLIC_SUPABASE_KEY (anon key from Supabase - Project Settings - API)
- NUXT_PUBLIC_SITE_URL, NUXT_PUBLIC_OPS_ACCESS_KEY, Stripe NUXT_PUBLIC_PAY_* as in .env.example

## Supabase
- Run supabase/migrations/001_franks_schema.sql in the Supabase SQL editor (see supabase/README.md)
- Set Auth URL config for production and local dev

## Inbox
- Monitor info@thefranksstandard.com for support and store applications