import { getBcServiceSupabase } from '#bc-server-utils/bcSupabase'
import { requireBcOpsAuth } from '#bc-server-utils/bcOpsAuth'
import { logBcAudit } from '#bc-server-utils/audit'

/** Create or activate an auction from the owner console. */
export default defineEventHandler(async (event) => {
  requireBcOpsAuth(event)
  const body = await readBody(event)
  const title = String(body?.title || 'Auction item').trim()
  const productId = String(body?.productId || title).trim()
  const startTime = body?.startTime ? new Date(body.startTime) : new Date()
  const endTime = body?.endTime ? new Date(body.endTime) : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
  const reservePrice = Number(body?.reservePrice || 0)
  const buyNowPrice = body?.buyNowPrice != null ? Number(body.buyNowPrice) : null
  const minIncrement = Number(body?.minIncrement || 1)
  const status = String(body?.status || 'active')

  const sb = getBcServiceSupabase()
  if (!sb) {
    throw createError({ statusCode: 503, statusMessage: 'Supabase not configured' })
  }

  const { data, error } = await sb.from('bc_auctions').insert({
    product_id: productId,
    title,
    seller_id: body?.sellerId || null,
    start_time: startTime.toISOString(),
    end_time: endTime.toISOString(),
    reserve_price: reservePrice,
    buy_now_price: buyNowPrice,
    min_increment: minIncrement,
    status,
  }).select().single()

  if (error) {
    throw createError({ statusCode: 500, statusMessage: error.message })
  }

  await logBcAudit('admin', null, 'auction_created', 'auction', data.id, { title })
  return { success: true, auction: data }
})
