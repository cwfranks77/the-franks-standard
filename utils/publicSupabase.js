/**
 * Resolve Supabase public client config from Nuxt runtime (static + dev builds).
 * @nuxtjs/supabase v2 stores URL/key at runtimeConfig.public.supabase.{url,key}.
 */
export function getPublicSupabaseUrl (config) {
  const pub = config?.public || {}
  return String(pub.supabase?.url || pub.supabaseUrl || '').replace(/\/+$/, '')
}

export function getPublicSupabaseKey (config) {
  const pub = config?.public || {}
  return String(pub.supabase?.key || pub.supabaseKey || '').trim()
}

export function hasPublicSupabase (config) {
  return Boolean(getPublicSupabaseUrl(config) && getPublicSupabaseKey(config))
}

export function getSupabaseFunctionsBase (config) {
  const url = getPublicSupabaseUrl(config)
  if (!url) {
    throw new Error('Supabase URL is not configured on this build.')
  }
  return `${url}/functions/v1`
}
