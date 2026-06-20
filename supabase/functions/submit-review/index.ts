import { createClient } from 'npm:@supabase/supabase-js@2'
import { assertMarketplaceCompliance } from '../_shared/marketplaceCompliance.ts'
import {
  submitBuyerReview,
  submitPlatformReview,
  submitSellerReview,
} from '../_shared/reviewSystem.ts'
import { corsHeaders, json } from '../_shared/stripe.ts'
import { clientIpFromRequest } from '../_shared/requestContext.ts'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL') ?? ''
const SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? Deno.env.get('SERVICE_ROLE_KEY') ?? ''

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })
  if (req.method !== 'POST') return json({ error: 'method_not_allowed' }, 405)

  const authHeader = req.headers.get('Authorization') ?? ''
  if (!authHeader.startsWith('Bearer ')) return json({ error: 'unauthorized' }, 401)

  const userClient = createClient(SUPABASE_URL, Deno.env.get('SUPABASE_ANON_KEY') ?? '', {
    global: { headers: { Authorization: authHeader } },
    auth: { persistSession: false },
  })
  const { data: { user }, error: userErr } = await userClient.auth.getUser()
  if (userErr || !user) return json({ error: 'unauthorized' }, 401)

  let body: Record<string, unknown>
  try {
    body = await req.json()
  } catch {
    return json({ error: 'invalid_json' }, 400)
  }

  const reviewType = String(body.review_type ?? '').trim()
  const rating = Number(body.rating)
  const text = String(body.text ?? '').trim()
  const evidence = (body.evidence as Record<string, unknown>) ?? {}

  if (!Number.isFinite(rating) || rating < 1 || rating > 5 || text.length < 3) {
    return json({ error: 'invalid_review' }, 400)
  }

  const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, { auth: { persistSession: false } })
  const ip = clientIpFromRequest(req)

  const compliance = await assertMarketplaceCompliance(admin, user.id)
  if (!compliance.ok) return json({ error: compliance.error, message: compliance.message }, 403)

  if (reviewType === 'platform') {
    const result = await submitPlatformReview(admin, {
      reviewerId: user.id,
      rating,
      text,
      evidence,
      ipAddress: ip,
    })
    if (!result.ok) return json({ error: result.error, message: result.message }, 400)
    return json({ ok: true, review_id: result.review_id })
  }

  const orderId = String(body.order_id ?? '').trim()
  const targetId = String(body.target_id ?? '').trim()
  if (!orderId || !targetId) return json({ error: 'missing_fields' }, 400)

  if (reviewType === 'seller') {
    const result = await submitSellerReview(admin, {
      reviewerId: user.id,
      sellerId: targetId,
      orderId,
      rating,
      text,
      evidence,
      ipAddress: ip,
    })
    if (!result.ok) return json({ error: result.error, message: result.message }, 400)
    return json({ ok: true, review_id: result.review_id })
  }

  if (reviewType === 'buyer') {
    const result = await submitBuyerReview(admin, {
      reviewerId: user.id,
      buyerId: targetId,
      orderId,
      rating,
      text,
      evidence,
      ipAddress: ip,
    })
    if (!result.ok) return json({ error: result.error, message: result.message }, 400)
    return json({ ok: true, review_id: result.review_id })
  }

  return json({ error: 'invalid_review_type' }, 400)
})
