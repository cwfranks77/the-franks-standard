// scripts/tfsAllInOneRoutes.ts
// Wire all TFS Express routes + security + error handler in one call.

import type { Express } from 'express'
import { applyTfsSecurity } from './securityHardening'
import { bootstrapExpressGuards, wireExpressErrorHandler } from './expressBootstrap'
import { registerMarketplaceListingRoutes } from './marketplaceRoutes'
import { registerCheckoutRoutes } from './checkoutRoutes'
import { registerReviewRoutes } from './reviewRoutes'
import { registerOwnerRoutes } from './ownerRoutes'
import { registerBuildVerificationRoutes } from './buildVerificationRoutes'

/** Register listing, checkout, reviews, owner tools, and verify-build routes. */
export function registerTfsAllInOneRoutes (app: Express) {
  registerMarketplaceListingRoutes(app)
  registerCheckoutRoutes(app)
  registerReviewRoutes(app)
  registerOwnerRoutes(app)
  registerBuildVerificationRoutes(app)
}

/**
 * Full Express stack:
 * 1. env + crash guards
 * 2. security headers, rate limit, sanitization
 * 3. all API routes
 * 4. error handler (last)
 */
export function wireTfsExpressStack (app: Express) {
  bootstrapExpressGuards()
  applyTfsSecurity(app)
  registerTfsAllInOneRoutes(app)
  wireExpressErrorHandler(app)
}
