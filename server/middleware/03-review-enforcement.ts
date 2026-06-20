import { backendRequire as require } from '#cjs-require'
import { getServiceSupabase } from '../utils/serviceSupabase'

const {
  evaluateReviewSubmission,
  isReviewWritePath,
} = require('#backend/reviews/review_system.js')
const { persistReviewFlags } = require('#backend/reviews/submit_review.js')

export default defineEventHandler(async (event) => {
  const path = getRequestURL(event).pathname
  if (!isReviewWritePath(path, getMethod(event))) return

  const userId = getHeader(event, 'x-user-id') || null
  const isBanned = getHeader(event, 'x-user-banned') === 'true'
  const body = (event.context.sanitizedBody as Record<string, unknown> | undefined) ?? {}

  const result = evaluateReviewSubmission(body, { userId, isBanned })
  if (!result.ok) {
    if (result.flags?.includes('suspicious_language')) {
      const sb = getServiceSupabase()
      if (sb) {
        await persistReviewFlags(sb, {
          userId,
          review: result.review || body,
          flags: result.flags,
        }).catch(() => {})
      }
    }

    throw createError({
      statusCode: result.status || 403,
      statusMessage: result.error || 'Review blocked',
      data: result.flags ? { flags: result.flags } : undefined,
    })
  }

  event.context.reviewFlags = result.flags
  event.context.validatedReview = result.review
})
