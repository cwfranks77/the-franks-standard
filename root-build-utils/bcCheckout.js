const ALLOWED_CHECKOUT_ORIGIN = /^https:\/\/(www\.)?(bcpoweraudio\.com|thefranksstandard\.com)$/i

/** Safe return base for Stripe success/cancel URLs (client may pass runtime siteUrl). */
export function resolveCheckoutBaseUrl (bodySiteUrl, fallback = '') {
  const raw = String(bodySiteUrl || '').trim().replace(/\/+$/, '')
  if (ALLOWED_CHECKOUT_ORIGIN.test(raw)) return raw
  const fb = String(fallback || '').trim().replace(/\/+$/, '')
  return fb || 'https://thefranksstandard.com'
}

export function checkoutReturnUrls (baseUrl) {
  const isBc = String(baseUrl).toLowerCase().includes('bcpoweraudio.com')
  return {
    successPath: isBc ? '/bc-audio/order-success' : '/order/success',
    cancelPath: isBc ? '/?cancelled=1' : '/shop?cancelled=1',
  }
}
