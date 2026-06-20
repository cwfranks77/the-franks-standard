import { requireOwnerAuth } from '../../../utils/ownerAuth'
import { getServiceSupabase, supabaseUnavailable } from '../../../utils/serviceSupabase'
import { backendRequire as require } from '#cjs-require'

export default defineEventHandler(async (event) => {
  requireOwnerAuth(event)
  const sb = getServiceSupabase()
  if (!sb) throw createError({ statusCode: 503, statusMessage: supabaseUnavailable().message })

  const query = getQuery(event)
  const unreadOnly = query.unread === 'true'

  const { listOwnerAlerts, markAlertRead } = require('#backend/owner/alerts.js')

  if (getMethod(event) === 'POST') {
    const body = await readBody(event).catch(() => ({})) as { alert_id?: string }
    if (body.alert_id) return markAlertRead(sb, body.alert_id)
    return { ok: false, error: 'alert_id_required' }
  }

  return listOwnerAlerts(sb, { unreadOnly, limit: Number(query.limit) || 50 })
})
