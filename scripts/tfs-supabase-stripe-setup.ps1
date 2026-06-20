# Safe TFS Supabase + Stripe setup (Windows) — use INSTEAD of tfs_full_setup.sh
# Does NOT overwrite functions or create a second orders/sellers schema.
#
# Run from repo root:
#   powershell -ExecutionPolicy Bypass -File scripts/tfs-supabase-stripe-setup.ps1
#
# Prerequisites: npx supabase login (once), database password for link if prompted.

$ErrorActionPreference = 'Stop'
Set-Location (Join-Path $PSScriptRoot '..')

$ProjectRef = 'rochesyrxiyrxhzmkuwk'
$SiteUrl = 'https://thefranksstandard.com'

Write-Host ''
Write-Host '=== The Franks Standard — Supabase + Stripe setup ===' -ForegroundColor Cyan
Write-Host 'Do NOT run tfs_full_setup.sh on this repo (wrong paths, duplicate schema).' -ForegroundColor Yellow
Write-Host ''

Write-Host 'Step 1: SQL in Supabase Dashboard -> SQL Editor (run once if not done):' -ForegroundColor Cyan
Write-Host '  - supabase/migrations/003_stripe_payments.sql'
Write-Host '  - supabase/migrations/042_webhook_idempotency_and_payouts.sql'
Write-Host ''

Write-Host 'Step 2: Link CLI to your project...' -ForegroundColor Cyan
npx --yes supabase@latest link --project-ref $ProjectRef
Write-Host ''

Write-Host 'Step 3: Deploy edge functions (correct names)...' -ForegroundColor Cyan
$noJwt = @('stripe-webhook', 'ops-create-transfer', 'ops-session', 'reconcile-orders', 'inventory-source-webhook', 'shipping-tracker-webhook')
$withJwt = @(
  'create-checkout-session',
  'create-platform-checkout-session',
  'stripe-connect-onboard',
  'stripe-connect-sync',
  'confirm-order-receipt'
)

foreach ($fn in $noJwt) {
  Write-Host "  Deploy $fn ..." -ForegroundColor DarkGray
  npx --yes supabase@latest functions deploy $fn --no-verify-jwt --project-ref $ProjectRef
}
foreach ($fn in $withJwt) {
  Write-Host "  Deploy $fn ..." -ForegroundColor DarkGray
  npx --yes supabase@latest functions deploy $fn --project-ref $ProjectRef
}

Write-Host ''
Write-Host 'Step 4: Set Edge secrets (use test or live keys from Stripe Dashboard):' -ForegroundColor Cyan
Write-Host "  npx supabase secrets set STRIPE_SECRET_KEY=sk_... STRIPE_WEBHOOK_SECRET=whsec_... SITE_URL=$SiteUrl STRIPE_PLATFORM_FEE_BPS=500 --project-ref $ProjectRef"
Write-Host '  Or: node scripts/push-stripe-secrets-from-env.cjs'
Write-Host '  Do NOT set SUPABASE_URL / SERVICE_ROLE_KEY manually (auto-injected).'
Write-Host ''

Write-Host 'Step 5: Stripe Dashboard webhook URL:' -ForegroundColor Cyan
Write-Host "  https://${ProjectRef}.supabase.co/functions/v1/stripe-webhook"
Write-Host '  Events: checkout.session.completed, payment_intent.succeeded, payment_intent.payment_failed, charge.refunded, account.updated'
Write-Host ''

Write-Host 'Step 6: Verify' -ForegroundColor Cyan
Write-Host '  npm run stripe:webhook:verify'
Write-Host ''

Write-Host 'Already in this repo (no bash script needed):' -ForegroundColor Green
Write-Host '  - supabase/functions/stripe-webhook'
Write-Host '  - supabase/functions/stripe-connect-onboard'
Write-Host '  - supabase/functions/ops-create-transfer'
Write-Host '  - components/CrestLogo.vue + public/brand/crest.svg'
Write-Host '  - composables/useStripe.ts'
Write-Host '  - pages/checkout.vue'
Write-Host ''
Write-Host 'Done.' -ForegroundColor Green
