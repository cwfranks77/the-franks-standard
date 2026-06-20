/**
 * TFS Error Catcher + Crash Guard — backend-only, idempotent.
 * Writes to logs/errors.log and guards against unhandled process crashes.
 */

const fs = require('fs')
const path = require('path')

const LOG_DIR = path.join(process.cwd(), 'logs')
const ERROR_LOG = path.join(LOG_DIR, 'errors.log')

let logDirReady = false
let crashGuardsAttached = false

function ensureLogDir () {
  if (logDirReady) return
  if (!fs.existsSync(LOG_DIR)) {
    fs.mkdirSync(LOG_DIR, { recursive: true })
  }
  logDirReady = true
}

function normalizeError (error) {
  if (error instanceof Error) return error
  if (typeof error === 'string') return new Error(error)
  if (error && typeof error === 'object' && error.message) {
    const err = new Error(String(error.message))
    if (error.stack) err.stack = String(error.stack)
    return err
  }
  return new Error('Unknown error')
}

function buildErrorEntry (error, extra = {}) {
  const err = normalizeError(error)
  return {
    timestamp: new Date().toISOString(),
    message: err.message || 'Unknown error',
    stack: err.stack || null,
    ...extra,
  }
}

function writeErrorLog (error, extra = {}) {
  ensureLogDir()
  const entry = buildErrorEntry(error, extra)
  fs.appendFileSync(ERROR_LOG, `${JSON.stringify(entry)}\n`, 'utf8')
  return entry
}

function expressErrorHandler (err, req, res, next) {
  writeErrorLog(err, {
    path: req?.path ?? req?.url ?? null,
    method: req?.method ?? null,
  })

  if (res.headersSent) {
    return next(err)
  }

  return res.status(500).json({
    error: 'Internal server error.',
    code: 'TFS_BACKEND_FAILURE',
  })
}

function envVarPresent (name) {
  const value = process.env[name]
  return value !== undefined && value !== null && String(value).trim() !== ''
}

function requireEnvVars (vars = []) {
  const missing = []

  for (const entry of vars) {
    if (Array.isArray(entry)) {
      const found = entry.some((name) => envVarPresent(name))
      if (!found) missing.push(entry.join(' | '))
      continue
    }

    if (!envVarPresent(entry)) missing.push(entry)
  }

  if (missing.length > 0) {
    const error = new Error(`Missing required environment variables: ${missing.join(', ')}`)
    writeErrorLog(error)
    throw error
  }
}

function safeAsync (fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch((err) => {
      writeErrorLog(err, {
        path: req?.path ?? req?.url ?? null,
        method: req?.method ?? null,
      })
      next(err)
    })
  }
}

function attachCrashGuards () {
  if (crashGuardsAttached) return
  crashGuardsAttached = true

  process.on('uncaughtException', (err) => {
    writeErrorLog(err, { source: 'uncaughtException' })
    console.error('Uncaught Exception:', err)
  })

  process.on('unhandledRejection', (reason) => {
    writeErrorLog(reason, { source: 'unhandledRejection' })
    console.error('Unhandled Rejection:', reason)
  })
}

function shouldLogNitroError (error) {
  const statusCode = Number(error?.statusCode ?? error?.status ?? 0)
  if (statusCode >= 400 && statusCode < 500) return false
  return true
}

function formatNitroErrorResponse () {
  return {
    error: 'Internal server error.',
    code: 'TFS_BACKEND_FAILURE',
  }
}

function getErrorCatcherStatus () {
  return {
    ok: true,
    logDir: LOG_DIR,
    errorLog: ERROR_LOG,
    crashGuardsAttached,
  }
}

module.exports = {
  LOG_DIR,
  ERROR_LOG,
  ensureLogDir,
  normalizeError,
  buildErrorEntry,
  writeErrorLog,
  expressErrorHandler,
  requireEnvVars,
  safeAsync,
  attachCrashGuards,
  shouldLogNitroError,
  formatNitroErrorResponse,
  getErrorCatcherStatus,
}
