const STORAGE_KEY = 'franks_welcome_from_ebay'

export default defineNuxtPlugin(() => {
  if (!import.meta.client) return

  const route = useRoute()
  const from = String(route.query.from || '').toLowerCase()
  if (from !== 'ebay') return

  try {
    if (sessionStorage.getItem(STORAGE_KEY)) return
    sessionStorage.setItem(STORAGE_KEY, '1')
  } catch {
    return
  }

  const banner = document.createElement('div')
  banner.setAttribute('role', 'status')
  banner.style.cssText =
    'position:fixed;bottom:16px;left:16px;right:16px;max-width:520px;margin:0 auto;z-index:9999;' +
    'background:#1a1a1a;border:1px solid #c9a227;color:#f3f4f6;padding:14px 16px;border-radius:8px;' +
    'box-shadow:0 8px 24px rgba(0,0,0,0.4);font-size:14px;line-height:1.5;'

  banner.innerHTML =
    '<strong>Shopping on The Franks Standard</strong><br>' +
    'Checkout uses Stripe escrow here — not eBay PayPal. ' +
    '<a href="/sellers/switch" style="color:#c9a227">Switching guide</a>'

  const close = document.createElement('button')
  close.textContent = '×'
  close.setAttribute('aria-label', 'Dismiss')
  close.style.cssText =
    'position:absolute;top:8px;right:10px;background:none;border:none;color:#9ca3af;font-size:20px;cursor:pointer'
  close.onclick = () => banner.remove()
  banner.style.position = 'fixed'
  banner.appendChild(close)
  document.body.appendChild(banner)
})
