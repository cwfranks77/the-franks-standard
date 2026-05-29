# Owner one-time setup (then stop fixing the same things)

**Last checked:** production health 16/16, signup email working with Auth Hook.

You should **not** need to revisit Supabase Auth Hooks or Redirect URLs unless someone changes them by mistake.

---

## You are DONE with these (do not re-do)

| Item | Status |
|------|--------|
| Live site https://thefranksstandard.com | Deploying via GitHub Actions |
| Supabase project `rochesyrxiyrxhzmkuwk` | Connected |
| Auth Hook Send Email → `.../functions/v1/auth-send-email` | You fixed the URL |
| Redirect `https://thefranksstandard.com/auth/verify` | On your screenshot |
| Stripe webhook + edge functions | Was verified earlier |
| DB migrations 021–027 | Applied via CI |

---

## One thing only you must do now (~3 minutes)

**Add SendGrid to GitHub** so signup email survives the next deploy (today it works because Supabase already has the key; GitHub does not list it yet).

1. Open **[GitHub → Secrets → Actions](https://github.com/cwfranks77/the-franks-standard/settings/secrets/actions)**
2. **New repository secret**
   - Name: `SENDGRID_API_KEY`
   - Value: your SendGrid key (`SG....` from [API Keys](https://app.sendgrid.com/settings/api_keys))
3. Optional second secret: `SENDGRID_FROM_EMAIL` = `info@thefranksstandard.com`
4. Run workflow **[Push SendGrid secrets to Supabase](https://github.com/cwfranks77/the-franks-standard/actions/workflows/push-supabase-sendgrid-secrets.yml)** → **Run workflow**

That is it for core signup. No more Supabase clicking unless mail stops again.

---

## Optional (alerts when something breaks)

| Secret | Why |
|--------|-----|
| `TELEGRAM_NOTIFY_CHAT_ID` | Get a phone ping when deploy or health check fails |

Get chat id: message [@BotFather](https://t.me/BotFather) bot, then open `https://api.telegram.org/bot<TELEGRAM_BOT_TOKEN>/getUpdates` (you already have the bot token in GitHub).

---

## If something breaks later

| Symptom | One link |
|---------|----------|
| Signup / no email | [Auth Hooks](https://supabase.com/dashboard/project/rochesyrxiyrxhzmkuwk/auth/hooks) — check endpoint is the `supabase.co/functions/v1/...` URL |
| Site old / 404 | [GitHub Actions](https://github.com/cwfranks77/the-franks-standard/actions) — re-run **Deploy Franks Standard to GitHub Pages** |
| Pay / webhook | [Stripe webhooks](https://dashboard.stripe.com/webhooks) |
| Everything else | Run `npm run health` locally or check **Production health** workflow in Actions |

---

## Why it felt like “everything keeps breaking”

- **Code** (Cursor/GitHub) and **config** (Supabase dashboard) are separate. Pushing code does not fix a wrong hook URL.
- One wrong paste (dashboard link instead of function URL) blocked all signup mail.
- Missing `SENDGRID_API_KEY` in GitHub means the next “push secrets” workflow cannot refresh mail settings.

After the GitHub secret above, routine deploys should not require you to fix signup again.
