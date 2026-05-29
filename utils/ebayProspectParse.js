import { buildSellerGoogleSearchUrl } from '~/utils/prospectOutreach.js'

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

function parseCardsFromBlocks (text, map, limit, blockRe) {
  let card
  while ((card = blockRe.exec(text)) !== null && map.size < limit * 2) {
    ingestListingBlock(card[1], map)
  }
}

function ingestListingBlock (block, map) {
  if (/Shop on eBay|s-item__placholder/i.test(block)) return

  let username =
    block.match(/\/usr\/([A-Za-z0-9._-]{2,64})/i)?.[1] ||
    block.match(/[?&]_ssn=([A-Za-z0-9._-]{2,64})/i)?.[1] ||
    block.match(/"sellerUserName"\s*:\s*"([A-Za-z0-9._-]{2,64})"/i)?.[1] ||
    block.match(/"username"\s*:\s*"([A-Za-z0-9._-]{2,64})"/i)?.[1] ||
    null

  const sellerSpan =
    block.match(/s-item__seller-info-text[^>]*>([^<]+)</i) ||
    block.match(/s-card__seller-info-text[^>]*>([^<]+)</i) ||
    block.match(/class="[^"]*s-item__seller[^"]*"[^>]*>[\s\S]*?>([^<]{2,64})</i)
  if (!username && sellerSpan) username = sellerSpan[1].trim()

  username = cleanUsername(username)
  if (!username) return

  const titleMatch =
    block.match(/s-item__title[^>]*>[\s\S]*?<[^>]+>([^<]+)</i) ||
    block.match(/s-card__title[^>]*>([^<]+)</i) ||
    block.match(/"title"\s*:\s*"([^"]{4,200})"/i)
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

/** Parse sellers from eBay search results HTML. */
export function parseEbayProspectsFromHtml (html, limit = 150) {
  const map = new Map()
  const text = String(html || '')

  const cardRe = /<li[^>]*class="[^"]*s-item[^"]*"[^>]*>([\s\S]*?)<\/li>/gi
  parseCardsFromBlocks(text, map, limit, cardRe)

  const cardDivRe = /<div[^>]*class="[^"]*s-card[^"]*s-item[^"]*"[^>]*>([\s\S]*?)<\/div>/gi
  parseCardsFromBlocks(text, map, limit, cardDivRe)

  const sellerJsonRe = /"sellerUserName"\s*:\s*"([A-Za-z0-9._-]{2,64})"/gi
  let sj
  while ((sj = sellerJsonRe.exec(text)) !== null && map.size < limit * 2) {
    const username = cleanUsername(sj[1])
    if (username) upsert(map, username, { listing_hits: 1 })
  }

  const usrRe = /ebay\.com\/usr\/([A-Za-z0-9._-]{2,64})/gi
  let um
  while ((um = usrRe.exec(text)) !== null && map.size < limit * 2) {
    const username = cleanUsername(um[1])
    if (username) upsert(map, username, { listing_hits: 0 })
  }

  const storeNames = new Set()
  const strRe = /ebay\.com\/str\/([A-Za-z0-9._%-]{2,64})/gi
  let sm
  while ((sm = strRe.exec(text)) !== null) {
    const username = cleanUsername(sm[1])
    if (username) storeNames.add(username.toLowerCase())
  }

  return [...map.values()]
    .map((p) => {
      const isStore = storeNames.has(p.username.toLowerCase())
      return {
        ...p,
        is_ebay_store: isStore,
        store_url: isStore
          ? `https://www.ebay.com/str/${encodeURIComponent(p.username)}`
          : p.store_url,
      }
    })
    .filter((p) => p.listing_hits > 0 || p.sample_titles.length)
    .sort((a, b) => {
      if (a.is_ebay_store !== b.is_ebay_store) return a.is_ebay_store ? -1 : 1
      return b.listing_hits - a.listing_hits || (b.feedback_pct || 0) - (a.feedback_pct || 0)
    })
    .slice(0, limit)
}

export function prospectsToCsv (rows) {
  const header = 'username,feedback_pct,feedback_count,listings_on_page,sample_title,store_url,profile_url,google_search'
  const lines = rows.map((r) => {
    const esc = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`
    const google = buildSellerGoogleSearchUrl(r.username)
    return [
      esc(r.username),
      esc(r.feedback_pct ?? ''),
      esc(r.feedback_count ?? ''),
      esc(r.listing_hits),
      esc(r.sample_titles?.[0] ?? ''),
      esc(r.store_url),
      esc(r.profile_url),
      esc(google),
    ].join(',')
  })
  return [header, ...lines].join('\n')
}
