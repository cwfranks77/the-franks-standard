/**
 * Shared Supabase service client for optional Express marketplace server.
 */

const { createClient } = require('@supabase/supabase-js')

let cached = null

function getServiceSupabaseFromEnv () {
  if (cached) return cached

  const url = String(process.env.SUPABASE_URL || process.env.NUXT_PUBLIC_SUPABASE_URL || '').trim()
  const key = String(process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY || '').trim()
  if (!url || !key) return null

  cached = createClient(url, key, { auth: { persistSession: false } })
  return cached
}

module.exports = { getServiceSupabaseFromEnv }
