import { createClient } from 'npm:@supabase/supabase-js@2'
import { corsHeaders, json, siteUrl, stripeClient } from '../_shared/stripe.ts'
import { platformServiceTaxOptions, TAX_CODE_SERVICES } from '../_shared/stripeTax.ts'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL') ?? ''
const SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? Deno.env.get('SERVICE_ROLE_KEY') ?? ''

type CheckoutType = 'pro' | 'listing_fee' | 'dispute_fee'

function centsFor (type: CheckoutType): number | null {
  if (type === 'pro') {
    const n = Number.parseInt(Deno.env.get('STRIPE_PRO_MONTHLY_CENTS') ?? '1499', 10)
    return Number.isFinite(n) && n > 0 ? n : 1499
  }
  if (type === 'listing_fee') {
    const n = Number.parseInt(Deno.env.get('STRIPE_LISTING_FEE_CENTS') ?? '', 10)
    return Number.isFinite(n) && n > 0 ? n : null
  }
  const n = Number.parseInt(Deno.env.get('STRIPE_DISPUTE_FEE_CENTS') ?? '', 10)
  return Number.isFinite(n) && n > 0 ? n : null
}

function lineItemFor (type: CheckoutType, amountCents: number) {
  if (type === 'pro') {
    return {
      quantity: 1,
      price_data: {
        currency: 'usd',
        unit_amount: amountCents,
        tax_behavior: 'exclusive' as const,
        recurring: { interval: 'month' as const },
        product_data: {
          name: 'Pro Seller plan',
          tax_code: TAX_CODE_SERVICES,
        },
      },
    }
  }
  const names: Record<Exclude<CheckoutType, 'pro'>, string> = {
    listing_fee: 'Listing or renewal fee',
    dispute_fee: 'Dispute or mediation fee',
  }
  return {
    quantity: 1,
    price_data: {
      currency: 'usd',
      unit_amount: amountCents,
      tax_behavior: 'exclusive' as const,
      product_data: {
        name: names[type],
        tax_code: TAX_CODE_SERVICES,
      },
    },
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }
  if (req.method !== 'POST') {
    return json({ error: 'method_not_allowed' }, 405)
  }

  try {
    const authHeader = req.headers.get('Authorization') ?? ''
    if (!authHeader.startsWith('Bearer ')) {
      return json({ error: 'unauthorized' }, 401)
    }

    const supabaseUser = createClient(SUPABASE_URL, Deno.env.get('SUPABASE_ANON_KEY') ?? '', {
      global: { headers: { Authorization: authHeader } },
      auth: { persistSession: false },
    })
    const { data: { user }, error: userError } = await supabaseUser.auth.getUser()
    if (userError || !user) {
      return json({ error: 'unauthorized' }, 401)
    }

    const body = await req.json().catch(() => ({})) as { checkout_type?: string }
    const checkoutType = String(body.checkout_type ?? '').trim() as CheckoutType
    if (!['pro', 'listing_fee', 'dispute_fee'].includes(checkoutType)) {
      return json({ error: 'checkout_type_required' }, 400)
    }

    const amountCents = centsFor(checkoutType)
    if (!amountCents) {
      return json({ error: 'fee_amount_not_configured', detail: checkoutType }, 500)
    }

    const stripe = stripeClient()
    const base = siteUrl()
    const sessionParams: Parameters<typeof stripe.checkout.sessions.create>[0] = {
      mode: checkoutType === 'pro' ? 'subscription' : 'payment',
      customer_email: user.email ?? undefined,
      line_items: [lineItemFor(checkoutType, amountCents)],
      metadata: {
        checkout_type: checkoutType,
        user_id: user.id,
      },
      success_url: `${base}/dashboard?checkout=success&type=${checkoutType}`,
      cancel_url: `${base}/pay?checkout=cancelled&type=${checkoutType}`,
      ...platformServiceTaxOptions(),
    }

    const session = await stripe.checkout.sessions.create(sessionParams)
    return json({ url: session.url, session_id: session.id, checkout_type: checkoutType })
  } catch (e) {
    const message = e instanceof Error ? e.message : 'checkout_failed'
    return json({ error: message }, 500)
  }
})