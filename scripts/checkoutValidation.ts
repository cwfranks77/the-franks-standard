// scripts/checkoutValidation.ts
// TFS Checkout + Tax Logic Validation – backend only, idempotent

import type { Request, Response, NextFunction } from 'express'
import { createRequire } from 'node:module'
import type { H3Event } from 'h3'
import {
  logPaymentInitiated,
  logPaymentCompleted,
  logSuspiciousActivity,
} from './activityRecorder'

const require = createRequire(import.meta.url)
const checkout = require('../backend/checkout/checkout_validation.js')

export const {
  STATE_TAX_RATES,
  MARKETPLACE_FEE_RATE,
  BC_AUDIO_FEE_RATE,
  OWNER_INCOME_TAX_RESERVE_RATE,
  normalizeCheckoutBody,
  validateCheckoutPayloadInput,
  calculateTotals,
  checkoutFraudCheckContext,
  validatePaymentProcessorInput,
  evaluateCheckout,
  isCheckoutPath,
  getCheckoutValidationStatus,
} = checkout

export const recordCheckoutStart = checkout.logCheckoutStart
export const recordCheckoutComplete = checkout.logCheckoutComplete

// --------------------------------------
// Express middleware
// --------------------------------------

export function validateCheckoutPayload (
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const result = validateCheckoutPayloadInput(req.body)
  if (!result.ok) {
    return res.status(result.status || 400).json({ error: result.error })
  }
  req.body = { ...req.body, ...result.checkout }
  next()
}

export function checkoutFraudCheck (
  req: Request & { user?: { id?: string, is_banned?: boolean } },
  res: Response,
  next: NextFunction,
) {
  const result = checkoutFraudCheckContext({
    price: Number((req.body as { price?: number }).price),
    userId: req.user?.id ?? null,
    isBanned: Boolean(req.user?.is_banned),
  })

  if (!result.ok) {
    return res.status(result.status || 403).json({ error: result.error })
  }

  if (result.flags.includes('high_value_checkout') && req.user?.id) {
    logSuspiciousActivity(req.user.id, 'high_value_checkout', {
      price: (req.body as { price?: number }).price,
    })
  }

  next()
}

export function attachCheckoutTotals (
  req: Request & { checkoutTotals?: Record<string, unknown> },
  _res: Response,
  next: NextFunction,
) {
  const body = req.body as {
    price?: number
    buyer_state?: string
    shipping_zip?: string
    division?: string
    shipping_cost?: number
  }

  req.checkoutTotals = calculateTotals(Number(body.price), {
    shipping_zip: body.shipping_zip ?? null,
    buyer_state: body.buyer_state ?? null,
    division: body.division ?? 'TFS',
    shipping_cost: Number(body.shipping_cost ?? 0),
  })

  next()
}

export function validatePaymentProcessor (
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const result = validatePaymentProcessorInput((req.body as { processor?: string }).processor)
  if (!result.ok) {
    return res.status(result.status || 400).json({ error: result.error })
  }
  next()
}

export function logCheckoutStart (
  req: Request & { user?: { id?: string }, checkoutTotals?: Record<string, unknown> },
  _res: Response,
  next: NextFunction,
) {
  if (req.user?.id) {
    logPaymentInitiated(req.user.id, 'pending', {
      listingId: (req.body as { listing_id?: string }).listing_id,
      price: (req.body as { price?: number }).price,
      totals: req.checkoutTotals,
    })
  }
  next()
}

export function logCheckoutComplete (
  req: Request & { user?: { id?: string }, checkoutTotals?: Record<string, unknown> },
  res: Response,
  next: NextFunction,
) {
  const payload = (res.locals as { checkoutResult?: { data?: unknown } }).checkoutResult

  if (req.user?.id) {
    logPaymentCompleted(req.user.id, 'completed', {
      listingId: (req.body as { listing_id?: string }).listing_id,
      totals: req.checkoutTotals,
    })
  }

  if (payload?.data !== undefined) {
    return res.json(payload.data)
  }

  next()
}

// --------------------------------------
// Nitro helpers
// --------------------------------------

export function readCheckoutUserContext (event: H3Event) {
  return {
    userId: getHeader(event, 'x-user-id') || null,
    isBanned: getHeader(event, 'x-user-banned') === 'true',
  }
}

export function applyCheckoutValidationNitro (event: H3Event) {
  const path = getRequestURL(event).pathname
  if (!isCheckoutPath(path) || getMethod(event) !== 'POST') return

  const body = (event.context.sanitizedBody as Record<string, unknown> | undefined) ?? {}
  const user = readCheckoutUserContext(event)
  const result = evaluateCheckout(body, user)

  if (!result.ok) {
    throw createError({
      statusCode: result.status || 400,
      statusMessage: result.error || 'Checkout validation failed',
    })
  }

  event.context.checkoutValidation = result
  event.context.checkoutTotals = result.totals
}

export function getTfsCheckoutValidationStatus () {
  return getCheckoutValidationStatus()
}
