const ALLOWED_CHECKOUT_ORIGIN = /^https:\/\/(www\.)?(bcpoweraudio\.com|thefranksstandard\.com)$/i

export function resolveCheckoutBaseUrl (bodySiteUrl: unknown, fallback: string): string {
  const raw = String(bodySiteUrl || '').trim().replace(/\/+$/, '')
  if (ALLOWED_CHECKOUT_ORIGIN.test(raw)) return raw
  return String(fallback || '').trim().replace(/\/+$/, '') || 'https://thefranksstandard.com'
}

export function checkoutReturnUrls (baseUrl: string) {
  const isBc = baseUrl.toLowerCase().includes('bcpoweraudio.com')
  return {
    successPath: isBc ? '/bc-audio/order-success' : '/order/success',
    cancelPath: isBc ? '/?cancelled=1' : '/shop?cancelled=1',
  }
}
