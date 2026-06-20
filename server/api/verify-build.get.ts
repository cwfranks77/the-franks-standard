import { requireOwnerAuth } from '../utils/ownerAuth'
import { getServiceSupabase } from '../utils/serviceSupabase'
import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)
const { runBuildVerification, resolveBaseUrlFromRequest } = require('../../../backend/launch/build_verification.js')

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
