import { createClient, type SupabaseClient } from '@supabase/supabase-js'

let cached: SupabaseClient | null | undefined

export function getServiceSupabase (): SupabaseClient | null {
  if (cached !== undefined) return cached

  const url = String(process.env.SUPABASE_URL || process.env.NUXT_PUBLIC_SUPABASE_URL || '').trim()
  const key = String(
    process.env.SUPABASE_SERVICE_ROLE_KEY
    || process.env.SUPABASE_SERVICE_KEY
    || '',
  ).trim()

  if (!url || !key) {
    cached = null
    return null
  }

  cached = createClient(url, key, { auth: { persistSession: false } })
  return cached
}

export function supabaseUnavailable () {
  return {
    ok: false,
    error: 'supabase_unavailable',
    message: 'Supabase service role not configured.',
  }
}
