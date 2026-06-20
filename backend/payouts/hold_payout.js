/**
 * Hold an existing payout (fraud, dispute, freeze).
 */

const { shouldHoldPayout } = require('./payout_rules.js')
const { postLedgerEntry } = require('../accounting/ledger.js')

async function holdPayout (admin, { payoutId, reason = null, sellerId = null, orderId = null }) {
  const { data: payout, error } = await admin
    .from('payouts')
    .select('*')
    .eq('id', payoutId)
    .maybeSingle()

  if (error || !payout) return { ok: false, error: error?.message || 'payout_not_found' }
  if (['released', 'paid'].includes(payout.status)) {
    return { ok: false, error: 'already_released' }
  }

  const sid = sellerId || payout.seller_id
  const holdCheck = reason
    ? { hold: true, reasons: [reason] }
    : await shouldHoldPayout(admin, { sellerId: sid, orderId: orderId || payout.order_id })

  if (!holdCheck.hold) return { ok: false, error: 'no_hold_required' }

  const holdReason = holdCheck.reasons.join(',')

  const { error: updErr } = await admin.from('payouts').update({
    status: 'held',
    hold_reason: holdReason,
    updated_at: new Date().toISOString(),
  }).eq('id', payoutId)

  if (updErr) return { ok: false, error: updErr.message }

  await postLedgerEntry(admin, {
    userId: sid,
    entryType: 'debit',
    amount: payout.amount,
    category: 'fraud_hold',
    referenceId: payoutId,
    referenceType: 'payout',
    metadata: { reasons: holdCheck.reasons },
  })

  return { ok: true, payout_id: payoutId, status: 'held', hold_reason: holdReason }
}

module.exports = { holdPayout }
