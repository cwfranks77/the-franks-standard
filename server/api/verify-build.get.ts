import { requireOwnerAuth } from '../utils/ownerAuth'
import { getServiceSupabase } from '../utils/serviceSupabase'
import { backendRequire as require } from '#cjs-require'
const { runBuildVerification, resolveBaseUrlFromRequest } = require('#backend/launch/build_verification.js')

/**
 * GET /api/verify-build — owner-only final build verification report.
 * Matches: runBuildVerification(app, req.db)
 */
export default defineEventHandler(async (event) => {
  requireOwnerAuth(event)

  const host = getHeader(event, 'host') || 'localhost:3000'
  const proto = getHeader(event, 'x-forwarded-proto') || 'http'
  const baseUrl = resolveBaseUrlFromRequest({
    headers: { host, 'x-forwarded-proto': proto },
  })

  const report = await runBuildVerification({
    admin: getServiceSupabase(),
    baseUrl,
  })

  return report
})
