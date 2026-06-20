// scripts/checkoutRoutes.ts
// Express checkout middleware chain — matches checkoutValidation sketch.

import type { Express } from 'express'
import { createRequire } from 'node:module'
import { requireAuth } from './securityHardening'
import {
  validateCheckoutPayload,
  checkoutFraudCheck,
  attachCheckoutTotals,
  validatePaymentProcessor,
  logCheckoutStart,
  logCheckoutComplete,
} from './checkoutValidation'

const require = createRequire(import.meta.url)
const { checkoutHandler } = require('../backend/marketplace/handlers.js')

export { checkoutHandler }

export function registerCheckoutRoutes (app: Express) {
  app.post(
    '/api/checkout',
    requireAuth,
    validateCheckoutPayload,
    checkoutFraudCheck,
    attachCheckoutTotals,
    validatePaymentProcessor,
    logCheckoutStart,
    checkoutHandler, // DB + processor; logs complete on success
    logCheckoutComplete,
  )
}
