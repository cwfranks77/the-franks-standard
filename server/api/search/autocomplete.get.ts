import { createRequire } from 'node:module'
import { getServiceSupabase, supabaseUnavailable } from '../../utils/serviceSupabase'

const require = createRequire(import.meta.url)
const { autocomplete } = require('../../../backend/search/autocomplete.js')

export default defineEventHandler(async (event) => {
  const sb = getServiceSupabase()
  if (!sb) throw createError({ statusCode: 503, statusMessage: supabaseUnavailable().message })

  const q = getQuery(event)
  return autocomplete(sb, {
    q: String(q.q ?? ''),
    limit: Math.min(20, Number(q.limit) || 12),
  })
})
