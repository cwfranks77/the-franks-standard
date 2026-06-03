/**
 * Step 3–4: Shippo / EasyPost tracking webhooks → carrier delivered → escrow + margin payout.
 *
 * Configure in Shippo/EasyPost:
 *   POST https://<project>.supabase.co/functions/v1/shipping-tracker-webhook
 * Header: x-webhook-secret: <SHIPPO_WEBHOOK_SECRET or EASYPOST_WEBHOOK_SECRET>
 */
import { createClient } from 'npm:@supabase/supabase-js@2'
import { processShippingWebhook } from '../_shared/shippingTracker.ts'
import { stripeClient } from '../_shared/stripe.ts'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL') ?? ''
const SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? Deno.env.get('SERVICE_ROLE_KEY') ?? ''
const SHIPPO_WEBHOOK_SECRET = Deno.env.get('SHIPPO_WEBHOOK_SECRET') ?? ''
const EASYPOST_WEBHOOK_SECRET = Deno.env.get('EASYPOST_WEBHOOK_SECRET') ?? ''
const TRACKING_WEBHOOK_SECRET = Deno.env.get('TRACKING_WEBHOOK_SECRET') ?? ''

const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, { auth: { persistSession: false } })

function json (body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8' },
  })
}

function verifyWebhook (req: Request): boolean {
  const inbound = req.headers.get('x-webhook-secret')
    ?? req.headers.get('x-shippo-signature-token')
    ?? ''
  const secrets = [TRACKING_WEBHOOK_SECRET, SHIPPO_WEBHOOK_SECRET, EASYPOST_WEBHOOK_SECRET].filter(Boolean)
  if (secrets.length === 0) return true
  return secrets.some((s) => inbound === s)
}

Deno.serve(async (req) => {
  if (req.method === 'GET' || req.method === 'HEAD') {
    return json({
      service: 'shipping-tracker-webhook',
      ok: !!(SUPABASE_URL && SERVICE_ROLE_KEY),
      hint: 'POST tracking events from Shippo or EasyPost. Set TRACKING_WEBHOOK_SECRET (or provider-specific secret).',
    })
  }

  if (req.method !== 'POST') {
    return json({ error: 'method_not_allowed' }, 405)
  }

  if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
    return json({ error: 'missing_supabase_service_credentials' }, 500)
  }

  if (!verifyWebhook(req)) {
    return json({ error: 'invalid_webhook_signature' }, 401)
  }

  const body = await req.json().catch(() => null)
  if (!body || typeof body !== 'object') {
    return json({ error: 'invalid_json' }, 400)
  }

  try {
    const stripe = stripeClient()
    const result = await processShippingWebhook(admin, stripe, body as Record<string, unknown>)
    if (!result.ok && result.error === 'unrecognized_payload') {
      return json(result, 422)
    }
    return json(result, result.ok ? 200 : 500)
  } catch (e) {
    const message = e instanceof Error ? e.message : 'handler_error'
    console.error('shipping-tracker-webhook', message)
    return json({ error: message }, 500)
  }
})
