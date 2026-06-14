import bcOpsAuth from '../middleware/bc-ops-auth'
import bcOpsGate from '../middleware/bc-ops-gate'
import bcOpsHost from '../middleware/bc-ops-host'
import bcStorefrontHome from '../middleware/bc-storefront-home.global.js'

export default defineNuxtPlugin(() => {
  addRouteMiddleware('bc-storefront-home', bcStorefrontHome, { global: true })
  addRouteMiddleware('bc-ops-auth', bcOpsAuth)
  addRouteMiddleware('bc-ops-gate', bcOpsGate)
  addRouteMiddleware('bc-ops-host', bcOpsHost)
})
