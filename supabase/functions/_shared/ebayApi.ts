/**
 * eBay Browse API (official) — client-credentials token + search.
 * Set Supabase secrets: EBAY_CLIENT_ID, EBAY_CLIENT_SECRET
 * Optional: EBAY_API_ENV=sandbox | production (default production)
 * Optional: EBAY_MARKETPLACE_ID=EBAY_US (default)
 */

export type EbayProspectRow = {
  username: string
  feedback_pct: number | null
  feedback_count: number | null
  listing_hits: number
  sample_titles: string[]
  sample_prices: number[]
  store_url: string
  profile_url: string
}

export type EbayListingPreview = {
  external_id: string
  title: string
  price: number | null
  image_url: string | null
  item_url: string | null
}

export function isEbayApiConfigured (): boolean {
  const id = Deno.env.get('EBAY_CLIENT_ID') ?? ''
  const secret = Deno.env.get('EBAY_CLIENT_SECRET') ?? ''
  return id.length > 0 && secret.length > 0
}

function apiHosts () {
  const env = (Deno.env.get('EBAY_API_ENV') ?? 'production').toLowerCase()
  if (env === 'sandbox') {
    return {
      token: 'https://api.sandbox.ebay.com/identity/v1/oauth2/token',
      browse: 'https://api.sandbox.ebay.com/buy/browse/v1',
    }
  }
  return {
    token: 'https://api.ebay.com/identity/v1/oauth2/token',
    browse: 'https://api.ebay.com/buy/browse/v1',
  }
}

let tokenCache: { value: string; expiresAt: number } | null = null

export async function getEbayApplicationToken (): Promise<string> {
  const now = Date.now()
  if (tokenCache && tokenCache.expiresAt > now + 60_000) {
    return tokenCache.value
  }

  const clientId = Deno.env.get('EBAY_CLIENT_ID') ?? ''
  const clientSecret = Deno.env.get('EBAY_CLIENT_SECRET') ?? ''
  if (!clientId || !clientSecret) {
    throw new Error('ebay_api_not_configured')
  }

  const { token: tokenUrl } = apiHosts()
  const basic = btoa(`${clientId}:${clientSecret}`)
  const res = await fetch(tokenUrl, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${basic}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials&scope=https://api.ebay.com/oauth/api_scope',
  })

  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    throw new Error(`ebay_token_failed:${res.status}:${data?.error_description || data?.error || 'unknown'}`)
  }

  const accessToken = String(data.access_token || '')
  const expiresIn = Number(data.expires_in) || 7200
  if (!accessToken) throw new Error('ebay_token_empty')

  tokenCache = {
    value: accessToken,
    expiresAt: now + expiresIn * 1000,
  }
  return accessToken
}

function marketplaceId (): string {
  return Deno.env.get('EBAY_MARKETPLACE_ID') || 'EBAY_US'
}

async function browseSearch (query: Record<string, string>): Promise<{
  itemSummaries?: Array<Record<string, unknown>>
  total?: number
  next?: string
}> {
  const token = await getEbayApplicationToken()
  const { browse } = apiHosts()
  const params = new URLSearchParams(query)
  const url = `${browse}/item_summary/search?${params.toString()}`

  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
      'X-EBAY-C-MARKETPLACE-ID': marketplaceId(),
      'Content-Type': 'application/json',
    },
  })

  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    const msg = (data as { errors?: Array<{ message?: string }> })?.errors?.[0]?.message
    throw new Error(`ebay_search_failed:${res.status}:${msg || 'unknown'}`)
  }
  return data as { itemSummaries?: Array<Record<string, unknown>>; total?: number; next?: string }
}

function parseNum (v: unknown): number | null {
  const n = Number.parseFloat(String(v ?? ''))
  return Number.isFinite(n) ? n : null
}

function itemIdFromSummary (item: Record<string, unknown>): string {
  const legacy = String(item.legacyItemId || '').trim()
  if (legacy) return legacy
  const href = String((item as { itemWebUrl?: string }).itemWebUrl || '')
  const m = href.match(/\/itm\/(\d+)/)
  return m?.[1] || ''
}

/** Search listings and aggregate unique seller usernames (prospect recruiting). */
export async function searchEbayProspects (opts: {
  keywords: string
  categoryId?: string | null
  maxSellers?: number
  maxItems?: number
}): Promise<{
  prospects: EbayProspectRow[]
  items_scanned: number
  source_url: string
}> {
  const maxSellers = Math.min(150, Math.max(5, opts.maxSellers ?? 80))
  const maxItems = Math.min(600, Math.max(50, opts.maxItems ?? 300))
  const q = String(opts.keywords || '').trim() || 'collectibles'
  const categoryId = opts.categoryId ? String(opts.categoryId).trim() : ''

  const bySeller = new Map<string, EbayProspectRow>()
  let itemsScanned = 0
  let offset = 0
  const pageSize = 200

  while (itemsScanned < maxItems && bySeller.size < maxSellers) {
    const query: Record<string, string> = {
      q,
      limit: String(Math.min(pageSize, maxItems - itemsScanned)),
      offset: String(offset),
    }
    if (categoryId) query.category_ids = categoryId

    const data = await browseSearch(query)
    const summaries = data.itemSummaries || []
    if (!summaries.length) break

    for (const raw of summaries) {
      itemsScanned++
      const seller = raw.seller as Record<string, unknown> | undefined
      const username = String(seller?.username || '').trim()
      if (!username || username.length < 2) continue

      const key = username.toLowerCase()
      const feedback_pct = parseNum(seller?.feedbackPercentage)
      const feedback_count = parseNum(seller?.feedbackScore)
      const title = String(raw.title || '').trim()
      const priceVal = (raw.price as Record<string, unknown> | undefined)?.value
      const price = parseNum(priceVal)

      const cur = bySeller.get(key) || {
        username,
        feedback_pct: null,
        feedback_count: null,
        listing_hits: 0,
        sample_titles: [],
        sample_prices: [],
        store_url: `https://www.ebay.com/sch/i.html?_ssn=${encodeURIComponent(username)}&_ipg=60&rt=nc`,
        profile_url: `https://www.ebay.com/usr/${encodeURIComponent(username)}`,
      }
      if (feedback_pct != null) cur.feedback_pct = feedback_pct
      if (feedback_count != null) cur.feedback_count = Math.round(feedback_count)
      if (title && cur.sample_titles.length < 3 && !cur.sample_titles.includes(title)) {
        cur.sample_titles.push(title)
      }
      if (price != null && cur.sample_prices.length < 3) cur.sample_prices.push(price)
      cur.listing_hits += 1
      bySeller.set(key, cur)
    }

    offset += summaries.length
    if (summaries.length < pageSize) break
  }

  const prospects = [...bySeller.values()]
    .sort((a, b) => b.listing_hits - a.listing_hits || (b.feedback_pct || 0) - (a.feedback_pct || 0))
    .slice(0, maxSellers)

  const sourceParams = new URLSearchParams({ q })
  if (categoryId) sourceParams.set('category_ids', categoryId)
  const source_url = `ebay://browse/search?${sourceParams.toString()}`

  return { prospects, items_scanned: itemsScanned, source_url }
}

/** Active listings for one eBay seller (inventory import preview). */
export async function searchEbaySellerListings (opts: {
  sellerUsername: string
  limit?: number
}): Promise<{ items: EbayListingPreview[]; items_scanned: number }> {
  const username = String(opts.sellerUsername || '').trim().replace(/^@/, '')
  const limit = Math.min(120, Math.max(1, opts.limit ?? 48))
  const items: EbayListingPreview[] = []
  const seen = new Set<string>()
  let offset = 0
  const pageSize = 200

  while (items.length < limit) {
    const query: Record<string, string> = {
      q: '*',
      filter: `sellers:{${username}}`,
      limit: String(Math.min(pageSize, limit - items.length + 20)),
      offset: String(offset),
    }

    const data = await browseSearch(query)
    const summaries = data.itemSummaries || []
    if (!summaries.length) break

    for (const raw of summaries) {
      if (items.length >= limit) break
      const external_id = itemIdFromSummary(raw)
      if (!external_id || seen.has(external_id)) continue
      seen.add(external_id)

      const title = String(raw.title || '').trim()
      if (!title) continue

      const priceVal = (raw.price as Record<string, unknown> | undefined)?.value
      const image = (raw.image as Record<string, unknown> | undefined)?.imageUrl
      const itemWebUrl = String((raw as { itemWebUrl?: string }).itemWebUrl || '')

      items.push({
        external_id,
        title,
        price: parseNum(priceVal),
        image_url: image ? String(image) : null,
        item_url: itemWebUrl || `https://www.ebay.com/itm/${external_id}`,
      })
    }

    offset += summaries.length
    if (summaries.length < pageSize) break
  }

  return { items, items_scanned: offset }
}
