import { createClient } from 'npm:@supabase/supabase-js@2'
import { assertAccountNotFrozenForActivity } from '../_shared/accountSafety.ts'
import { assertMarketplaceCompliance } from '../_shared/marketplaceCompliance.ts'
import { openDispute } from '../_shared/disputeResolutionEngine.ts'
import { scanAndEnforceViolation } from '../_shared/violationEnforcement.ts'
import { corsHeaders, json } from '../_shared/stripe.ts'
import { clientIpFromRequest } from '../_shared/requestContext.ts'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL') ?? ''
const SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? Deno.env.get('SERVICE_ROLE_KEY') ?? ''

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })
  if (req.method !== 'POST') return json({ error: 'method_not_allowed' }, 405)

  const authHeader = req.headers.get('Authorization') ?? ''
  if (!authHeader.startsWith('Bearer ')) return json({ error: 'unauthorized' }, 401)

  let body: Record<string, unknown>
  try {
    body = await req.json()
  } catch {
    return json({ error: 'invalid_json' }, 400)
  }

  const userClient = createClient(SUPABASE_URL, Deno.env.get('SUPABASE_ANON_KEY') ?? '', {
    global: { headers: { Authorization: authHeader } },
    auth: { persistSession: false },
  })
  const { data: { user }, error: userErr } = await userClient.auth.getUser()
  if (userErr || !user) return json({ error: 'unauthorized' }, 401)

  const orderId = String(body.order_id ?? '').trim()
  const description = String(body.description ?? '').trim().slice(0, 8000)
  const evidence = (body.evidence as Record<string, unknown>) || {}

  if (!orderId || description.length < 10) {
    return json({ error: 'missing_fields' }, 400)
  }

  const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, { auth: { persistSession: false } })
  const ip = clientIpFromRequest(req)

  const activity = await assertAccountNotFrozenForActivity(admin, user.id)
  if (!activity.ok) return json({ error: activity.error, message: activity.message }, 403)

  const compliance = await assertMarketplaceCompliance(admin, user.id)
  if (!compliance.ok) return json({ error: compliance.error, message: compliance.message }, 403)

  const scan = await scanAndEnforceViolation({
    admin,
    userId: user.id,
    sourceType: 'dispute',
    sourceId: orderId,
    content: description,
    ipAddress: ip,
    deviceFingerprint: body.device_fingerprint ? String(body.device_fingerprint) : null,
  })

  if (scan.violated && scan.action === 'fraud_case_opened') {
    return json({ error: 'dispute_blocked', message: 'Dispute could not be filed due to policy violation.' }, 403)
  }

  const { data: order } = await admin
    .from('orders')
    .select('id, buyer_id, seller_id, status')
    .eq('id', orderId)
    .maybeSingle()

  if (!order || order.buyer_id !== user.id) {
    return json({ error: 'forbidden' }, 403)
  }

  const result = await openDispute(admin, {
    buyerId: order.buyer_id,
    sellerId: order.seller_id,
    orderId: order.id,
    description,
    evidence,
  })

  if (!result.ok) return json({ error: result.error }, 500)
  return json({ ok: true, dispute_id: result.disputeId })
})
