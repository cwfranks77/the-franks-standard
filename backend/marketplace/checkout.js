/**
 * Marketplace checkout — proxies to Supabase create-checkout-session edge function.
 */

const { logCheckoutComplete } = require('../checkout/checkout_validation.js')

async function startCheckout ({
  supabaseUrl,
  anonKey,
  authorization,
  body = {},
  checkoutTotals = null,
  skipCompleteLog = false,
}) {
  const url = String(supabaseUrl || '').replace(/\/$/, '')
  const key = String(anonKey || '').trim()
  const auth = String(authorization || '').trim()

  if (!url || !key) return { ok: false, error: 'checkout_not_configured', status: 503 }
  if (!auth.startsWith('Bearer ')) return { ok: false, error: 'unauthorized', status: 401 }

  const listingId = String(body.listing_id ?? '').trim()
  if (!listingId) return { ok: false, error: 'listing_id_required', status: 400 }

  const userId = String(body.user_id ?? body.buyer_id ?? '').trim() || null

  const payload = {
    ...body,
    ...(checkoutTotals ? { checkout_totals: checkoutTotals } : {}),
  }

  const response = await fetch(`${url}/functions/v1/create-checkout-session`, {
    method: 'POST',
    headers: {
      Authorization: auth,
      apikey: key,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })

  const data = await response.json().catch(() => ({}))
  if (!response.ok) {
    return {
      ok: false,
      error: data.error || 'checkout_failed',
      message: data.message || null,
      status: response.status,
      data,
    }
  }

  const transactionId = data.order_id || data.session_id || listingId
  if (userId && !skipCompleteLog) {
    await logCheckoutComplete(userId, String(transactionId), {
      listing_id: listingId,
      price: body.price,
    }, checkoutTotals).catch(() => {})
  }

  return { ok: true, data }
}

module.exports = { startCheckout }
