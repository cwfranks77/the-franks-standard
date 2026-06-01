import { createClient } from 'npm:@supabase/supabase-js@2'
import { corsHeaders, json } from '../_shared/stripe.ts'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL') ?? ''
const SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? Deno.env.get('SERVICE_ROLE_KEY') ?? ''
const ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY') ?? ''

type SplitBody = {
  productId?: string
  retailPrice?: number | string
  wholesaleCost?: number | string
  distributorId?: string
}

function dollars(value: unknown): number {
  const n = typeof value === 'number'
    ? value
    : Number.parseFloat(String(value ?? '').replace(/[^0-9.]/g, ''))
  return Number.isFinite(n) ? Math.round(n * 100) / 100 : 0
}

function cents(value: number): number {
  return Math.round(value * 100)
}

function stripeProcessingFee(retailPrice: number): number {
  return Math.round((retailPrice * 0.029 + 0.30) * 100) / 100
}

function isUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value)
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

    const userClient = createClient(SUPABASE_URL, ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
      auth: { persistSession: false },
    })
    const { data: { user }, error: userError } = await userClient.auth.getUser()
    if (userError || !user) {
      return json({ error: 'unauthorized' }, 401)
    }

    const body = await req.json().catch(() => ({})) as SplitBody
    const productId = String(body.productId ?? '').trim()
    const distributorId = String(body.distributorId ?? '').trim()

    if (!productId) {
      return json({ error: 'missing_product_id', message: 'Missing critical financial transaction attributes.' }, 400)
    }

    let retailPrice = dollars(body.retailPrice)
    let wholesaleCost = dollars(body.wholesaleCost)
    let listingId: string | null = null
    let authoritativeListing = false

    const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, { auth: { persistSession: false } })

    if (isUuid(productId)) {
      const { data: listing } = await admin
        .from('listings')
        .select('id, price, dropship_wholesale_cost')
        .eq('id', productId)
        .maybeSingle()
      if (listing?.id) {
        listingId = listing.id
        retailPrice = dollars(listing.price)
        if (listing.dropship_wholesale_cost != null) {
          wholesaleCost = dollars(listing.dropship_wholesale_cost)
        }
        authoritativeListing = true
      }
    }

    if (retailPrice <= 0 || wholesaleCost <= 0) {
      return json({ error: 'missing_financial_attributes', message: 'Missing critical financial transaction attributes.' }, 400)
    }

    let distributor = null
    if (distributorId && isUuid(distributorId)) {
      const { data } = await admin
        .from('distributors')
        .select('id, name, payout_account_id')
        .eq('id', distributorId)
        .eq('is_active', true)
        .maybeSingle()
      distributor = data
    }

    const processingFee = stripeProcessingFee(retailPrice)
    const platformNetProfit = Math.round((retailPrice - wholesaleCost - processingFee) * 100) / 100

    if (platformNetProfit <= 0) {
      await admin.from('stripe_margin_split_audits').insert({
        product_id: productId,
        listing_id: listingId,
        distributor_id: distributor?.id ?? null,
        distributor_name: distributor?.name ?? null,
        distributor_payout_account_id: distributor?.payout_account_id ?? null,
        retail_price: retailPrice,
        wholesale_cost: wholesaleCost,
        stripe_processing_fee: processingFee,
        platform_net_profit: platformNetProfit,
        amount_to_charge_customer: cents(retailPrice),
        application_fee_amount: 0,
        transfer_to_distributor: cents(wholesaleCost),
        status: 'rejected',
        created_by: user.id,
        metadata: { reason: 'negative_margin', authoritative_listing: authoritativeListing },
      })
      return json({
        error: 'negative_platform_profit',
        message: 'Transaction aborted: Pricing structure yields negative platform profit.',
      }, 422)
    }

    const stripePayload = {
      amountToChargeCustomer: cents(retailPrice),
      applicationFeeAmount: cents(platformNetProfit),
      transferToDistributor: cents(wholesaleCost),
      currency: 'usd',
      distributorPayoutAccountId: distributor?.payout_account_id ?? null,
      metadata: {
        targetProductId: productId,
        supplierIdentifier: (distributor?.id ?? distributorId) || 'direct_brand',
        authoritativeListing: String(authoritativeListing),
      },
    }

    await admin.from('stripe_margin_split_audits').insert({
      product_id: productId,
      listing_id: listingId,
      distributor_id: distributor?.id ?? null,
      distributor_name: distributor?.name ?? null,
      distributor_payout_account_id: distributor?.payout_account_id ?? null,
      retail_price: retailPrice,
      wholesale_cost: wholesaleCost,
      stripe_processing_fee: processingFee,
      platform_net_profit: platformNetProfit,
      amount_to_charge_customer: stripePayload.amountToChargeCustomer,
      application_fee_amount: stripePayload.applicationFeeAmount,
      transfer_to_distributor: stripePayload.transferToDistributor,
      status: 'calculated',
      created_by: user.id,
      metadata: { authoritative_listing: authoritativeListing },
    })

    console.log(`[PAYMENT ENGINE]: Customer Charge Prepared: $${retailPrice}`)
    console.log(`[PAYMENT ENGINE]: B&C Audio Net Profit: $${platformNetProfit.toFixed(2)}`)
    console.log(`[PAYMENT ENGINE]: Distributor Wholesale Allocation: $${wholesaleCost}`)

    return json({
      success: true,
      message: 'Stripe split calculation synchronized successfully.',
      payload: stripePayload,
      data: {
        productId,
        listingId,
        retailPrice,
        wholesaleCost,
        stripeProcessingFee: processingFee,
        platformNetProfit,
      },
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal Settlement Processing Failure'
    console.error('[PAYMENT ENGINE ERROR]: Financial calculations halted:', message)
    return json({ error: 'settlement_processing_failure', message }, 500)
  }
})
