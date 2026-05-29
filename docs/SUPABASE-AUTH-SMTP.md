# Supabase signup & auth email

## Why users see “cannot email until you setup custom SMTP”

The **website signup code works**. Supabase Auth must **send** the confirmation email. Without custom mail configured, only org-team addresses may receive mail.

You have **two fixes** (pick one):

---

## Option A — Send Email hook (recommended; code is in this repo)

We deploy `auth-send-email` — it sends branded mail through **SendGrid** when someone signs up.

### What you do (about 5 minutes)

1. **GitHub** → repo **Secrets → Actions** → ensure `SENDGRID_API_KEY` is set (`SG....` from SendGrid).
2. **GitHub → Actions** → run workflow **“Push SendGrid secrets to Supabase”** (once).
3. **GitHub → Actions** → run **“Deploy Supabase Edge Functions”** (or push to `master` if functions changed).
4. **Supabase** → [Auth Hooks](https://supabase.com/dashboard/project/rochesyrxiyrxhzmkuwk/auth/hooks) → **Send email** → **Enable hook**
   - Type: **HTTPS**
   - URL: `https://rochesyrxiyrxhzmkuwk.supabase.co/functions/v1/auth-send-email`
   - Save. Supabase stores `SEND_EMAIL_HOOK_SECRET` on the function automatically.
5. **SendGrid** → verify sender `info@thefranksstandard.com` (domain or single sender).
6. **Supabase** → [URL configuration](https://supabase.com/dashboard/project/rochesyrxiyrxhzmkuwk/auth/url-configuration):
   - Site URL: `https://thefranksstandard.com`
   - Redirect: `https://thefranksstandard.com/auth/verify`

Test: register with a Gmail **not** on your Supabase team → inbox should show **The Franks Standard** confirm link.

### Common mistake

Hook endpoint must be the **Edge Function URL**, not a Supabase dashboard link:

- **Wrong:** `https://supabase.com/dashboard/project/...`
- **Right:** `https://rochesyrxiyrxhzmkuwk.supabase.co/functions/v1/auth-send-email`

Run: `npm run auth:verify`

### What the agent cannot do

- Log into your Supabase or SendGrid account
- Flip the Auth Hook switch for you
- Create your SendGrid API key

---

## Option B — Custom SMTP in Supabase (no hook)

**Authentication → SMTP** in the dashboard:

| Field | Value |
|--------|--------|
| Host | `smtp.sendgrid.net` |
| Port | `587` |
| Username | `apikey` |
| Password | SendGrid API key |
| From | `info@thefranksstandard.com` |

Same URL configuration as step 6 above.

If you use Option B, **disable** the Send Email hook so only one path sends mail.

---

## App code (already correct)

- `pages/auth/register.vue` → `signUp` with redirect to `/auth/verify`
- `pages/auth/verify.vue` → completes confirmation

No GitHub Pages redeploy fixes missing mail.

## Dev-only (not production)

**Authentication → Providers → Email** → turn off **Confirm email** — accounts work without mail (insecure).
