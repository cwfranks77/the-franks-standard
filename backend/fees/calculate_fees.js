/**
 * Platform fee calculation — Section 12 rules.
 */

const DEFAULT_FEE_BPS = 1000 // 10%
const BC_AUDIO_FEE_BPS = 500 // 5%
const FEATURED_FEE_BPS = 800 // 8%
const STARTER_FREE_SLUG = 'starter_free_90'

const BC_SLUGS = new Set([
  'bc-audio',
  'bc-performance-audio',
  'bcpoweraudio',
  'b-c-performance-audio',
])

function isBcAudioStore (profile) {
  const slug = String(profile?.store_slug ?? '').toLowerCase()
  return BC_SLUGS.has(slug)
}

async function sellerOnStarterFreePlan (admin, sellerId) {
  if (!admin || !sellerId) return false

  const { data: starterPlan } = await admin
    .from('subscription_plans')
    .select('id')
    .eq('slug', STARTER_FREE_SLUG)
    .maybeSingle()

  if (!starterPlan?.id) return false

  const { data: sub } = await admin
    .from('seller_subscriptions')
    .select('expires_at, status')
    .eq('seller_id', sellerId)
    .eq('plan_id', starterPlan.id)
    .eq('status', 'active')
    .maybeSingle()

  if (!sub?.expires_at) return false
  return new Date(sub.expires_at) > new Date()
}

/**
 * @returns {{ feeBps: number, feeRate: number, feeLabel: string, platformFee: number, sellerNet: number }}
 */
async function calculateFees (admin, {
  merchandiseAmount,
  sellerId = null,
  sellerProfile = null,
}) {
  const amount = Number(merchandiseAmount) || 0
  let feeBps = DEFAULT_FEE_BPS
  let feeLabel = 'default_10pct'

  let profile = sellerProfile
  if (!profile && admin && sellerId) {
    const { data } = await admin
      .from('profiles')
      .select('id, store_slug, featured_store')
      .eq('id', sellerId)
      .maybeSingle()
    profile = data
  }

  if (admin && sellerId && await sellerOnStarterFreePlan(admin, sellerId)) {
    feeBps = 0
    feeLabel = 'starter_free_90'
  } else if (profile && isBcAudioStore(profile)) {
    feeBps = BC_AUDIO_FEE_BPS
    feeLabel = 'bc_audio_5pct'
  } else if (profile?.featured_store) {
    feeBps = FEATURED_FEE_BPS
    feeLabel = 'featured_store_8pct'
  }

  const platformFee = Math.round(amount * feeBps) / 10000
  const sellerNet = Math.round((amount - platformFee) * 100) / 100

  return {
    feeBps,
    feeRate: feeBps / 10000,
    feeLabel,
    platformFee,
    sellerNet,
    sellerPayout: sellerNet,
    platformFeeCents: Math.round(platformFee * 100),
  }
}

module.exports = {
  calculateFees,
  DEFAULT_FEE_BPS,
  BC_AUDIO_FEE_BPS,
  FEATURED_FEE_BPS,
  isBcAudioStore,
  sellerOnStarterFreePlan,
}
