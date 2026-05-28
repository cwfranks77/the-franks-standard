/** Google search tuned to find IG, site, or contact info for an eBay username. */
export function buildSellerGoogleSearchUrl (username) {
  const u = String(username || '').trim()
  if (!u) return 'https://www.google.com/search'
  const q = `"${u}" ebay seller collectibles instagram OR facebook OR contact OR website`
  return `https://www.google.com/search?q=${encodeURIComponent(q)}`
}
