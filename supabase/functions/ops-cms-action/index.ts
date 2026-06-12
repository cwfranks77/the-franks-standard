import { createClient } from 'npm:@supabase/supabase-js@2'
import { verifyOpsKey } from '../_shared/opsAuth.ts'
import { corsHeaders, json } from '../_shared/stripe.ts'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL') ?? ''
const SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? Deno.env.get('SERVICE_ROLE_KEY') ?? ''

const DEFAULT_BC_META = {
  title: 'B&C Performance Audio LLC | Competition Subwoofers & Car Audio Amplifiers',
  description: 'Shop competition subwoofers, monoblock amplifiers, Sundown, Kicker, Rockford Fosgate, and Taramps from B&C Performance Audio LLC.',
  image: 'https://www.bcpoweraudio.com/img/hero-showcase-v2.svg',
  parentCompany: 'B&C Performance Audio LLC',
  url: 'https://www.bcpoweraudio.com',
}

const DEFAULT_ANTIQUE_LEDGER = {
  items: [
    {
      id: 'antique-01',
      title: 'Vintage Cast Iron Mechanical Bank',
      purchase_price: 45,
      sale_price: 175,
      collected_sales_tax: 7.79,
      income_tax_reserve: 32.5,
    },
  ],
}

const DEFAULT_BC_THEME = {
  presetId: 'classic-red',
  accent: '#d32f2f',
  accentBright: '#ff5252',
  bg: '#0a0a0c',
  bgCard: '#16161c',
}

function isSiteMarketingTableMissing (error: { message?: string } | null): boolean {
  const msg = String(error?.message || '').toLowerCase()
  return msg.includes('site_marketing_content') &&
    (msg.includes('schema cache') || msg.includes('does not exist') || msg.includes('pgrst'))
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })
  if (req.method !== 'POST') return json({ error: 'method_not_allowed' }, 405)

  let body: Record<string, unknown>
  try {
    body = await req.json()
  } catch {
    return json({ error: 'invalid_json' }, 400)
  }

  const opsKey = String(body.ops_key ?? '')
  if (!(await verifyOpsKey(opsKey))) {
    return json({ error: 'unauthorized' }, 401)
  }

  if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
    return json({ error: 'supabase_not_configured' }, 503)
  }

  const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, { auth: { persistSession: false } })
  const action = String(body.action ?? '')

  if (action === 'get_site_content') {
    const keysRaw = body.keys ? String(body.keys).split(',').map((k) => k.trim()).filter(Boolean) : []
    const defaults: Record<string, unknown> = {
      bcMeta: DEFAULT_BC_META,
      bcTheme: DEFAULT_BC_THEME,
      antiqueLedger: DEFAULT_ANTIQUE_LEDGER,
    }
    const wanted = keysRaw.length ? keysRaw : Object.keys(defaults)
    const out: Record<string, unknown> = {}
    for (const key of wanted) out[key] = defaults[key] ?? {}

    const { data, error } = await admin
      .from('site_marketing_content')
      .select('content_key, payload')
      .in('content_key', wanted)

    if (error && !isSiteMarketingTableMissing(error)) return json({ error: error.message }, 500)
    for (const row of data || []) {
      const key = row.content_key
      const base = (defaults[key] as Record<string, unknown>) || {}
      const payload = (row.payload || {}) as Record<string, unknown>
      if (key === 'antiqueLedger') {
        out.antiqueLedger = {
          items: Array.isArray(payload.items) ? payload.items : (base.items as unknown[]) || [],
        }
        continue
      }
      out[key] = { ...base, ...payload }
    }
    return json(out)
  }

  if (action === 'put_site_content') {
    const contentKey = String(body.contentKey || '')
    const payload = body.payload
    if (!contentKey || !payload || typeof payload !== 'object') {
      return json({ error: 'contentKey and payload required' }, 400)
    }
    const { error } = await admin.from('site_marketing_content').upsert({
      content_key: contentKey,
      payload,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'content_key' })
    if (error) {
      if (isSiteMarketingTableMissing(error)) {
        return json({
          error: 'owner_storage_not_ready',
          hint: 'Cloud storage is still starting. Wait 2 minutes, click Reload, then Save again.',
        }, 503)
      }
      return json({ error: error.message }, 500)
    }
    return json({ ok: true, contentKey })
  }

  if (action === 'get_dropship_store') {
    const storeId = String(body.storeId || 'bc-performance-audio')
    const [{ data: storeRow }, { data: itemRows }] = await Promise.all([
      admin.from('dropship_stores').select('*').eq('id', storeId).maybeSingle(),
      admin.from('dropship_catalog_items').select('*').eq('store_id', storeId).order('sort_order'),
    ])
    return json({
      store: storeRow || { id: storeId, name: 'B&C Performance Audio', is_live: true, hero_json: {} },
      items: itemRows || [],
      source: storeRow ? 'supabase' : 'defaults',
    })
  }

  if (action === 'save_dropship_store') {
    const store = (body.store || {}) as Record<string, unknown>
    const items = Array.isArray(body.items) ? body.items as Record<string, unknown>[] : []
    const storeId = String(store.id || 'bc-performance-audio')

    const { error: storeErr } = await admin.from('dropship_stores').upsert({
      id: storeId,
      slug: store.slug || storeId,
      name: store.name,
      tagline: store.tagline,
      accent: store.accent || '#d32f2f',
      is_live: store.is_live !== false,
      hero_json: store.hero_json || {},
      sort_order: Number(store.sort_order) || 0,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'id' })
    if (storeErr) return json({ error: storeErr.message }, 500)

    const { error: delErr } = await admin.from('dropship_catalog_items').delete().eq('store_id', storeId)
    if (delErr) return json({ error: delErr.message }, 500)

    if (items.length) {
      const rows = items.map((item, index) => ({
        store_id: storeId,
        item_id: String(item.item_id || item.id),
        brand: item.brand || '',
        name: item.name,
        tagline: item.tagline || '',
        retail_price: Number(item.retail_price ?? item.retailPrice ?? 0),
        wholesale_cost: Number(item.wholesale_cost ?? item.wholesaleCost ?? 0),
        category: item.category || '',
        badge: item.badge || '',
        image: item.image || '/img/hero-showcase-v2.svg',
        specs: item.specs || [],
        sort_order: Number(item.sort_order ?? index),
        is_active: item.is_active !== false,
        updated_at: new Date().toISOString(),
      }))
      const { error: insErr } = await admin.from('dropship_catalog_items').insert(rows)
      if (insErr) return json({ error: insErr.message }, 500)
    }

    const [{ data: storeRow }, { data: itemRows }] = await Promise.all([
      admin.from('dropship_stores').select('*').eq('id', storeId).maybeSingle(),
      admin.from('dropship_catalog_items').select('*').eq('store_id', storeId).order('sort_order'),
    ])
    return json({
      store: storeRow,
      items: itemRows || [],
      source: 'supabase',
    })
  }

  if (action === 'get_bc_orders') {
    const { data, error } = await admin
      .from('dropship_orders')
      .select('id,order_id,provider_key,provider_status,provider_order_id,updated_at,created_at,order:orders(tracking_number,tracking_carrier,total_cents,buyer_email),listing:listings(title)')
      .order('updated_at', { ascending: false })
      .limit(40)
    if (error) return json({ error: error.message }, 500)
    return json({ rows: data || [], source: 'supabase' })
  }

  return json({ error: 'unknown_action' }, 400)
})
