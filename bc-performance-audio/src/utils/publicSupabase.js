/** Public Supabase URL + anon key for browser and edge calls. */
export function getPublicSupabaseUrl (runtimeConfig) {
  const c = runtimeConfig?.public || {}
  return String(c.supabase?.url || c.supabaseUrl || process.env.NUXT_PUBLIC_SUPABASE_URL || '').trim()
}

export function getPublicSupabaseKey (runtimeConfig) {
  const c = runtimeConfig?.public || {}
  return String(
    c.supabase?.key
    || c.supabaseKey
    || process.env.NUXT_PUBLIC_SUPABASE_KEY
    || process.env.NUXT_PUBLIC_SUPABASE_ANON_KEY
    || '',
  ).trim()
}

export function hasPublicSupabase (runtimeConfig) {
  return Boolean(getPublicSupabaseUrl(runtimeConfig) && getPublicSupabaseKey(runtimeConfig))
}

/** Base URL for Supabase Edge Functions (e.g. …/functions/v1). */
export function getSupabaseFunctionsBase (runtimeConfig) {
  const url = getPublicSupabaseUrl(runtimeConfig).replace(/\/$/, '')
  if (!url) return ''
  return `${url}/functions/v1`
}
