/**
 * Release a held or scheduled payout to pending (ready for Stripe transfer).
 */

const { postLedgerEntry } = require('../accounting/ledger.js')

async function releasePayout (admin, { payoutId, releasedBy = 'system' }) {
  const { data: payout, error } = await admin
    .from('payouts')
    .select('*')
    .eq('id', payoutId)
    .maybeSingle()

  if (error || !payout) return { ok: false, error: error?.message || 'payout_not_found' }
  if (!['held', 'scheduled'].includes(payout.status)) {
    return { ok: false, error: 'invalid_status', status: payout.status }
  }

  const { error: updErr } = await admin.from('payouts').update({
    status: 'pending',
    hold_reason: null,
    updated_at: new Date().toISOString(),
  }).eq('id', payoutId)

  if (updErr) return { ok: false, error: updErr.message }

  await postLedgerEntry(admin, {
    userId: payout.seller_id,
    entryType: 'credit',
    amount: payout.amount,
    category: 'payout_release',
    referenceId: payoutId,
    referenceType: 'payout',
    metadata: { released_by: releasedBy, order_id: payout.order_id },
  })

  return { ok: true, payout_id: payoutId, status: 'pending' }
}

module.exports = { releasePayout }
