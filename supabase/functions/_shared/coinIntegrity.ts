/** Deno copy of utils/coinIntegrity.js */

export const MORGAN_SPECS = { weight: 26.73, diameter: 38.1, thickness: 2.4 }
export const MORGAN_KEY_DATES = ['1885-CC', '1889-CC', '1893-S']

export function parseMorganFromText (text = '') {
  const t = String(text)
  if (!/\bmorgan\b/i.test(t)) {
    return { type: null, date: null, mintMark: null, keyDateId: null }
  }
  let date: string | null = null
  let mintMark: string | null = null
  const keyed = t.match(/\b(18[7-9]\d|1921)\s*[-–]?\s*(CC|S|O|D)\b/i)
  if (keyed) {
    date = keyed[1]
    mintMark = keyed[2].toUpperCase()
  } else {
    const dateOnly = t.match(/\b(18[7-9]\d|1921)\b/)
    if (dateOnly) date = dateOnly[1]
    if (/\bCC\b/.test(t) && (t.match(/\bCC\b/g) || []).length <= 3) mintMark = 'CC'
    else if (/\b1893[\s-]*S\b/i.test(t) || /\bS\b.*\b1893\b/i.test(t)) mintMark = 'S'
  }
  const keyDateId = date && mintMark ? `${date}-${mintMark}` : null
  const normalizedKey = keyDateId && MORGAN_KEY_DATES.includes(keyDateId) ? keyDateId : null
  return { type: 'Morgan Dollar', date, mintMark, keyDateId: normalizedKey }
}

export function detectMintTextConflict (text = '') {
  const lines = String(text).split(/\n/)
  const titleLine = lines[0] || text.slice(0, 120)
  const titleMeta = parseMorganFromText(titleLine)
  const fullMeta = parseMorganFromText(text)
  if (!titleMeta.mintMark || !fullMeta.mintMark) return null
  if (titleMeta.mintMark === fullMeta.mintMark) return null
  return {
    titleMint: titleMeta.mintMark,
    otherMint: fullMeta.mintMark,
    label: `Mint mismatch: title suggests ${titleMeta.mintMark}, listing text also references ${fullMeta.mintMark}`,
  }
}

export function highRiskCoinCheck (input: { text?: string; price?: number | null } = {}) {
  const text = input.text ?? ''
  const price = Number(input.price)
  const risks: string[] = []
  const meta = parseMorganFromText(text)
  if (meta.type !== 'Morgan Dollar') return risks
  if (meta.keyDateId) {
    risks.push(`Key-date Morgan (${meta.keyDateId}) — elevated counterfeit risk`)
    if (Number.isFinite(price) && price > 0 && price < 300) {
      risks.push('Price far below typical market for this key date')
    }
  }
  const conflict = detectMintTextConflict(text)
  if (conflict) risks.push(conflict.label)
  if (/\b(uncirculated|unc|ms\s*\d+|gem\s*bu)\b/i.test(text) && Number.isFinite(price) && price > 0 && price < 75) {
    risks.push('“Uncirculated” or high grade claimed at very low price')
  }
  return risks
}

export function coinIntegrityFlags (row: Record<string, unknown>) {
  const text = `${row.title || ''}\n${row.description || ''}`.trim()
  const price = row.price != null ? Number(row.price) : null
  const flags: Array<{ id: string; label: string; severity: string; weight: number }> = []
  for (const msg of highRiskCoinCheck({ text, price })) {
    flags.push({ id: 'coin_high_risk', label: msg, severity: 'review', weight: 32 })
  }
  return flags
}
