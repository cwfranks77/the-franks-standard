import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import {
  DEFAULT_ADS,
  DEFAULT_HOMEPAGE,
  catalogRowToGridItem,
  defaultDropshipCatalog,
  defaultDropshipStore,
} from './ownerConfigDefaults'

let serviceClient: SupabaseClient | null | undefined

export function getServiceSupabase (): SupabaseClient | null {
  if (serviceClient !== undefined) return serviceClient
  const config = useRuntimeConfig()
  const url = process.env.NUXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
  const key = String(config.supabaseServiceKey || process.env.SUPABASE_SERVICE_ROLE_KEY || '')
  if (!url || !key) {
    serviceClient = null
    return null
  }
  serviceClient = createClient(url, key, { auth: { persistSession: false } })
  return serviceClient
}

const DEFAULT_BC_META = {
  title: 'B&C Performance Audio LLC | Competition Subwoofers & Car Audio Amplifiers',
  description: 'Shop competition subwoofers, monoblock amplifiers, Sundown, Kicker, Rockford Fosgate, and Taramps from B&C Performance Audio LLC — Louisiana checkout with dropship fulfillment.',
  image: 'https://www.bcpoweraudio.com/franks-pavilion.png',
  parentCompany: 'The Franks Standard LLC',
}

const DEFAULT_BC_THEME = {
  presetId: 'classic-red',
  accent: '#d32f2f',
  accentBright: '#ff5252',
  bg: '#0a0a0c',
  bgCard: '#16161c',
}

export async function fetchSiteMarketing (keys?: string[]) {
  const defaults: Record<string, unknown> = {
    homepage: DEFAULT_HOMEPAGE,
    ads: DEFAULT_ADS,
    bcMeta: DEFAULT_BC_META,
    bcTheme: DEFAULT_BC_THEME,
  }
  const wanted = keys?.length ? keys : Object.keys(defaults)
  const out: Record<string, unknown> = {}
  for (const key of wanted) {
    out[key] = defaults[key] ?? {}
  }

  const sb = getServiceSupabase()
  if (!sb) return out

  const { data, error } = await sb
    .from('site_marketing_content')
    .select('content_key, payload')
    .in('content_key', wanted)

  if (error) return out

  for (const row of data || []) {
    out[row.content_key] = { ...(defaults[row.content_key] as object || {}), ...(row.payload || {}) }
  }
  return out
}

export async function saveSiteMarketing (contentKey: string, payload: Record<string, unknown>) {
  const sb = getServiceSupabase()
  if (!sb) {
    throw createError({ statusCode: 503, statusMessage: 'Supabase service role not configured. Run migration 037_owner_cms.sql and set SUPABASE_SERVICE_ROLE_KEY.' })
  }
  const { error } = await sb
    .from('site_marketing_content')
    .upsert({ content_key: contentKey, payload, updated_at: new Date().toISOString() }, { onConflict: 'content_key' })
  if (error) throw createError({ statusCode: 500, statusMessage: error.message })
}

export async function fetchDropshipStore (storeId = 'bc-performance-audio') {
  const storeDefault = defaultDropshipStore()
  const catalogDefault = defaultDropshipCatalog()

  const sb = getServiceSupabase()
  if (!sb) {
    return {
      store: storeDefault,
      items: catalogDefault.map((row) => catalogRowToGridItem(row, storeDefault)),
      source: 'defaults',
    }
  }

  const { data: storeRow, error: storeErr } = await sb
    .from('dropship_stores')
    .select('*')
    .eq('id', storeId)
    .maybeSingle()

  if (storeErr || !storeRow) {
    return {
      store: storeDefault,
      items: catalogDefault.map((row) => catalogRowToGridItem(row, storeDefault)),
      source: 'defaults',
    }
  }

  if (!storeRow.is_live) {
    return {
      store: storeRow,
      items: [],
      offline: true,
      source: 'supabase',
    }
  }

  const { data: itemRows, error: itemsErr } = await sb
    .from('dropship_catalog_items')
    .select('*')
    .eq('store_id', storeId)
    .eq('is_active', true)
    .order('sort_order')

  if (itemsErr) {
    return {
      store: storeRow,
      items: catalogDefault.map((row) => catalogRowToGridItem(row, storeRow)),
      source: 'defaults',
    }
  }

  const activeItems = (itemRows || []).filter((r) => r.is_active !== false)
  return {
    store: storeRow,
    items: activeItems.length
      ? activeItems.map((row) => catalogRowToGridItem(row, storeRow))
      : catalogDefault.map((row) => catalogRowToGridItem(row, storeRow)),
    source: 'supabase',
  }
}

export async function fetchDropshipStoreForOps (storeId = 'bc-performance-audio') {
  const storeDefault = defaultDropshipStore()
  const catalogDefault = defaultDropshipCatalog()
  const sb = getServiceSupabase()
  if (!sb) {
    return { store: storeDefault, items: catalogDefault, source: 'defaults' }
  }

  const [{ data: storeRow }, { data: itemRows }] = await Promise.all([
    sb.from('dropship_stores').select('*').eq('id', storeId).maybeSingle(),
    sb.from('dropship_catalog_items').select('*').eq('store_id', storeId).order('sort_order'),
  ])

  return {
    store: storeRow || storeDefault,
    items: itemRows?.length ? itemRows : catalogDefault,
    source: storeRow ? 'supabase' : 'defaults',
  }
}

export async function saveDropshipStore (store: Record<string, unknown>, items: Record<string, unknown>[]) {
  const sb = getServiceSupabase()
  if (!sb) {
    throw createError({ statusCode: 503, statusMessage: 'Supabase service role not configured. Run migration 037_owner_cms.sql and set SUPABASE_SERVICE_ROLE_KEY.' })
  }

  const storeId = String(store.id || 'bc-performance-audio')
  const { error: storeErr } = await sb.from('dropship_stores').upsert({
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

  if (storeErr) throw createError({ statusCode: 500, statusMessage: storeErr.message })

  const { error: delErr } = await sb.from('dropship_catalog_items').delete().eq('store_id', storeId)
  if (delErr) throw createError({ statusCode: 500, statusMessage: delErr.message })

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
    const { error: insErr } = await sb.from('dropship_catalog_items').insert(rows)
    if (insErr) throw createError({ statusCode: 500, statusMessage: insErr.message })
  }
}
