import { buildSellerGoogleSearchUrl } from '~/utils/sellerGoogleSearch.js'

export const SELLER_LINK_BUILD_STAMP = 'seller-links-2026-05-20c'

const GENERIC = /^(seller|unknown|not available|ebay)$/i

function cleanId (raw) {
  let u = String(raw || '').trim().replace(/^@/, '')
  try {
    u = decodeURIComponent(u)
  } catch {
    /* keep */
  }
  u = u.replace(/^https?:\/\/(www\.)?ebay\.com\/(?:usr|str)\//i, '')
  u = u.split(/[/?#&]/)[0]
  u = u.replace(/[^\w.-]/g, '')
  if (!u || u.length < 2 || u.length > 64) return null
  if (GENERIC.test(u)) return null
  if (!/^[A-Za-z0-9._-]+$/.test(u)) return null
  return u
}

function row (username, isEbayStore = false) {
  const u = encodeURIComponent(username)
  return {
    username,
    profile_url: `https://www.ebay.com/usr/${u}`,
    store_url: isEbayStore
      ? `https://www.ebay.com/str/${u}`
      : `https://www.ebay.com/sch/i.html?_ssn=${u}&_ipg=60&rt=nc`,
    google_url: buildSellerGoogleSearchUrl(username),
    is_ebay_store: isEbayStore,
  }
}

/** Parse store (/str/), profile (/usr/), ?_ssn=, or plain usernames. */
export function buildSellerRowsFromPaste (text) {
  const seen = new Set()
  const rows = []
  const raw = String(text || '').trim()
  if (!raw) return rows

  const add = (id, isStore = false) => {
    const u = cleanId(id)
    if (!u) return
    const key = u.toLowerCase()
    if (seen.has(key)) return
    seen.add(key)
    rows.push(row(u, isStore))
  }

  const scan = (chunk) => {
    let m
    const usr = /ebay\.com\/usr\/([A-Za-z0-9._%-]{2,64})/gi
    while ((m = usr.exec(chunk)) !== null) add(m[1], false)
    const str = /ebay\.com\/str\/([A-Za-z0-9._%-]{2,64})/gi
    while ((m = str.exec(chunk)) !== null) add(m[1], true)
    const ssn = /[?&]_ssn=([A-Za-z0-9._%-]{2,64})/gi
    while ((m = ssn.exec(chunk)) !== null) add(m[1], false)
  }

  scan(raw)

  for (const line of raw.split(/\r?\n/)) {
    const t = line.trim()
    if (!t) continue
    if (/ebay\.com\/(str|usr)\//i.test(t)) {
      scan(t)
      continue
    }
    for (const part of t.split(/[,;\t|]+/)) {
      const p = part.trim()
      if (!p) continue
      if (/ebay\.com\//i.test(p)) {
        scan(p)
        continue
      }
      add(p, false)
      for (const w of p.split(/\s+/)) add(w, false)
    }
  }

  if (!rows.length && /[,;]/.test(raw)) {
    for (const chunk of raw.split(/[,;]+/)) {
      const p = chunk.trim()
      if (/ebay\.com\//i.test(p)) scan(p)
      else add(p, false)
    }
  }

  return rows
}
