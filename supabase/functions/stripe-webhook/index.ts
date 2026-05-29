import Stripe from 'npm:stripe@14'
import { json, stripeClient } from '../_shared/stripe.ts'
import { markOrderRefunded } from '../_shared/forceRefund.ts'
import { adminClient, markOrderPaid, paidTotalsFromSession } from '../_shared/markOrderPaid.ts'

const WEBHOOK_SECRET = Deno.env.get('STRIPE_WEBHOOK_SECRET') ?? ''

const admin = adminClient()

function configStatus () {
  const hasWebhookSecret = WEBHOOK_SECRET.length > 0
  const hasStripeKey = !!(Deno.env.get('STRIPE_SECRET_KEY') ?? '')
  const hasServiceRole = !!(
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? Deno.env.get('SERVICE_ROLE_KEY') ?? ''
  )
  const hasSupabaseUrl = !!(Deno.env.get('SUPABASE_URL') ?? '')
  return {
    ok: hasWebhookSecret && hasStripeKey && hasServiceRole && hasSupabaseUrl,
    hasWebhookSecret,
    hasStripeKey,
    hasServiceRole,
    hasSupabaseUrl,
  }
}

async function handleCheckoutCompleted (session: {
  id: string
  metadata?: Record<string, string> | null
  payment_intent?: string | { id: string } | null
  client_reference_id?: string | null
  amount_total?: number | null
  total_details?: { amount_tax?: number | null } | null
  customer_details?: {
    email?: string | null
    name?: string | null
    address?: {
      line1?: string | null
      line2?: string | null
      city?: string | null
      state?: string | null
      postal_code?: string | null
      country?: string | null
    } | null
  } | null
}) {
  const orderId = session.metadata?.order_id ?? session.client_reference_id ?? ''
  if (!orderId) return

  const totals = paidTotalsFromSession(session)
  const addr = session.customer_details?.address
  const result = await markOrderPaid(admin, {
    orderId,
    sessionId: session.id,
    paymentIntentId: totals.paymentIntentId,
    taxAmount: totals.taxAmount,
    totalPaid: totals.totalPaid,
    buyerEmail: session.customer_details?.email ?? null,
    buyerName: session.customer_details?.name ?? null,
    shippingAddress: addr ? {
      line1: addr.line1,
      line2: addr.line2,
      city: addr.city,
      state: addr.state,
      postal_code: addr.postal_code,
      country: addr.country,
    } : null,
  })
  if (!result.ok) {
    throw new Error(result.error ?? 'markOrderPaid failed')
  }
}

async function handleChargeRefunded (charge: {
  id: string
  payment_intent?: string | { id: string } | null
  amount_refunded?: number
  metadata?: Record<string, string> | null
}) {
  const orderId = charge.metadata?.order_id ?? ''
  const piRaw = charge.payment_intent
  const paymentIntentId = typeof piRaw === 'string' ? piRaw : piRaw?.id ?? null
  if (!orderId && !paymentIntentId) return

  let query = admin.from('orders').select('id, status, stripe_refund_id').limit(1)
  if (orderId) {
    query = query.eq('id', orderId)
  } else if (paymentIntentId) {
    query = query.eq('stripe_payment_intent_id', paymentIntentId)
  }
  const { data: order, error } = await query.maybeSingle()
  if (error) throw new Error(error.message)
  if (!order || order.status === 'refunded' || order.stripe_refund_id) return

  const refundAmount = charge.amount_refunded
    ? Math.round(charge.amount_refunded) / 100
    : 0

  await markOrderRefunded(admin, {
    orderId: order.id,
    stripeRefundId: `charge_refund_${charge.id}`,
    refundAmount,
    reason: charge.metadata?.refund_reason ?? 'stripe_webhook',
    initiatedBy: 'stripe_webhook',
  })
}

async function handleAccountUpdated (account: {
  id: string
  charges_enabled?: boolean
  payouts_enabled?: boolean
}) {
  const { error } = await admin
    .from('profiles')
    .update({
      stripe_charges_enabled: !!account.charges_enabled,
      stripe_payouts_enabled: !!account.payouts_enabled,
    })
    .eq('stripe_account_id', account.id)
  if (error) throw new Error(error.message)
}

async function dispatchEvent (event: Stripe.Event) {
  switch (event.type) {
    case 'checkout.session.completed':
      await handleCheckoutCompleted(event.data.object as Parameters<typeof handleCheckoutCompleted>[0])
      break
    case 'account.updated':
      await handleAccountUpdated(event.data.object as Parameters<typeof handleAccountUpdated>[0])
      break
    case 'charge.refunded':
      await handleChargeRefunded(event.data.object as Parameters<typeof handleChargeRefunded>[0])
      break
    default:
      break
  }
}

// CI deploy: explicit --project-ref on all edge functions (2026-05-29)
Deno.serve(async (req) => {
  if (req.method === 'GET' || req.method === 'HEAD') {
    const cfg = configStatus()
    return json({
      service: 'stripe-webhook',
      ...cfg,
      hint: cfg.ok
        ? 'Endpoint reachable. Stripe POSTs with Stripe-Signature header.'
        : 'Set missing secrets in Supabase Edge Functions secrets, then redeploy.',
    }, cfg.ok ? 200 : 503)
  }

  if (req.method !== 'POST') {
    return json({ error: 'method_not_allowed' }, 405)
  }

  const cfg = configStatus()
  if (!cfg.hasWebhookSecret) {
    console.error('stripe-webhook: STRIPE_WEBHOOK_SECRET missing')
    return json({ error: 'STRIPE_WEBHOOK_SECRET is not configured' }, 503)
  }
  if (!cfg.hasServiceRole || !cfg.hasSupabaseUrl) {
    console.error('stripe-webhook: Supabase admin env missing')
    return json({ error: 'Supabase service role not configured' }, 503)
  }

  const signature = req.headers.get('stripe-signature') ?? ''
  const rawBody = await req.text()

  let event: Stripe.Event
  try {
    event = await Stripe.webhooks.constructEventAsync(rawBody, signature, WEBHOOK_SECRET)
  } catch (e) {
    const message = e instanceof Error ? e.message : 'invalid_signature'
    console.error('stripe-webhook: signature', message)
    return json({ error: message }, 400)
  }

  try {
    stripeClient()
    await dispatchEvent(event)
  } catch (e) {
    const message = e instanceof Error ? e.message : 'handler_error'
    console.error('stripe-webhook:', event.type, message)
    return json({ error: message, type: event.type }, 500)
  }

  return json({ received: true, type: event.type })
})
