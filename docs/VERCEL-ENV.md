# Vercel env vars

## Warning on NUXT_PUBLIC_SUPABASE_KEY

Vercel may say it might expose sensitive material. That is OK for the Supabase **anon public** key.

- Use **anon public** from Supabase Settings -> API
- Never use **service_role** in NUXT_PUBLIC_* 
- Security is Row Level Security in Supabase, not hiding the anon key

## Required

- NUXT_PUBLIC_SUPABASE_URL
- NUXT_PUBLIC_SUPABASE_KEY (anon only)
- NUXT_PUBLIC_SITE_URL = https://thefranksstandard.com
- NUXT_PUBLIC_OPS_ACCESS_KEY

Redeploy after saving.
