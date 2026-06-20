import { createClient } from 'npm:@supabase/supabase-js@2'
import { scanAndEnforceViolation, previewScan } from '../_shared/violationEnforcement.ts'
import { corsHeaders, json } from '../_shared/stripe.ts'
import { clientIpFromRequest } from '../_shared/requestContext.ts'

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

  const content = String(body.content ?? '')
  const sourceType = String(body.source_type ?? 'other') as 'message' | 'listing' | 'review' | 'dispute' | 'upload' | 'contact' | 'other'
  const enforce = body.enforce !== false

  if (!content.trim()) return json({ error: 'content_required' }, 400)

  if (!enforce) {
    return json({ ok: true, scan: previewScan(content, sourceType) })
  }

  const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, { auth: { persistSession: false } })
  const ip = clientIpFromRequest(req)

  const result = await scanAndEnforceViolation({
    admin,
    userId: body.user_id ? String(body.user_id) : null,
    sourceType,
    sourceId: body.source_id ? String(body.source_id) : null,
    content,
    ipAddress: ip,
    deviceFingerprint: body.device_fingerprint ? String(body.device_fingerprint) : null,
    browserFingerprint: body.browser_fingerprint ? String(body.browser_fingerprint) : null,
    metadata: (body.metadata as Record<string, unknown>) || {},
  })

  if (result.violated) {
    return json({
      ok: false,
      blocked: true,
      violation: true,
      action: result.action,
      scan: result.scan,
      violation_event_id: result.violationEventId,
      fraud_case_id: result.fraudCaseId,
    }, 403)
  }

  return json({ ok: true, blocked: false, scan: result.scan })
})
