/** Google search tuned to find IG, site, or contact info for an eBay username. */
export function buildSellerGoogleSearchUrl (username) {
  const u = String(username || '').trim()
  if (!u) return 'https://www.google.com/search'
  const q = `"${u}" ebay seller collectibles instagram OR facebook OR contact OR website`
  return `https://www.google.com/search?q=${encodeURIComponent(q)}`
}

/** Find brick-and-mortar signals: address, hours, visit us, Maps listing. */
export function buildSellerGooglePhysicalSearchUrl (username) {
  const u = String(username || '').trim()
  if (!u) return 'https://www.google.com/search'
  const q = `"${u}" (ebay store OR "ebay.com/str" OR collectibles OR coins OR cards) ("address" OR "hours" OR "visit us" OR "located at" OR "suite" OR "ste " OR "storefront")`
  return `https://www.google.com/search?q=${encodeURIComponent(q)}`
}

/** Google Maps search for a likely store name derived from eBay username. */
export function buildSellerMapsSearchUrl (username) {
  const u = String(username || '').trim()
  if (!u) return 'https://www.google.com/maps'
  const label = u.replace(/[-_]/g, ' ')
  const q = `${label} sports cards OR coin shop OR collectibles store`
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q)}`
}

/** Reverse: confirm a Maps business also sells on eBay. */
export function buildBusinessEbayCheckUrl (businessName) {
  const n = String(businessName || '').trim()
  if (!n) return 'https://www.google.com/search'
  const q = `"${n}" site:ebay.com OR "ebay.com/str"`
  return `https://www.google.com/search?q=${encodeURIComponent(q)}`
}
