import type { SupabaseClient } from '@supabase/supabase-js'
import { getBcServiceSupabase } from './bcSupabase'

export function getServiceSupabase (): SupabaseClient | null {
  return getBcServiceSupabase()
}

export async function readSiteMarketingContent (keys: string[]) {
  const sb = getBcServiceSupabase()
  if (!sb || !keys.length) return []
  const { data, error } = await sb
    .from('site_marketing_content')
    .select('content_key, payload, updated_at')
    .in('content_key', keys)
  if (error) throw error
  return data || []
}

export async function upsertSiteMarketingContent (contentKey: string, payload: Record<string, unknown>) {
  const sb = getBcServiceSupabase()
  if (!sb) throw new Error('Supabase service role not configured')
  const { data, error } = await sb
    .from('site_marketing_content')
    .upsert({
      content_key: contentKey,
      payload,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'content_key' })
    .select()
    .single()
  if (error) throw error
  return data
}

function rowsToMap (rows: Array<{ content_key: string, payload: Record<string, unknown> }>) {
  const out: Record<string, unknown> = {}
  for (const row of rows) {
    out[row.content_key] = row.payload || {}
  }
  return out
}

export async function fetchSiteContentMap (keys: string[]) {
  const rows = await readSiteMarketingContent(keys)
  return rowsToMap(rows as Array<{ content_key: string, payload: Record<string, unknown> }>)
}
