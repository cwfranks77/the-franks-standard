# Fix Stripe webhook failures (The Franks Standard)

Stripe emailed about failures to:

`https://rochesyrxiyrxhzmkuwk.supabase.co/functions/v1/stripe-webhook`

Payments can still succeed in Stripe while **orders stay `pending`** if this webhook does not return HTTP **200**.

## Quick diagnosis

```bash
node scripts/verify-stripe-webhook.cjs
```

| Result | Meaning |
|--------|---------|
| GET **503** + `hasWebhookSecret: false` | `STRIPE_WEBHOOK_SECRET` not set in Supabase Edge secrets |
| POST **400** + `No stripe-signature` | Function is deployed (good) |
| Stripe Dashboard still failing | **Signing secret mismatch** — whsec in Supabase ≠ whsec on that endpoint |

## Fix (live mode)

### 1. Stripe Dashboard

1. [Stripe → Developers → Webhooks](https://dashboard.stripe.com/webhooks) (**Live** mode, not Test).
2. Open the endpoint whose URL is exactly:
   `https://rochesyrxiyrxhzmkuwk.supabase.co/functions/v1/stripe-webhook`
3. **Reveal** the **Signing secret** (`whsec_...`).
4. Under **Events**, enable at least:
   - `checkout.session.completed`
   - `account.updated`
   - `charge.refunded` (refunds from Dashboard or ops)

If the URL is wrong or you have duplicate endpoints, delete the bad one or update the URL.

### 2. Supabase Edge secrets

In [Supabase](https://supabase.com/dashboard/project/rochesyrxiyrxhzmkuwk/settings/functions) → Edge Functions → Secrets, set:

| Secret | Value |
|--------|--------|
| `STRIPE_WEBHOOK_SECRET` | `whsec_...` from step 1 (this endpoint only) |
| `STRIPE_SECRET_KEY` | `sk_live_...` |
| `SITE_URL` | `https://thefranksstandard.com` |
| `STRIPE_PLATFORM_FEE_BPS` | `500` |

Or from repo (GitHub secrets must be set first):

**Actions → Push Stripe secrets to Supabase → Run workflow**

### 3. Redeploy the function

**Actions → Deploy Supabase Edge Functions** (push to `master` on `supabase/functions/**` also deploys).

Deploy command locally:

```bash
supabase functions deploy stripe-webhook --no-verify-jwt --project-ref rochesyrxiyrxhzmkuwk
```

`--no-verify-jwt` is required so Stripe can POST without a Supabase user JWT.

### 4. Send a test event

Stripe Dashboard → your webhook → **Send test webhook** → `checkout.session.completed`.

Expect **200** and body like `{"received":true,"type":"checkout.session.completed"}`.

### 5. Reconcile stuck orders

If buyers paid while the webhook was down, run (with service role):

```bash
node scripts/reconcile-stripe-orders.cjs
```

## Common mistakes

- Pasting **test mode** `whsec_` while the failing endpoint is **live** (or the reverse).
- Rotating the signing secret in Stripe without updating Supabase.
- Two webhook endpoints — fixing secrets on the wrong one.
- `STRIPE_SECRET_KEY` missing: handler used to crash with 500 before processing; redeploy latest `stripe-webhook` after setting secrets.

## Health check

```bash
curl https://rochesyrxiyrxhzmkuwk.supabase.co/functions/v1/stripe-webhook
```

Should return JSON with `"ok": true` when all secrets are set.
