import Stripe from 'npm:stripe@14'
import { createClient } from 'npm:@supabase/supabase-js@2'

function json (body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8' },
  })
}

function stripeClient () {
  const key = Deno.env.get('STRIPE_SECRET_KEY') ?? ''
  if (!key) throw new Error('STRIPE_SECRET_KEY is not configured')
  return new Stripe(key, { apiVersion: '2024-06-20' })
}

const SUPABASE_URL = Deno.env.get('SUPABASE_URL') ?? ''
const SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? Deno.env.get('SERVICE_ROLE_KEY') ?? ''
const WEBHOOK_SECRET = Deno.env.get('STRIPE_WEBHOOK_SECRET') ?? ''

const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, { auth: { persistSession: false } })

async function markOrderPaid (params: {
  orderId: string
  sessionId?: string
  paymentIntentId?: string
}) {
  const { orderId, sessionId, paymentIntentId } = params
  const { error } = await admin
    .from('orders')
    .update({
      status: 'paid',
      escrow_status: 'held',
      paid_at: new Date().toISOString(),
      stripe_checkout_session_id: sessionId ?? undefined,
      stripe_payment_intent_id: paymentIntentId ?? undefined,
    })
    .eq('id', orderId)
    .in('status', ['pending'])

  if (error) console.error('markOrderPaid', orderId, error.message)
}

async function handleCheckoutCompleted (session: {
  id: string
  metadata?: Record<string, string> | null
  payment_intent?: string | { id: string } | null
  client_reference_id?: string | null
}) {
  const orderId = session.metadata?.order_id ?? session.client_reference_id ?? ''
  if (!orderId) return
  const pi = session.payment_intent
  const paymentIntentId = typeof pi === 'string' ? pi : pi?.id
  await markOrderPaid({ orderId, sessionId: session.id, paymentIntentId })
}

async function handleAccountUpdated (account: {
  id: string
  charges_enabled?: boolean
  payouts_enabled?: boolean
}) {
  await admin
    .from('profiles')
    .update({
      stripe_charges_enabled: !!account.charges_enabled,
      stripe_payouts_enabled: !!account.payouts_enabled,
    })
    .eq('stripe_account_id', account.id)
}

Deno.serve(async (req) => {
  if (req.method !== 'POST') return json({ error: 'method_not_allowed' }, 405)
  const stripe = stripeClient()
  const signature = req.headers.get('stripe-signature') ?? ''
  const rawBody = await req.text()
  let event
  try {
    if (!WEBHOOK_SECRET) throw new Error('STRIPE_WEBHOOK_SECRET is not configured')
    event = await stripe.webhooks.constructEventAsync(rawBody, signature, WEBHOOK_SECRET)
  } catch (e) {
    const message = e instanceof Error ? e.message : 'invalid_signature'
    return json({ error: message }, 400)
  }
  switch (event.type) {
    case 'checkout.session.completed':
      await handleCheckoutCompleted(event.data.object as Parameters<typeof handleCheckoutCompleted>[0])
      break
    case 'account.updated':
      await handleAccountUpdated(event.data.object as Parameters<typeof handleAccountUpdated>[0])
      break
    default:
      break
  }
  return json({ received: true })
})
