import { corsHeaders, json } from '../_shared/stripe.ts'
import { louisianaTaxFromShippingZip } from '../_shared/louisianaShippingTax.ts'

/** Cart tax preview — Louisiana Act 22: shipping ZIP only. */
Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })
  if (req.method !== 'POST') return json({ error: 'method_not_allowed' }, 405)

  let body: { shipping_zip?: string; subtotal?: number }
  try {
    body = await req.json()
  } catch {
    return json({ error: 'invalid_json' }, 400)
  }

  const zip = String(body.shipping_zip ?? '').trim()
  const subtotal = Number(body.subtotal ?? 0)
  if (!zip || zip.length < 5) {
    return json({ error: 'shipping_zip_required' }, 400)
  }
  if (!Number.isFinite(subtotal) || subtotal < 0) {
    return json({ error: 'invalid_subtotal' }, 400)
  }

  const quote = louisianaTaxFromShippingZip(zip, subtotal)
  return json({ ok: true, ...quote })
})
