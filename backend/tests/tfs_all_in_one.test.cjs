const { describe, it } = require('node:test')
const assert = require('node:assert/strict')
const fs = require('fs')
const path = require('path')

describe('tfs all in one', () => {
  const root = path.join(__dirname, '..', '..')

  it('includes tfsAllInOne scripts in build verification file list', () => {
    const { REQUIRED_FILES } = require('../launch/build_verification.js')
    assert.ok(REQUIRED_FILES.includes('scripts/tfsAllInOne.ts'))
    assert.ok(REQUIRED_FILES.includes('scripts/tfsAllInOneRoutes.ts'))
  })

  it('all-in-one script files exist on disk', () => {
    const files = [
      'scripts/tfsAllInOne.ts',
      'scripts/tfsAllInOneRoutes.ts',
      'scripts/tfsExpressApp.ts',
      'scripts/securityHardening.ts',
      'scripts/marketplaceEnforcement.ts',
      'scripts/reviewSystem.ts',
      'scripts/activityRecorder.ts',
      'scripts/ownerTools.ts',
      'scripts/checkoutValidation.ts',
      'scripts/errorCatcher.ts',
      'scripts/buildVerification.ts',
    ]

    for (const file of files) {
      assert.ok(fs.existsSync(path.join(root, file)), `missing ${file}`)
    }
  })

  it('backend modules backing all-in-one namespaces exist', () => {
    const modules = [
      '../security/security_hardening.js',
      '../activity/activity_recorder.js',
      '../marketplace/marketplace_enforcement.js',
      '../reviews/review_system.js',
      '../owner/owner_tools.js',
      '../checkout/checkout_validation.js',
      '../error/error_catcher.js',
      '../launch/build_verification.js',
    ]

    for (const mod of modules) {
      assert.doesNotThrow(() => require(mod))
    }
  })
})
