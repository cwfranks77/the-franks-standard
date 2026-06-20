import { getServiceSupabase, supabaseUnavailable } from '../../utils/serviceSupabase'
import { backendRequire as require } from '#cjs-require'
const { createListing } = require('#backend/marketplace/create_listing.js')

/**
 * POST /api/listings/create
 * Enforcement: server/middleware/02-marketplace-enforcement.ts
 *   (enforceSellerRules → enforceListingRules equivalent)
 */
export default defineEventHandler(async (event) => {
  if (getMethod(event) !== 'POST') {
    throw createError({ statusCode: 405, statusMessage: 'POST required' })
  }

  const sb = getServiceSupabase()
  if (!sb) throw createError({ statusCode: 503, statusMessage: supabaseUnavailable().message })

  const authHeader = getHeader(event, 'authorization') || ''
  let sellerId = getHeader(event, 'x-user-id') || null

  if (authHeader.startsWith('Bearer ')) {
    const token = authHeader.slice(7)
    const { data: { user } } = await sb.auth.getUser(token)
    if (user?.id) sellerId = user.id
  }

  const body = (event.context.sanitizedBody as Record<string, unknown> | undefined)
    ?? await readBody(event).catch(() => ({}))

  const flags = Array.isArray(event.context.listingFlags)
    ? event.context.listingFlags as string[]
    : []

  const result = await createListing(sb, {
    sellerId,
    listing: body as Record<string, unknown>,
    flags,
    publish: Boolean((body as Record<string, unknown>).publish),
  })

  if (!result.ok) {
    throw createError({
      statusCode: result.status || 400,
      statusMessage: result.error || 'create_listing_failed',
    })
  }

  return result
})
