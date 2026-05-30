/** Deno copy of utils/authenticityScan.js heuristics */

import { coinIntegrityFlags } from './coinIntegrity.ts'

const NON_COLLECTIBLE = new Set([
  'Consumer Electronics',
  'Tools & Workshop Equipment',
  'Appliances & Home Improvement',
  'Furniture & Home Decor',
  'Garden, Patio & Outdoor Living',
  'Sporting Goods & Outdoors',
  'Automotive Parts & Accessories',
  'Pet Supplies',
  'Beauty & Personal Care',
  'Health & Wellness',
  'Baby, Kids & Family',
  'Food & Gourmet (shelf-stable)',
  'Office & School Supplies',
  'Craft, Hobby & Maker Supplies',
  'Apparel & Clothing',
  'General Merchandise',
  'General Store',
  'Firearms Accessories',
])

const COLLECTIBLE_INTENT_RE =
  /\b(collectible|collectables|antique|antiques|vintage|graded|slabbed|slab|psa|bgs|sgc|pcgs|ngc|pmg|autograph|signed by|memorabilia|rookie card|trading card|sports card|pokemon|comic book|coin|currency|numismatic|certificate of authenticity|\bcoa\b|game used|game-worn|1\/1|one of one)\b/i

function listingRequiresCoa (
  category: unknown,
  title?: unknown,
  description?: unknown,
): boolean {
  const c = String(category || '').trim()
  if (!c) return false
  const text = `${title || ''} ${description || ''}`.trim()
  const keywords = text.length >= 4 && COLLECTIBLE_INTENT_RE.test(text)
  if (NON_COLLECTIBLE.has(c) || c === 'Other (describe in listing)') return keywords
  return true
}

type Flag = { id: string; label: string; severity: string; weight: number }

const REPLICA_SIGNALS = [
  { id: 'replica_keyword', re: /\b(replica|reproduction|copy of|inspired by|style of|looks like|homage|unauthorized|bootleg|counterfeit|fake)\b/i, label: 'Replica / fake language in listing', severity: 'block', weight: 40 },
  { id: 'not_genuine', re: /\b(not\s+genuine|not\s+authentic|no\s+guarantee\s+of\s+auth)/i, label: 'Seller disclaims authenticity', severity: 'block', weight: 35 },
  { id: 'as_is_no_auth', re: /\b(sold\s+as[\s-]*is|no\s+coa|without\s+certificate)\b/i, label: 'Sold without authentication language', severity: 'review', weight: 20 },
]

const GRADE_CLAIM = /\b(psa|bgs|beckett|sgc|pcgs|ngc|pmg|cac)\s*#?\s*\d{4,12}\b/i
const GRADE_WORD = /\b(psa|bgs|sgc|pcgs|ngc|pmg)\s*(10|9\.5|9|8|gem\s*mint|mint)\b/i

const CATEGORY_RULES: Record<string, Array<{
  id: string
  label: string
  severity: string
  weight: number
  re?: RegExp
  test?: (t: string, row: Record<string, unknown>) => boolean
}>> = {
  'Coins & Currency': [
    { id: 'coin_no_cert_claim', test: (t, row) => /\b(graded|pcgs|ngc|pmg|ms\d+|pr\d+|proof)\b/i.test(t) && row.coa_type === 'guarantee' && !row.coa_storage_path, label: 'Graded coin claim but only signed guarantee (no cert file)', severity: 'review', weight: 25 },
    { id: 'coin_plated', re: /\b(gold[\s-]*plated|clad|replica coin|copy coin|fantasy issue)\b/i, label: 'Possible plated / copy coin language', severity: 'block', weight: 35 },
  ],
  'Sports Cards & Memorabilia': [
    { id: 'slab_no_upload', test: (t, row) => (GRADE_CLAIM.test(t) || GRADE_WORD.test(t)) && row.coa_type === 'guarantee' && !row.coa_storage_path, label: 'Graded slab claimed without COA upload', severity: 'review', weight: 30 },
  ],
}

export function scanListingIntegrity (row: Record<string, unknown>) {
  const text = `${row.title || ''}\n${row.description || ''}`.trim()
  const flags: Flag[] = []
  let score = 0

  for (const sig of REPLICA_SIGNALS) {
    if (sig.re.test(text)) {
      flags.push({ id: sig.id, label: sig.label, severity: sig.severity, weight: sig.weight })
      score += sig.weight
    }
  }

  const catRules = CATEGORY_RULES[String(row.category || '')] || []
  for (const rule of catRules) {
    if (rule.re && rule.re.test(text)) {
      flags.push({ id: rule.id, label: rule.label, severity: rule.severity, weight: rule.weight })
      score += rule.weight
    } else if (rule.test && rule.test(text, row)) {
      flags.push({ id: rule.id, label: rule.label, severity: rule.severity, weight: rule.weight })
      score += rule.weight
    }
  }

  const coaType = String(row.coa_type || '')
  const proofRequired = listingRequiresCoa(row.category, row.title, row.description)
  if (proofRequired && coaType === 'none') {
    flags.push({
      id: 'collectible_no_proof',
      label: 'Collectible listing requires COA, guarantee, or Franks issued COA',
      severity: 'block',
      weight: 45,
    })
    score += 45
  }
  if (proofRequired && coaType === 'upload' && !row.coa_storage_path) {
    flags.push({ id: 'coa_missing_file', label: 'Marked COA upload but no file on record', severity: 'review', weight: 30 })
    score += 30
  }
  if (proofRequired && coaType === 'guarantee' && !row.guarantee_signed) {
    flags.push({ id: 'guarantee_unsigned', label: 'Guarantee selected but not signed', severity: 'block', weight: 50 })
    score += 50
  }

  if (String(row.category || '').includes('Coin')) {
    for (const cf of coinIntegrityFlags(row)) {
      flags.push(cf)
      score += cf.weight
    }
  }

  const hasBlock = flags.some((f) => f.severity === 'block')
  const hasReview = flags.some((f) => f.severity === 'review')
  const severity = hasBlock ? 'block' : hasReview ? 'review' : 'clear'

  return { ok: severity !== 'block', score, severity, flags }
}

export function integrityStatusFromScan (
  scan: { severity: string; score: number },
  reportCount = 0,
) {
  if (reportCount >= 2) return 'review'
  if (scan.severity === 'block') return 'review'
  if (scan.severity === 'review' || scan.score >= 25) return 'review'
  return 'clear'
}
