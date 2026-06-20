import { createRequire } from 'node:module'
import { requireOwnerAuth } from '../../utils/ownerAuth'

const require = createRequire(import.meta.url)

/**
 * GET /api/security/healthcheck — owner-only security subsystem status.
 */
export default defineEventHandler((event) => {
  requireOwnerAuth(event)

  const { getRateLimitStatus } = require('../../../backend/security/rate_limit.js')
  const { getBruteForceStatus } = require('../../../backend/security/brute_force.js')
  const { getSessionSecurityStatus } = require('../../../backend/security/session_security.js')
  const { getFingerprintEnforcementStatus } = require('../../../backend/security/device_fingerprint.js')
  const { getIpRiskStatus } = require('../../../backend/security/ip_risk.js')
  const { getFileScanStatus } = require('../../../backend/security/file_upload.js')

  return {
    ok: true,
    checked_at: new Date().toISOString(),
    rate_limit: getRateLimitStatus(),
    session_rotation: getSessionSecurityStatus(),
    fingerprint_enforcement: getFingerprintEnforcementStatus(),
    ip_risk_engine: getIpRiskStatus(),
    file_scanning: getFileScanStatus(),
    brute_force_protection: getBruteForceStatus(),
    message_sanitization: { enabled: true, strips: ['email', 'phone', 'url', 'social', 'payment', 'off_platform'] },
    owner_routes_protected: true,
  }
})
