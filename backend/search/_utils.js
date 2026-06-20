/**
 * Shared search tokenization and fuzzy scoring.
 */

function tokenize (text) {
  return String(text || '')
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, ' ')
    .split(/\s+/)
    .filter((t) => t.length > 1)
}

function buildSearchText (parts) {
  return parts.filter(Boolean).join(' ').toLowerCase().slice(0, 8000)
}

/** Simple token overlap + substring fuzzy score (0–100). */
function fuzzyScore (query, haystack) {
  const q = tokenize(query)
  if (!q.length) return 0
  const h = ` ${String(haystack || '').toLowerCase()} `
  let hits = 0
  for (const tok of q) {
    if (h.includes(` ${tok}`) || h.includes(tok)) hits += 1
    else if ([...tok].every((c, i) => h.includes(tok.slice(0, i + 1)))) hits += 0.5
  }
  return Math.round((hits / q.length) * 100)
}

function parseTags (raw) {
  if (Array.isArray(raw)) return raw.map(String)
  if (typeof raw === 'string') {
    try {
      const p = JSON.parse(raw)
      return Array.isArray(p) ? p.map(String) : []
    } catch {
      return raw.split(',').map((s) => s.trim()).filter(Boolean)
    }
  }
  return []
}

module.exports = { tokenize, buildSearchText, fuzzyScore, parseTags }
