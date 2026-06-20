/**
 * Rate limiting — stores violations in rate_limit_events.
 */

const LIMITS = {
  login: { max: 5, windowMs: 10 * 60 * 1000 },
  messaging: { max: 20, windowMs: 60 * 1000 },
  listing_edit: { max: 10, windowMs: 60 * 1000 },
  api: { max: 200, windowMs: 60 * 1000 },
}

const buckets = new Map()

function bucketKey (category, key) {
  return `${category}:${key}`
}

function pruneBucket (entry, windowMs) {
  const cutoff = Date.now() - windowMs
  entry.timestamps = entry.timestamps.filter((t) => t > cutoff)
}

/**
 * In-memory fast path; persists violations to Supabase when admin client provided.
 * @param {import('@supabase/supabase-js').SupabaseClient | null} admin
 */
async function checkRateLimit (admin, {
  category,
  key,
  userId = null,
  ipAddress = null,
  metadata = {},
}) {
  const rule = LIMITS[category]
  if (!rule) return { ok: true, allowed: true }

  const bk = bucketKey(category, key)
  let entry = buckets.get(bk)
  if (!entry) {
    entry = { timestamps: [] }
    buckets.set(bk, entry)
  }

  pruneBucket(entry, rule.windowMs)
  const count = entry.timestamps.length
  const allowed = count < rule.max

  if (!allowed) {
    if (admin) {
      await admin.from('rate_limit_events').insert({
        limit_key: key,
        category,
        ip_address: ipAddress,
        user_id: userId,
        request_count: count + 1,
        window_seconds: Math.floor(rule.windowMs / 1000),
        blocked: true,
        metadata,
      })
    }
    return {
      ok: false,
      allowed: false,
      error: 'rate_limit_exceeded',
      category,
      limit: rule.max,
      window_seconds: Math.floor(rule.windowMs / 1000),
    }
  }

  entry.timestamps.push(Date.now())
  return { ok: true, allowed: true, remaining: rule.max - entry.timestamps.length }
}

function getRateLimitStatus () {
  return {
    enabled: true,
    limits: Object.fromEntries(
      Object.entries(LIMITS).map(([k, v]) => [k, { max: v.max, window_seconds: v.windowMs / 1000 }]),
    ),
    in_memory_buckets: buckets.size,
  }
}

module.exports = { checkRateLimit, getRateLimitStatus, LIMITS }
