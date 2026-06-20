const { describe, it, before, after } = require('node:test')
const assert = require('node:assert/strict')
const fs = require('fs')
const path = require('path')
const os = require('os')

describe('build verification', () => {
  let originalCwd
  let tmpRoot

  before(() => {
    originalCwd = process.cwd()
    tmpRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'tfs-build-verify-'))
    process.chdir(tmpRoot)

    fs.mkdirSync(path.join(tmpRoot, 'logs'), { recursive: true })
    fs.mkdirSync(path.join(tmpRoot, 'scripts'), { recursive: true })
    fs.mkdirSync(path.join(tmpRoot, 'backend'), { recursive: true })
    fs.mkdirSync(path.join(tmpRoot, 'server', 'api'), { recursive: true })
    fs.mkdirSync(path.join(tmpRoot, 'server', 'middleware'), { recursive: true })

    for (const file of [
      'scripts/securityHardening.ts',
      'scripts/marketplaceEnforcement.ts',
      'scripts/reviewSystem.ts',
      'scripts/activityRecorder.ts',
      'scripts/ownerTools.ts',
      'scripts/checkoutValidation.ts',
      'scripts/errorCatcher.ts',
      'scripts/buildVerification.ts',
      'scripts/expressBootstrap.ts',
      'scripts/tfsExpressApp.ts',
      'scripts/tfsAllInOne.ts',
      'scripts/tfsAllInOneRoutes.ts',
    ]) {
      fs.writeFileSync(path.join(tmpRoot, file), '// test stub\n', 'utf8')
    }
  })

  after(() => {
    process.chdir(originalCwd)
    fs.rmSync(tmpRoot, { recursive: true, force: true })
  })

  it('flags missing env groups', () => {
    const { checkEnvVars } = require('../launch/build_verification.js')
    const missing = checkEnvVars()
    assert.ok(missing.length > 0)
  })

  it('passes env groups when aliases are set', () => {
    const { checkEnvVars } = require('../launch/build_verification.js')
    process.env.SUPABASE_URL = 'https://example.supabase.co'
    process.env.OPS_SESSION_SECRET = 'secret'
    process.env.STRIPE_SECRET_KEY = 'sk_test'
    process.env.SENDGRID_API_KEY = 'sg_test'
    process.env.SENDGRID_FROM_EMAIL = 'info@example.com'

    const missing = checkEnvVars()
    assert.equal(missing.length, 0)

    delete process.env.SUPABASE_URL
    delete process.env.OPS_SESSION_SECRET
    delete process.env.STRIPE_SECRET_KEY
    delete process.env.SENDGRID_API_KEY
    delete process.env.SENDGRID_FROM_EMAIL
  })

  it('checks required directories and files', () => {
    const { checkDirectories, checkFiles } = require('../launch/build_verification.js')
    assert.equal(checkDirectories().length, 0)
    assert.equal(checkFiles().length, 0)
  })

  it('checks database connectivity via supabase admin', async () => {
    const { checkDatabase } = require('../launch/build_verification.js')
    const admin = {
      from: () => ({
        select: () => ({
          limit: () => Promise.resolve({ error: null }),
        }),
      }),
    }
    const ok = await checkDatabase(admin)
    assert.equal(ok, true)
  })

  it('checks api health with injected fetch', async () => {
    const { checkApiHealth } = require('../launch/build_verification.js')
    const results = await checkApiHealth({
      baseUrl: 'http://localhost:3000',
      routes: ['/api/checkout'],
      fetchFn: async () => ({ status: 401 }),
    })
    assert.equal(results['/api/checkout'], true)
  })

  it('writes build_verification.json report', async () => {
    const {
      runBuildVerification,
      VERIFICATION_LOG,
    } = require('../launch/build_verification.js')

    process.env.SUPABASE_URL = 'https://example.supabase.co'
    process.env.OPS_SESSION_SECRET = 'secret'
    process.env.STRIPE_SECRET_KEY = 'sk_test'
    process.env.SENDGRID_API_KEY = 'sg_test'
    process.env.SENDGRID_FROM_EMAIL = 'info@example.com'

    const admin = {
      from: () => ({
        select: () => ({
          limit: () => Promise.resolve({ error: null }),
        }),
      }),
    }

    const report = await runBuildVerification({
      admin,
      fetchFn: async () => ({ status: 200 }),
      routes: ['/api/checkout'],
    })

    assert.ok(fs.existsSync(VERIFICATION_LOG))
    assert.equal(typeof report.ok, 'boolean')
    assert.equal(report.envVars.length, 0)
    assert.equal(report.directories.length, 0)
    assert.equal(report.files.length, 0)
    assert.equal(report.database, true)

    delete process.env.SUPABASE_URL
    delete process.env.OPS_SESSION_SECRET
    delete process.env.STRIPE_SECRET_KEY
    delete process.env.SENDGRID_API_KEY
    delete process.env.SENDGRID_FROM_EMAIL
  })

  it('supports legacy runBuildVerification(app, db) signature', async () => {
    const { runBuildVerificationLegacy } = require('../launch/build_verification.js')
    const app = { use () {}, locals: { baseUrl: 'http://example.test' } }
    const admin = {
      from: () => ({
        select: () => ({
          limit: () => Promise.resolve({ error: null }),
        }),
      }),
    }

    process.env.SUPABASE_URL = 'https://example.supabase.co'
    process.env.OPS_SESSION_SECRET = 'secret'
    process.env.STRIPE_SECRET_KEY = 'sk_test'
    process.env.SENDGRID_API_KEY = 'sg_test'
    process.env.SENDGRID_FROM_EMAIL = 'info@example.com'

    const report = await runBuildVerificationLegacy(app, admin, {
      fetchFn: async () => ({ status: 200 }),
      routes: ['/api/verify-build'],
    })

    assert.equal(typeof report.ok, 'boolean')
    assert.equal(report.database, true)

    delete process.env.SUPABASE_URL
    delete process.env.OPS_SESSION_SECRET
    delete process.env.STRIPE_SECRET_KEY
    delete process.env.SENDGRID_API_KEY
    delete process.env.SENDGRID_FROM_EMAIL
  })

  it('exports verify build handler', () => {
    const { verifyBuildHandler } = require('../launch/build_verification.js')
    assert.equal(typeof verifyBuildHandler, 'function')
  })

  it('exposes status envelope', () => {
    const { getBuildVerificationStatus } = require('../launch/build_verification.js')
    const status = getBuildVerificationStatus()
    assert.equal(status.ok, true)
    assert.ok(status.verificationLog.includes('build_verification.json'))
  })
})
