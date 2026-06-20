import type { SupabaseClient } from 'npm:@supabase/supabase-js@2'
import { notificationTriggers } from './notifications.ts'

export type StorePublicRow = {
  id: string
  store_name: string | null
  store_slug: string | null
  featured_store: boolean | null
}

export async function fetchFeaturedStore (
  admin: SupabaseClient,
): Promise<StorePublicRow | null> {
  const { data } = await admin
    .from('profiles')
    .select('id, store_name, store_slug, featured_store')
    .eq('featured_store', true)
    .order('updated_at', { ascending: false })
    .limit(1)
    .maybeSingle()
  return data as StorePublicRow | null
}

export async function fetchDailySpotlight (
  admin: SupabaseClient,
  dateIso?: string,
): Promise<{ spotlight_date: string; store: StorePublicRow } | null> {
  const date = dateIso ?? new Date().toISOString().slice(0, 10)
  const { data: row } = await admin
    .from('daily_spotlight')
    .select('spotlight_date, store_id')
    .eq('spotlight_date', date)
    .maybeSingle()

  if (!row?.store_id) return null

  const { data: store } = await admin
    .from('profiles')
    .select('id, store_name, store_slug, featured_store')
    .eq('id', row.store_id)
    .maybeSingle()

  if (!store) return null
  return { spotlight_date: row.spotlight_date, store: store as StorePublicRow }
}

export async function pickDailySpotlight (
  admin: SupabaseClient,
): Promise<{ ok: true; store_id: string; spotlight_date: string } | { ok: false; error: string }> {
  const today = new Date().toISOString().slice(0, 10)

  const existing = await fetchDailySpotlight(admin, today)
  if (existing?.store?.id) {
    return { ok: true, store_id: existing.store.id, spotlight_date: today }
  }

  const { data: candidates, error } = await admin
    .from('profiles')
    .select('id')
    .eq('active_store', true)
    .not('store_slug', 'is', null)
    .neq('store_slug', '')

  if (error) return { ok: false, error: error.message }
  const pool = (candidates ?? []).map((c) => c.id)
  if (pool.length < 1) return { ok: false, error: 'no_active_stores' }

  const pick = pool[Math.floor(Math.random() * pool.length)]
  const { error: insErr } = await admin.from('daily_spotlight').insert({
    store_id: pick,
    spotlight_date: today,
  })

  if (insErr) return { ok: false, error: insErr.message }

  const { data: store } = await admin
    .from('profiles')
    .select('store_name')
    .eq('id', pick)
    .maybeSingle()

  await notificationTriggers.spotlightSelected(admin, {
    userId: pick,
    storeName: store?.store_name ?? undefined,
    date: today,
  }).catch((e) => console.error('spotlight notification', e))

  return { ok: true, store_id: pick, spotlight_date: today }
}

export function storePayload (store: StorePublicRow) {
  const slug = store.store_slug ?? ''
  return {
    store_id: store.id,
    store_name: store.store_name,
    store_slug: slug,
    featured: !!store.featured_store,
    store_url: slug ? `/store/${slug}` : null,
  }
}
