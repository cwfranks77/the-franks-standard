/**
 * Tax engine — always uses shipping ZIP (Louisiana marketplace facilitator).
 */

const STATE_RATE = 0.0445

const PARISH_RATES = {
  '70001': 0.0475,
  '70112': 0.0500,
  '70801': 0.0550,
  default: 0.0445,
}

function validateShippingZip (zip) {
  const cleaned = String(zip || '').trim()
  if (!/^\d{5}(-\d{4})?$/.test(cleaned)) {
    return { ok: false, error: 'invalid_zip_format' }
  }
  return { ok: true, zip5: cleaned.slice(0, 5) }
}

function calculateTax ({ shippingZip, merchandiseAmount, shippingCost = 0 }) {
  const zipCheck = validateShippingZip(shippingZip)
  if (!zipCheck.ok) return zipCheck

  const zip5 = zipCheck.zip5
  const localRate = PARISH_RATES[zip5] ?? PARISH_RATES.default
  const combinedRate = STATE_RATE + localRate
  const taxableBase = Math.max(0, Number(merchandiseAmount) || 0) + Math.max(0, Number(shippingCost) || 0)
  const stateTax = Math.round(taxableBase * STATE_RATE * 100) / 100
  const localTax = Math.round(taxableBase * localRate * 100) / 100
  const taxAmount = Math.round(taxableBase * combinedRate * 100) / 100

  return {
    ok: true,
    shipping_zip: zip5,
    state_rate: STATE_RATE,
    local_rate: localRate,
    combined_rate: combinedRate,
    state_tax: stateTax,
    local_tax: localTax,
    tax_amount: taxAmount,
    taxable_base: taxableBase,
    tax_breakdown: {
      shipping_zip: zip5,
      state_rate_pct: Number((STATE_RATE * 100).toFixed(3)),
      local_rate_pct: Number((localRate * 100).toFixed(3)),
      combined_rate_pct: Number((combinedRate * 100).toFixed(3)),
      state_tax: stateTax,
      local_tax: localTax,
      total_tax: taxAmount,
      taxable_base: taxableBase,
    },
  }
}

async function validateOrderTax (admin, { orderId, shippingZip, expectedTaxAmount }) {
  const { data: order } = await admin
    .from('orders')
    .select('merchandise_amount, amount, shipping_cost, tax_amount')
    .eq('id', orderId)
    .maybeSingle()

  if (!order) return { ok: false, error: 'order_not_found' }

  const merchandise = Number(order.merchandise_amount ?? order.amount) || 0
  const shipping = Number(order.shipping_cost) || 0
  const calc = calculateTax({ shippingZip, merchandiseAmount: merchandise, shippingCost: shipping })

  if (!calc.ok) return calc

  const stored = expectedTaxAmount != null ? Number(expectedTaxAmount) : Number(order.tax_amount)
  const drift = Math.abs((stored || 0) - calc.tax_amount)
  if (drift > 0.02) {
    return { ok: false, error: 'tax_mismatch', calculated: calc.tax_amount, expected: stored }
  }

  return { ok: true, ...calc }
}

module.exports = { calculateTax, validateShippingZip, validateOrderTax, STATE_RATE, PARISH_RATES }
