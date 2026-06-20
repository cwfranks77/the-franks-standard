/** Louisiana combined sales tax estimate from shipping ZIP (parish lookup). */
const STATE_RATE = 0.0445

const PARISH_RATES: Record<string, number> = {
  '70001': 0.0475,
  '70112': 0.0500,
  '70801': 0.0550,
  default: 0.0445,
}

export function louisianaTaxFromShippingZip (zipCode: string, subtotal: number) {
  const zip = String(zipCode || '').trim().slice(0, 5)
  const localRate = PARISH_RATES[zip] ?? PARISH_RATES.default
  const finalRate = STATE_RATE + localRate
  const taxAmount = Math.round(subtotal * finalRate * 100) / 100
  return {
    taxAmount,
    totalCombinedRatePercentage: Number((finalRate * 100).toFixed(2)),
    shippingZip: zip,
  }
}
