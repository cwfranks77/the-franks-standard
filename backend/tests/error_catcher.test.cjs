const { describe, it, before, after } = require('node:test')
const assert = require('node:assert/strict')
const fs = require('fs')
const path = require('path')
const os = require('os')

describe('error catcher', () => {
  let originalCwd

  before(() => {
    originalCwd = process.cwd()
    process.chdir(os.tmpdir())
  })

  after(() => {
    process.chdir(originalCwd)
    const errorLog = path.join(os.tmpdir(), 'logs', 'errors.log')
    if (fs.existsSync(errorLog)) fs.unlinkSync(errorLog)
  })

  it('writes errors to errors.log', () => {
    const { writeErrorLog, ERROR_LOG } = require('../error/error_catcher.js')
    writeErrorLog(new Error('test failure'))
    assert.ok(fs.existsSync(ERROR_LOG))
    const content = fs.readFileSync(ERROR_LOG, 'utf8')
    assert.ok(content.includes('test failure'))
  })

  it('throws when required env vars are missing', () => {
    const { requireEnvVars } = require('../error/error_catcher.js')
    const key = `TFS_TEST_MISSING_${Date.now()}`
    delete process.env[key]
    assert.throws(
      () => requireEnvVars([key]),
      /Missing required environment variables/,
    )
  })

  it('passes when required env vars exist', () => {
    const { requireEnvVars } = require('../error/error_catcher.js')
    const key = `TFS_TEST_PRESENT_${Date.now()}`
    process.env[key] = 'ok'
    assert.doesNotThrow(() => requireEnvVars([key]))
    delete process.env[key]
  })

  it('accepts one-of env groups', () => {
    const { requireEnvVars } = require('../error/error_catcher.js')
    const key = `TFS_TEST_GROUP_${Date.now()}`
    process.env[key] = 'ok'
    assert.doesNotThrow(() => requireEnvVars([['MISSING_A', key, 'MISSING_B']]))
    delete process.env[key]
  })

  it('rejects empty env values', () => {
    const { requireEnvVars } = require('../error/error_catcher.js')
    const key = `TFS_TEST_EMPTY_${Date.now()}`
    process.env[key] = '   '
    assert.throws(() => requireEnvVars([key]), /Missing required environment variables/)
    delete process.env[key]
  })

  it('safeAsync forwards errors to next', async () => {
    const { safeAsync } = require('../error/error_catcher.js')
    const handler = safeAsync(async () => {
      throw new Error('async route failed')
    })

    let passedError = null
    await new Promise((resolve) => {
      handler({}, {}, (err) => {
        passedError = err
        resolve()
      })
    })

    assert.ok(passedError)
    assert.equal(passedError.message, 'async route failed')
  })

  it('expressErrorHandler returns TFS_BACKEND_FAILURE', () => {
    const { expressErrorHandler } = require('../error/error_catcher.js')
    const body = {}
    const res = {
      headersSent: false,
      status (code) {
        this.statusCode = code
        return this
      },
      json (payload) {
        Object.assign(body, payload)
        return this
      },
    }

    expressErrorHandler(new Error('boom'), { path: '/api/checkout' }, res, () => {})
    assert.equal(res.statusCode, 500)
    assert.equal(body.code, 'TFS_BACKEND_FAILURE')
  })

  it('attachCrashGuards is idempotent', () => {
    const { attachCrashGuards, getErrorCatcherStatus } = require('../error/error_catcher.js')
    attachCrashGuards()
    attachCrashGuards()
    assert.equal(getErrorCatcherStatus().crashGuardsAttached, true)
  })

  it('skips logging expected 4xx nitro errors', () => {
    const { shouldLogNitroError } = require('../error/error_catcher.js')
    assert.equal(shouldLogNitroError({ statusCode: 404 }), false)
    assert.equal(shouldLogNitroError({ statusCode: 500 }), true)
  })

  it('exposes status envelope', () => {
    const { getErrorCatcherStatus } = require('../error/error_catcher.js')
    const status = getErrorCatcherStatus()
    assert.equal(status.ok, true)
    assert.ok(status.errorLog.includes('errors.log'))
  })
})
