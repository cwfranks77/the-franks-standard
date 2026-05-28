import { buildSellerGoogleSearchUrl } from '~/utils/prospectOutreach.js'

export function parseSellerUsernameList (text) {
  const seen = new Set()
  const rows = []
  for (const line of String(text || '').split(/\r?\n/)) {
    let u = line.trim().replace(/^@/, '')
    u = u.replace(/^https?:\/\/(www\.)?ebay\.com\/usr\//i, '').split(/[/?#]/)[0]
    if (!u || u.length < 2 || u.length > 64) continue
    if (!/^[A-Za-z0-9._-]+$/.test(u)) continue
    const key = u.toLowerCase()
    if (seen.has(key)) continue
    seen.add(key)
    rows.push({
      username: u,
      profile_url: `https://www.ebay.com/usr/${encodeURIComponent(u)}`,
      store_url: `https://www.ebay.com/sch/i.html?_ssn=${encodeURIComponent(u)}&_ipg=60&rt=nc`,
      google_url: buildSellerGoogleSearchUrl(u),
    })
  }
  return rows
}
