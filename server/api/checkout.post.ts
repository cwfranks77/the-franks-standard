import { backendRequire as require } from '#cjs-require'
const { startCheckout } = require('#backend/marketplace/checkout.js')
const { logCheckoutComplete } = require('#backend/checkout/checkout_validation.js')

/**
 * POST /api/checkout
 * Middleware: 02-marketplace-enforcement, 04-checkout-validation
 * Order: requireAuth → validate → fraud → totals → processor → logStart → handler → logComplete
 */
export default defineEventHandler(async (event) => {
  if (getMethod(event) !== 'POST') {
    throw createError({ statusCode: 405, statusMessage: 'POST required' })
  }

  const body = (event.context.sanitizedBody as Record<string, unknown> | undefined)
    ?? await readBody(event).catch(() => ({}))

  const validation = event.context.checkoutValidation as {
    checkout?: Record<string, unknown>
  } | undefined

  if (!validation?.checkout) {
    throw createError({ statusCode: 400, statusMessage: 'Checkout validation required.' })
  }

  const userId = (event.context.checkoutUserId as string | null) || null
  if (!userId) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }

  const checkoutBody = { ...body, ...validation.checkout, user_id: userId }

  const result = await startCheckout({
    supabaseUrl: process.env.SUPABASE_URL || process.env.NUXT_PUBLIC_SUPABASE_URL,
    anonKey: process.env.NUXT_PUBLIC_SUPABASE_KEY || process.env.NUXT_PUBLIC_SUPABASE_ANON_KEY,
    authorization: getHeader(event, 'authorization') || '',
    body: checkoutBody,
    checkoutTotals: event.context.checkoutTotals ?? null,
    skipCompleteLog: true,
  })

  if (!result.ok) {
    throw createError({
      statusCode: result.status || 500,
      statusMessage: result.error || 'checkout_failed',
      data: result.message ? { message: result.message, ...(result.data || {}) } : result.data,
    })
  }

  const transactionId = result.data?.order_id || result.data?.session_id || 'completed'
  await logCheckoutComplete(
    userId,
    String(transactionId),
    validation.checkout,
    event.context.checkoutTotals,
  ).catch(() => {})

  return result.data
})
