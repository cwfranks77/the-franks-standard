// scripts/expressBootstrap.ts
// Express startup — env guard, crash guards, error handler at stack bottom.

import type { Express } from 'express'
import {
  expressErrorHandler,
  requireEnvVars,
  attachCrashGuards,
} from './errorCatcher'

/**
 * Required env keys for Express bootstrap.
 * Each row accepts legacy names from the sketch OR the TFS names in .env.
 */
export const TFS_EXPRESS_REQUIRED_ENV: Array<string | string[]> = [
  ['DATABASE_URL', 'SUPABASE_URL', 'NUXT_PUBLIC_SUPABASE_URL'],
  ['JWT_SECRET', 'OPS_SESSION_SECRET'],
  ['STRIPE_SECRET', 'STRIPE_SECRET_KEY', 'NUXT_STRIPE_SECRET_KEY'],
  ['EMAIL_SERVER', 'SENDGRID_API_KEY', 'NUXT_SENDGRID_API_KEY'],
]

// 1. Ensure required env vars exist
export function bootstrapExpressEnv () {
  requireEnvVars(TFS_EXPRESS_REQUIRED_ENV)
}

// 2. Attach crash guards
export function bootstrapExpressCrashGuards () {
  attachCrashGuards()
}

/** Steps 1 + 2 — call before registering routes. */
export function bootstrapExpressGuards () {
  bootstrapExpressEnv()
  bootstrapExpressCrashGuards()
}

// 3. At the VERY bottom of your Express stack:
export function wireExpressErrorHandler (app: Express) {
  app.use(expressErrorHandler)
}

/** Convenience: steps 1–2 then error handler (register routes between guards and wire). */
export function bootstrapExpressErrorCatcher (app: Express) {
  bootstrapExpressGuards()
  wireExpressErrorHandler(app)
}
