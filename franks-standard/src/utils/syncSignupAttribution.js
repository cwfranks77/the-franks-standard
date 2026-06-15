/** Copy signup_* fields from auth user_metadata onto profiles (after verify or register). */

export function signupAttributionFromMetadata (metadata = {}) {
  const m = metadata || {}
  const patch = {}
  const map = [
    ['signup_ref', 'signup_ref'],
    ['signup_campaign', 'signup_campaign'],
    ['signup_promo', 'signup_promo'],
    ['signup_utm_source', 'signup_utm_source'],
    ['signup_utm_medium', 'signup_utm_medium'],
    ['signup_utm_campaign', 'signup_utm_campaign'],
    ['signup_utm_content', 'signup_utm_content'],
    ['signup_landing_path', 'signup_landing_path'],
    ['signup_first_touch_at', 'signup_first_touch_at'],
    ['signup_affiliate_handle', 'signup_affiliate_handle'],
    ['signup_affiliate_tier', 'signup_affiliate_tier'],
  ]
  for (const [metaKey, col] of map) {
    const v = m[metaKey]
    if (v != null && String(v).trim() !== '') patch[col] = String(v).trim()
  }
  return patch
}

export async function syncSignupAttributionToProfile (supabase, user) {
  if (!user?.id) return { ok: false }
  const patch = signupAttributionFromMetadata(user.user_metadata)
  if (!Object.keys(patch).length) return { ok: true, skipped: true }
  const { error } = await supabase.from('profiles').update(patch).eq('id', user.id)
  return { ok: !error, error: error?.message }
}
