import { corsHeaders, json, stripeClient } from '../_shared/stripe.ts'

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }
  if (req.method !== 'POST') {
    return json({ error: 'method_not_allowed' }, 405)
  }

  try {
    const body = await req.json().catch(() => ({})) as { session_id?: string }
    const sessionId = String(body.session_id ?? '').trim()
    if (!sessionId.startsWith('cs_')) {
      return json({ error: 'session_id_required' }, 400)
    }

    const stripe = stripeClient()
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['total_details.breakdown', 'line_items'],
    })

    const lineItems = session.line_items?.data?.map((li) => ({
      description: li.description,
      amount_subtotal: li.amount_subtotal,
      amount_tax: li.amount_tax,
      tax_behavior: li.price?.tax_behavior,
    })) ?? []

    return json({
      id: session.id,
      status: session.status,
      automatic_tax: session.automatic_tax,
      billing_address_collection: session.billing_address_collection,
      customer_details: session.customer_details,
      amount_subtotal: session.amount_subtotal,
      amount_total: session.amount_total,
      total_details: session.total_details,
      line_items: lineItems,
    })
  } catch (e) {
    const message = e instanceof Error ? e.message : 'inspect_failed'
    return json({ error: message }, 500)
  }
})