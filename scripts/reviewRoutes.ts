// scripts/reviewRoutes.ts
// Express route wiring — optional standalone server (live site uses Nitro routes).

import type { Express } from 'express'
import { createRequire } from 'node:module'
import {
  enforceReviewPermissions,
  validateReview,
  preventSelfReview,
  enforceReviewModeration,
} from './reviewSystem'

const require = createRequire(import.meta.url)
const { createReviewHandler } = require('../backend/reviews/handlers.js')

export { createReviewHandler }

export function registerReviewRoutes (app: Express) {
  app.post(
    '/api/reviews/create',
    enforceReviewPermissions,
    preventSelfReview,
    validateReview,
    enforceReviewModeration,
    createReviewHandler,
  )
}
