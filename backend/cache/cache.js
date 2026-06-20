/**
 * In-memory cache with optional Redis (REDIS_URL). Falls back to memory when Redis unavailable.
 */

const DEFAULT_TTLS = {
  listings: 5 * 60,
  stores: 5 * 60,
  homepage: 10 * 60,
  spotlight: 24 * 60 * 60,
  featured: 24 * 60 * 60,
  seo: 24 * 60 * 60,
  search: 60,
  autocomplete: 10 * 60,
}

const memory = new Map()
let redisClient = null
let redisReady = false

async function getRedis () {
  if (redisClient !== null) return redisClient
  const url = process.env.REDIS_URL || process.env.NUXT_REDIS_URL
  if (!url) {
    redisClient = false
    return false
  }
  try {
    const { createClient } = require('redis')
    const client = createClient({ url })
    client.on('error', () => { redisReady = false })
    await client.connect()
    redisClient = client
    redisReady = true
    return client
  } catch {
    redisClient = false
    return false
  }
}

function memGet (key) {
  const row = memory.get(key)
  if (!row) return null
  if (row.expiresAt < Date.now()) {
    memory.delete(key)
    return null
  }
  return row.value
}

function memSet (key, value, ttlSeconds) {
  memory.set(key, { value, expiresAt: Date.now() + ttlSeconds * 1000 })
}

async function cacheGet (key) {
  const redis = await getRedis()
  if (redis) {
    try {
      const raw = await redis.get(`tfs:${key}`)
      return raw ? JSON.parse(raw) : null
    } catch {
      return memGet(key)
    }
  }
  return memGet(key)
}

async function cacheSet (key, value, ttlSeconds) {
  const redis = await getRedis()
  if (redis) {
    try {
      await redis.set(`tfs:${key}`, JSON.stringify(value), { EX: ttlSeconds })
      return
    } catch {
      // fall through
    }
  }
  memSet(key, value, ttlSeconds)
}

async function cacheDel (pattern) {
  const redis = await getRedis()
  if (redis) {
    try {
      const keys = await redis.keys(`tfs:${pattern}*`)
      if (keys.length) await redis.del(keys)
    } catch {
      // fall through
    }
  }
  for (const k of [...memory.keys()]) {
    if (k.startsWith(pattern)) memory.delete(k)
  }
}

async function getOrSet (key, ttlSeconds, fetcher) {
  const cached = await cacheGet(key)
  if (cached !== null) return { value: cached, hit: true }
  const value = await fetcher()
  await cacheSet(key, value, ttlSeconds)
  return { value, hit: false }
}

const INVALIDATION = {
  listing: (id) => cacheDel(`listings:${id}`).then(() => cacheDel('listings:')),
  store: (id) => cacheDel(`stores:${id}`).then(() => cacheDel('stores:')),
  homepage: () => cacheDel('homepage:'),
  spotlight: () => cacheDel('spotlight:'),
  featured: () => cacheDel('featured:'),
  seo: () => cacheDel('seo:'),
}

function getCacheStatus () {
  return {
    enabled: true,
    backend: redisReady ? 'redis' : 'memory',
    in_memory_keys: memory.size,
    ttls_seconds: DEFAULT_TTLS,
  }
}

module.exports = {
  cacheGet,
  cacheSet,
  cacheDel,
  getOrSet,
  invalidate: INVALIDATION,
  getCacheStatus,
  DEFAULT_TTLS,
}
