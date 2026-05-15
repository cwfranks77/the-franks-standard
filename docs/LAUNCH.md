# Launch checklist (thefranksstandard.com)

## GitHub Pages
- Settings → Pages → **Source: GitHub Actions** (not “Deploy from a branch”) or the site 404s.
- Custom domain **thefranksstandard.com** stays configured; DNS per [GitHub Pages custom domain](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site).

## Vercel (if The Franks Standard is linked there)

This repo is a **client-only static site** (`ssr: false`, `nuxt generate`). The repo root **`vercel.json`** uses **`npm run build`** (same as `npm run generate`) and publishes **`.output/public`**.

On Vercel’s build servers **`VERCEL` is set**, so Nitro uses the **`static`** preset; GitHub Actions / local builds keep **`github-pages`** for static hosting quirks.

**In the Vercel dashboard** for project **`the-franks-standard`** (linked to this repo): turn **off** Build/Output overrides so **`vercel.json`** wins. **Environment variables** — fastest path from your machine:

1. Copy `env.local.example` → `.env.local` and fill **Supabase URL + anon key** (same values as GitHub secrets `NUXT_PUBLIC_SUPABASE_URL` / `NUXT_PUBLIC_SUPABASE_KEY` — Supabase → Project → Settings → API).
2. Run **`npm run env:vercel`** (pushes all `NUXT_PUBLIC_*` to Production, Preview, Development).
3. **Redeploy** in Vercel (Deployments → … → Redeploy).

Without **Supabase** env vars, signup/login is broken on Vercel even if the site loads.

**One production domain:** If **thefranksstandard.com** DNS already points at **GitHub Pages**, do not also assign that exact domain to Vercel unless you intend to move hosting—two hosts fighting for the same name causes random failures (auth redirects, SSL, “wrong site”). Use Vercel’s **`*.vercel.app`** preview for experiments, or move DNS to Vercel only when you commit to Vercel as the sole host.

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

## Advertising kit (ready to paste)

Use **one canonical URL** everywhere: **https://thefranksstandard.com**

| Link | URL |
|------|-----|
| Home | https://thefranksstandard.com |
| Join (buyers & sellers) | https://thefranksstandard.com/auth/register |
| Sign in | https://thefranksstandard.com/auth/login |
| For stores | https://thefranksstandard.com/sellers |

**Short lines you can post as-is:**

1. *The Franks Standard is live — a proof-first marketplace for collectibles & gear. Every public listing needs a COA or a signed in-platform guarantee. Join free: https://thefranksstandard.com*

2. *Selling high-trust inventory? The Franks Standard is built for reputation, not a flood of fakes. Stores: https://thefranksstandard.com/sellers*

3. *Buy with proof — https://thefranksstandard.com — authenticity is not optional here.*

After your smoke test passes, post where your people already are (Facebook groups, Discord, collector forums, email to partners). Optional automation: **`npm run post:social`** (see `.env.example` → Social launch).

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