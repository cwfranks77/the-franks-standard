/**
 * Schedule seller payout after order finalization.
 */

const { shouldHoldPayout, payoutDelayMs } = require('./payout_rules.js')
const { postLedgerEntry } = require('../accounting/ledger.js')

async function schedulePayout (admin, { sellerId, orderId, amount, fee = 0 }) {
  if (!sellerId || !amount || amount <= 0) return { ok: true, skipped: true }

  const { data: profile } = await admin
    .from('profiles')
    .select('trusted_seller_payouts, seller_first_sale_at')
    .eq('id', sellerId)
    .maybeSingle()

  const holdCheck = await shouldHoldPayout(admin, { sellerId, orderId })
  const delay = payoutDelayMs(profile)
  const scheduledAt = new Date(Date.now() + delay).toISOString()

  let status = 'scheduled'
  let holdReason = null
  if (holdCheck.hold) {
    status = 'held'
    holdReason = holdCheck.reasons.join(',')
  } else if (profile?.trusted_seller_payouts) {
    status = 'pending' // instant queue for trusted sellers
  }

  const { data, error } = await admin.from('payouts').insert({
    seller_id: sellerId,
    order_id: orderId,
    amount: Math.round(Number(amount) * 100) / 100,
    fee: Math.round(Number(fee) * 100) / 100,
    status,
    scheduled_at: holdCheck.hold ? null : scheduledAt,
    hold_reason: holdReason,
    updated_at: new Date().toISOString(),
  }).select('id').single()

  if (error) return { ok: false, error: error.message }

  if (status === 'held') {
    await postLedgerEntry(admin, {
      userId: sellerId,
      entryType: 'debit',
      amount,
      category: 'fraud_hold',
      referenceId: orderId,
      referenceType: 'order',
      metadata: { payout_id: data.id, reasons: holdCheck.reasons },
    })
  }

  return { ok: true, payout_id: data.id, status, scheduled_at: scheduledAt, held: holdCheck.hold }
}

module.exports = { schedulePayout }
