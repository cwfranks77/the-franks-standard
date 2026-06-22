/**
 * B&C primary site (bcpoweraudio.com) needs /cart as a real Nuxt page file so
 * static hosting ships cart/index.html. Hook-only registration was skipped on
 * some deploys; copying the cart page into pages/ makes the route reliable.
 */
const fs = require('node:fs')
const path = require('node:path')

const rootDir = path.resolve(__dirname, '..')
const siteUrl = String(process.env.NUXT_PUBLIC_SITE_URL || '').trim()
const bcPrimarySite = /bcpoweraudio\.com/i.test(siteUrl)
const cartSrc = path.join(rootDir, 'bc-performance-audio', 'src', 'pages', 'bc-audio', 'cart.vue')
const cartDest = path.join(rootDir, 'pages', 'cart.vue')

if (bcPrimarySite) {
  if (!fs.existsSync(cartSrc)) {
    console.error('[ensure-bc-cart-page] missing source cart page:', cartSrc)
    process.exit(1)
  }
  fs.mkdirSync(path.dirname(cartDest), { recursive: true })
  fs.copyFileSync(cartSrc, cartDest)
  console.log('[ensure-bc-cart-page] synced pages/cart.vue for bcpoweraudio.com')
} else if (fs.existsSync(cartDest)) {
  fs.rmSync(cartDest, { force: true })
  console.log('[ensure-bc-cart-page] removed pages/cart.vue (not a B&C primary build)')
}
