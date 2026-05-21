# Full marketplace payments (Stripe Checkout + Connect)

Per-item checkout runs on **Supabase Edge Functions** (the site stays static on GitHub Pages).

## 1. Supabase SQL

In **Supabase Dashboard → SQL**, run the full file:

`supabase/migrations/003_stripe_payments.sql`

Also ensure `002_dropship_full_automation.sql` ran (creates `orders` table).

## 2. Stripe Dashboard

1. **Developers → API keys** — copy **Secret key** (`sk_live_...` or `sk_test_...` for testing).
2. **Settings → Connect** — enable Connect; platform is the marketplace.
3. **Developers → Webhooks → Add endpoint**
   - URL: `https://<PROJECT_REF>.supabase.co/functions/v1/stripe-webhook`
   - Events: `checkout.session.completed`, `account.updated`
   - Copy **Signing secret** (`whsec_...`).

## 3. Supabase Edge secrets

```bash
supabase login
supabase link --project-ref <PROJECT_REF>

supabase secrets set STRIPE_SECRET_KEY=sk_...
supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_...
supabase secrets set SITE_URL=https://thefranksstandard.com
supabase secrets set STRIPE_PLATFORM_FEE_BPS=500
```

`STRIPE_PLATFORM_FEE_BPS=500` = default 5% platform fee (Starter). Pro sellers use 450 bps (4.5%); Store uses 400 bps (4%). Launch promo: 300 bps (3%) for 90 days. Update the **Pro Payment Link** in Stripe to **$14.99/mo** to match the pricing page.

## 4. Deploy functions

```bash
cd the-franks-standard
supabase functions deploy create-checkout-session
supabase functions deploy stripe-connect-onboard
supabase functions deploy confirm-order-receipt
supabase functions deploy stripe-webhook --no-verify-jwt
```

`stripe-webhook` must use `--no-verify-jwt` so Stripe can POST without a Supabase user JWT.

## 5. Redeploy the website

Push to `master` (GitHub Actions) so buyers get the new **Buy now** button and order pages.

## Flow

| Step | What happens |
|------|----------------|
| Buy now | Edge function creates `orders` row + Stripe Checkout Session for listing price |
| Payment | Stripe webhook sets order `paid`, `escrow_status=held` |
| Ship | Seller marks shipped on `/order/:id` |
| Confirm | Buyer confirms → escrow released; transfer to Connect account if needed |

## Seller payouts

Sellers open **Dashboard → Set up Stripe payouts** (Stripe Connect Express). When `stripe_charges_enabled` is true, checkout uses **destination charges** (seller gets payout minus platform fee automatically).

## Test mode

Use `sk_test_...` and `whsec_...` from test mode webhook; test cards: `4242 4242 4242 4242`.

## Troubleshooting

- **Checkout could not start** — functions not deployed or `STRIPE_SECRET_KEY` missing.
- **Payment succeeds but order stays pending** — webhook URL or secret wrong; check Edge Function logs in Supabase.
- **Seller not paid** — complete Connect onboarding; or buyer must confirm receipt for platform-held orders.