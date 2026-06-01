import { corsHeaders, json } from '../_shared/stripe.ts'

type TaxResult = {
  taxAmount: number
  taxRate: number
  region: string
}

const STATE_RATE = 0.0445
const PARISH_RATES: Record<string, number> = {
  '70001': 0.0475,
  '70112': 0.0500,
  '70801': 0.0550,
  default: 0.0445,
}

function calculateLouisianaTax(zipCode: string, subtotal: number): TaxResult {
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

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  if (req.method === 'GET') {
    return json({ ok: true, service: 'louisiana-tax-estimate' })
  }

  if (req.method !== 'POST') {
    return json({ error: 'method_not_allowed' }, 405)
  }

  const body = await req.json().catch(() => ({})) as { zipCode?: string; subtotal?: number | string }
  const zipCode = String(body.zipCode ?? '').trim()
  const subtotal = Number.parseFloat(String(body.subtotal ?? '').replace(/[^0-9.]/g, ''))

  if (!zipCode || !Number.isFinite(subtotal) || subtotal < 0) {
    return json({ error: 'invalid_tax_request', message: 'zipCode and non-negative subtotal are required.' }, 400)
  }

  const result = calculateLouisianaTax(zipCode, subtotal)

  return json({
    success: true,
    data: result,
    notice: 'Estimate only. Stripe Tax at checkout remains the source of truth.',
  })
})
