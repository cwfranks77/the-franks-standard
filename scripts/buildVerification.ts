// scripts/buildVerification.ts
// TFS Final Build Verification – backend only, idempotent

import type { Request, Response, NextFunction } from 'express'
import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)
const verification = require('../backend/launch/build_verification.js')
const { getServiceSupabaseFromEnv } = require('../backend/marketplace/_env.js')

export const {
  LOG_DIR,
  VERIFICATION_LOG,
  REQUIRED_ENV_GROUPS,
  REQUIRED_DIRS,
  REQUIRED_FILES,
  DEFAULT_API_ROUTES,
  checkEnvVars,
  checkDirectories,
  checkFiles,
  checkDatabase,
  checkApiHealth,
  summarizeReport,
  writeVerificationReport,
  getBuildVerificationStatus,
  verifyBuildHandler,
} = verification

type BuildVerificationOptions = {
  admin?: unknown
  baseUrl?: string
  routes?: string[]
  fetchFn?: typeof fetch
  root?: string
  outputPath?: string
}

/** Options object or legacy Express signature: runBuildVerification(app, req.db) */
export async function runBuildVerification (
  appOrOptions?: unknown,
  db?: unknown,
  options: BuildVerificationOptions = {},
) {
  const isLegacy = db !== undefined
    || (appOrOptions
      && typeof appOrOptions === 'object'
      && typeof (appOrOptions as { use?: unknown }).use === 'function')

  if (isLegacy) {
    return verification.runBuildVerificationLegacy(appOrOptions, db, options)
  }

  const opts = (appOrOptions && typeof appOrOptions === 'object' && !isLegacy)
    ? appOrOptions as BuildVerificationOptions
    : {}

  return verification.runBuildVerification(opts)
}

export function attachServiceDb (
  req: Request & { db?: unknown },
  _res: Response,
  next: NextFunction,
) {
  req.db = getServiceSupabaseFromEnv()
  next()
}

export function getTfsBuildVerificationStatus () {
  return getBuildVerificationStatus()
}
