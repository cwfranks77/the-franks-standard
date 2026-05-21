# API secrets — where they go (you add them, not in chat)

Run: npm run secrets:check

## GitHub Actions (site deploy)
https://github.com/cwfranks77/the-franks-standard/settings/secrets/actions

- NUXT_PUBLIC_SUPABASE_URL (required)
- NUXT_PUBLIC_SUPABASE_KEY (required, anon key only)
- NUXT_PUBLIC_OPS_ACCESS_KEY or NUXT_PUBLIC_OPS_ACCESS_KEY_HASH (required for owner toolkit)

## Local .env only (marketing scripts)

- SENDGRID_API_KEY — from app.sendgrid.com (SG.xxx)
- SENDGRID_FROM_EMAIL=info@thefranksstandard.com
- LOB_API_KEY — test_ free from dashboard.lob.com
- LOB_POSTCARD_FRONT_URL — upload postcard in Lob

Never paste secrets in Cursor chat. See .env.example for full list.