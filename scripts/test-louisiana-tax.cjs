#!/usr/bin/env node
const assert = require('assert')

const STATE_RATE = 0.0445
const PARISH_RATES = {
  70001: 0.0475,
  70112: 0.0500,
  70801: 0.0550,
  default: 0.0445,
}

function calculateLouisianaTax(zipCode, subtotal) {
  const normalizedZip = String(zipCode || '').trim().slice(0, 5)
  const safeSubtotal = Number.isFinite(Number(subtotal)) ? Math.max(0, Number(subtotal)) : 0
  const localRate = PARISH_RATES[normalizedZip] ?? PARISH_RATES.default
  const totalRate = STATE_RATE + localRate
  return {
    taxAmount: Math.round(safeSubtotal * totalRate * 100) / 100,
    taxRate: Number((totalRate * 100).toFixed(2)),
    region: normalizedZip.startsWith('70') ? 'Louisiana' : 'Out of State',
  }
}

assert.deepStrictEqual(calculateLouisianaTax('70001', 100), {
  taxAmount: 9.2,
  taxRate: 9.2,
  region: 'Louisiana',
})
assert.deepStrictEqual(calculateLouisianaTax('70112', 100), {
  taxAmount: 9.45,
  taxRate: 9.45,
  region: 'Louisiana',
})
assert.deepStrictEqual(calculateLouisianaTax('70801', 100), {
  taxAmount: 9.95,
  taxRate: 9.95,
  region: 'Louisiana',
})
assert.deepStrictEqual(calculateLouisianaTax('99999', 100), {
  taxAmount: 8.9,
  taxRate: 8.9,
  region: 'Out of State',
})

console.log('OK Louisiana tax calculator')
