import { requireOwnerAuth } from '../../../utils/ownerAuth'
import { getServiceSupabase, supabaseUnavailable } from '../../../utils/serviceSupabase'
import { backendRequire as require } from '#cjs-require'

export default defineEventHandler(async (event) => {
  requireOwnerAuth(event)
  const sb = getServiceSupabase()
  if (!sb) throw createError({ statusCode: 503, statusMessage: supabaseUnavailable().message })

  const method = getMethod(event)
  const { createKey, revokeKey, listKeys } = require('#backend/owner/api_keys.js')

  if (method === 'GET') {
    return listKeys(sb)
  }

  const body = await readBody(event).catch(() => ({})) as { action?: string; key_id?: string; permissions?: string[] }
  if (body.action === 'revoke') {
    return revokeKey(sb, String(body.key_id ?? ''))
  }

  return createKey(sb, { permissions: body.permissions ?? ['read', 'write'] })
})
