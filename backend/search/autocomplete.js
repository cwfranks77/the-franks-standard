/**
 * Autocomplete — titles, brands, categories, stores, tags. Cache 10 minutes.
 */

const { cacheGet, cacheSet } = require('../cache/cache.js')
const { tokenize } = require('./_utils.js')

const AUTOCOMPLETE_TTL = 10 * 60

async function autocomplete (admin, { q = '', limit = 12 }) {
  const prefix = String(q || '').trim().toLowerCase()
  if (prefix.length < 2) return { ok: true, suggestions: [] }

  const cacheKey = `autocomplete:${prefix}:${limit}`
  const cached = await cacheGet(cacheKey)
  if (cached) return { ...cached, cached: true }

  const suggestions = new Map()

  const add = (type, value, score = 50) => {
    const v = String(value || '').trim()
    if (!v || v.length < 2) return
    if (!v.toLowerCase().startsWith(prefix) && !v.toLowerCase().includes(prefix)) return
    const key = `${type}:${v.toLowerCase()}`
    const existing = suggestions.get(key)
    if (!existing || existing.score < score) {
      suggestions.set(key, { type, value: v, score })
    }
  }

  const [{ data: listings }, { data: stores }] = await Promise.all([
    admin.from('search_index_listings').select('title, brand, category, tags').limit(300),
    admin.from('search_index_stores').select('store_name, categories').limit(100),
  ])

  for (const l of listings ?? []) {
    add('title', l.title, 80)
    add('brand', l.brand, 70)
    add('category', l.category, 60)
    const tags = Array.isArray(l.tags) ? l.tags : []
    for (const t of tags) add('tag', t, 55)
  }

  for (const s of stores ?? []) {
    add('store', s.store_name, 75)
    const cats = Array.isArray(s.categories) ? s.categories : []
    for (const c of cats) add('category', c, 58)
  }

  const tokens = tokenize(prefix)
  if (tokens.length) {
    for (const l of listings ?? []) {
      for (const tok of tokenize(l.title)) {
        if (tok.startsWith(tokens[0])) add('title', l.title, 65)
      }
    }
  }

  const sorted = [...suggestions.values()]
    .sort((a, b) => b.score - a.score || a.value.localeCompare(b.value))
    .slice(0, limit)

  const payload = { ok: true, query: prefix, suggestions: sorted }
  await cacheSet(cacheKey, payload, AUTOCOMPLETE_TTL)
  return payload
}

module.exports = { autocomplete, AUTOCOMPLETE_TTL }
