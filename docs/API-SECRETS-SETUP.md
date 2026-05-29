# API secrets — where they go (you add them, not in chat)

Run: npm run secrets:check

## GitHub Actions (site deploy)
https://github.com/cwfranks77/the-franks-standard/settings/secrets/actions

- NUXT_PUBLIC_SUPABASE_URL (required)
- NUXT_PUBLIC_SUPABASE_KEY (required, anon key only)
- NUXT_PUBLIC_OPS_ACCESS_KEY or NUXT_PUBLIC_OPS_ACCESS_KEY_HASH (required for owner toolkit)

## Supabase Auth email (signup / reset)

Agent **cannot** log into Supabase for you. After `SENDGRID_API_KEY` is in GitHub Secrets:

1. Run Actions workflow **Push SendGrid secrets to Supabase**
2. Deploy edge functions (includes `auth-send-email`)
3. You enable **Auth → Hooks → Send email** → `https://rochesyrxiyrxhzmkuwk.supabase.co/functions/v1/auth-send-email`

Or use Custom SMTP in dashboard instead — see **`docs/SUPABASE-AUTH-SMTP.md`**

## Local .env only (marketing scripts)

- SENDGRID_API_KEY — from app.sendgrid.com (SG.xxx); **same key can power Supabase SMTP**
- SENDGRID_FROM_EMAIL=info@thefranksstandard.com
- LOB_API_KEY — test_ free from dashboard.lob.com
- LOB_POSTCARD_FRONT_URL — upload postcard in Lob

Never paste secrets in Cursor chat. See .env.example for full list.