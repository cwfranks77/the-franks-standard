// scripts/ownerTools.ts
// TFS Owner Tools – backend only, idempotent

import type { Request, Response, NextFunction } from 'express'
import { createRequire } from 'node:module'
import type { H3Event } from 'h3'

const require = createRequire(import.meta.url)
const ownerTools = require('../backend/owner/owner_tools.js')
const handlers = require('../backend/owner/owner_handlers.js')

export const {
  lookupUser,
  lookupListing,
  lookupTransaction,
  forceRefund,
  resolveDispute,
  verifySeller,
  unverifySeller,
  verifyBuyer,
  unverifyBuyer,
  banUser,
  unbanUserTool,
  requireOwnerContext,
  getOwnerToolsStatus,
} = ownerTools

export const {
  ownerLookupUser,
  ownerLookupListing,
  ownerLookupTransaction,
  ownerForceRefund,
  ownerResolveDispute,
  ownerVerifySeller,
  ownerUnverifySeller,
  ownerVerifyBuyer,
  ownerUnverifyBuyer,
  ownerBanUser,
  ownerUnbanUser,
} = handlers

// --------------------------------------
// Express: Owner/Admin permission middleware
// --------------------------------------

export function requireOwner (
  req: Request & { user?: { id?: string, roles?: string[] }, opsKeyValid?: boolean },
  res: Response,
  next: NextFunction,
) {
  const check = requireOwnerContext({
    opsKeyValid: Boolean(req.opsKeyValid),
    userId: req.user?.id ?? null,
    roles: req.user?.roles ?? [],
  })

  if (!check.ok) {
    return res.status(check.status || 403).json({ error: check.error })
  }

  next()
}

// --------------------------------------
// Nitro helpers (live site uses x-ops-key via requireOwnerAuth)
// --------------------------------------

export function readOwnerContext (event: H3Event) {
  return {
    userId: getHeader(event, 'x-user-id') || null,
    roles: String(getHeader(event, 'x-user-roles') || '').split(',').filter(Boolean),
    opsKeyValid: false,
  }
}

export function getTfsOwnerToolsStatus () {
  return getOwnerToolsStatus()
}
