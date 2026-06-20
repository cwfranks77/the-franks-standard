import type { SupabaseClient } from 'npm:@supabase/supabase-js@2'

const LIMITS = {
  login: { max: 5, windowMs: 600_000 },
  messaging: { max: 20, windowMs: 60_000 },
  listing_edit: { max: 10, windowMs: 60_000 },
  api: { max: 200, windowMs: 60_000 },
}

const buckets = new Map<string, number[]>()

export async function checkRateLimit (
  admin: SupabaseClient,
  category: keyof typeof LIMITS,
  key: string,
  meta: { userId?: string | null; ipAddress?: string | null } = {},
) {
  const rule = LIMITS[category]
  const bk = `${category}:${key}`
  const now = Date.now()
  const cutoff = now - rule.windowMs
  const ts = (buckets.get(bk) ?? []).filter((t) => t > cutoff)

  if (ts.length >= rule.max) {
    await admin.from('rate_limit_events').insert({
      limit_key: key,
      category,
      ip_address: meta.ipAddress ?? null,
      user_id: meta.userId ?? null,
      request_count: ts.length + 1,
      window_seconds: Math.floor(rule.windowMs / 1000),
      blocked: true,
      metadata: meta,
    })
    return { allowed: false as const, error: 'rate_limit_exceeded' }
  }

  ts.push(now)
  buckets.set(bk, ts)
  return { allowed: true as const }
}
