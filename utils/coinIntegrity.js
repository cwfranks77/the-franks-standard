/**
 * Coin-specific integrity helpers (from Authentication & COA toolkit v1).
 * Used by authenticityScan — not a replacement for Franks COA issuance (see issue-coa-certificate).
 */

export const MORGAN_SPECS = {
  weight: 26.73,
  diameter: 38.1,
  thickness: 2.4,
}

/** Key-date Morgans — heavy counterfeit targets */
export const MORGAN_KEY_DATES = ['1885-CC', '1889-CC', '1893-S']

const MINT_MARKS = ['CC', 'S', 'O', 'D']

/**
 * Parse Morgan date/mint hints from listing text (best-effort).
 * @returns {{ type: string, date: string|null, mintMark: string|null, keyDateId: string|null }}
 */
export function parseMorganFromText (text = '') {
  const t = String(text)
  if (!/\bmorgan\b/i.test(t)) {
    return { type: null, date: null, mintMark: null, keyDateId: null }
  }

  let date = null
  let mintMark = null

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

  return {
    type: 'Morgan Dollar',
    date,
    mintMark,
    keyDateId: normalizedKey,
  }
}

/**
 * Title vs body mint disagreement (e.g. 1893-S in title, "variety: CC" in description).
 */
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

/**
 * @param {{ text?: string, price?: number|null }} input
 */
export function highRiskCoinCheck (input = {}) {
  const text = input.text ?? ''
  const price = Number(input.price)
  const risks = []
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

export function validateCoinMeasurements (measurements = {}) {
  const missing = []
  if (measurements.weight == null || measurements.weight === '') missing.push('weight')
  if (measurements.diameter == null || measurements.diameter === '') missing.push('diameter')
  if (measurements.thickness == null || measurements.thickness === '') missing.push('thickness')
  return { valid: missing.length === 0, missing }
}

/**
 * @param {Record<string, unknown>} measurements
 * @param {string} [coinType]
 */
export function scoreCoinMeasurements (measurements = {}, coinType = 'Morgan Dollar') {
  let score = 100
  const flags = []

  if (coinType !== 'Morgan Dollar') {
    return { score, flags }
  }

  const weight = Number(measurements.weight)
  const diameter = Number(measurements.diameter)
  const thickness = Number(measurements.thickness)
  const magnet = String(measurements.magnetResult ?? measurements.magnet ?? '').toLowerCase()

  if (Number.isFinite(weight) && Math.abs(weight - MORGAN_SPECS.weight) > 0.2) {
    score -= 40
    flags.push('Weight out of tolerance for Morgan (26.73 g)')
  }
  if (Number.isFinite(diameter) && Math.abs(diameter - MORGAN_SPECS.diameter) > 0.1) {
    score -= 20
    flags.push('Diameter out of tolerance for Morgan (38.1 mm)')
  }
  if (Number.isFinite(thickness) && Math.abs(thickness - MORGAN_SPECS.thickness) > 0.1) {
    score -= 10
    flags.push('Thickness out of tolerance for Morgan (~2.4 mm)')
  }
  if (magnet === 'attracted' || magnet === 'yes' || magnet === 'true') {
    score -= 60
    flags.push('Magnetic — silver Morgan should not stick to a magnet')
  }

  return { score, flags }
}

/**
 * Extra scan flags for Coins & Currency listings.
 * @param {Record<string, unknown>} row
 * @returns {Array<{id:string,label:string,severity:string,weight:number}>}
 */
export function coinIntegrityFlags (row = {}) {
  const text = `${row.title || ''}\n${row.description || ''}`.trim()
  const price = row.price != null ? Number(row.price) : null
  const flags = []

  for (const msg of highRiskCoinCheck({ text, price })) {
    flags.push({
      id: 'coin_high_risk',
      label: msg,
      severity: 'review',
      weight: 32,
    })
  }

  const measurements = row.coin_measurements
  if (measurements && typeof measurements === 'object') {
    const check = validateCoinMeasurements(measurements)
    if (!check.valid) {
      flags.push({
        id: 'coin_measurements_incomplete',
        label: `Missing coin measurements: ${check.missing.join(', ')}`,
        severity: 'review',
        weight: 18,
      })
    } else {
      const meta = parseMorganFromText(text)
      const scored = scoreCoinMeasurements(measurements, meta.type || 'Morgan Dollar')
      for (const f of scored.flags) {
        flags.push({
          id: 'coin_measurement_fail',
          label: f,
          severity: scored.score < 70 ? 'review' : 'review',
          weight: scored.score < 70 ? 28 : 12,
        })
      }
    }
  }

  return flags
}
