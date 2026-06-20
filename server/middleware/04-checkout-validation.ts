import { backendRequire as require } from '#cjs-require'
import { getServiceSupabase } from '../utils/serviceSupabase'

const { evaluateCheckout, isCheckoutPath, logCheckoutStart } = require('#backend/checkout/checkout_validation.js')

export default defineEventHandler(async (event) => {
  const path = getRequestURL(event).pathname
  if (!isCheckoutPath(path) || getMethod(event) !== 'POST') return

  const body = (event.context.sanitizedBody as Record<string, unknown> | undefined) ?? {}
  let userId = getHeader(event, 'x-user-id') || null
  const isBanned = getHeader(event, 'x-user-banned') === 'true'

  const authHeader = getHeader(event, 'authorization') || ''
  if (authHeader.startsWith('Bearer ')) {
    const sb = getServiceSupabase()
    if (sb) {
      const token = authHeader.slice(7)
      const { data: { user } } = await sb.auth.getUser(token)
      if (user?.id) userId = user.id
    }
  }

  const result = evaluateCheckout(body, { userId, isBanned, admin: getServiceSupabase() })
  if (!result.ok) {
    throw createError({
      statusCode: result.status || 400,
      statusMessage: result.error || 'Checkout validation failed',
    })
  }

  event.context.checkoutUserId = userId
  event.context.checkoutValidation = result
  event.context.checkoutTotals = result.totals

  if (userId) {
    await logCheckoutStart(userId, result.checkout, result.totals, getServiceSupabase()).catch(() => {})
  }
})
