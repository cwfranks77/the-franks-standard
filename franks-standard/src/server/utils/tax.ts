export function calculateLouisianaTax(zipCode: string, subtotal: number) {
  const STATE_RATE = 0.0445
  const PARISH_RATES: Record<string, number> = {
    '70001': 0.0475,
    '70112': 0.0500,
    '70801': 0.0550,
    default: 0.0445,
  }
  const localRate = PARISH_RATES[zipCode] ?? PARISH_RATES['default']
  const finalRate = STATE_RATE + localRate
  return {
    taxAmount: Math.round(subtotal * finalRate * 100) / 100,
    totalCombinedRatePercentage: Number((finalRate * 100).toFixed(2)),
  }
}
