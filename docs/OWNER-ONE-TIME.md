# Owner one-time setup (then hands-off)

**Auth email** uses your **Namecheap mailbox** (`info@thefranksstandard.com`) via the `auth-send-email` edge function — **not SendGrid**.

---

## Already automated (you do not touch Supabase SMTP)

| What | How |
|------|-----|
| Site deploy | Push to `master` → GitHub Pages |
| Edge functions | Push changes under `supabase/functions/` → CI deploy |
| Mailbox password on Supabase | CI reads `MAILBOX_SMTP_PASSWORD` from GitHub Secrets |
| Health checks | `production-health.yml` after deploy |

---

## One-time only if mail ever stops (~2 min)

From the site repo (uses `franks-standard-credentials/email.env` — never commit it):

```powershell
npm run mail:sync-github
gh workflow run push-supabase-mailbox-secrets.yml -R cwfranks77/the-franks-standard
gh workflow run deploy-supabase-functions.yml -R cwfranks77/the-franks-standard
```

Or locally if `supabase login` is done:

```powershell
npm run mail:push-supabase
```

---

## Do not re-do unless someone broke it

| Item | Check |
|------|--------|
| Auth Hook Send Email | [Hooks](https://supabase.com/dashboard/project/rochesyrxiyrxhzmkuwk/auth/hooks) → `https://rochesyrxiyrxhzmkuwk.supabase.co/functions/v1/auth-send-email` (not a dashboard URL) |
| Redirect URL | `https://thefranksstandard.com/auth/verify` in [URL config](https://supabase.com/dashboard/project/rochesyrxiyrxhzmkuwk/auth/url-configuration) |
| Custom SMTP in Supabase | **Leave off** — hook + edge function sends mail |

---

## Optional alerts

| GitHub secret | Why |
|---------------|-----|
| `TELEGRAM_NOTIFY_CHAT_ID` | Ping when deploy or health fails |

---

## If something breaks

| Symptom | Action |
|---------|--------|
| No signup email | `npm run mail:test` then `npm run mail:sync-github` + re-run workflows above |
| Site stale | [Actions](https://github.com/cwfranks77/the-franks-standard/actions) → **Deploy Franks Standard to GitHub Pages** |
| Pay / webhook | [Stripe webhooks](https://dashboard.stripe.com/webhooks) |
| Quick check | `npm run health` |
