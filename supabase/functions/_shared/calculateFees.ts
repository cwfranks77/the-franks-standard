import type { SupabaseClient } from 'npm:@supabase/supabase-js@2'

const DEFAULT_FEE_BPS = 1000
const BC_AUDIO_FEE_BPS = 500
const FEATURED_FEE_BPS = 800
const STARTER_FREE_SLUG = 'starter_free_90'

const BC_SLUGS = new Set(['bc-audio', 'bc-performance-audio', 'bcpoweraudio', 'b-c-performance-audio'])

export async function calculateFees (
  admin: SupabaseClient,
  params: { merchandiseAmount: number; sellerId: string; sellerProfile?: { store_slug?: string | null; featured_store?: boolean | null } | null },
) {
  const amount = Number(params.merchandiseAmount) || 0
  let feeBps = DEFAULT_FEE_BPS
  let feeLabel = 'default_10pct'

  let profile = params.sellerProfile
  if (!profile) {
    const { data } = await admin.from('profiles').select('store_slug, featured_store').eq('id', params.sellerId).maybeSingle()
    profile = data
  }

  const { data: starterPlan } = await admin.from('subscription_plans').select('id').eq('slug', STARTER_FREE_SLUG).maybeSingle()
  if (starterPlan?.id) {
    const { data: sub } = await admin
      .from('seller_subscriptions')
      .select('expires_at')
      .eq('seller_id', params.sellerId)
      .eq('plan_id', starterPlan.id)
      .eq('status', 'active')
      .maybeSingle()
    if (sub?.expires_at && new Date(sub.expires_at) > new Date()) {
      feeBps = 0
      feeLabel = 'starter_free_90'
    }
  }

  if (feeBps > 0) {
    const slug = String(profile?.store_slug ?? '').toLowerCase()
    if (BC_SLUGS.has(slug)) {
      feeBps = BC_AUDIO_FEE_BPS
      feeLabel = 'bc_audio_5pct'
    } else if (profile?.featured_store) {
      feeBps = FEATURED_FEE_BPS
      feeLabel = 'featured_store_8pct'
    }
  }

  const platformFee = Math.round(amount * feeBps) / 10000
  const sellerPayout = Math.round((amount - platformFee) * 100) / 100
  return { feeBps, feeLabel, platformFee, sellerPayout, platformFeeCents: Math.round(platformFee * 100) }
}
