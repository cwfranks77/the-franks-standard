import { createRequire } from 'node:module'
import { getServiceSupabase, supabaseUnavailable } from '../../utils/serviceSupabase'

const require = createRequire(import.meta.url)
const { evaluateReviewSubmission } = require('../../../backend/reviews/review_system.js')
const { submitReview } = require('../../../backend/reviews/submit_review.js')

function clientIp (event: Parameters<typeof getRequestURL>[0]) {
  return getHeader(event, 'x-forwarded-for')?.split(',')[0]?.trim()
    || getHeader(event, 'x-real-ip')
    || null
}

/**
 * POST /api/reviews/create
 * Enforcement: server/middleware/03-review-enforcement.ts
 */
export default defineEventHandler(async (event) => {
  if (getMethod(event) !== 'POST') {
    throw createError({ statusCode: 405, statusMessage: 'POST required' })
  }

  const sb = getServiceSupabase()
  if (!sb) throw createError({ statusCode: 503, statusMessage: supabaseUnavailable().message })

  const authHeader = getHeader(event, 'authorization') || ''
  let userId = getHeader(event, 'x-user-id') || null
  const isBanned = getHeader(event, 'x-user-banned') === 'true'

  if (authHeader.startsWith('Bearer ')) {
    const token = authHeader.slice(7)
    const { data: { user } } = await sb.auth.getUser(token)
    if (user?.id) userId = user.id
  }

  const body = (event.context.sanitizedBody as Record<string, unknown> | undefined)
    ?? await readBody(event).catch(() => ({}))

  const precheck = (event.context.validatedReview as Record<string, unknown> | undefined)
    ? { ok: true as const, review: event.context.validatedReview, flags: event.context.reviewFlags }
    : evaluateReviewSubmission(body, { userId, isBanned })

  if (!precheck.ok) {
    throw createError({
      statusCode: (precheck as { status?: number }).status || 403,
      statusMessage: (precheck as { error?: string }).error || 'Review blocked',
      data: (precheck as { flags?: string[] }).flags
        ? { flags: (precheck as { flags?: string[] }).flags }
        : undefined,
    })
  }

  const result = await submitReview(sb, {
    review: precheck.review || body,
    userId,
    isBanned,
    ipAddress: clientIp(event),
  })

  if (!result.ok) {
    throw createError({
      statusCode: result.status || 400,
      statusMessage: result.error || 'review_submit_failed',
      data: result.flags ? { flags: result.flags } : undefined,
    })
  }

  return result
})
