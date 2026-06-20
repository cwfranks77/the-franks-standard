/**
 * Rate limiting — stores violations in rate_limit_events.
 */

const LIMITS = {
  login: { max: 5, windowMs: 10 * 60 * 1000 },
  messaging: { max: 20, windowMs: 60 * 1000 },
  messages: { max: 20, windowMs: 60 * 1000 },
  listing_edit: { max: 10, windowMs: 60 * 1000 },
  listings: { max: 10, windowMs: 60 * 1000 },
  reviews: { max: 5, windowMs: 60 * 1000 },
  disputes: { max: 3, windowMs: 60 * 1000 },
  coa: { max: 5, windowMs: 60 * 1000 },
  api: { max: 200, windowMs: 60 * 1000 },
}

/** Map API path prefixes to rate-limit categories (Section 10). */
const API_PATH_LIMITS = [
  { prefix: '/api/messages', category: 'messages' },
  { prefix: '/api/listings', category: 'listings' },
  { prefix: '/api/reviews', category: 'reviews' },
  { prefix: '/api/disputes', category: 'disputes' },
  { prefix: '/api/coa', category: 'coa' },
]

function categoryForPath (path) {
  const p = String(path || '').split('?')[0]
  for (const row of API_PATH_LIMITS) {
    if (p === row.prefix || p.startsWith(`${row.prefix}/`)) return row.category
  }
  return null
}

async function checkRateLimitForPath (admin, path, key, meta = {}) {
  const category = categoryForPath(path)
  if (!category) return { ok: true, allowed: true }
  return checkRateLimit(admin, { category, key, ...meta })
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

module.exports = { checkRateLimit, checkRateLimitForPath, categoryForPath, getRateLimitStatus, LIMITS, API_PATH_LIMITS }
