import { createClient } from 'npm:@supabase/supabase-js@2'
import {
  isEbayApiConfigured,
  searchEbayProspects,
} from '../_shared/ebayApi.ts'
import { parseEbayProspectsFromHtml } from '../_shared/ebayProspectParse.ts'
import { corsHeaders, json } from '../_shared/stripe.ts'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL') ?? ''
const ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY') ?? ''

function buildSearchUrl (keywords: string, categoryId: string | null, itemsPerPage: number) {
  const params = new URLSearchParams()
  if (keywords) params.set('_nkw', keywords)
  if (categoryId) params.set('_sacat', categoryId)
  params.set('_ipg', String(itemsPerPage))
  params.set('rt', 'nc')
  return `https://www.ebay.com/sch/i.html?${params.toString()}`
}

async function skimViaHtml (keywords: string, categoryId: string, limit: number) {
  const url = buildSearchUrl(keywords, categoryId || null, limit)
  const res = await fetch(url, {
    headers: {
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      Accept: 'text/html,application/xhtml+xml',
      'Accept-Language': 'en-US,en;q=0.9',
    },
  })
  const html = await res.text()
  const prospects = parseEbayProspectsFromHtml(html, limit)
  const blocked = res.status === 403 || res.status === 429
  let hint: string | null = null
  if (prospects.length === 0) {
    hint = blocked
      ? 'eBay blocked HTML fetch. Add EBAY_CLIENT_ID and EBAY_CLIENT_SECRET to Supabase for fully automated API skim (see docs/EBAY-API-SETUP.md).'
      : 'No sellers parsed from HTML.'
  }
  return { prospects, blocked, hint, source_url: url, http_status: res.status, items_scanned: 0 }
}

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

  let body: { keywords?: string; category_id?: string | null; limit?: number; force_html?: boolean }
  try {
    body = await req.json()
  } catch {
    return json({ error: 'invalid_json' }, 400)
  }

  const keywords = String(body.keywords ?? '').trim().slice(0, 120)
  const categoryId = body.category_id ? String(body.category_id).trim() : ''
  const limit = Math.min(150, Math.max(10, Number(body.limit) || 80))
  const apiConfigured = isEbayApiConfigured()

  try {
    if (apiConfigured && !body.force_html) {
      const { prospects, items_scanned, source_url } = await searchEbayProspects({
        keywords,
        categoryId: categoryId || null,
        maxSellers: limit,
        maxItems: 400,
      })
      return json({
        keywords,
        category_id: categoryId || null,
        api_configured: true,
        method: 'ebay_browse_api',
        blocked: false,
        count: prospects.length,
        items_scanned,
        prospects,
        source_url,
        hint: prospects.length === 0
          ? 'No sellers returned — try broader keywords or another category.'
          : null,
      })
    }

    const htmlResult = await skimViaHtml(keywords, categoryId, limit)
    return json({
      keywords,
      category_id: categoryId || null,
      api_configured: apiConfigured,
      method: 'html_scrape',
      blocked: htmlResult.blocked,
      http_status: htmlResult.http_status,
      count: htmlResult.prospects.length,
      items_scanned: htmlResult.items_scanned,
      prospects: htmlResult.prospects,
      source_url: htmlResult.source_url,
      hint: htmlResult.hint,
    })
  } catch (e) {
    const msg = String(e?.message || e)
    if (msg.includes('ebay_api_not_configured') || msg.includes('ebay_token') || msg.includes('ebay_search')) {
      try {
        const htmlResult = await skimViaHtml(keywords, categoryId, limit)
        return json({
          keywords,
          category_id: categoryId || null,
          api_configured: apiConfigured,
          method: 'html_scrape_fallback',
          api_error: msg,
          blocked: htmlResult.blocked,
          count: htmlResult.prospects.length,
          prospects: htmlResult.prospects,
          source_url: htmlResult.source_url,
          hint: htmlResult.hint || `API error (${msg}). Configure eBay API keys for automation.`,
        })
      } catch {
        return json({
          error: 'skim_failed',
          api_configured: apiConfigured,
          hint: 'Set EBAY_CLIENT_ID + EBAY_CLIENT_SECRET in Supabase secrets. See docs/EBAY-API-SETUP.md',
          detail: msg,
        }, 502)
      }
    }
    return json({ error: 'skim_failed', detail: msg }, 502)
  }
})
