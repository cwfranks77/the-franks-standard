import {
  AFFILIATE_PARTNERS_SEED,
  getAffiliatePartner,
  normalizeAffiliateHandle,
} from '~/utils/affiliateProgram.js'

const ROSTER_KEY = 'franks-affiliate-roster-v1'

export function useAffiliateRoster () {
  const customRoster = ref([])

  function loadRoster () {
    if (!import.meta.client) return
    try {
      const raw = localStorage.getItem(ROSTER_KEY)
      customRoster.value = raw ? JSON.parse(raw) : []
    } catch {
      customRoster.value = []
    }
  }

  function saveRoster () {
    if (!import.meta.client) return
    try {
      localStorage.setItem(ROSTER_KEY, JSON.stringify(customRoster.value))
    } catch {}
  }

  function allPartners () {
    const map = new Map()
    for (const p of AFFILIATE_PARTNERS_SEED) {
      if (p.active !== false) map.set(normalizeAffiliateHandle(p.handle), p)
    }
    for (const p of customRoster.value) {
      if (p.active !== false) map.set(normalizeAffiliateHandle(p.handle), p)
    }
    return [...map.values()]
  }

  function findPartner (handle) {
    return getAffiliatePartner(handle, customRoster.value)
  }

  function upsertPartner (partner) {
    const h = normalizeAffiliateHandle(partner.handle)
    if (!h) return false
    const row = {
      handle: h,
      displayName: String(partner.displayName || h).trim(),
      tier: partner.tier || 'nano',
      platform: partner.platform || '',
      landing: partner.landing || 'sell',
      active: partner.active !== false,
      notes: partner.notes || '',
    }
    const idx = customRoster.value.findIndex((p) => normalizeAffiliateHandle(p.handle) === h)
    if (idx >= 0) customRoster.value[idx] = row
    else customRoster.value.push(row)
    saveRoster()
    return true
  }

  function removePartner (handle) {
    const h = normalizeAffiliateHandle(handle)
    customRoster.value = customRoster.value.filter((p) => normalizeAffiliateHandle(p.handle) !== h)
    saveRoster()
  }

  return {
    customRoster,
    loadRoster,
    saveRoster,
    allPartners,
    findPartner,
    upsertPartner,
    removePartner,
  }
}
