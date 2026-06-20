import type { SupabaseClient } from 'npm:@supabase/supabase-js@2'
import { scanAndEnforceViolation } from './violationEnforcement.ts'

const VERIFIED_ORDER_STATUSES = new Set(['paid', 'shipped', 'delivered', 'confirmed', 'disputed'])

export async function assertVerifiedPurchase (
  admin: SupabaseClient,
  orderId: string,
  reviewerId: string,
  targetRole: 'seller' | 'buyer',
): Promise<{ ok: true; order: { buyer_id: string; seller_id: string } } | { ok: false; error: string }> {
  const { data: order, error } = await admin
    .from('orders')
    .select('id, buyer_id, seller_id, status')
    .eq('id', orderId)
    .maybeSingle()

  if (error || !order) return { ok: false, error: 'order_not_found' }
  if (!VERIFIED_ORDER_STATUSES.has(String(order.status))) {
    return { ok: false, error: 'order_not_verified' }
  }

  if (targetRole === 'seller') {
    if (order.buyer_id !== reviewerId) return { ok: false, error: 'forbidden' }
  } else {
    if (order.seller_id !== reviewerId) return { ok: false, error: 'forbidden' }
  }

  return { ok: true, order: { buyer_id: order.buyer_id, seller_id: order.seller_id } }
}

export async function submitSellerReview (
  admin: SupabaseClient,
  params: {
    reviewerId: string
    sellerId: string
    orderId: string
    rating: number
    text: string
    evidence?: Record<string, unknown>
    ipAddress?: string | null
  },
): Promise<{ ok: true; review_id: string } | { ok: false; error: string; message?: string }> {
  const verified = await assertVerifiedPurchase(admin, params.orderId, params.reviewerId, 'seller')
  if (!verified.ok) return verified
  if (verified.order.seller_id !== params.sellerId) return { ok: false, error: 'seller_mismatch' }

  const scan = await scanAndEnforceViolation({
    admin,
    userId: params.reviewerId,
    sourceType: 'review',
    sourceId: params.orderId,
    content: params.text,
    ipAddress: params.ipAddress,
    metadata: { review_type: 'seller', seller_id: params.sellerId },
  })
  if (scan.violated) {
    return { ok: false, error: 'review_blocked', message: 'Review violates marketplace policies.' }
  }

  const { data, error } = await admin.from('seller_reviews').insert({
    reviewer_id: params.reviewerId,
    seller_id: params.sellerId,
    order_id: params.orderId,
    rating: params.rating,
    text: params.text.slice(0, 4000),
    evidence: params.evidence ?? {},
  }).select('id').single()

  if (error || !data?.id) return { ok: false, error: error?.message ?? 'insert_failed' }
  return { ok: true, review_id: data.id }
}

export async function submitBuyerReview (
  admin: SupabaseClient,
  params: {
    reviewerId: string
    buyerId: string
    orderId: string
    rating: number
    text: string
    evidence?: Record<string, unknown>
    ipAddress?: string | null
  },
): Promise<{ ok: true; review_id: string } | { ok: false; error: string; message?: string }> {
  const verified = await assertVerifiedPurchase(admin, params.orderId, params.reviewerId, 'buyer')
  if (!verified.ok) return verified
  if (verified.order.buyer_id !== params.buyerId) return { ok: false, error: 'buyer_mismatch' }

  const scan = await scanAndEnforceViolation({
    admin,
    userId: params.reviewerId,
    sourceType: 'review',
    sourceId: params.orderId,
    content: params.text,
    ipAddress: params.ipAddress,
    metadata: { review_type: 'buyer', buyer_id: params.buyerId },
  })
  if (scan.violated) {
    return { ok: false, error: 'review_blocked', message: 'Review violates marketplace policies.' }
  }

  const { data, error } = await admin.from('buyer_reviews').insert({
    reviewer_id: params.reviewerId,
    buyer_id: params.buyerId,
    order_id: params.orderId,
    rating: params.rating,
    text: params.text.slice(0, 4000),
    evidence: params.evidence ?? {},
  }).select('id').single()

  if (error || !data?.id) return { ok: false, error: error?.message ?? 'insert_failed' }
  return { ok: true, review_id: data.id }
}

export async function submitPlatformReview (
  admin: SupabaseClient,
  params: {
    reviewerId: string
    rating: number
    text: string
    evidence?: Record<string, unknown>
    ipAddress?: string | null
  },
): Promise<{ ok: true; review_id: string } | { ok: false; error: string; message?: string }> {
  const scan = await scanAndEnforceViolation({
    admin,
    userId: params.reviewerId,
    sourceType: 'review',
    content: params.text,
    ipAddress: params.ipAddress,
    metadata: { review_type: 'platform' },
  })
  if (scan.violated) {
    return { ok: false, error: 'review_blocked', message: 'Review violates marketplace policies.' }
  }

  const { data, error } = await admin.from('platform_reviews').insert({
    reviewer_id: params.reviewerId,
    rating: params.rating,
    text: params.text.slice(0, 4000),
    evidence: params.evidence ?? {},
  }).select('id').single()

  if (error || !data?.id) return { ok: false, error: error?.message ?? 'insert_failed' }
  return { ok: true, review_id: data.id }
}
