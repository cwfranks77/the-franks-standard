import { BC_META_DEFAULTS } from '~/utils/bcMetaDefaults.js'

type SiteContentKey = 'bcMeta' | 'bcTheme' | 'homepage' | 'ads' | 'antiqueLedger'

const CONTENT_DEFAULTS: Record<string, unknown> = {
  bcMeta: BC_META_DEFAULTS,
  bcTheme: {
    presetId: 'classic-red',
    accent: '#d32f2f',
    accentBright: '#ff5252',
    bg: '#0a0a0c',
    bgCard: '#16161c',
  },
}

function mergeRows (keys: SiteContentKey[], rows: Array<{ content_key: string, payload: Record<string, unknown> }> | null) {
  const out: Record<string, unknown> = {}
  for (const key of keys) {
    const base = (CONTENT_DEFAULTS[key] as Record<string, unknown>) || {}
    const row = rows?.find((item) => item.content_key === key)
    const payload = (row?.payload || {}) as Record<string, unknown>
    if (key === 'antiqueLedger') {
      out.antiqueLedger = {
        items: Array.isArray(payload.items) ? payload.items : [],
      }
      continue
    }
    out[key] = { ...base, ...payload }
  }
  return out
}

/** Public marketing content — Nuxt API in dev, Supabase on static GitHub Pages. */
export async function fetchBcPublicSiteContent (keys: SiteContentKey[]) {
  const wanted = keys.length ? keys : (Object.keys(CONTENT_DEFAULTS) as SiteContentKey[])

  try {
    const data = await $fetch<Record<string, unknown>>('/api/public/site-content', {
      query: { keys: wanted.join(',') },
    })
    if (data && typeof data === 'object') return data
  } catch { /* static host — fall through to Supabase */ }

  try {
    const supabase = useSupabaseClient()
    const { data, error } = await supabase
      .from('site_marketing_content')
      .select('content_key, payload')
      .in('content_key', wanted)
    if (error) throw error
    return mergeRows(wanted, data || [])
  } catch {
    return mergeRows(wanted, null)
  }
}
