import { requireOwnerAuth } from '../../../utils/ownerAuth'
import { getServiceSupabase, supabaseUnavailable } from '../../../utils/serviceSupabase'

export default defineEventHandler(async (event) => {
  requireOwnerAuth(event)
  const sb = getServiceSupabase()
  if (!sb) throw createError({ statusCode: 503, statusMessage: supabaseUnavailable().message })

  const query = getQuery(event)
  const days = Math.min(365, Math.max(1, Number(query.days) || 30))
  const category = String(query.category ?? '').trim()
  const userId = String(query.user_id ?? '').trim()
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString()

  let q = sb
    .from('ledger_entries')
    .select('id, user_id, entry_type, amount, category, reference_id, reference_type, metadata, created_at')
    .gte('created_at', since)
    .order('created_at', { ascending: false })
    .limit(500)

  if (category) q = q.eq('category', category)
  if (userId) q = q.eq('user_id', userId)

  const { data, error } = await q
  if (error) throw createError({ statusCode: 500, statusMessage: error.message })

  const credits = (data ?? []).filter((e) => e.entry_type === 'credit').reduce((s, e) => s + Number(e.amount), 0)
  const debits = (data ?? []).filter((e) => e.entry_type === 'debit').reduce((s, e) => s + Number(e.amount), 0)

  return {
    ok: true,
    since,
    entries: data ?? [],
    totals: {
      credits: Math.round(credits * 100) / 100,
      debits: Math.round(debits * 100) / 100,
    },
  }
})
