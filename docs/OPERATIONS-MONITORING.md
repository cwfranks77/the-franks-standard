# 24/7 operations monitoring

## Automated checks

| What | When | Alert |
|------|------|-------|
| `production-health.yml` | Daily + after site/function deploy | Telegram (`TELEGRAM_BOT_TOKEN`, `TELEGRAM_NOTIFY_CHAT_ID`) |
| `npm run health` | Local / CI | Exit code 1 on failure |
| `npm run auth:verify` | With health workflow | Auth email hook |

## What health checks cover

- Live site + Supabase project id
- Core tables and edge functions (payments, Connect, auth email, checkout)
- Signup hook secret must **not** return `missing_send_email_hook_secret`

## Stripe Connect payouts

Sellers complete Stripe Express onboarding, then:

1. Webhook `account.updated` sets `stripe_charges_enabled` on `profiles`, **or**
2. Dashboard **Refresh payout status** calls `stripe-connect-sync` (fixes missed webhooks).

Without `stripe_charges_enabled`, checkout uses platform escrow (buyer confirm → manual transfer path).

## Support chat decision

**Help chat** (`AiSupportDrawer`) stays — rule-based, no video, works offline of API keys. Best for launch: instant answers on COA, escrow, fees, Open Door.

Add human live chat later only if volume requires it; route urgent issues to phone + contact form + ops panel.

## Owner alerts

Set GitHub secrets:

- `TELEGRAM_BOT_TOKEN` + `TELEGRAM_NOTIFY_CHAT_ID` — immediate push on health failure
- Optional: `NUXT_PUBLIC_SOCIAL_*` URLs for footer Follow us links

## Manual fixes health cannot auto-run

- Stripe Dashboard webhook URL + `account.updated` event
- Supabase Auth hook secret → `npm run auth:push-hook-secret`
- Stripe Connect platform settings (Express enabled)

When health fails, open Actions → **Production health check** log, fix the named check, re-run workflow.
