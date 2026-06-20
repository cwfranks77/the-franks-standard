import { SupabaseClient } from 'npm:@supabase/supabase-js@2'

const INTEGRATED_PROVIDERS = new Set(['doba', 'inventory-source'])

type ShippingAddress = {
  line1?: string | null
  line2?: string | null
  city?: string | null
  state?: string | null
  postal_code?: string | null
  country?: string | null
}

type SellerSecrets = {
  flxpoint_api_key?: string | null
  inventory_source_api_key?: string | null
  doba_supplier_id?: string | null
  doba_warehouse_id?: string | null
}

function sellerCanAutoDispatch (
  providerKey: string,
  fulfillmentMode: string,
  secrets: SellerSecrets | null,
): boolean {
  if (fulfillmentMode !== 'integrated' || !INTEGRATED_PROVIDERS.has(providerKey)) {
    return false
  }
  if (providerKey === 'doba') {
    return !!(
      secrets?.flxpoint_api_key?.trim()
      && secrets?.doba_supplier_id?.trim()
      && secrets?.doba_warehouse_id?.trim()
    )
  }
  if (providerKey === 'inventory-source') {
    return !!secrets?.inventory_source_api_key?.trim()
  }
  return false
}

export async function queueDropshipOrder (
  admin: SupabaseClient,
  params: {
    orderId: string
    buyerEmail?: string | null
    buyerName?: string | null
    shippingAddress?: ShippingAddress | null
  },
) {
  const { orderId, buyerEmail, buyerName, shippingAddress } = params

  const { data: order, error: orderErr } = await admin
    .from('orders')
    .select('id, listing_id, amount, buyer_email, seller_id')
    .eq('id', orderId)
    .maybeSingle()

  if (orderErr || !order?.listing_id) {
    console.error('queueDropshipOrder order lookup', orderId, orderErr?.message)
    return { ok: false, skipped: true }
  }

  const { data: listing, error: listingErr } = await admin
    .from('listings')
    .select(`
      id, title, price, listing_mode,
      dropship_provider_key, dropship_provider_name, dropship_sales_channel_key,
      dropship_supplier_name, dropship_supplier_email, dropship_supplier_sku,
      dropship_ship_time, dropship_ships_from
    `)
    .eq('id', order.listing_id)
    .maybeSingle()

  if (listingErr || !listing || listing.listing_mode !== 'dropship') {
    return { ok: true, skipped: true }
  }

  const providerKey = String(listing.dropship_provider_key || 'custom').trim() || 'custom'

  const { data: existing } = await admin
    .from('dropship_orders')
    .select('id')
    .eq('order_id', orderId)
    .maybeSingle()

  if (existing?.id) {
    return { ok: true, skipped: true, reason: 'already_queued' }
  }

  let fulfillmentMode = 'manual'
  let providerStatus = 'awaiting_seller'
  let sellerSecrets: SellerSecrets | null = null

  if (order.seller_id) {
    const { data: settings } = await admin
      .from('seller_dropship_settings')
      .select('fulfillment_mode, preferred_provider_key')
      .eq('seller_id', order.seller_id)
      .maybeSingle()

    fulfillmentMode = String(settings?.fulfillment_mode || 'manual')

    const { data: secrets } = await admin
      .from('seller_dropship_secrets')
      .select('flxpoint_api_key, inventory_source_api_key, doba_supplier_id, doba_warehouse_id')
      .eq('seller_id', order.seller_id)
      .maybeSingle()

    sellerSecrets = secrets

    if (sellerCanAutoDispatch(providerKey, fulfillmentMode, sellerSecrets)) {
      providerStatus = 'queued'
    } else if (fulfillmentMode === 'integrated') {
      providerStatus = 'manual_fulfillment'
    }
  }

  const email = buyerEmail || order.buyer_email || null
  const lineItems = [{
    sku: String(listing.dropship_supplier_sku || '').trim() || undefined,
    quantity: 1,
    title: String(listing.title || 'Marketplace item').slice(0, 120),
    unit_price: Number(order.amount) || Number(listing.price) || 0,
  }]

  const supplierPayload: Record<string, unknown> = {
    line_items: lineItems,
    supplier_name: listing.dropship_supplier_name,
    supplier_email: listing.dropship_supplier_email,
    ship_time: listing.dropship_ship_time,
    ships_from: listing.dropship_ships_from,
    customer: {
      email,
      name: buyerName || null,
    },
    shipping_address: shippingAddress ? {
      line1: shippingAddress.line1,
      line2: shippingAddress.line2,
      city: shippingAddress.city,
      state: shippingAddress.state,
      postal_code: shippingAddress.postal_code,
      country: shippingAddress.country || 'US',
    } : null,
  }

  const { data: row, error: insErr } = await admin
    .from('dropship_orders')
    .insert({
      order_id: orderId,
      listing_id: listing.id,
      seller_id: order.seller_id ?? null,
      provider_key: providerKey,
      sales_channel_key: listing.dropship_sales_channel_key || 'the-franks-standard',
      supplier_payload: supplierPayload,
      fulfillment_mode: fulfillmentMode,
      provider_status: providerStatus,
    })
    .select('id')
    .single()

  if (insErr || !row) {
    console.error('queueDropshipOrder insert', orderId, insErr?.message)
    return { ok: false, error: insErr?.message || 'insert_failed' }
  }

  await admin.from('dropship_events').insert({
    dropship_order_id: row.id,
    order_id: orderId,
    event_type: providerStatus === 'queued' ? 'queued' : 'awaiting_seller',
    event_payload: {
      provider_key: providerKey,
      fulfillment_mode: fulfillmentMode,
      auto_dispatch: providerStatus === 'queued',
    },
  })

  return {
    ok: true,
    dropship_order_id: row.id,
    provider_status: providerStatus,
  }
}
