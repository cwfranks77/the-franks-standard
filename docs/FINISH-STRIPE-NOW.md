# Finish Stripe payments

Supabase project: rochesyrxiyrxhzmkuwk

## Secrets go on SUPABASE (not only Railway)

https://supabase.com/dashboard/project/rochesyrxiyrxhzmkuwk/settings/functions

STRIPE_SECRET_KEY, SITE_URL, STRIPE_PLATFORM_FEE_BPS=500, then STRIPE_WEBHOOK_SECRET

## Stripe webhook URL (Live)

https://dashboard.stripe.com/webhooks/create

Endpoint URL:
https://rochesyrxiyrxhzmkuwk.supabase.co/functions/v1/stripe-webhook

Events: checkout.session.completed, account.updated

## Deploy functions

powershell -ExecutionPolicy Bypass -File scripts\setup-stripe-payments.ps1