import { createClient } from 'npm:@supabase/supabase-js@2'
import { verifyOpsKey } from '../_shared/opsAuth.ts'
import { corsHeaders, json, stripeClient } from '../_shared/stripe.ts'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL') ?? ''
const SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? Deno.env.get('SERVICE_ROLE_KEY') ?? ''

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })
  if (req.method !== 'POST') return json({ error: 'method_not_allowed' }, 405)

  let body: Record<string, unknown>
  try {
    body = await req.json()
  } catch {
    return json({ error: 'invalid_json' }, 400)
  }

  const opsKey = String(body.ops_key ?? '')
  if (!(await verifyOpsKey(opsKey))) {
    return json({ error: 'unauthorized' }, 401)
  }

  const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, { auth: { persistSession: false } })
  const action = String(body.action ?? 'create_transfer')

  if (action === 'list_pending') {
    const { data, error } = await admin
      .from('payouts')
      .select('id, seller_id, amount, currency, status, created_at')
      .eq('status', 'pending')
      .order('created_at', { ascending: true })
      .limit(100)

    if (error) return json({ error: 'fetch_failed', detail: error.message }, 500)
    return json({ ok: true, payouts: data ?? [] })
  }

  const payoutId = String(body.payoutId ?? body.payout_id ?? '').trim()
  if (!payoutId) return json({ error: 'payout_id_required' }, 400)

  const { data: payout, error: payoutErr } = await admin
    .from('payouts')
    .select('id, seller_id, amount, currency, status')
    .eq('id', payoutId)
    .maybeSingle()

  if (payoutErr) return json({ error: 'fetch_failed', detail: payoutErr.message }, 500)
  if (!payout) return json({ error: 'payout_not_found' }, 404)
  if (payout.status !== 'pending') {
    return json({ error: 'payout_not_pending', status: payout.status }, 400)
  }

  const { data: seller, error: sellerErr } = await admin
    .from('profiles')
    .select('stripe_account_id')
    .eq('id', payout.seller_id)
    .maybeSingle()

  if (sellerErr) return json({ error: 'fetch_failed', detail: sellerErr.message }, 500)
  if (!seller?.stripe_account_id) {
    return json({ error: 'seller_not_onboarded' }, 400)
  }

  const stripe = stripeClient()

  try {
    const transfer = await stripe.transfers.create({
      amount: Math.round(Number(payout.amount) * 100),
      currency: String(payout.currency || 'USD').toLowerCase(),
      destination: seller.stripe_account_id,
      metadata: {
        payout_id: payout.id,
        seller_id: payout.seller_id,
      },
    })

    const { error: updateErr } = await admin
      .from('payouts')
      .update({
        status: 'paid',
        processed_at: new Date().toISOString(),
        reference: transfer.id,
      })
      .eq('id', payoutId)
      .eq('status', 'pending')

    if (updateErr) return json({ error: 'update_failed', detail: updateErr.message }, 500)

    return json({ ok: true, success: true, transfer, payoutId, payout_id: payoutId })
  } catch (e) {
    const message = e instanceof Error ? e.message : 'transfer_failed'
    console.error('ops-create-transfer', payoutId, message)
    await admin
      .from('payouts')
      .update({ status: 'failed' })
      .eq('id', payoutId)
      .eq('status', 'pending')
    return json({ error: message }, 500)
  }
})
