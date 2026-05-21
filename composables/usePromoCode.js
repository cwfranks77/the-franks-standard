import { FOUNDING_PROMO_CODE } from '~/utils/foundingPromo.js'
import { getPendingHonorCategory } from '~/utils/honorPromo.js'

const PENDING_PROMO_KEY = 'tfs_pending_promo'

export function usePromoCode () {
  const supabase = useSupabaseClient()
  const config = useRuntimeConfig()

  function savePendingPromo (code) {
    if (!import.meta.client || !code) return
    sessionStorage.setItem(PENDING_PROMO_KEY, String(code).trim().toUpperCase())
  }

  function getPendingPromo () {
    if (!import.meta.client) return ''
    return sessionStorage.getItem(PENDING_PROMO_KEY) || ''
  }

  function clearPendingPromo () {
    if (!import.meta.client) return
    sessionStorage.removeItem(PENDING_PROMO_KEY)
  }

  async function fetchAvailability (slug = 'founders10') {
    const base = config.public.supabaseUrl
    if (!base) return null
    const key = config.public.supabaseKey
    const headers = key ? { apikey: key, Authorization: `Bearer ${key}` } : {}
    const res = await fetch(`${base}/functions/v1/promo-availability?slug=${encodeURIComponent(slug)}`, { headers })
    if (!res.ok) return null
    return res.json()
  }

  async function redeemCode (code, extra = {}) {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session?.access_token) {
      return { error: 'not_signed_in', message: 'Sign in or create an account first.' }
    }

    const normalized = String(code || getPendingPromo() || FOUNDING_PROMO_CODE).trim().toUpperCase()
    const res = await fetch(`${config.public.supabaseUrl}/functions/v1/redeem-promo-code`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({ code: normalized, ...extra }),
    })

    const data = await res.json().catch(() => ({}))
    if (!res.ok) {
      return { error: data.error || 'redeem_failed', message: data.message || data.error, ...data }
    }
    clearPendingPromo()
    return data
  }

  async function redeemPendingIfAny () {
    const pending = getPendingPromo()
    if (!pending) return null
    const cat = getPendingHonorCategory()
    const extra = cat ? { service_category: cat } : {}
    return redeemCode(pending, extra)
  }

  return {
    savePendingPromo,
    getPendingPromo,
    clearPendingPromo,
    fetchAvailability,
    redeemCode,
    redeemPendingIfAny,
  }
}
