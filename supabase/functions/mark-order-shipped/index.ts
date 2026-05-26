import { createClient } from 'npm:@supabase/supabase-js@2'
import { transferDropshipSupplierPortion } from '../_shared/dropshipStripeSplit.ts'
import { corsHeaders, json, stripeClient } from '../_shared/stripe.ts'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL') ?? ''
const SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? Deno.env.get('SERVICE_ROLE_KEY') ?? ''

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }
  if (req.method !== 'POST') {
    return json({ error: 'method_not_allowed' }, 405)
  }

  try {
    const authHeader = req.headers.get('Authorization') ?? ''
    if (!authHeader.startsWith('Bearer ')) {
      return json({ error: 'unauthorized' }, 401)
    }

    const supabaseUser = createClient(SUPABASE_URL, Deno.env.get('SUPABASE_ANON_KEY') ?? '', {
      global: { headers: { Authorization: authHeader } },
      auth: { persistSession: false },
    })
    const { data: { user }, error: userError } = await supabaseUser.auth.getUser()
    if (userError || !user) {
      return json({ error: 'unauthorized' }, 401)
    }

    const body = await req.json().catch(() => ({})) as { order_id?: string }
    const orderId = String(body.order_id ?? '').trim()
    if (!orderId) {
      return json({ error: 'order_id_required' }, 400)
    }

    const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, { auth: { persistSession: false } })
    const { data: order, error: orderError } = await admin
      .from('orders')
      .select('id, seller_id, status, listing_mode')
      .eq('id', orderId)
      .maybeSingle()

    if (orderError || !order) {
      return json({ error: 'order_not_found' }, 404)
    }
    if (order.seller_id !== user.id) {
      return json({ error: 'forbidden' }, 403)
    }
    if (order.status !== 'paid') {
      return json({ error: 'order_not_ready_to_ship' }, 400)
    }

    const { error: updateError } = await admin
      .from('orders')
      .update({ status: 'shipped', shipped_at: new Date().toISOString() })
      .eq('id', orderId)

    if (updateError) {
      return json({ error: 'update_failed', detail: updateError.message }, 500)
    }

    let supplierTransfer = null
    if (String(order.listing_mode || '').toLowerCase() === 'dropship') {
      const stripe = stripeClient()
      supplierTransfer = await transferDropshipSupplierPortion(admin, stripe, orderId)
    }

    return json({ ok: true, status: 'shipped', supplier_transfer: supplierTransfer })
  } catch (e) {
    const message = e instanceof Error ? e.message : 'mark_shipped_failed'
    return json({ error: message }, 500)
  }
})
