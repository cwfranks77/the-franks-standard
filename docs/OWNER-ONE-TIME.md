# Owner one-time setup (then hands-off)

---

## 1. Signup email (SendGrid — recommended)

| Step | Action |
|------|--------|
| 1 | [SendGrid](https://app.sendgrid.com/settings/api_keys) → create API key with **Mail Send** |
| 2 | [Sender Authentication](https://app.sendgrid.com/settings/sender_auth) → verify `info@thefranksstandard.com` or domain `thefranksstandard.com` |
| 3 | [GitHub Secrets](https://github.com/cwfranks77/the-franks-standard/settings/secrets/actions) → `SENDGRID_API_KEY` = `SG....` |
| 4 | Optional: `SENDGRID_FROM_EMAIL` = `info@thefranksstandard.com` |
| 5 | Push to `master` or run **Deploy Supabase Edge Functions** — CI pushes SendGrid secrets automatically |
| 6 | [Auth Hooks](https://supabase.com/dashboard/project/rochesyrxiyrxhzmkuwk/auth/hooks) → Send Email **ON** → `https://rochesyrxiyrxhzmkuwk.supabase.co/functions/v1/auth-send-email` |
| 7 | [URL config](https://supabase.com/dashboard/project/rochesyrxiyrxhzmkuwk/auth/url-configuration) → `https://thefranksstandard.com/auth/verify` |
| 8 | Leave **Custom SMTP** off in Supabase |

Test: incognito register at https://thefranksstandard.com/auth/register with a personal Gmail.

---

## 2. Database migration (COA rules for general merch)

Run once if not already applied via CI:

- Migration `028_listing_coa_none_general_merch.sql` — allows `coa_type = 'none'` for general categories.

GitHub Action **Apply Supabase migrations** runs on push to `master` when `supabase/migrations/**` changes.

---

## 3. Listing rules (automatic in code)

| Category type | COA required? |
|---------------|----------------|
| Sports cards, coins, watches, sneakers, luxury, vintage collectibles, etc. | **Yes** |
| Pet supplies, general merchandise, electronics, apparel, office, etc. | **No** — accurate listing only |

Sellers pick category on `/sell`; COA section shows or hides automatically.

---

## 4. Optional alerts

| Secret | Why |
|--------|-----|
| `TELEGRAM_NOTIFY_CHAT_ID` | Ping when deploy or health fails |

---

## If something breaks

| Symptom | Action |
|---------|--------|
| No signup email | Check SendGrid sender + `SENDGRID_API_KEY` in GitHub; re-run edge deploy workflow |
| Collectible listing blocked | Add COA, guarantee, or Franks issued COA |
| General item asks for COA | Pick a non-collectible category (e.g. General Merchandise) |
| Site stale | [Actions](https://github.com/cwfranks77/the-franks-standard/actions) → Deploy GitHub Pages |
| Quick check | `npm run health` |
