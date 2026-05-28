/**
 * Extract unique eBay seller usernames from a search/browse HTML page.
 * Used for owner prospecting (recruit sellers), not inventory import.
 */

const GENERIC_SELLER = /^(seller|unknown|not available)$/i

function cleanUsername (raw) {
  const u = String(raw || '').trim().replace(/^@/, '')
  if (!u || u.length < 2 || u.length > 64) return null
  if (GENERIC_SELLER.test(u)) return null
  if (!/^[A-Za-z0-9._-]+$/.test(u)) return null
  return u
}

function upsert (map, username, patch) {
  const key = username.toLowerCase()
  const cur = map.get(key) || {
    username,
    feedback_pct: null,
    feedback_count: null,
    listing_hits: 0,
    sample_titles: [],
    sample_prices: [],
    store_url: `https://www.ebay.com/sch/i.html?_ssn=${encodeURIComponent(username)}&_ipg=60&rt=nc`,
    profile_url: `https://www.ebay.com/usr/${encodeURIComponent(username)}`,
  }
  if (patch.feedback_pct != null) cur.feedback_pct = patch.feedback_pct
  if (patch.feedback_count != null) cur.feedback_count = patch.feedback_count
  if (patch.title && cur.sample_titles.length < 3 && !cur.sample_titles.includes(patch.title)) {
    cur.sample_titles.push(patch.title)
  }
  if (patch.price != null && cur.sample_prices.length < 3) cur.sample_prices.push(patch.price)
  cur.listing_hits += patch.listing_hits || 0
  map.set(key, cur)
}

function parseFeedback (text) {
  const t = String(text || '')
  const pct = t.match(/([\d.]+)\s*%/)
  const count = t.match(/\(([\d,]+)\)/)
  return {
    feedback_pct: pct ? Number.parseFloat(pct[1]) : null,
    feedback_count: count ? Number.parseInt(count[1].replace(/,/g, ''), 10) : null,
  }
}

function parsePrice (raw) {
  const m = String(raw || '').replace(/,/g, '').match(/[\d.]+/)
  if (!m) return null
  const n = Number.parseFloat(m[0])
  return Number.isFinite(n) && n > 0 ? n : null
}

/** Parse sellers from eBay search results HTML. */
export function parseEbayProspectsFromHtml (html, limit = 150) {
  const map = new Map()
  const text = String(html || '')

  const cardRe = /<li[^>]*class="[^"]*s-item[^"]*"[^>]*>([\s\S]*?)<\/li>/gi
  let card
  while ((card = cardRe.exec(text)) !== null && map.size < limit * 2) {
    const block = card[1]
    if (/Shop on eBay|s-item__placholder/i.test(block)) continue

    let username =
      block.match(/\/usr\/([A-Za-z0-9._-]{2,64})/i)?.[1] ||
      block.match(/[?&]_ssn=([A-Za-z0-9._-]{2,64})/i)?.[1] ||
      null

    const sellerSpan =
      block.match(/s-item__seller-info-text[^>]*>([^<]+)</i) ||
      block.match(/s-card__seller-info-text[^>]*>([^<]+)</i)
    if (!username && sellerSpan) username = sellerSpan[1].trim()

    username = cleanUsername(username)
    if (!username) continue

    const titleMatch =
      block.match(/s-item__title[^>]*>[\s\S]*?<[^>]+>([^<]+)</i) ||
      block.match(/s-card__title[^>]*>([^<]+)</i)
    const title = (titleMatch?.[1] || '').replace(/\s+/g, ' ').trim()

    const priceMatch =
      block.match(/s-item__price[^>]*>([^<]+)</i) ||
      block.match(/s-card__price[^>]*>([^<]+)</i)
    const price = priceMatch ? parsePrice(priceMatch[1]) : null

    const fb = parseFeedback(block)
    upsert(map, username, {
      ...fb,
      title: title && !/^shop on ebay/i.test(title) ? title : null,
      price,
      listing_hits: 1,
    })
  }

  const usrRe = /ebay\.com\/usr\/([A-Za-z0-9._-]{2,64})/gi
  let um
  while ((um = usrRe.exec(text)) !== null && map.size < limit * 2) {
    const username = cleanUsername(um[1])
    if (username) upsert(map, username, { listing_hits: 0 })
  }

  return [...map.values()]
    .filter((p) => p.listing_hits > 0 || p.sample_titles.length)
    .sort((a, b) => b.listing_hits - a.listing_hits || (b.feedback_pct || 0) - (a.feedback_pct || 0))
    .slice(0, limit)
}

export function prospectsToCsv (rows) {
  const header = 'username,feedback_pct,feedback_count,listings_on_page,sample_title,store_url,profile_url'
  const lines = rows.map((r) => {
    const esc = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`
    return [
      esc(r.username),
      esc(r.feedback_pct ?? ''),
      esc(r.feedback_count ?? ''),
      esc(r.listing_hits),
      esc(r.sample_titles?.[0] ?? ''),
      esc(r.store_url),
      esc(r.profile_url),
    ].join(',')
  })
  return [header, ...lines].join('\n')
}
