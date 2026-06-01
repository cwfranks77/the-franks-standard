import { createClient } from 'npm:@supabase/supabase-js@2'
import {
  isEbayApiConfigured,
  searchEbaySellerListings,
} from '../_shared/ebayApi.ts'
import { parseEbaySellerHtml } from '../_shared/ebayParse.ts'
import { corsHeaders, json } from '../_shared/stripe.ts'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL') ?? ''
const ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY') ?? ''

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }
  if (req.method !== 'POST') {
    return json({ error: 'method_not_allowed' }, 405)
  }

  const authHeader = req.headers.get('Authorization') ?? ''
  if (!authHeader.startsWith('Bearer ')) {
    return json({ error: 'unauthorized' }, 401)
  }

  const userClient = createClient(SUPABASE_URL, ANON_KEY, {
    global: { headers: { Authorization: authHeader } },
  })
  const { data: { user }, error: userErr } = await userClient.auth.getUser()
  if (userErr || !user) {
    return json({ error: 'unauthorized' }, 401)
  }

  let body: { seller_username?: string; limit?: number }
  try {
    body = await req.json()
  } catch {
    return json({ error: 'invalid_json' }, 400)
  }

  const username = String(body.seller_username ?? '').trim().replace(/^@/, '')
  if (!username || !/^[A-Za-z0-9._-]{2,64}$/.test(username)) {
    return json({ error: 'invalid_username' }, 400)
  }

  const limit = Math.min(120, Math.max(1, Number(body.limit) || 48))
  const apiConfigured = isEbayApiConfigured()

  if (apiConfigured) {
    try {
      const { items, items_scanned } = await searchEbaySellerListings({
        sellerUsername: username,
        limit,
      })
      return json({
        seller_username: username,
        api_configured: true,
        method: 'ebay_browse_api',
        source_url: `https://www.ebay.com/sch/i.html?_ssn=${encodeURIComponent(username)}`,
        count: items.length,
        items_scanned,
        items,
        blocked: false,
        hint: items.length === 0
          ? 'No active listings returned from eBay API for this username.'
          : null,
      })
    } catch (e) {
      const detail = String(e?.message || e)
      // fall through to HTML attempt
      console.error('ebay_api_listing_preview_failed', detail)
    }
  }

  const url = `https://www.ebay.com/sch/i.html?_ssn=${encodeURIComponent(username)}&_ipg=120&rt=nc`
  let res: Response
  try {
    res = await fetch(url, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        Accept: 'text/html,application/xhtml+xml',
        'Accept-Language': 'en-US,en;q=0.9',
      },
    })
  } catch (e) {
    return json({ error: 'fetch_failed', detail: String(e), api_configured: apiConfigured }, 502)
  }

  const html = await res.text()
  const items = parseEbaySellerHtml(html, limit)
  const blocked = res.status === 403 || res.status === 429
  let hint: string | null = null
  if (items.length === 0) {
    if (blocked) {
      hint = apiConfigured
        ? 'HTML blocked; API also failed — check eBay app keys or use CSV import.'
        : 'eBay blocked our server. Add EBAY_CLIENT_ID + EBAY_CLIENT_SECRET to Supabase for automatic import, or use CSV / saved HTML.'
    } else {
      hint = 'No listings parsed. Use CSV export or saved store HTML on the Import page.'
    }
  }

  return json({
    seller_username: username,
    api_configured: apiConfigured,
    method: 'html_scrape',
    source_url: url,
    http_status: res.status,
    blocked,
    count: items.length,
    items,
    hint,
  })
})
