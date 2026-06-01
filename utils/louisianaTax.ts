export interface TaxResult {
  taxAmount: number
  taxRate: number
  region: string
}

const STATE_RATE = 0.0445

const PARISH_RATES: Record<string, number> = {
  '70001': 0.0475, // Metairie (Jefferson Parish)
  '70112': 0.0500, // New Orleans (Orleans Parish)
  '70801': 0.0550, // Baton Rouge (East Baton Rouge Parish)
  default: 0.0445,
}

export function calculateLouisianaTax(zipCode: string, subtotal: number): TaxResult {
  const normalizedZip = String(zipCode || '').trim().slice(0, 5)
  const safeSubtotal = Number.isFinite(Number(subtotal)) ? Math.max(0, Number(subtotal)) : 0
  const localRate = PARISH_RATES[normalizedZip] ?? PARISH_RATES.default
  const totalRate = STATE_RATE + localRate
  const taxAmount = Math.round(safeSubtotal * totalRate * 100) / 100

  return {
    taxAmount,
    taxRate: Number((totalRate * 100).toFixed(2)),
    region: normalizedZip.startsWith('70') ? 'Louisiana' : 'Out of State',
  }
}

export const LOUISIANA_TAX_NOTICE =
  'Louisiana tax calculator is an estimate for preview/compliance checks. Stripe Tax at checkout remains the source of truth.'
