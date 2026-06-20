import { backendRequire as require } from '#cjs-require'
import { requireOwnerAuth } from '../utils/ownerAuth'
import { getServiceSupabase } from '../utils/serviceSupabase'

const {
  evaluateListingEnforcement,
  enforceBuyerRulesContext,
  enforceSellerRulesContext,
  isListingWritePath,
  isCheckoutPath,
  isBuyerActionPath,
  isSellerActionPath,
  persistListingViolationFlags,
} = require('#backend/marketplace/marketplace_enforcement.js')

function opsKeyValid (event: Parameters<typeof getRequestURL>[0]) {
  try {
    requireOwnerAuth(event)
    return true
  } catch {
    return false
  }
}

function userContext (event: Parameters<typeof getRequestURL>[0]) {
  return {
    userId: getHeader(event, 'x-user-id') || null,
    isBanned: getHeader(event, 'x-user-banned') === 'true',
    isVerifiedSeller: getHeader(event, 'x-user-verified-seller') === 'true',
    opsKeyValid: opsKeyValid(event),
  }
}

export default defineEventHandler(async (event) => {
  const path = getRequestURL(event).pathname
  if (!path.startsWith('/api/')) return

  const method = getMethod(event)
  const user = userContext(event)

  if (isBuyerActionPath(path) && isCheckoutPath(path) && !user.opsKeyValid) {
    const buyer = enforceBuyerRulesContext(user)
    if (!buyer.ok) {
      throw createError({ statusCode: buyer.status || 403, statusMessage: buyer.error || 'Forbidden' })
    }
  }

  if (isSellerActionPath(path, method) && !user.opsKeyValid) {
    const seller = enforceSellerRulesContext({
      ...user,
      isVerifiedSeller: user.isVerifiedSeller || getHeader(event, 'x-seller-policies-accepted') === 'true',
    })
    if (!seller.ok) {
      throw createError({ statusCode: seller.status || 403, statusMessage: seller.error || 'Forbidden' })
    }
  }

  if (!isListingWritePath(path, method)) return

  const listing = (event.context.sanitizedBody as Record<string, unknown> | undefined) ?? {}
  const result = evaluateListingEnforcement(listing)
  event.context.listingFlags = result.flags

  if (result.freeze) {
    const sb = getServiceSupabase()
    if (sb && result.flags.length) {
      await persistListingViolationFlags(sb, {
        userId: user.userId,
        listing,
        flags: result.flags,
      }).catch(() => {})
    }

    throw createError({
      statusCode: 403,
      statusMessage: result.error || 'Listing frozen',
      data: { flags: result.flags },
    })
  }
})
