// scripts/tfsAllInOne.ts
// The Franks Standard – All-in-One Backend Module
// Security, Enforcement, Reviews, Activity, Owner Tools, Checkout, Errors, Build Verification
// Facade over modular scripts — single import surface, no duplicated logic.

import type { Express } from 'express'

import {
  applySecurityHeaders,
  applyGlobalRateLimit,
  authLimiter,
  sanitizeString,
  sanitizeObject,
  sanitizeRequest,
  requireAuth,
  requireOwnerOrAdmin,
  protectCriticalRoute,
  applyTfsSecurity,
} from './securityHardening'

import type { ActivityEvent } from './activityRecorder'
import {
  LOG_DIR as ACTIVITY_LOG_DIR,
  LOG_FILE as ACTIVITY_LOG,
  createEvent,
  recordEvent,
  logListingCreated,
  logListingEdited,
  logListingDeleted,
  logPaymentInitiated,
  logPaymentCompleted,
  logRefundRequested,
  logRefundProcessed,
  logDisputeOpened,
  logDisputeResolved,
  logReviewCreated,
  logAdminAction,
  logSuspiciousActivity,
  logLogin,
  logFailedLogin,
} from './activityRecorder'

import {
  VIOLATION_TYPES,
  autoFlagListing,
  shouldFreezeListing,
  enforceListingRules,
  enforceBuyerRules,
  enforceSellerRules,
  escalateDispute,
  enforceRefundRules,
  logChargeback,
} from './marketplaceEnforcement'

import {
  validateReview,
  autoFlagReview,
  enforceReviewModeration,
  preventSelfReview,
  calculateNewRating,
  enforceReviewPermissions,
} from './reviewSystem'

import {
  requireOwner,
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
} from './ownerTools'

import {
  STATE_TAX_RATES,
  MARKETPLACE_FEE_RATE,
  BC_AUDIO_FEE_RATE,
  OWNER_INCOME_TAX_RESERVE_RATE,
  calculateTotals,
  validateCheckoutPayload,
  checkoutFraudCheck,
  attachCheckoutTotals,
  validatePaymentProcessor,
  logCheckoutStart,
  logCheckoutComplete,
} from './checkoutValidation'

import {
  expressErrorHandler,
  requireEnvVars,
  safeAsync,
  attachCrashGuards,
  ERROR_LOG,
} from './errorCatcher'

import { TFS_EXPRESS_REQUIRED_ENV } from './expressBootstrap'

import {
  runBuildVerification,
  attachServiceDb,
  verifyBuildHandler,
  checkEnvVars,
  checkDirectories,
  checkFiles,
  checkDatabase,
  checkApiHealth,
  REQUIRED_ENV_GROUPS,
  REQUIRED_DIRS,
  REQUIRED_FILES,
  VERIFICATION_LOG,
} from './buildVerification'

// ============================================================================
// SECTION 1 – SECURITY HARDENING
// ============================================================================

export namespace TfsSecurity {
  export {
    applySecurityHeaders,
    applyGlobalRateLimit,
    authLimiter,
    sanitizeString,
    sanitizeObject,
    sanitizeRequest,
    requireAuth,
    requireOwnerOrAdmin,
    protectCriticalRoute,
    applyTfsSecurity,
  }
}

// ============================================================================
// SECTION 2 – ACTIVITY RECORDER
// ============================================================================

export namespace TfsActivity {
  export type { ActivityEvent }

  export const LOG_DIR = ACTIVITY_LOG_DIR
  export const ACTIVITY_LOG_FILE = ACTIVITY_LOG

  export {
    createEvent,
    recordEvent,
    logListingCreated,
    logListingEdited,
    logListingDeleted,
    logPaymentInitiated,
    logPaymentCompleted,
    logRefundRequested,
    logRefundProcessed,
    logDisputeOpened,
    logDisputeResolved,
    logReviewCreated,
    logAdminAction,
    logSuspiciousActivity,
    logLogin,
    logFailedLogin,
  }
}

// ============================================================================
// SECTION 3 – MARKETPLACE ENFORCEMENT
// ============================================================================

export namespace TfsEnforcement {
  export {
    VIOLATION_TYPES,
    autoFlagListing,
    shouldFreezeListing,
    enforceListingRules,
    enforceBuyerRules,
    enforceSellerRules,
    escalateDispute,
    enforceRefundRules,
    logChargeback,
  }
}

// ============================================================================
// SECTION 4 – REVIEW SYSTEM
// ============================================================================

export namespace TfsReviews {
  export {
    validateReview,
    autoFlagReview,
    enforceReviewModeration,
    preventSelfReview,
    calculateNewRating,
    enforceReviewPermissions,
  }
}

// ============================================================================
// SECTION 5 – OWNER TOOLS (Supabase handlers — not Prisma)
// ============================================================================

export namespace TfsOwnerTools {
  export {
    requireOwner,
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
  }
}

// ============================================================================
// SECTION 6 – CHECKOUT + TAX LOGIC (shipping ZIP tax — Louisiana compliant)
// ============================================================================

export namespace TfsCheckout {
  export {
    STATE_TAX_RATES,
    MARKETPLACE_FEE_RATE,
    BC_AUDIO_FEE_RATE,
    OWNER_INCOME_TAX_RESERVE_RATE,
    calculateTotals,
    validateCheckoutPayload,
    checkoutFraudCheck,
    attachCheckoutTotals,
    validatePaymentProcessor,
    logCheckoutStart,
    logCheckoutComplete,
  }
}

// ============================================================================
// SECTION 7 – ERROR CATCHER + CRASH GUARD
// ============================================================================

export namespace TfsErrors {
  export const ERROR_LOG_FILE = ERROR_LOG

  export {
    expressErrorHandler,
    requireEnvVars,
    safeAsync,
    attachCrashGuards,
  }
}

// ============================================================================
// SECTION 8 – BUILD VERIFICATION
// ============================================================================

export namespace TfsBuildVerification {
  export const REQUIRED_ENV_VARS = REQUIRED_ENV_GROUPS
  export const REQUIRED_ENV_GROUPS_ALIAS = REQUIRED_ENV_GROUPS
  export { REQUIRED_DIRS, REQUIRED_FILES, VERIFICATION_LOG }

  export {
    runBuildVerification,
    attachServiceDb,
    verifyBuildHandler,
    checkEnvVars,
    checkDirectories,
    checkFiles,
    checkDatabase,
    checkApiHealth,
  }
}

// ============================================================================
// EXPRESS BOOTSTRAP HELPERS
// ============================================================================

export { TFS_EXPRESS_REQUIRED_ENV } from './expressBootstrap'
export {
  bootstrapExpressGuards,
  bootstrapExpressEnv,
  bootstrapExpressCrashGuards,
  wireExpressErrorHandler,
} from './expressBootstrap'

export {
  registerMarketplaceRoutes,
  registerMarketplaceListingRoutes,
  createListingHandler,
} from './marketplaceRoutes'

export {
  registerCheckoutRoutes,
  checkoutHandler,
} from './checkoutRoutes'

export { registerReviewRoutes, createReviewHandler } from './reviewRoutes'
export { registerOwnerRoutes } from './ownerRoutes'
export { registerBuildVerificationRoutes } from './buildVerificationRoutes'
export { registerErrorCatcher } from './errorCatcher'

export { registerTfsAllInOneRoutes, wireTfsExpressStack } from './tfsAllInOneRoutes'

export function getTfsAllInOneStatus () {
  return {
    ok: true,
    modules: [
      'TfsSecurity',
      'TfsActivity',
      'TfsEnforcement',
      'TfsReviews',
      'TfsOwnerTools',
      'TfsCheckout',
      'TfsErrors',
      'TfsBuildVerification',
    ],
    expressEnvGroups: TFS_EXPRESS_REQUIRED_ENV.length,
    verificationFiles: REQUIRED_FILES.length,
  }
}
