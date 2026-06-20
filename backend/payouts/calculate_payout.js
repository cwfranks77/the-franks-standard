/**
 * Calculate seller payout amount after fees.
 */

const { calculateFees } = require('../fees/calculate_fees.js')

async function calculatePayout (admin, { orderId, sellerId = null, grossAmount = null }) {
  let order = null
  if (orderId) {
    const { data } = await admin
      .from('orders')
      .select('id, seller_id, amount, merchandise_amount, platform_fee, seller_payout, status')
      .eq('id', orderId)
      .maybeSingle()
    order = data
  }

  const sid = sellerId || order?.seller_id
  const merchandise = grossAmount != null
    ? Number(grossAmount)
    : Number(order?.merchandise_amount ?? order?.amount) || 0

  const fees = await calculateFees(admin, { merchandiseAmount: merchandise, sellerId: sid })
  const platformFee = order?.platform_fee != null ? Number(order.platform_fee) : fees.platformFee
  const net = order?.seller_payout != null ? Number(order.seller_payout) : fees.sellerNet

  return {
    ok: true,
    seller_id: sid,
    order_id: orderId || order?.id,
    gross_amount: merchandise,
    platform_fee: platformFee,
    payout_amount: net,
    fee_bps: fees.feeBps,
    fee_label: fees.feeLabel,
  }
}

module.exports = { calculatePayout }
