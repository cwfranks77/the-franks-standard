/**
 * Payout hold rules — fraud, dispute, freeze, banned device/IP.
 */

const THREE_DAY_MS = 3 * 24 * 60 * 60 * 1000

async function shouldHoldPayout (admin, { sellerId, orderId = null, ipAddress = null, deviceFingerprint = null }) {
  const reasons = []

  const { data: profile } = await admin
    .from('profiles')
    .select('safety_frozen_at, platform_banned_at, seller_banned_at, account_frozen_at, trusted_seller_payouts, seller_first_sale_at')
    .eq('id', sellerId)
    .maybeSingle()

  if (profile?.safety_frozen_at || profile?.account_frozen_at) reasons.push('account_frozen')
  if (profile?.platform_banned_at || profile?.seller_banned_at) reasons.push('account_banned')

  const { data: fraudCase } = await admin
    .from('fraud_cases')
    .select('id')
    .eq('user_id', sellerId)
    .eq('status', 'open')
    .limit(1)
    .maybeSingle()
  if (fraudCase?.id) reasons.push('fraud_case_open')

  if (orderId) {
    const { data: dispute } = await admin
      .from('dispute_cases')
      .select('id')
      .eq('order_id', orderId)
      .not('status', 'eq', 'resolved')
      .limit(1)
      .maybeSingle()
    if (dispute?.id) reasons.push('dispute_open')
  }

  if (ipAddress) {
    const { data: bannedIp } = await admin
      .from('banned_ips')
      .select('id')
      .eq('ip_address', ipAddress)
      .limit(1)
      .maybeSingle()
    if (bannedIp?.id) reasons.push('banned_ip')
  }

  if (deviceFingerprint) {
    const { data: bannedDevice } = await admin
      .from('banned_devices')
      .select('id')
      .eq('device_fingerprint', deviceFingerprint)
      .limit(1)
      .maybeSingle()
    if (bannedDevice?.id) reasons.push('banned_device')
  }

  return { hold: reasons.length > 0, reasons }
}

function payoutDelayMs (profile) {
  if (profile?.trusted_seller_payouts) return 0
  if (!profile?.seller_first_sale_at) return THREE_DAY_MS
  const firstSale = new Date(profile.seller_first_sale_at).getTime()
  if (Date.now() - firstSale < THREE_DAY_MS) return THREE_DAY_MS
  return 0
}

module.exports = { shouldHoldPayout, payoutDelayMs, THREE_DAY_MS }
