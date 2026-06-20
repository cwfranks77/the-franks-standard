/** Build public eBay search URLs for prospecting (no API key). */

export const EBAY_PROSPECT_PRESETS = [
  { id: 'sports-cards', label: 'Sports cards', keywords: 'sports cards PSA', categoryId: '2536' },
  { id: 'memorabilia', label: 'Sports memorabilia', keywords: 'game used autographed', categoryId: '64482' },
  { id: 'coins', label: 'Coins & currency', keywords: 'PCGS NGC coin', categoryId: '11116' },
  { id: 'comics', label: 'Comics', keywords: 'CGC comic', categoryId: '63' },
  { id: 'sneakers', label: 'Sneakers', keywords: 'deadstock sneakers', categoryId: '15709' },
  { id: 'watches', label: 'Watches', keywords: 'luxury watch authenticated', categoryId: '31387' },
  { id: 'vintage', label: 'Vintage collectibles', keywords: 'vintage collectible', categoryId: '' },
]

export function buildEbaySearchUrl ({ keywords = '', categoryId = '', itemsPerPage = 60 } = {}) {
  const params = new URLSearchParams()
  const q = String(keywords || '').trim()
  if (q) params.set('_nkw', q)
  if (categoryId) params.set('_sacat', String(categoryId))
  params.set('_ipg', String(Math.min(120, Math.max(24, itemsPerPage))))
  params.set('rt', 'nc')
  return `https://www.ebay.com/sch/i.html?${params.toString()}`
}

export function buildEbayStoreUrl (username) {
  const u = String(username || '').trim().replace(/^@/, '')
  if (!u) return 'https://www.ebay.com/'
  return `https://www.ebay.com/sch/i.html?_ssn=${encodeURIComponent(u)}&_ipg=120&rt=nc`
}
