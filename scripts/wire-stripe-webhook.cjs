/**
 * Ensure Stripe webhook points at Supabase stripe-webhook Edge Function.
 * Requires STRIPE_SECRET_KEY in env (live or test).
 *
 *   STRIPE_SECRET_KEY=sk_live_... node scripts/wire-stripe-webhook.cjs
 */
import Stripe from 'stripe'

const SECRET = process.env.STRIPE_SECRET_KEY
if (!SECRET) {
  console.error('Set STRIPE_SECRET_KEY before running.')
  process.exit(1)
}

const WEBHOOK_URL = 'https://rochesyrxiyrxhzmkuwk.supabase.co/functions/v1/stripe-webhook'
const EVENTS = [
  'checkout.session.completed',
  'account.updated',
  'charge.refunded',
]

const stripe = new Stripe(SECRET)

const endpoints = await stripe.webhookEndpoints.list({ limit: 100 })
const existing = endpoints.data.find((e) => e.url === WEBHOOK_URL && e.status !== 'disabled')

if (existing) {
  console.log('Webhook already configured:', existing.id)
  console.log('URL:', existing.url)
  console.log('Events:', existing.enabled_events.join(', '))
  const missing = EVENTS.filter((e) => !existing.enabled_events.includes(e))
  if (missing.length) {
    const updated = await stripe.webhookEndpoints.update(existing.id, {
      enabled_events: [...new Set([...existing.enabled_events, ...EVENTS])],
    })
    console.log('Updated events:', updated.enabled_events.join(', '))
  }
  console.log('')
  console.log('Signing secret: Stripe Dashboard → Webhooks → this endpoint → Reveal')
  console.log('  Must match Supabase secret STRIPE_WEBHOOK_SECRET (whsec_...)')
  console.log('  GitHub: Actions → "Push Stripe secrets to Supabase" after updating STRIPE_WEBHOOK_SECRET')
  console.log('  node scripts/verify-stripe-webhook.cjs')
  process.exit(0)
}

const created = await stripe.webhookEndpoints.create({
  url: WEBHOOK_URL,
  enabled_events: EVENTS,
  description: 'The Franks Standard — Supabase marketplace payments',
})

console.log('Created webhook:', created.id)
console.log('URL:', created.url)
console.log('Signing secret (save to Supabase Edge secrets ONCE):')
console.log(created.secret)
console.log('')
console.log('Run in Supabase project rochesyrxiyrxhzmkuwk:')
console.log('  supabase secrets set STRIPE_WEBHOOK_SECRET=' + created.secret)
console.log('  supabase secrets set STRIPE_SECRET_KEY=' + SECRET.slice(0, 12) + '...')
console.log('  supabase secrets set SITE_URL=https://thefranksstandard.com')
console.log('  supabase secrets set STRIPE_PLATFORM_FEE_BPS=500')
console.log('  supabase secrets set STRIPE_TAX_ENABLED=true')
