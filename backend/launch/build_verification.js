/**
 * TFS Final Build Verification — backend-only, idempotent.
 * Writes logs/build_verification.json
 */

const fs = require('fs')
const path = require('path')

const LOG_DIR = path.join(process.cwd(), 'logs')
const VERIFICATION_LOG = path.join(LOG_DIR, 'build_verification.json')

const REQUIRED_ENV_GROUPS = [
  ['DATABASE_URL', 'SUPABASE_URL', 'NUXT_PUBLIC_SUPABASE_URL'],
  ['JWT_SECRET', 'OPS_SESSION_SECRET'],
  ['STRIPE_SECRET', 'STRIPE_SECRET_KEY', 'NUXT_STRIPE_SECRET_KEY'],
  ['EMAIL_SERVER', 'SENDGRID_API_KEY', 'NUXT_SENDGRID_API_KEY'],
  ['EMAIL_USER', 'SENDGRID_FROM_EMAIL', 'NUXT_SENDGRID_FROM_EMAIL'],
  ['EMAIL_PASS', 'SENDGRID_API_KEY', 'NUXT_SENDGRID_API_KEY'],
]

const REQUIRED_DIRS = [
  'logs',
  'scripts',
  'backend',
  'server',
  'server/api',
  'server/middleware',
]

const REQUIRED_FILES = [
  'scripts/securityHardening.ts',
  'scripts/marketplaceEnforcement.ts',
  'scripts/reviewSystem.ts',
  'scripts/activityRecorder.ts',
  'scripts/ownerTools.ts',
  'scripts/checkoutValidation.ts',
  'scripts/errorCatcher.ts',
  'scripts/buildVerification.ts',
  'scripts/expressBootstrap.ts',
  'scripts/tfsAllInOne.ts',
  'scripts/tfsAllInOneRoutes.ts',
  'scripts/tfsExpressApp.ts',
]

const DEFAULT_API_ROUTES = [
  '/api/verify-build',
  '/api/system/health',
  '/api/security/healthcheck',
  '/api/listings/create',
  '/api/checkout',
  '/api/owner/user/test',
  '/api/health',
  '/api/auth/login',
  '/api/listings',
]

function envVarPresent (name) {
  const value = process.env[name]
  return value !== undefined && value !== null && String(value).trim() !== ''
}

function checkEnvVars (groups = REQUIRED_ENV_GROUPS) {
  const missing = []

  for (const group of groups) {
    const names = Array.isArray(group) ? group : [group]
    const found = names.some((name) => envVarPresent(name))
    if (!found) missing.push(names.join(' | '))
  }

  return missing
}

function checkDirectories (dirs = REQUIRED_DIRS, root = process.cwd()) {
  return dirs.filter((dir) => !fs.existsSync(path.join(root, dir)))
}

function checkFiles (files = REQUIRED_FILES, root = process.cwd()) {
  return files.filter((file) => !fs.existsSync(path.join(root, file)))
}

async function checkDatabase (admin) {
  if (!admin || typeof admin.from !== 'function') return false

  try {
    const { error } = await admin.from('profiles').select('id').limit(1)
    if (!error) return true
    if (/does not exist|schema cache/i.test(error.message || '')) return false
    return true
  } catch {
    return false
  }
}

async function checkApiHealth ({
  baseUrl = 'http://localhost:3000',
  routes = DEFAULT_API_ROUTES,
  fetchFn = typeof fetch === 'function' ? fetch : null,
} = {}) {
  const results = {}

  if (!fetchFn) {
    for (const route of routes) results[route] = false
    return results
  }

  for (const route of routes) {
    try {
      const res = await fetchFn(`${String(baseUrl).replace(/\/+$/, '')}${route}`)
      results[route] = res.status < 500
    } catch {
      results[route] = false
    }
  }

  return results
}

function summarizeReport (report) {
  const apiHealthy = Object.values(report.apiHealth || {}).every(Boolean)
  const ok = report.envVars.length === 0
    && report.directories.length === 0
    && report.files.length === 0
    && report.database === true
    && apiHealthy

  return { ...report, ok }
}

function writeVerificationReport (report, outputPath = VERIFICATION_LOG) {
  if (!fs.existsSync(LOG_DIR)) {
    fs.mkdirSync(LOG_DIR, { recursive: true })
  }

  const payload = summarizeReport(report)
  fs.writeFileSync(outputPath, `${JSON.stringify(payload, null, 2)}\n`, 'utf8')
  return payload
}

async function runBuildVerification ({
  admin = null,
  baseUrl = 'http://localhost:3000',
  routes = DEFAULT_API_ROUTES,
  fetchFn,
  root = process.cwd(),
  outputPath = VERIFICATION_LOG,
} = {}) {
  const report = {
    timestamp: new Date().toISOString(),
    envVars: checkEnvVars(),
    directories: checkDirectories(REQUIRED_DIRS, root),
    files: checkFiles(REQUIRED_FILES, root),
    database: await checkDatabase(admin),
    apiHealth: await checkApiHealth({ baseUrl, routes, fetchFn }),
  }

  return writeVerificationReport(report, outputPath)
}

async function runBuildVerificationLegacy (app, db, options = {}) {
  const baseUrl = options.baseUrl
    || resolveBaseUrlFromApp(app)
    || 'http://localhost:3000'

  return runBuildVerification({
    admin: db ?? null,
    baseUrl,
    ...options,
  })
}

function resolveBaseUrlFromApp (app) {
  if (!app || typeof app !== 'object') return null
  const locals = app.locals || {}
  if (typeof locals.baseUrl === 'string' && locals.baseUrl.trim()) return locals.baseUrl.trim()
  return null
}

function resolveBaseUrlFromRequest (req) {
  const host = req?.headers?.host
  if (!host) return 'http://localhost:3000'
  const proto = req.headers['x-forwarded-proto'] || 'http'
  return `${proto}://${host}`
}

async function verifyBuildHandler (req, res) {
  try {
    const { getServiceSupabaseFromEnv } = require('../marketplace/_env.js')
    const admin = req.db ?? getServiceSupabaseFromEnv()
    const report = await runBuildVerification({
      admin,
      baseUrl: resolveBaseUrlFromRequest(req),
    })
    return res.json(report)
  } catch (err) {
    return res.status(500).json({
      error: err?.message || 'verify_build_failed',
      code: 'TFS_VERIFY_BUILD_FAILED',
    })
  }
}

function getBuildVerificationStatus () {
  return {
    ok: true,
    verificationLog: VERIFICATION_LOG,
    requiredEnvGroups: REQUIRED_ENV_GROUPS.length,
    requiredDirs: REQUIRED_DIRS.length,
    requiredFiles: REQUIRED_FILES.length,
    defaultApiRoutes: DEFAULT_API_ROUTES.length,
  }
}

module.exports = {
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
  runBuildVerification,
  runBuildVerificationLegacy,
  resolveBaseUrlFromRequest,
  verifyBuildHandler,
  getBuildVerificationStatus,
}
