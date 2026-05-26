import { json, stripeClient } from '../_shared/stripe.ts'
import { adminClient, markOrderPaid, paidTotalsFromSession } from '../_shared/markOrderPaid.ts'

const WEBHOOK_SECRET = Deno.env.get('STRIPE_WEBHOOK_SECRET') ?? ''

const admin = adminClient()

async function handleCheckoutCompleted (session: {
  id: string
  metadata?: Record<string, string> | null
  payment_intent?: string | { id: string } | null
  client_reference_id?: string | null
  amount_total?: number | null
  total_details?: { amount_tax?: number | null } | null
}) {
  const orderId = session.metadata?.order_id ?? session.client_reference_id ?? ''
  if (!orderId) return

  const totals = paidTotalsFromSession(session)
  await markOrderPaid(admin, {
    orderId,
    sessionId: session.id,
    paymentIntentId: totals.paymentIntentId,
    taxAmount: totals.taxAmount,
    totalPaid: totals.totalPaid,
  })
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
  if (req.method !== 'POST') {
    return json({ error: 'method_not_allowed' }, 405)
  }

  const stripe = stripeClient()
  const signature = req.headers.get('stripe-signature') ?? ''
  const rawBody = await req.text()

  let event
  try {
    if (!WEBHOOK_SECRET) {
      throw new Error('STRIPE_WEBHOOK_SECRET is not configured')
    }
    event = stripe.webhooks.constructEvent(rawBody, signature, WEBHOOK_SECRET)
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