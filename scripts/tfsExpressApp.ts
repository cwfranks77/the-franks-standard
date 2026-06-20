// scripts/tfsExpressApp.ts
// Optional standalone Express server — matches tfsAllInOne route sketch.
// Live production site uses Nuxt/Nitro; this is for local API testing only.

import express from 'express'
import { createRequire } from 'node:module'
import {
  TfsSecurity,
  TfsEnforcement,
  TfsReviews,
  TfsOwnerTools,
  TfsCheckout,
  TfsErrors,
  TfsBuildVerification,
  TFS_EXPRESS_REQUIRED_ENV,
} from './tfsAllInOne'

const require = createRequire(import.meta.url)
const { createListingHandler } = require('../backend/marketplace/handlers.js')
const { checkoutHandler } = require('../backend/marketplace/handlers.js')
const { createReviewHandler } = require('../backend/reviews/handlers.js')

const app = express()
app.use(express.json())

// Security + crash guards (TFS .env names accepted via one-of groups)
TfsErrors.requireEnvVars(TFS_EXPRESS_REQUIRED_ENV)
TfsErrors.attachCrashGuards()
TfsSecurity.applyTfsSecurity(app)

// Auth
app.post('/api/auth/login', TfsSecurity.authLimiter, (_req, res) => {
  res.status(501).json({
    error: 'Use Supabase auth on the live Nuxt site.',
    code: 'TFS_AUTH_VIA_SUPABASE',
  })
})

// Listings
app.post(
  '/api/listings/create',
  TfsSecurity.requireAuth,
  TfsEnforcement.enforceSellerRules,
  TfsEnforcement.enforceListingRules,
  TfsErrors.safeAsync(createListingHandler),
)

// Checkout
app.post(
  '/api/checkout',
  TfsSecurity.requireAuth,
  TfsCheckout.validateCheckoutPayload,
  TfsCheckout.checkoutFraudCheck,
  TfsCheckout.attachCheckoutTotals,
  TfsCheckout.validatePaymentProcessor,
  TfsCheckout.logCheckoutStart,
  TfsErrors.safeAsync(checkoutHandler),
  TfsCheckout.logCheckoutComplete,
)

// Reviews
app.post(
  '/api/reviews/create',
  TfsSecurity.requireAuth,
  TfsReviews.enforceReviewPermissions,
  TfsReviews.preventSelfReview,
  TfsReviews.validateReview,
  TfsReviews.enforceReviewModeration,
  TfsErrors.safeAsync(createReviewHandler),
)

// Owner tools
app.get(
  '/api/owner/user/:userId',
  TfsOwnerTools.requireOwner,
  TfsErrors.safeAsync(TfsOwnerTools.ownerLookupUser),
)

app.post(
  '/api/owner/ban/:userId',
  TfsOwnerTools.requireOwner,
  TfsErrors.safeAsync(TfsOwnerTools.ownerBanUser),
)

// Build verification
app.get(
  '/api/verify-build',
  TfsOwnerTools.requireOwner,
  TfsBuildVerification.attachServiceDb,
  TfsErrors.safeAsync(TfsBuildVerification.verifyBuildHandler),
)

// Error handler LAST
app.use(TfsErrors.expressErrorHandler)

export default app

export function startTfsExpressServer (port = Number(process.env.PORT || 3000)) {
  return app.listen(port, () => {
    console.log(`TFS Express API listening on http://localhost:${port}`)
  })
}
