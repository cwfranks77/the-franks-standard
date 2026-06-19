import { getBcServiceSupabase, supabaseUnavailable } from '#bc-server-utils/bcSupabase'
import { requireBcOpsAuth } from '#bc-server-utils/bcOpsAuth'

async function safeSelect (table: string, select: string, orderCol: string, limit: number) {
  const sb = getBcServiceSupabase()
  if (!sb) return []
  try {
    const { data } = await sb.from(table).select(select).order(orderCol, { ascending: false }).limit(limit)
    return data || []
  } catch {
    return []
  }
}

/** Owner activity feed — audit logs, orders, and customer signups. */
export default defineEventHandler(async (event) => {
  requireBcOpsAuth(event)
  const sb = getBcServiceSupabase()
  if (!sb) return supabaseUnavailable()

  const [auditRes, profilesRes] = await Promise.all([
    sb.from('bc_audit_logs').select('*').order('created_at', { ascending: false }).limit(80),
    sb.from('bc_customer_profiles').select('id,email,full_name,status,created_at').order('created_at', { ascending: false }).limit(40),
  ])

  const orders = await safeSelect('orders', 'id,buyer_email,total_cents,status,created_at', 'created_at', 40)
  const dropship = await safeSelect('dropship_orders', 'id,order_id,provider_status,updated_at', 'updated_at', 40)

  return {
    source: 'supabase',
    audit: auditRes.data || [],
    orders,
    profiles: profilesRes.data || [],
    dropship,
    errors: {
      audit: auditRes.error?.message || null,
      profiles: profilesRes.error?.message || null,
    },
  }
})
