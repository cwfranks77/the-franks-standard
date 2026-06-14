export const HONOR_PROMO_CODE = 'HONOR26'
export const HONOR_PROMO_SLUG = 'honor-heroes'
export const HONOR_PROMO_MONTHS = 6

export const SERVICE_CATEGORIES = [
  { value: 'veteran', label: 'U.S. Military Veteran' },
  { value: 'police', label: 'Law Enforcement' },
  { value: 'fire', label: 'Firefighter' },
  { value: 'ems', label: 'EMS / Paramedic' },
  { value: 'dispatcher', label: '911 Dispatcher' },
  { value: 'corrections', label: 'Corrections Officer' },
  { value: 'other', label: 'Other First Responder' },
]

export function honorPromoRegisterPath (category) {
  let path = '/auth/register?promo=' + HONOR_PROMO_CODE + '&account=sell'
  if (category) path += '&honor=' + encodeURIComponent(category)
  return path
}

export function honorPagePath () {
  return '/honor'
}

const PENDING_HONOR_CAT_KEY = 'tfs_pending_honor_category'

export function savePendingHonorCategory (category) {
  if (!import.meta.client || !category) return
  sessionStorage.setItem(PENDING_HONOR_CAT_KEY, String(category))
}

export function getPendingHonorCategory () {
  if (!import.meta.client) return ''
  return sessionStorage.getItem(PENDING_HONOR_CAT_KEY) || ''
}

export function clearPendingHonorCategory () {
  if (!import.meta.client) return
  sessionStorage.removeItem(PENDING_HONOR_CAT_KEY)
}