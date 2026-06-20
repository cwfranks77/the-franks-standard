/**
 * Nuxt pages:extend — swap thin routes for full checkout/listing pages (no Vue edits).
 */
import { existsSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const APP_ROOT = resolve(__dirname, '..')

const OVERRIDES = [
  { path: '/listing/:id', file: 'src/pages/listing/[id].vue' },
  { path: '/order/success', file: 'src/pages/order/success.vue' },
  { path: '/order/:id', file: 'src/pages/order/[id].vue' },
  { path: '/cart', file: 'src/pages/cart.vue' },
  { path: '/checkout', file: 'pages/checkout.vue' },
]

export function extendBackendPages (pages) {
  const kept = pages.filter((p) => {
    const path = p.path || ''
    if (path.startsWith('/listing')) return false
    if (path === '/order/success' || path.startsWith('/order/')) return false
    if (path === '/cart' || path === '/checkout') return false
    return true
  })
  for (const def of OVERRIDES) {
    const abs = resolve(APP_ROOT, def.file)
    if (!existsSync(abs)) continue
    kept.push({
      path: def.path,
      file: abs,
      name: def.path.replace(/[/:]/g, '-'),
    })
  }
  pages.splice(0, pages.length, ...kept)
}
