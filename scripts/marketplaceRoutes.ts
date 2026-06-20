// scripts/marketplaceRoutes.ts
// Express route wiring — optional standalone server (live site uses Nitro routes below).

import type { Express } from 'express'
import { createRequire } from 'node:module'
import {
  enforceListingRules,
  enforceBuyerRules,
  enforceSellerRules,
} from './marketplaceEnforcement'

const require = createRequire(import.meta.url)
const { createListingHandler, checkoutHandler } = require('../backend/marketplace/handlers.js')

export { createListingHandler, checkoutHandler }

/** Listing create only — use registerCheckoutRoutes for full checkout chain. */
export function registerMarketplaceListingRoutes (app: Express) {
  app.post(
    '/api/listings/create',
    enforceSellerRules,
    enforceListingRules,
    createListingHandler,
  )
}

/** Register marketplace routes on an Express app (same order as enforcement sketch). */
export function registerMarketplaceRoutes (app: Express) {
  registerMarketplaceListingRoutes(app)

  app.post(
    '/api/checkout',
    enforceBuyerRules,
    checkoutHandler,
  )
}
