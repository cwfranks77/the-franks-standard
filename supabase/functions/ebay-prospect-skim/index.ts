import { createClient } from 'npm:@supabase/supabase-js@2'
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

  let body: { keywords?: string; category_id?: string | null; limit?: number }
  try {
    body = await req.json()
  } catch {
    return json({ error: 'invalid_json' }, 400)
  }

  const keywords = String(body.keywords ?? '').trim().slice(0, 120)
  const categoryId = body.category_id ? String(body.category_id).trim() : ''
  const limit = Math.min(120, Math.max(10, Number(body.limit) || 60))
  const url = buildSearchUrl(keywords, categoryId || null, limit)

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
    return json({ error: 'fetch_failed', detail: String(e) }, 502)
  }

  const html = await res.text()
  const prospects = parseEbayProspectsFromHtml(html, limit)
  const blocked = res.status === 403 || res.status === 429

  let hint: string | null = null
  if (prospects.length === 0) {
    hint = blocked
      ? 'eBay blocked the server. Open the search link in Chrome, save the page as HTML, upload on /ops/ebay-prospects.'
      : 'No sellers found in HTML — try a broader keyword or upload a saved search page.'
  }

  return json({
    keywords,
    category_id: categoryId || null,
    source_url: url,
    http_status: res.status,
    blocked,
    count: prospects.length,
    prospects,
    hint,
  })
})
