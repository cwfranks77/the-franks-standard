// scripts/marketplaceEnforcement.ts
// TFS Marketplace Enforcement System – backend only, idempotent

import type { Request, Response, NextFunction } from 'express'
import { createRequire } from 'node:module'
import type { H3Event } from 'h3'

const require = createRequire(import.meta.url)
const enforcement = require('../backend/marketplace/marketplace_enforcement.js')

export const {
  VIOLATION_TYPES,
  autoFlagListing,
  shouldFreezeListing,
  evaluateListingEnforcement,
  enforceBuyerRulesContext,
  enforceSellerRulesContext,
  escalateDispute,
  enforceRefundRules,
  logChargeback,
  persistChargebackLog,
  persistListingViolationFlags,
  isListingWritePath,
  isCheckoutPath,
  isBuyerActionPath,
  isSellerActionPath,
  getMarketplaceEnforcementStatus,
} = enforcement

// ------------------------------
// Express middleware (optional standalone Express server)
// ------------------------------

export function enforceListingRules (
  req: Request & { user?: { id?: string }, listingFlags?: string[] },
  res: Response,
  next: NextFunction,
) {
  const result = evaluateListingEnforcement(req.body)

  if (result.freeze) {
    return res.status(403).json({
      error: result.error,
      flags: result.flags,
    })
  }

  req.listingFlags = result.flags
  next()
}

export function enforceBuyerRules (
  req: Request & { user?: { id?: string, is_banned?: boolean } },
  res: Response,
  next: NextFunction,
) {
  const check = enforceBuyerRulesContext({
    userId: req.user?.id ?? null,
    isBanned: Boolean(req.user?.is_banned),
  })

  if (!check.ok) {
    return res.status(check.status || 403).json({ error: check.error })
  }

  next()
}

export function enforceSellerRules (
  req: Request & { user?: { id?: string, is_banned?: boolean, is_verified_seller?: boolean } },
  res: Response,
  next: NextFunction,
) {
  const check = enforceSellerRulesContext({
    userId: req.user?.id ?? null,
    isBanned: Boolean(req.user?.is_banned),
    isVerifiedSeller: Boolean(req.user?.is_verified_seller),
  })

  if (!check.ok) {
    return res.status(check.status || 403).json({ error: check.error })
  }

  next()
}

// ------------------------------
// Nuxt/Nitro helpers (live site)
// ------------------------------

export function readUserEnforcementContext (event: H3Event) {
  return {
    userId: getHeader(event, 'x-user-id') || null,
    isBanned: getHeader(event, 'x-user-banned') === 'true',
    isVerifiedSeller: getHeader(event, 'x-user-verified-seller') === 'true',
    opsKeyValid: false,
  }
}

export function applyMarketplaceEnforcementNitro (event: H3Event) {
  const path = getRequestURL(event).pathname
  const method = getMethod(event)
  const user = readUserEnforcementContext(event)

  if (isBuyerActionPath(path) && isCheckoutPath(path)) {
    const buyer = enforceBuyerRulesContext(user)
    if (!buyer.ok) {
      throw createError({ statusCode: buyer.status || 403, statusMessage: buyer.error || 'Forbidden' })
    }
  }

  if (isSellerActionPath(path, method)) {
    const seller = enforceSellerRulesContext(user)
    if (!seller.ok) {
      throw createError({ statusCode: seller.status || 403, statusMessage: seller.error || 'Forbidden' })
    }
  }

  if (isListingWritePath(path, method)) {
    const listing = (event.context.sanitizedBody as Record<string, unknown> | undefined) ?? {}
    const result = evaluateListingEnforcement(listing)
    event.context.listingFlags = result.flags

    if (result.freeze) {
      throw createError({
        statusCode: 403,
        statusMessage: result.error || 'Listing frozen',
        data: { flags: result.flags },
      })
    }
  }
}

export function getTfsMarketplaceEnforcementStatus () {
  return getMarketplaceEnforcementStatus()
}
