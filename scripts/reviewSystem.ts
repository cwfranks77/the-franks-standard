// scripts/reviewSystem.ts
// TFS Review System – backend only, idempotent

import type { Request, Response, NextFunction } from 'express'
import { createRequire } from 'node:module'
import type { H3Event } from 'h3'

const require = createRequire(import.meta.url)
const reviewSystem = require('../backend/reviews/review_system.js')

export const {
  normalizeReview,
  validateReviewInput,
  autoFlagReview,
  enforceReviewModerationContext,
  preventSelfReviewContext,
  enforceReviewPermissionsContext,
  calculateNewRating,
  logReviewActivity,
  persistReviewActivity,
  evaluateReviewSubmission,
  isReviewWritePath,
  getReviewSystemStatus,
} = reviewSystem

// --------------------------------------
// Express middleware (order: permissions → self-review → validate → moderate)
// --------------------------------------

export function validateReview (req: Request, res: Response, next: NextFunction) {
  const result = validateReviewInput(req.body)
  if (!result.ok) {
    return res.status(result.status || 400).json({ error: result.error })
  }
  next()
}

export function enforceReviewModeration (
  req: Request & { reviewFlags?: string[] },
  res: Response,
  next: NextFunction,
) {
  const result = enforceReviewModerationContext(req.body)
  req.reviewFlags = result.flags || autoFlagReview(req.body)

  if (!result.ok) {
    return res.status(result.status || 403).json({
      error: result.error,
      flags: result.flags,
    })
  }

  next()
}

export function preventSelfReview (
  req: Request & { user?: { id?: string } },
  res: Response,
  next: NextFunction,
) {
  const targetUserId = (req.body as { target_user_id?: string })?.target_user_id
  const result = preventSelfReviewContext({
    userId: req.user?.id ?? null,
    targetUserId: targetUserId ? String(targetUserId) : null,
  })

  if (!result.ok) {
    return res.status(result.status || 403).json({ error: result.error })
  }

  next()
}

export function enforceReviewPermissions (
  req: Request & { user?: { id?: string, is_banned?: boolean } },
  res: Response,
  next: NextFunction,
) {
  const result = enforceReviewPermissionsContext({
    userId: req.user?.id ?? null,
    isBanned: Boolean(req.user?.is_banned),
  })

  if (!result.ok) {
    return res.status(result.status || 403).json({ error: result.error })
  }

  next()
}

// --------------------------------------
// Nuxt/Nitro helpers (live site)
// --------------------------------------

export function readReviewUserContext (event: H3Event) {
  return {
    userId: getHeader(event, 'x-user-id') || null,
    isBanned: getHeader(event, 'x-user-banned') === 'true',
  }
}

export function applyReviewEnforcementNitro (event: H3Event) {
  const path = getRequestURL(event).pathname
  const method = getMethod(event)
  if (!isReviewWritePath(path, method)) return

  const body = (event.context.sanitizedBody as Record<string, unknown> | undefined) ?? {}
  const user = readReviewUserContext(event)
  const result = evaluateReviewSubmission(body, user)

  if (!result.ok) {
    throw createError({
      statusCode: result.status || 403,
      statusMessage: result.error || 'Review blocked',
      data: result.flags ? { flags: result.flags } : undefined,
    })
  }

  event.context.reviewFlags = result.flags
  event.context.validatedReview = result.review
}

export function getTfsReviewSystemStatus () {
  return getReviewSystemStatus()
}
