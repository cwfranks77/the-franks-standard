/**
 * Verify Supabase stripe-webhook is reachable and secrets are wired.
 *
 *   node scripts/verify-stripe-webhook.cjs
 *
 * Fix signing errors:
 *   Stripe Dashboard → Developers → Webhooks → your endpoint → Signing secret
 *   Copy whsec_... into GitHub secret STRIPE_WEBHOOK_SECRET, then run workflow
 *   "Push Stripe secrets to Supabase" (workflow_dispatch).
 */
const WEBHOOK_URL = 'https://rochesyrxiyrxhzmkuwk.supabase.co/functions/v1/stripe-webhook'

async function main () {
  console.log('Checking', WEBHOOK_URL)

  const health = await fetch(WEBHOOK_URL, { method: 'GET' })
  const healthBody = await health.text()
  console.log('GET health:', health.status, healthBody)

  const probe = await fetch(WEBHOOK_URL, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: '{}',
  })
  const probeBody = await probe.text()
  console.log('POST (no signature):', probe.status, probeBody)

  if (health.status === 503) {
    console.error('\nFAIL: Edge secrets missing. Set in Supabase (project rochesyrxiyrxhzmkuwk):')
    console.error('  STRIPE_WEBHOOK_SECRET=whsec_...  (from Stripe webhook signing secret)')
    console.error('  STRIPE_SECRET_KEY=sk_live_...')
    console.error('  SITE_URL=https://thefranksstandard.com')
    console.error('Then: GitHub → Actions → "Push Stripe secrets to Supabase" → Run workflow')
    process.exit(1)
  }

  if (probe.status === 400 && probeBody.includes('stripe-signature')) {
    console.log('\nOK: Function is deployed; signature check is active.')
    console.log('If Stripe still reports failures, the whsec in Supabase must match')
    console.log('the signing secret on THIS webhook endpoint in live mode.')
    console.log('\nStripe Dashboard:')
    console.log('  https://dashboard.stripe.com/webhooks')
    console.log('  Endpoint URL must be exactly:')
    console.log('  ' + WEBHOOK_URL)
    process.exit(0)
  }

  console.warn('\nUnexpected response — check Supabase function logs.')
  process.exit(1)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
