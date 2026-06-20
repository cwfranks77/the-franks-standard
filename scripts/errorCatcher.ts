// scripts/errorCatcher.ts
// TFS Error Catcher + Crash Guard – backend only, idempotent

import type { Express, Request, Response, NextFunction } from 'express'
import type { NitroApp } from 'nitropack'
import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)
const errorCatcher = require('../backend/error/error_catcher.js')

export const {
  LOG_DIR,
  ERROR_LOG,
  writeErrorLog,
  expressErrorHandler,
  requireEnvVars,
  safeAsync,
  attachCrashGuards,
  shouldLogNitroError,
  formatNitroErrorResponse,
  getErrorCatcherStatus,
} = errorCatcher

// --------------------------------------
// Express wiring
// --------------------------------------

export function registerErrorCatcher (app: Express) {
  attachCrashGuards()
  app.use(expressErrorHandler)
}

// --------------------------------------
// Nitro wiring
// --------------------------------------

export function applyErrorCatcherNitro (nitroApp: NitroApp) {
  attachCrashGuards()

  nitroApp.hooks.hook('error', (error, { event }) => {
    if (!shouldLogNitroError(error)) return

    writeErrorLog(error, {
      path: event?.path ?? null,
      method: event?.method ?? null,
      source: 'nitro_error',
    })
  })
}

export function getTfsErrorCatcherStatus () {
  return getErrorCatcherStatus()
}
