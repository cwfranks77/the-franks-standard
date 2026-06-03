import { corsHeaders, json, siteUrl, stripeClient } from '../_shared/stripe.ts'

const LA_TAX_RATE = 0.0445

function makeOrderId () {
  return `BC-${Date.now().toString(36).toUpperCase()}`
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }
  if (req.method !== 'POST') {
    return json({ error: 'method_not_allowed' }, 405)
  }

  try {
    const body = await req.json().catch(() => ({})) as Record<string, unknown>
    const productName = String(body.productName || body.name || '').trim()
    const customerEmail = String(body.customerEmail || '').trim()
    const retailPrice = body.retailPrice
    const wholesaleCost = body.wholesaleCost
    const orderId = String(body.orderId || '').trim() || makeOrderId()

    if (!productName || !customerEmail || retailPrice == null || wholesaleCost == null) {
      return json({ error: 'missing_fields', message: 'productName, customerEmail, retailPrice, and wholesaleCost are required.' }, 400)
    }

    const retailCents = Math.round(parseFloat(String(retailPrice)) * 100)
    const wholesaleCents = Math.round(parseFloat(String(wholesaleCost)) * 100)

    if (!Number.isFinite(retailCents) || retailCents <= 0 || !Number.isFinite(wholesaleCents) || wholesaleCents < 0) {
      return json({ error: 'invalid_price' }, 400)
    }

    if (wholesaleCents > retailCents) {
      return json({ error: 'invalid_split', message: 'Wholesale cost cannot exceed retail price.' }, 400)
    }

    const laTaxCents = Math.round(retailCents * LA_TAX_RATE)
    const totalCustomerGrossCents = retailCents + laTaxCents
    const applicationFeeAmount = totalCustomerGrossCents - wholesaleCents

    if (applicationFeeAmount < 0) {
      return json({ error: 'invalid_split' }, 400)
    }

    const distributorAccountId =
      Deno.env.get('STRIPE_DISTRIBUTOR_CONNECT_ACCOUNT_ID') || 'acct_1Distributor99X'
    const baseUrl = siteUrl()
    const stripe = stripeClient()

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'usd',
          product_data: {
            name: `B&C Performance Audio - ${productName}`,
            description: `Order ID: #${orderId} - Fulfill Sync Active`,
          },
          unit_amount: totalCustomerGrossCents,
        },
        quantity: 1,
      }],
      mode: 'payment',
      customer_email: customerEmail,
      success_url: `${baseUrl}/order/success?order=${encodeURIComponent(orderId)}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/shop?cancelled=1`,
      metadata: {
        orderId,
        productName,
        productSku: String(body.productSku || body.productId || ''),
        customerZip: String(body.customerZip || ''),
        shippingAddress: String(body.shippingAddress || '').slice(0, 500),
        wholesaleCents: String(wholesaleCents),
        retailCents: String(retailCents),
        laTaxCents: String(laTaxCents),
      },
      payment_intent_data: {
        application_fee_amount: applicationFeeAmount,
        transfer_data: { destination: distributorAccountId },
        metadata: { orderId, productName },
      },
    })

    return json({
      url: session.url,
      orderId,
      sessionId: session.id,
      totals: {
        retailCents,
        laTaxCents,
        totalCustomerGrossCents,
        wholesaleCents,
        applicationFeeAmount,
        processingFeeCents: Math.round(retailCents * 0.035),
      },
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Stripe checkout failed'
    return json({ error: 'stripe_error', message }, 502)
  }
})
