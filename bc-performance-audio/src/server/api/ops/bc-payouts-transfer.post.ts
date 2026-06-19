import { getBcServiceSupabase } from '#bc-server-utils/bcSupabase'
import { requireBcOpsAuth } from '#bc-server-utils/bcOpsAuth'
import { logBcAudit } from '#bc-server-utils/audit'
import { getBcStripe } from '#bc-server-utils/bcStripe'

/** Transfer a queued payout to a seller's Stripe Connect account. */
export default defineEventHandler(async (event) => {
  requireBcOpsAuth(event)
  const body = await readBody(event)
  const payoutId = String(body?.payoutId || '').trim()

  if (!payoutId) {
    throw createError({ statusCode: 400, statusMessage: 'payoutId is required' })
  }

  const stripe = getBcStripe()
  if (!stripe) {
    throw createError({ statusCode: 503, statusMessage: 'STRIPE_SECRET_KEY not configured' })
  }

  const sb = getBcServiceSupabase()
  if (!sb) {
    throw createError({ statusCode: 503, statusMessage: 'Supabase not configured' })
  }

  const { data: payout, error: pErr } = await sb.from('bc_payouts').select('*').eq('id', payoutId).single()
  if (pErr || !payout) {
    throw createError({ statusCode: 404, statusMessage: 'Payout not found' })
  }

  const { data: sellerAccount } = await sb
    .from('bc_seller_accounts')
    .select('connected_account_id')
    .eq('seller_id', payout.seller_id)
    .maybeSingle()

  const destination = sellerAccount?.connected_account_id
  if (!destination) {
    throw createError({ statusCode: 400, statusMessage: 'Seller is not onboarded to Stripe Connect' })
  }

  try {
    const transfer = await stripe.transfers.create({
      amount: Math.round(Number(payout.amount) * 100),
      currency: String(payout.currency || 'USD').toLowerCase(),
      destination,
      metadata: { payoutId, sellerId: payout.seller_id },
    })

    const { data, error } = await sb.from('bc_payouts').update({
      status: 'paid',
      processed_at: new Date().toISOString(),
      reference: transfer.id,
    }).eq('id', payoutId).select().single()

    if (error) {
      throw createError({ statusCode: 500, statusMessage: error.message })
    }

    await logBcAudit('admin', null, 'payout_transferred', 'payout', payoutId, { transferId: transfer.id })
    return { success: true, payout: data, transfer }
  } catch (err) {
    console.error('BC Stripe transfer error', err)
    await sb.from('bc_payouts').update({ status: 'failed' }).eq('id', payoutId)
    throw createError({ statusCode: 500, statusMessage: 'Stripe transfer failed' })
  }
})
