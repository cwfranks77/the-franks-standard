import { requireOpsAuth } from '../../utils/opsAuth'
import { getServiceSupabase } from '../../utils/ownerCms'

export default defineEventHandler(async (event) => {
  requireOpsAuth(event)
  const body = await readBody(event)
  const sb = getServiceSupabase()
  if (!sb) {
    throw createError({ statusCode: 503, statusMessage: 'Supabase service role not configured.' })
  }
  const { error, data } = await sb
    .from('distributors')
    .insert({
      name: body.companyName,
      business_tax_id: body.businessTaxId,
      wholesale_catalog_url: body.wholesaleCatalogUrl || null,
      preferred_payout_method: body.preferredPayoutMethod || 'Stripe Connect',
      is_active: true,
    })
    .select()
    .single()
  if (error) throw createError({ statusCode: 500, statusMessage: error.message })
  return { ok: true, vendor: data }
})
