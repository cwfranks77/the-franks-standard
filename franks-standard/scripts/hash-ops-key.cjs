/**
 * Compute NUXT_PUBLIC_OPS_ACCESS_KEY_HASH for GitHub / Vercel.
 * Usage: node scripts/hash-ops-key.cjs "your operator phrase"
 */
const { createHash } = require('node:crypto')

function normalizeOpsPhrase (input) {
  return String(input || '')
    .trim()
    .toLowerCase()
    .replace(/[\u200B-\u200D\uFEFF]/g, '')
    .replace(/[\u2010-\u2015\u2212\uFE58\uFE63\uFF0D]/g, '-')
    .replace(/\s*-\s*/g, '-')
    .replace(/\s+/g, '-')
}

const phrase = process.argv.slice(2).join(' ').trim()
if (!phrase) {
  console.error('Usage: node scripts/hash-ops-key.cjs "your operator phrase"')
  process.exit(1)
}

const hash = createHash('sha256').update(normalizeOpsPhrase(phrase)).digest('hex')
console.log('NUXT_PUBLIC_OPS_ACCESS_KEY_HASH=' + hash)
