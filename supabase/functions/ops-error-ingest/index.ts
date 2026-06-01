/**
 * Ingest client/runtime/health-check errors into ops_incidents.
 * POST /functions/v1/ops-error-ingest  (--no-verify-jwt)
 */
import { corsHeaders, json } from '../_shared/stripe.ts'
import { ingestIncident } from '../_shared/opsIncidents.ts'

function verifyIngestKey (req: Request): boolean {
  const expected = (Deno.env.get('OPS_INGEST_KEY') ?? '').trim()
  if (!expected) return true
  const provided = req.headers.get('x-ops-ingest-key') ?? ''
  return provided === expected
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })
  if (req.method === 'GET') {
    return json({ ok: true, service: 'ops-error-ingest' })
  }
  if (req.method !== 'POST') return json({ error: 'method_not_allowed' }, 405)

  if (!verifyIngestKey(req)) {
    return json({ error: 'unauthorized' }, 401)
  }

  let body: Record<string, unknown>
  try {
    body = await req.json()
  } catch {
    return json({ error: 'invalid_json' }, 400)
  }

  const message = String(body.message ?? '').trim()
  const source = String(body.source ?? 'unknown').trim()
  if (!message) return json({ error: 'missing_message' }, 400)

  try {
    const result = await ingestIncident({
      severity: String(body.severity ?? 'medium'),
      source,
      message,
      stack: body.stack ? String(body.stack) : null,
      url: body.url ? String(body.url) : null,
      user_agent: body.user_agent ? String(body.user_agent) : null,
      metadata: (body.metadata && typeof body.metadata === 'object')
        ? body.metadata as Record<string, unknown>
        : {},
      fingerprint: body.fingerprint ? String(body.fingerprint) : null,
    })

    return json({
      ok: true,
      created: result.created,
      incident_id: result.incident.id,
      notify: result.notify,
    })
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e)
    console.error('[ops-error-ingest]', msg)
    return json({ error: msg }, 500)
  }
})
