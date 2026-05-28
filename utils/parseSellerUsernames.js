import { buildSellerGoogleSearchUrl } from '~/utils/sellerGoogleSearch.js'

const GENERIC = /^(seller|unknown|not available|ebay)$/i

function cleanUsername (raw) {
  let u = String(raw || '').trim().replace(/^@/, '')
  try {
    u = decodeURIComponent(u)
  } catch {
    /* keep as-is */
  }
  u = u.replace(/^https?:\/\/(www\.)?ebay\.com\/(?:usr|str)\//i, '')
  u = u.split(/[/?#&]/)[0]
  u = u.replace(/[^\w.-]/g, '')
  if (!u || u.length < 2 || u.length > 64) return null
  if (GENERIC.test(u)) return null
  if (!/^[A-Za-z0-9._-]+$/.test(u)) return null
  return u
}

function storeUrlFor (username, isEbayStore) {
  const u = encodeURIComponent(username)
  if (isEbayStore) {
    return `https://www.ebay.com/str/${u}`
  }
  return `https://www.ebay.com/sch/i.html?_ssn=${u}&_ipg=60&rt=nc`
}

function addRow (seen, rows, username, { isEbayStore = false } = {}) {
  const u = cleanUsername(username)
  if (!u) return
  const key = u.toLowerCase()
  if (seen.has(key)) return
  seen.add(key)
  rows.push({
    username: u,
    profile_url: `https://www.ebay.com/usr/${encodeURIComponent(u)}`,
    store_url: storeUrlFor(u, isEbayStore),
    google_url: buildSellerGoogleSearchUrl(u),
    is_ebay_store: isEbayStore,
  })
}

/** Pull seller ids from eBay URLs embedded in arbitrary text. */
function scanEbayUrls (text, seen, rows) {
  let m
  const usrRe = /ebay\.com\/usr\/([A-Za-z0-9._%-]{2,64})/gi
  while ((m = usrRe.exec(text)) !== null) addRow(seen, rows, m[1])

  const strRe = /ebay\.com\/str\/([A-Za-z0-9._%-]{2,64})/gi
  while ((m = strRe.exec(text)) !== null) addRow(seen, rows, m[1], { isEbayStore: true })

  const ssnRe = /[?&]_ssn=([A-Za-z0-9._%-]{2,64})/gi
  while ((m = ssnRe.exec(text)) !== null) addRow(seen, rows, m[1])
}

/** First seller id on a line (profile, store, or search URL). */
function sellerFromLine (line) {
  const trimmed = String(line || '').trim()
  if (!trimmed) return null

  const str = trimmed.match(/ebay\.com\/str\/([^/?#&\s]+)/i)
  if (str) return { id: str[1], isEbayStore: true }

  const usr = trimmed.match(/ebay\.com\/usr\/([^/?#&\s]+)/i)
  if (usr) return { id: usr[1], isEbayStore: false }

  const ssn = trimmed.match(/[?&]_ssn=([A-Za-z0-9._%-]{2,64})/i)
  if (ssn) return { id: ssn[1], isEbayStore: false }

  const parts = trimmed.split(/[,;\t|]+/)
  for (const part of parts) {
    const p = part.trim()
    if (!p) continue
    const fromUrl = sellerFromLine(p)
    if (fromUrl) return fromUrl
    const direct = cleanUsername(p)
    if (direct) return { id: direct, isEbayStore: false }
    const words = p.split(/\s+/)
    for (const w of words) {
      const u = cleanUsername(w)
      if (u) return { id: u, isEbayStore: false }
    }
  }
  const u = cleanUsername(trimmed)
  return u ? { id: u, isEbayStore: false } : null
}

/**
 * Parse pasted seller list (one per line, comma-separated, or eBay profile/store URLs).
 */
export function parseSellerUsernameList (text) {
  const seen = new Set()
  const rows = []
  const raw = String(text || '')
  scanEbayUrls(raw, seen, rows)

  for (const line of raw.split(/\r?\n/)) {
    const hit = sellerFromLine(line)
    if (hit) addRow(seen, rows, hit.id, { isEbayStore: hit.isEbayStore })
  }

  if (!rows.length && /[,;]/.test(raw)) {
    for (const chunk of raw.split(/[,;]+/)) {
      const hit = sellerFromLine(chunk)
      if (hit) addRow(seen, rows, hit.id, { isEbayStore: hit.isEbayStore })
    }
  }

  return rows
}
