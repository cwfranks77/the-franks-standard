import { createClient } from 'npm:@supabase/supabase-js@2'
import { transferDropshipSupplierPortion } from '../_shared/dropshipStripeSplit.ts'
import { stripeClient } from '../_shared/stripe.ts'

type DispatchRow = {
  id: string
  order_id: string
  listing_id: string
  seller_id: string | null
  provider_key: string
  sales_channel_key: string
  supplier_payload: Record<string, unknown>
  sync_attempts: number
}

type SellerSecrets = {
  flxpoint_api_key?: string | null
  inventory_source_api_key?: string | null
  doba_supplier_id?: string | null
  doba_warehouse_id?: string | null
}

type DispatchCredentials = {
  flxpointApiKey: string
  inventorySourceApiKey: string
  dobaSupplierId: string
  dobaWarehouseId: string
  source: 'seller' | 'platform'
}

const SUPABASE_URL = Deno.env.get('SUPABASE_URL') ?? ''
const SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? Deno.env.get('SERVICE_ROLE_KEY') ?? ''
const INVENTORY_SOURCE_API_BASE = (Deno.env.get('INVENTORY_SOURCE_API_BASE') ?? 'https://api.inventorysource.com').replace(/\/+$/, '')
const INVENTORY_SOURCE_API_KEY = Deno.env.get('INVENTORY_SOURCE_API_KEY') ?? ''
const INVENTORY_SOURCE_ORDER_ENDPOINT = `/${(Deno.env.get('INVENTORY_SOURCE_ORDER_ENDPOINT') ?? 'v1/orders').replace(/^\/+/, '')}`
const DOBA_INVENTORY_SOURCE_SUPPLIER_ID = Deno.env.get('DOBA_INVENTORY_SOURCE_SUPPLIER_ID') ?? ''
const DOBA_INVENTORY_SOURCE_WAREHOUSE_ID = Deno.env.get('DOBA_INVENTORY_SOURCE_WAREHOUSE_ID') ?? ''
const DOBA_INVENTORY_SOURCE_ORDER_ENDPOINT = `/${(Deno.env.get('DOBA_INVENTORY_SOURCE_ORDER_ENDPOINT') ?? '').replace(/^\/+/, '')}`.replace(/\/$/, '')
const FLXPOINT_API_BASE = (Deno.env.get('FLXPOINT_API_BASE') ?? 'https://api.flxpoint.com').replace(/\/+$/, '')
const FLXPOINT_API_KEY = Deno.env.get('FLXPOINT_API_KEY') ?? ''
const FLXPOINT_ORDER_ENDPOINT = `/${(Deno.env.get('FLXPOINT_ORDER_ENDPOINT') ?? 'api/orders').replace(/^\/+/, '')}`

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
})

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8' },
  })
}

async function loadSellerSecrets(sellerId: string | null): Promise<SellerSecrets | null> {
  if (!sellerId) return null
  const { data } = await supabase
    .from('seller_dropship_secrets')
    .select('flxpoint_api_key, inventory_source_api_key, doba_supplier_id, doba_warehouse_id')
    .eq('seller_id', sellerId)
    .maybeSingle()
  return data
}

function resolveCredentials(row: DispatchRow, sellerSecrets: SellerSecrets | null): DispatchCredentials | null {
  const sellerFlx = sellerSecrets?.flxpoint_api_key?.trim() || ''
  const sellerIs = sellerSecrets?.inventory_source_api_key?.trim() || ''
  const sellerSup = sellerSecrets?.doba_supplier_id?.trim() || ''
  const sellerWh = sellerSecrets?.doba_warehouse_id?.trim() || ''

  if (row.provider_key === 'doba' && sellerFlx && sellerSup && sellerWh) {
    return {
      flxpointApiKey: sellerFlx,
      inventorySourceApiKey: sellerIs,
      dobaSupplierId: sellerSup,
      dobaWarehouseId: sellerWh,
      source: 'seller',
    }
  }

  if (row.provider_key === 'inventory-source' && sellerIs) {
    return {
      flxpointApiKey: '',
      inventorySourceApiKey: sellerIs,
      dobaSupplierId: sellerSup,
      dobaWarehouseId: sellerWh,
      source: 'seller',
    }
  }

  if (FLXPOINT_API_KEY || INVENTORY_SOURCE_API_KEY) {
    return {
      flxpointApiKey: FLXPOINT_API_KEY,
      inventorySourceApiKey: INVENTORY_SOURCE_API_KEY,
      dobaSupplierId: DOBA_INVENTORY_SOURCE_SUPPLIER_ID,
      dobaWarehouseId: DOBA_INVENTORY_SOURCE_WAREHOUSE_ID,
      source: 'platform',
    }
  }

  return null
}

function validateDobaPayloadOrThrow(row: DispatchRow, creds: DispatchCredentials) {
  if (!creds.dobaSupplierId || !creds.dobaWarehouseId) {
    throw new Error('Missing Doba supplier_id or warehouse_id for this seller')
  }

  const payload = row.supplier_payload as Record<string, unknown>
  const lineItems = Array.isArray(payload.line_items) ? payload.line_items : []
  const hasValidSku = lineItems.some((item) => {
    if (!item || typeof item !== 'object') return false
    const sku = (item as Record<string, unknown>).sku
    return typeof sku === 'string' && sku.trim().length > 0
  })

  if (!hasValidSku) {
    throw new Error('Doba dispatch requires at least one line item with a valid sku')
  }
}

async function markError(row: DispatchRow, message: string) {
  const attempts = (row.sync_attempts ?? 0) + 1
  const retryMinutes = Math.min(120, Math.max(2, attempts * 5))
  const nextRetry = new Date(Date.now() + retryMinutes * 60_000).toISOString()

  await supabase
    .from('dropship_orders')
    .update({
      provider_status: 'error',
      sync_attempts: attempts,
      last_error: message.slice(0, 1000),
      next_retry_at: nextRetry,
    })
    .eq('id', row.id)

  await supabase.from('dropship_events').insert({
    dropship_order_id: row.id,
    order_id: row.order_id,
    event_type: 'dispatch_error',
    event_payload: { message, attempts, next_retry_at: nextRetry },
  })
}

async function submitToInventorySource(row: DispatchRow, creds: DispatchCredentials) {
  const isDoba = row.provider_key === 'doba'
  if (isDoba) {
    validateDobaPayloadOrThrow(row, creds)
  }
  const basePayload = {
    externalOrderId: row.order_id,
    salesChannel: row.sales_channel_key || 'the-franks-standard',
    ...row.supplier_payload,
  }
  let response: Response

  if (isDoba && creds.flxpointApiKey) {
    const flxPayload = {
      externalOrderId: row.order_id,
      salesChannel: row.sales_channel_key || 'the-franks-standard',
      source: { provider: 'doba' },
      supplier: {
        supplierId: creds.dobaSupplierId,
        warehouseId: creds.dobaWarehouseId,
      },
      ...basePayload,
    }
    response = await fetch(`${FLXPOINT_API_BASE}${FLXPOINT_ORDER_ENDPOINT}`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        authorization: `Bearer ${creds.flxpointApiKey}`,
        'x-api-key': creds.flxpointApiKey,
      },
      body: JSON.stringify(flxPayload),
    })
  } else {
    if (!creds.inventorySourceApiKey) {
      throw new Error('Missing Inventory Source API key for this seller')
    }
    const payload = {
      ...basePayload,
      supplier: {
        aggregator: 'inventory-source',
        provider: row.provider_key,
        supplierId: creds.dobaSupplierId || undefined,
        warehouseId: creds.dobaWarehouseId || undefined,
      },
      line_items: Array.isArray((basePayload as Record<string, unknown>).line_items)
        ? (basePayload as Record<string, unknown>).line_items
        : [],
    }
    const endpoint = DOBA_INVENTORY_SOURCE_ORDER_ENDPOINT || INVENTORY_SOURCE_ORDER_ENDPOINT
    response = await fetch(`${INVENTORY_SOURCE_API_BASE}${endpoint}`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        authorization: `Bearer ${creds.inventorySourceApiKey}`,
      },
      body: JSON.stringify(payload),
    })
  }

  const raw = await response.text()
  let parsed: Record<string, unknown> = {}
  try {
    parsed = raw ? JSON.parse(raw) : {}
  } catch {
    parsed = { raw }
  }

  if (!response.ok) {
    throw new Error(`Inventory Source error ${response.status}: ${raw.slice(0, 400)}`)
  }

  const providerOrderId = String(parsed.orderId ?? parsed.id ?? parsed.order_id ?? row.order_id)
  return { providerOrderId, parsed, credentialSource: creds.source }
}

Deno.serve(async (req) => {
  if (req.method !== 'POST') {
    return json({ error: 'method_not_allowed' }, 405)
  }

  if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
    return json({ error: 'missing_supabase_service_credentials' }, 500)
  }

  const { data: queued, error } = await supabase
    .from('dropship_orders')
    .select('id, order_id, listing_id, seller_id, provider_key, sales_channel_key, supplier_payload, sync_attempts')
    .eq('provider_status', 'queued')
    .in('provider_key', ['inventory-source', 'doba'])
    .order('created_at', { ascending: true })
    .limit(25)

  if (error) {
    return json({ error: 'failed_to_load_queue', detail: error.message }, 500)
  }

  if (!queued?.length) {
    return json({ ok: true, submitted: 0, message: 'queue_empty' })
  }

  const submitted: string[] = []
  const failed: Array<{ dropship_order_id: string; reason: string }> = []
  const skipped: string[] = []

  for (const row of queued as DispatchRow[]) {
    try {
      const sellerSecrets = await loadSellerSecrets(row.seller_id)
      const creds = resolveCredentials(row, sellerSecrets)
      if (!creds) {
        skipped.push(row.id)
        await markError(row, 'No API credentials for seller — connect keys in dropship setup or fulfill manually')
        failed.push({ dropship_order_id: row.id, reason: 'missing_seller_credentials' })
        continue
      }

      const { providerOrderId, parsed, credentialSource } = await submitToInventorySource(row, creds)

      await supabase
        .from('dropship_orders')
        .update({
          provider_order_id: providerOrderId,
          provider_status: 'submitted',
          sync_attempts: (row.sync_attempts ?? 0) + 1,
          last_error: null,
          next_retry_at: null,
        })
        .eq('id', row.id)

      await supabase
        .from('orders')
        .update({
          status: 'submitted_to_supplier',
          supplier_reference: providerOrderId,
          supplier_status: 'submitted',
        })
        .eq('id', row.order_id)

      await supabase.from('dropship_events').insert({
        dropship_order_id: row.id,
        order_id: row.order_id,
        event_type: 'submitted',
        event_payload: {
          provider_order_id: providerOrderId,
          credential_source: credentialSource,
          provider_response: parsed,
        },
      })

      const stripe = stripeClient()
      await transferDropshipSupplierPortion(supabase, stripe, row.order_id).catch((e) => {
        console.error('dropship supplier transfer', row.order_id, e instanceof Error ? e.message : e)
      })

      submitted.push(row.id)
    } catch (e) {
      const reason = e instanceof Error ? e.message : 'unknown_dispatch_error'
      await markError(row, reason)
      failed.push({ dropship_order_id: row.id, reason })
    }
  }

  return json({
    ok: true,
    submitted: submitted.length,
    failed: failed.length,
    skipped: skipped.length,
    submitted_ids: submitted,
    failures: failed,
  })
})
