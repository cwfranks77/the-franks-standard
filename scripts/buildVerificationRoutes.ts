// scripts/buildVerificationRoutes.ts
// GET /api/verify-build — matches buildVerification sketch.

import type { Express } from 'express'
import { requireOwner } from './ownerTools'
import { safeAsync } from './errorCatcher'
import {
  attachServiceDb,
  runBuildVerification,
  verifyBuildHandler,
} from './buildVerification'

export { runBuildVerification, verifyBuildHandler, attachServiceDb }

export function registerBuildVerificationRoutes (app: Express) {
  app.get(
    '/api/verify-build',
    requireOwner,
    attachServiceDb,
    safeAsync(verifyBuildHandler),
  )
}
