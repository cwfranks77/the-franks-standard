import Stripe from 'stripe'
import { checkoutReturnUrls, resolveCheckoutBaseUrl } from '~/utils/bcCheckout.js'
import { resolveBcCheckoutWholesale } from '#bc-server-utils/petraWholesaleLookup.js'

const PLATFORM_FEE_PERCENT = 0.035 // 3.5% estimated Stripe + platform fee matrix
const LA_TAX_RATE = 0.0445 // 4.45% Louisiana state sales tax rate

function makeOrderId () {
  return `BC-${Date.now().toString(36).toUpperCase()}`
}

function connectDestinationReady (accountId: string) {
  const id = String(accountId || '').trim()
  return id.startsWith('acct_') && !id.includes('Distributor99')
}

/**
 * POST /api/checkout/live-split-payment
 * Live buyer charges via Stripe Checkout + Connect destination split.
 */
export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event)
  const secretKey = config.stripeSecretKey || process.env.STRIPE_SECRET_KEY || ''
  const distributorAccountId =
    config.stripeDistributorConnectAccountId
    || process.env.STRIPE_DISTRIBUTOR_CONNECT_ACCOUNT_ID
    || 'acct_1Distributor99X'

  if (!secretKey) {
    throw createError({
      statusCode: 503,
      statusMessage: 'Stripe is not configured (STRIPE_SECRET_KEY missing).',
    })
  }

  const body = await readBody(event)
  const productName = String(body?.productName || body?.name || '').trim()
  const customerEmail = String(body?.customerEmail || '').trim()
  const retailPrice = body?.retailPrice
  const orderId = String(body?.orderId || '').trim() || makeOrderId()
  const wholesaleCost = resolveBcCheckoutWholesale(body ?? {})

  if (!productName || !customerEmail || retailPrice == null || wholesaleCost == null) {
    throw createError({
      statusCode: 400,
      statusMessage: 'productName, customerEmail, retailPrice, and a known product SKU are required.',
    })
  }

  const retailCents = Math.round(parseFloat(String(retailPrice)) * 100)
  const wholesaleCents = Math.round(parseFloat(String(wholesaleCost)) * 100)

  if (!Number.isFinite(retailCents) || retailCents <= 0 || !Number.isFinite(wholesaleCents) || wholesaleCents < 0) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid retail or wholesale price.' })
  }

  if (wholesaleCents > retailCents) {
    throw createError({ statusCode: 400, statusMessage: 'Wholesale cost cannot exceed retail price.' })
  }

  const laTaxCents = Math.round(retailCents * LA_TAX_RATE)
  const processingFeeCents = Math.round(retailCents * PLATFORM_FEE_PERCENT)
  const totalCustomerGrossCents = retailCents + laTaxCents
  const applicationFeeAmount = totalCustomerGrossCents - wholesaleCents

  if (applicationFeeAmount < 0) {
    throw createError({ statusCode: 400, statusMessage: 'Split math invalid for this product.' })
  }

  const envSiteUrl = String(config.public?.siteUrl || 'https://thefranksstandard.com').replace(/\/$/, '')
  const baseUrl = resolveCheckoutBaseUrl(body?.siteUrl, envSiteUrl)
  const { successPath, cancelPath } = checkoutReturnUrls(baseUrl)

  const useConnect = connectDestinationReady(distributorAccountId)
  console.log(`\n[STRIPE] Processing checkout for Order #${orderId} (${useConnect ? 'Connect split' : 'direct platform'})`)
  console.log(` -> Gross Customer Charge: $${(totalCustomerGrossCents / 100).toFixed(2)} (Includes 4.45% LA Tax)`)
  console.log(` -> Processing fee estimate: $${(processingFeeCents / 100).toFixed(2)}`)

  const stripe = new Stripe(secretKey)

  try {
    const sessionParams: Stripe.Checkout.SessionCreateParams = {
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
      success_url: `${baseUrl}${successPath}?order=${encodeURIComponent(orderId)}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}${cancelPath}`,
      metadata: {
        orderId,
        productName,
        productSku: String(body?.productSku || body?.productId || ''),
        customerZip: String(body?.customerZip || ''),
        shippingAddress: String(body?.shippingAddress || '').slice(0, 500),
        wholesaleCents: String(wholesaleCents),
        retailCents: String(retailCents),
        laTaxCents: String(laTaxCents),
        checkoutMode: useConnect ? 'connect' : 'direct',
      },
    }

    if (useConnect) {
      sessionParams.payment_intent_data = {
        application_fee_amount: applicationFeeAmount,
        transfer_data: { destination: distributorAccountId },
        metadata: { orderId, productName },
      }
    }

    const session = await stripe.checkout.sessions.create(sessionParams)

    console.log(' -> SUCCESS: Stripe Session Created. Routing Buyer to Secure Check-out Port.')

    return {
      url: session.url,
      orderId,
      sessionId: session.id,
    }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Stripe checkout failed'
    console.error(' -> STRIPE TRANSACTION FATAL ERROR:', message)
    throw createError({ statusCode: 502, statusMessage: message })
  }
})
