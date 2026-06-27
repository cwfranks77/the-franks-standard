/** Supabase public URL helpers for static GitHub Pages builds. */

export function getPublicSupabaseUrl (config: ReturnType<typeof useRuntimeConfig>) {
  const pub = config?.public || {}
  return String(pub.supabaseUrl || '').replace(/\/+$/, '')
}

export function getSupabaseFunctionsBase (config: ReturnType<typeof useRuntimeConfig>) {
  const url = getPublicSupabaseUrl(config)
  if (!url) return ''
  return `${url}/functions/v1`
}
