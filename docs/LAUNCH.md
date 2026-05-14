# Launch checklist (thefranksstandard.com)

## GitHub Pages
- Settings → Pages → **Source: GitHub Actions** (not “Deploy from a branch”) or the site 404s.
- Custom domain **thefranksstandard.com** stays configured; DNS per [GitHub Pages custom domain](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site).

## Required GitHub Actions secrets
- `NUXT_PUBLIC_SUPABASE_URL`, `NUXT_PUBLIC_SUPABASE_KEY` (anon key — Supabase → Project Settings → API)
- `NUXT_PUBLIC_SITE_URL` = `https://thefranksstandard.com` (no trailing slash; used in signup email links)
- `NUXT_PUBLIC_OPS_ACCESS_KEY`, Stripe `NUXT_PUBLIC_PAY_*` as in `.env.example`
- Optional: `NUXT_PUBLIC_OG_IMAGE`, Telegram deploy ping secrets

## Supabase (so anyone can sign up without friction)

1. **Project Settings → API** — copy URL + `anon` public key into GitHub secrets (and local `.env` for dev).
2. **Authentication → URL configuration**
   - **Site URL:** `https://thefranksstandard.com`
   - **Redirect URLs** — add exactly:
     - `https://thefranksstandard.com/auth/verify`
     - `http://localhost:3000/auth/verify` (optional, for local testing)
3. **Authentication → Providers → Email** — confirm email signups are enabled as you expect.
4. **Branded mail (strongly recommended)** — Project Settings → Auth → **Custom SMTP**; Authentication → **Email templates** (subject/body + sender name). Otherwise links still work but mail looks generic.
5. **Database** — run `supabase/migrations/001_franks_schema.sql` in the SQL editor if you have not already (see `supabase/README.md`).

## Smoke test before you announce (5 minutes)

Do this in a **private browser window** after the latest deploy is live:

1. Open `https://thefranksstandard.com/auth/register` — form loads, no console errors (F12).
2. Register with a **real** test email you control, buyer or seller, agree terms, submit.
3. You should see **“Check your inbox”** (not a raw error). If Supabase returns “already registered,” use another address or delete the test user in Supabase → Authentication → Users.
4. Open the **confirmation email**, click the link — you should land on **`/auth/verify`** and then redirect to **`/dashboard`** or **`/sellers`**.
5. Sign out (if the UI exposes it) or open an incognito window → **`/auth/login`** — sign in with the same password.
6. If email never arrived: **Spam** folder; on login use **“Resend confirmation email”** (same redirect as signup).

If any step fails, fix **Redirect URLs** and **`NUXT_PUBLIC_SITE_URL`** in Actions first, redeploy, then retest.

## Ship the build (“on the wire”)

1. Commit and **push to `main`** on `cwfranks77/the-franks-standard` (or run **Actions → Deploy Franks Standard → Run workflow**).
2. Wait for the workflow green check; open `https://thefranksstandard.com` and run the smoke test again.

## Tell people it exists

**Option A — one command (needs API keys in `.env`, never commit):**

```bash
cd the-franks-standard
npm run post:social
```

Uses `scripts/post-franks-social.cjs` (Telegram channel, Facebook Page, X). Env vars are documented in `.env.example` under “Social launch (optional)”.

**Option B — paste yourself** (works even without API keys): copy the site link and one line you believe in, e.g.  
*The Franks Standard is live — proof-first marketplace for collectibles & gear. Every public listing: COA or signed guarantee. https://thefranksstandard.com*

Post wherever your buyers and sellers already are (Facebook groups, Discord, collector forums, local business networks, email to people you trust).

## Inbox
- Monitor **info@thefranksstandard.com** (or whatever you publish) for support and seller questions.