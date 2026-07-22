/**
 * B&C storefront checkout — Stripe Checkout with tax from SHIPPING address only
 * (Louisiana Marketplace Facilitator / Act 22). Billing address is never used for tax.
 */
import { corsHeaders, json, siteUrl, stripeClient } from '../_shared/stripe.ts'
import { marketplaceListingTaxOptions, TAX_CODE_TANGIBLE } from '../_shared/stripeTax.ts'

function makeOrderId () {
  return `BC-${Date.now().toString(36).toUpperCase()}`
}

function connectDestinationReady (accountId: string) {
  const id = String(accountId || '').trim()
  return id.startsWith('acct_') && !id.includes('Distributor99')
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
    const productSku = String(body.productSku || body.productId || '').trim()
    const customerZip = String(body.customerZip || '').trim().slice(0, 10)
    const shippingAddress = String(body.shippingAddress || '').trim().slice(0, 500)
    const orderId = String(body.orderId || '').trim() || makeOrderId()
    const retailPrice = body.retailPrice
    const wholesaleCost = body.wholesaleCost

    if (!productName || !customerEmail || retailPrice == null) {
      return json({
        error: 'missing_fields',
        message: 'productName, customerEmail, and retailPrice are required.',
      }, 400)
    }

    const retailCents = Math.round(parseFloat(String(retailPrice)) * 100)
    if (!Number.isFinite(retailCents) || retailCents <= 0) {
      return json({ error: 'invalid_price' }, 400)
    }

    let wholesaleCents = 0
    if (wholesaleCost != null && wholesaleCost !== '') {
      wholesaleCents = Math.round(parseFloat(String(wholesaleCost)) * 100)
      if (!Number.isFinite(wholesaleCents) || wholesaleCents < 0) {
        return json({ error: 'invalid_wholesale' }, 400)
      }
      if (wholesaleCents > retailCents) {
        return json({ error: 'invalid_split', message: 'Wholesale cost cannot exceed retail price.' }, 400)
      }
    }

    const distributorAccountId =
      Deno.env.get('STRIPE_DISTRIBUTOR_CONNECT_ACCOUNT_ID') || ''
    const useConnect = wholesaleCents > 0 && connectDestinationReady(distributorAccountId)

    const requestedBase = String(body.siteUrl || '').trim().replace(/\/$/, '')
    const baseUrl = requestedBase || siteUrl()
    const isBcSite = /bcpoweraudio\.com/i.test(baseUrl)
    const successPath = isBcSite ? '/bc-audio/order-success' : '/order/success'
    const cancelPath = isBcSite ? '/bc-audio/catalog?cancelled=1' : '/bc-audio/catalog?cancelled=1'

    const stripe = stripeClient()

    // Retail only in the line item — Stripe Tax adds sales tax from the
    // shipping address collected at checkout (never billing address).
    const sessionParams: Record<string, unknown> = {
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'usd',
          product_data: {
            name: `B&C Performance Audio — ${productName}`,
            description: productSku ? `SKU ${productSku} · Order ${orderId}` : `Order ${orderId}`,
            tax_code: TAX_CODE_TANGIBLE,
          },
          unit_amount: retailCents,
        },
        quantity: 1,
      }],
      mode: 'payment',
      customer_email: customerEmail,
      success_url: `${baseUrl}${successPath}?order=${encodeURIComponent(orderId)}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}${cancelPath}`,
      metadata: {
        orderId,
        productName,
        productSku,
        customerZip,
        shippingAddress,
        retailCents: String(retailCents),
        wholesaleCents: String(wholesaleCents),
        taxBasis: 'shipping_address',
        brand: 'bc_performance_audio',
      },
      ...marketplaceListingTaxOptions(),
    }

    if (useConnect) {
      // Application fee keeps tax + margin on the platform; wholesale transfers to distributor.
      sessionParams.payment_intent_data = {
        application_fee_amount: retailCents - wholesaleCents,
        transfer_data: { destination: distributorAccountId },
        metadata: { orderId, productName, productSku },
      }
    }

    const session = await stripe.checkout.sessions.create(sessionParams as any)

    return json({
      url: session.url,
      orderId,
      sessionId: session.id,
      taxBasis: 'shipping_address',
      totals: {
        retailCents,
        wholesaleCents,
      },
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Stripe checkout failed'
    return json({ error: 'stripe_error', message }, 502)
  }
})
