import { backendRequire as require } from '#cjs-require'
import { getServiceSupabase, supabaseUnavailable } from '../../utils/serviceSupabase'

const { autocomplete } = require('#backend/search/autocomplete.js')

export default defineEventHandler(async (event) => {
  const sb = getServiceSupabase()
  if (!sb) throw createError({ statusCode: 503, statusMessage: supabaseUnavailable().message })

  const q = getQuery(event)
  return autocomplete(sb, {
    q: String(q.q ?? ''),
    limit: Math.min(20, Number(q.limit) || 12),
  })
})
