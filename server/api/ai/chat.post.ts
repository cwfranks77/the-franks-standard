import { getServiceSupabase, supabaseUnavailable } from '../../utils/serviceSupabase'
import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)
const { handleChatMessage } = require('../../../backend/ai_chat_agent/chat_router.js')

/**
 * POST /api/ai/chat — backend AI support chat (no UI changes).
 * Body: { message, session_id?, user_id? }
 */
export default defineEventHandler(async (event) => {
  if (getMethod(event) !== 'POST') {
    throw createError({ statusCode: 405, statusMessage: 'POST required' })
  }

  const sb = getServiceSupabase()
  if (!sb) throw createError({ statusCode: 503, statusMessage: supabaseUnavailable().message })

  const body = await readBody(event).catch(() => ({})) as {
    message?: string
    session_id?: string
    user_id?: string
  }

  const result = await handleChatMessage(sb, {
    message: String(body.message ?? ''),
    session_id: body.session_id ? String(body.session_id) : undefined,
    user_id: body.user_id ? String(body.user_id) : null,
  })

  if (!result.ok) {
    throw createError({ statusCode: 400, statusMessage: result.error ?? 'chat_failed' })
  }

  return result
})
