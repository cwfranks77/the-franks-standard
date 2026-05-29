/**
 * Listing integrity scanner — heuristic signals for counterfeit / misrepresentation risk.
 * Not a substitute for expert authentication; flags items for owner review and can block publish.
 */

import { coinIntegrityFlags } from '~/utils/coinIntegrity.js'

const REPLICA_SIGNALS = [
  { id: 'replica_keyword', re: /\b(replica|reproduction|copy of|inspired by|style of|looks like|homage|unauthorized|bootleg|counterfeit|fake)\b/i, label: 'Replica / fake language in listing', severity: 'block', weight: 40 },
  { id: 'not_genuine', re: /\b(not\s+genuine|not\s+authentic|no\s+guarantee\s+of\s+auth)/i, label: 'Seller disclaims authenticity', severity: 'block', weight: 35 },
  { id: 'as_is_no_auth', re: /\b(sold\s+as[\s-]*is|no\s+coa|without\s+certificate)\b/i, label: 'Sold without authentication language', severity: 'review', weight: 20 },
]

const GRADE_CLAIM = /\b(psa|bgs|beckett|sgc|pcgs|ngc|pmg|cac)\s*#?\s*\d{4,12}\b/i
const GRADE_WORD = /\b(psa|bgs|sgc|pcgs|ngc|pmg)\s*(10|9\.5|9|8|gem\s*mint|mint)\b/i

const CATEGORY_RULES = {
  'Coins & Currency': [
    { id: 'coin_no_cert_claim', test: (t, row) => /\b(graded|pcgs|ngc|pmg|ms\d+|pr\d+|proof)\b/i.test(t) && row.coa_type === 'guarantee' && !row.coa_storage_path, label: 'Graded coin claim but only signed guarantee (no cert file)', severity: 'review', weight: 25 },
    { id: 'coin_plated', re: /\b(gold[\s-]*plated|clad|replica coin|copy coin|fantasy issue)\b/i, label: 'Possible plated / copy coin language', severity: 'block', weight: 35 },
  ],
  'Sports Cards & Memorabilia': [
    { id: 'slab_no_upload', test: (t, row) => (GRADE_CLAIM.test(t) || GRADE_WORD.test(t)) && row.coa_type === 'guarantee' && !row.coa_storage_path, label: 'Graded slab claimed without COA upload', severity: 'review', weight: 30 },
    { id: 'custom_slabs', re: /\b(custom\s*slab|novelty\s*slab|ungraded\s*repack)\b/i, label: 'Non-standard slab language', severity: 'review', weight: 18 },
  ],
  'Watches & Jewelry': [
    { id: 'watch_clone', re: /\b(super\s*clone|clone|homage|replica\s*watch|fake\s*rolex)\b/i, label: 'Watch replica / clone language', severity: 'block', weight: 45 },
  ],
  'Sneakers & Streetwear': [
    { id: 'ua_unauthorized', re: /\b(ua\b|unauthorized\s*authentic|fake\s*jordan|replica\s*sneaker)/i, label: 'Unauthorized / replica sneaker language', severity: 'block', weight: 40 },
  ],
}

/**
 * @param {Record<string, unknown>} row
 * @returns {{ ok: boolean, score: number, severity: 'clear'|'review'|'block', flags: Array<{id:string,label:string,severity:string,weight:number}> }}
 */
export function scanListingIntegrity (row = {}) {
  const text = `${row.title || ''}\n${row.description || ''}`.trim()
  const flags = []
  let score = 0

  for (const sig of REPLICA_SIGNALS) {
    if (sig.re.test(text)) {
      flags.push({ id: sig.id, label: sig.label, severity: sig.severity, weight: sig.weight })
      score += sig.weight
    }
  }

  const catRules = CATEGORY_RULES[row.category] || []
  for (const rule of catRules) {
    if (rule.re && rule.re.test(text)) {
      flags.push({ id: rule.id, label: rule.label, severity: rule.severity, weight: rule.weight })
      score += rule.weight
    } else if (rule.test && rule.test(text, row)) {
      flags.push({ id: rule.id, label: rule.label, severity: rule.severity, weight: rule.weight })
      score += rule.weight
    }
  }

  if (row.coa_type === 'upload' && !row.coa_storage_path) {
    flags.push({ id: 'coa_missing_file', label: 'Marked COA upload but no file on record', severity: 'review', weight: 30 })
    score += 30
  }

  if (row.coa_type === 'guarantee' && !row.guarantee_signed) {
    flags.push({ id: 'guarantee_unsigned', label: 'Guarantee selected but not signed', severity: 'block', weight: 50 })
    score += 50
  }

  if (GRADE_CLAIM.test(text) && row.coa_type === 'guarantee' && !row.coa_storage_path) {
    const exists = flags.some((f) => f.id === 'slab_no_upload')
    if (!exists) {
      flags.push({ id: 'cert_number_no_coa', label: 'Cert number in title but no third-party COA uploaded', severity: 'review', weight: 22 })
      score += 22
    }
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

  return {
    ok: severity !== 'block',
    score,
    severity,
    flags,
  }
}

export function integrityStatusFromScan (scan, reportCount = 0) {
  if (reportCount >= 2) return 'review'
  if (scan.severity === 'block') return 'review'
  if (scan.severity === 'review' || scan.score >= 25) return 'review'
  return 'clear'
}

export const REPORT_REASONS = [
  { value: 'suspected_counterfeit', label: 'Suspected counterfeit / fake' },
  { value: 'misrepresented_grade', label: 'Grade or cert misrepresented' },
  { value: 'wrong_item_photos', label: 'Photos do not match item' },
  { value: 'fake_coa_document', label: 'Fake or stolen COA document' },
  { value: 'other', label: 'Other authenticity concern' },
]
