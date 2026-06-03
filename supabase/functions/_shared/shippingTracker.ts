import { SupabaseClient } from 'npm:@supabase/supabase-js@2'
import Stripe from 'npm:stripe@14'
import { transferDropshipSellerMargin } from './dropshipStripeSplit.ts'
import { releaseVendorEscrowPayout, type VendorPayoutReleaseReason } from './marketplaceConnectEscrow.ts'

/** In-transit: update order only — no bank payout yet. */
export const IN_TRANSIT_STATUSES = new Set([
  'in_transit',
  'in transit',
  'intransit',
  'pre_transit',
  'pre-transit',
  'pretransit',
  'transit',
  'accepted',
  'picked_up',
  'picked up',
  'pickup',
])

/** Carrier marked delivered to buyer — release escrow + margin to seller bank/Connect. */
export const DELIVERY_RELEASE_STATUSES = new Set([
  'delivered',
  'delivery',
  'delivered_to_customer',
  'delivered_to_recipient',
  'package_delivered',
  'completed',
])

export type ParsedTrackingEvent = {
  provider: 'shippo' | 'easypost' | 'unknown'
  eventType: string
  status: string
  trackingNumber: string
  externalTrackerId?: string
  carrier?: string
  raw: Record<string, unknown>
}

function normalizeStatus (status: string): string {
  return String(status || '').toLowerCase().trim().replace(/\s+/g, '_')
}

export function isInTransitStatus (status: string): boolean {
  const s = normalizeStatus(status)
  return IN_TRANSIT_STATUSES.has(s) || IN_TRANSIT_STATUSES.has(s.replace(/_/g, ' '))
}

export function isDeliveryReleaseStatus (status: string): boolean {
  const s = normalizeStatus(status)
  return DELIVERY_RELEASE_STATUSES.has(s) || DELIVERY_RELEASE_STATUSES.has(s.replace(/_/g, ' '))
}

export function parseShippingWebhookBody (body: Record<string, unknown>): ParsedTrackingEvent | null {
  const event = String(body.event ?? body.description ?? '').toLowerCase()

  if (event === 'track_updated' || body.data) {
    const data = (body.data && typeof body.data === 'object') ? body.data as Record<string, unknown> : {}
    const trackingNumber = String(data.tracking_number ?? data.trackingNumber ?? '').trim()
    const ts = (data.tracking_status && typeof data.tracking_status === 'object')
      ? data.tracking_status as Record<string, unknown>
      : {}
    const status = String(ts.status ?? ts.status_details ?? data.status ?? '').trim()
    if (trackingNumber) {
      return {
        provider: 'shippo',
        eventType: event || 'track_updated',
        status,
        trackingNumber,
        externalTrackerId: String(data.object_id ?? data.id ?? '').trim() || undefined,
        carrier: String(data.carrier ?? '').trim() || undefined,
        raw: body,
      }
    }
  }

  const result = (body.result && typeof body.result === 'object') ? body.result as Record<string, unknown> : null
  if (result) {
    const trackingNumber = String(result.tracking_code ?? result.tracking_number ?? '').trim()
    const status = String(result.status ?? '').trim()
    if (trackingNumber) {
      return {
        provider: 'easypost',
        eventType: event || 'tracker.updated',
        status,
        trackingNumber,
        externalTrackerId: String(result.id ?? '').trim() || undefined,
        carrier: String(result.carrier ?? '').trim() || undefined,
        raw: body,
      }
    }
  }

  const trackingNumber = String(
    body.tracking_number ?? body.trackingNumber ?? body.tracking_code ?? '',
  ).trim()
  const status = String(body.status ?? '').trim()
  if (trackingNumber && status) {
    return {
      provider: 'unknown',
      eventType: event || 'tracking_update',
      status,
      trackingNumber,
      raw: body,
    }
  }

  return null
}

async function findOrderByTracking (
  admin: SupabaseClient,
  trackingNumber: string,
): Promise<{
  id: string
  separate_charges: boolean | null
  stripe_vendor_payout_id: string | null
  stripe_seller_transfer_id: string | null
  listing_mode: string | null
  status: string
} | null> {
  const tn = trackingNumber.trim()
  if (!tn) return null

  const { data } = await admin
    .from('orders')
    .select('id, separate_charges, stripe_vendor_payout_id, stripe_seller_transfer_id, listing_mode, status')
    .eq('tracking_number', tn)
    .in('status', ['paid', 'shipped', 'delivered', 'submitted_to_supplier', 'confirmed'])
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  return data as {
    id: string
    separate_charges: boolean | null
    stripe_vendor_payout_id: string | null
    stripe_seller_transfer_id: string | null
    listing_mode: string | null
    status: string
  } | null
}

async function logTrackingEvent (
  admin: SupabaseClient,
  orderId: string,
  event: ParsedTrackingEvent,
) {
  await admin.from('order_tracking_events').insert({
    order_id: orderId,
    provider: event.provider,
    event_type: event.eventType,
    status: event.status,
    payload: event.raw,
  })
}

function isDropship (listingMode: string | null): boolean {
  return String(listingMode || '').toLowerCase() === 'dropship'
}

/**
 * Release vendor escrow (bank) + dropship margin (Connect transfer) when carrier marks delivered.
 * Idempotent — safe if buyer never confirms and supplier webhook also fires.
 */
export async function releaseAllSellerFundsOnCarrierDelivery (
  admin: SupabaseClient,
  stripe: Stripe,
  orderId: string,
  event: ParsedTrackingEvent | null,
  reason: VendorPayoutReleaseReason = 'carrier_delivery',
): Promise<{
  ok: boolean
  escrow?: { ok: boolean; skipped?: boolean; payout_id?: string; error?: string }
  margin?: { ok: boolean; skipped?: boolean; transfer_id?: string; error?: string }
}> {
  const now = new Date().toISOString()
  const { data: order } = await admin
    .from('orders')
    .select('id, status, separate_charges, listing_mode, stripe_vendor_payout_id, stripe_seller_transfer_id')
    .eq('id', orderId)
    .maybeSingle()

  if (!order) return { ok: false, escrow: { ok: false, error: 'order_not_found' } }

  const patch: Record<string, unknown> = {
    status: 'delivered',
    tracking_status: event?.status ?? 'delivered',
    carrier_scan_at: now,
    escrow_status: 'released',
  }
  if (event) {
    patch.tracking_provider = event.provider
    patch.external_tracker_id = event.externalTrackerId ?? null
    if (event.carrier) patch.tracking_carrier = event.carrier
  }

  if (order.status === 'paid' || order.status === 'submitted_to_supplier') {
    patch.shipped_at = patch.shipped_at ?? now
  }

  await admin.from('orders').update(patch).eq('id', orderId)

  if (event) await logTrackingEvent(admin, orderId, event)

  const instant = (Deno.env.get('STRIPE_INSTANT_VENDOR_PAYOUT') ?? '').toLowerCase() === 'true'

  let escrow = { ok: true as boolean, skipped: true as boolean | undefined }
  if (order.separate_charges && !order.stripe_vendor_payout_id) {
    escrow = await releaseVendorEscrowPayout(admin, stripe, orderId, { reason, instant })
  }

  let margin = { ok: true as boolean, skipped: true as boolean | undefined }
  if (isDropship(order.listing_mode) && !order.stripe_seller_transfer_id) {
    margin = await transferDropshipSellerMargin(admin, stripe, orderId)
  }

  const ok = (escrow.ok !== false) && (margin.ok !== false)
  return { ok, escrow, margin }
}

/** Record in-transit scan — ship status only, no payout. */
export async function handleInTransitTrackingUpdate (
  admin: SupabaseClient,
  orderId: string,
  event: ParsedTrackingEvent,
): Promise<{ ok: boolean }> {
  const now = new Date().toISOString()
  await admin.from('orders').update({
    status: 'shipped',
    shipped_at: now,
    tracking_provider: event.provider,
    external_tracker_id: event.externalTrackerId ?? null,
    tracking_status: event.status,
    ...(event.carrier ? { tracking_carrier: event.carrier } : {}),
  }).eq('id', orderId)

  await logTrackingEvent(admin, orderId, event)
  return { ok: true }
}

export async function processShippingWebhook (
  admin: SupabaseClient,
  stripe: Stripe,
  body: Record<string, unknown>,
): Promise<{
  ok: boolean
  handled?: boolean
  order_id?: string
  in_transit?: boolean
  delivery_release?: boolean
  release?: Awaited<ReturnType<typeof releaseAllSellerFundsOnCarrierDelivery>>
  error?: string
}> {
  const parsed = parseShippingWebhookBody(body)
  if (!parsed) {
    return { ok: false, error: 'unrecognized_payload' }
  }

  const order = await findOrderByTracking(admin, parsed.trackingNumber)
  if (!order) {
    return { ok: true, handled: false, error: 'order_not_found_for_tracking' }
  }

  await admin
    .from('orders')
    .update({
      tracking_provider: parsed.provider,
      external_tracker_id: parsed.externalTrackerId ?? null,
      tracking_status: parsed.status,
      ...(parsed.carrier ? { tracking_carrier: parsed.carrier } : {}),
    })
    .eq('id', order.id)

  await logTrackingEvent(admin, order.id, parsed)

  const escrowDone = !!order.stripe_vendor_payout_id
  const marginDone = !!order.stripe_seller_transfer_id || !isDropship(order.listing_mode)
  if (escrowDone && marginDone) {
    return { ok: true, handled: true, order_id: order.id, delivery_release: false }
  }

  if (isDeliveryReleaseStatus(parsed.status)) {
    const release = await releaseAllSellerFundsOnCarrierDelivery(
      admin,
      stripe,
      order.id,
      parsed,
      'carrier_delivery',
    )
    return {
      ok: release.ok,
      handled: true,
      order_id: order.id,
      delivery_release: true,
      release,
    }
  }

  if (isInTransitStatus(parsed.status)) {
    await handleInTransitTrackingUpdate(admin, order.id, parsed)
    return { ok: true, handled: true, order_id: order.id, in_transit: true }
  }

  return { ok: true, handled: true, order_id: order.id }
}
