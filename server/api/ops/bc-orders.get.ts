import { requireOpsAuth } from '../../utils/opsAuth'
import { getServiceSupabase } from '../../utils/ownerCms'

/** Recent B&C storefront checkout / dropship rows for the owner console. */
export default defineEventHandler(async (event) => {
  requireOpsAuth(event)
  const sb = getServiceSupabase()
  if (!sb) {
    return { rows: [], source: 'unavailable', message: 'Supabase service role not configured.' }
  }

  const { data, error } = await sb
    .from('dropship_orders')
    .select('id,order_id,provider_key,provider_status,provider_order_id,updated_at,created_at,order:orders(tracking_number,tracking_carrier,total_cents,buyer_email),listing:listings(title)')
    .order('updated_at', { ascending: false })
    .limit(40)

  if (error) {
    throw createError({ statusCode: 500, statusMessage: error.message })
  }

  return {
    rows: data || [],
    source: 'supabase',
  }
})
