/**
 * Ledger entry helper — purchases, payouts, refunds, fees, adjustments, fraud holds.
 */

async function postLedgerEntry (admin, {
  userId = null,
  entryType,
  amount,
  category,
  referenceId = null,
  referenceType = null,
  metadata = {},
}) {
  if (!admin || !entryType || !category) return { ok: false, error: 'missing_fields' }
  if (!['credit', 'debit'].includes(entryType)) return { ok: false, error: 'invalid_entry_type' }

  const amt = Math.round(Number(amount) * 100) / 100
  if (!Number.isFinite(amt) || amt < 0) return { ok: false, error: 'invalid_amount' }

  const { data, error } = await admin.from('ledger_entries').insert({
    user_id: userId,
    entry_type: entryType,
    amount: amt,
    category,
    reference_id: referenceId,
    reference_type: referenceType,
    metadata,
  }).select('id').single()

  if (error) return { ok: false, error: error.message }
  return { ok: true, ledger_id: data.id }
}

async function postPurchaseLedger (admin, { orderId, buyerId, sellerId, grossAmount, platformFee, sellerNet }) {
  const entries = []

  const purchase = await postLedgerEntry(admin, {
    userId: buyerId,
    entryType: 'debit',
    amount: grossAmount,
    category: 'purchase',
    referenceId: orderId,
    referenceType: 'order',
  })
  entries.push(purchase)

  if (platformFee > 0) {
    entries.push(await postLedgerEntry(admin, {
      userId: sellerId,
      entryType: 'debit',
      amount: platformFee,
      category: 'platform_fee',
      referenceId: orderId,
      referenceType: 'order',
    }))
  }

  if (sellerNet > 0) {
    entries.push(await postLedgerEntry(admin, {
      userId: sellerId,
      entryType: 'credit',
      amount: sellerNet,
      category: 'seller_earnings',
      referenceId: orderId,
      referenceType: 'order',
    }))
  }

  return { ok: true, entries }
}

module.exports = { postLedgerEntry, postPurchaseLedger }
