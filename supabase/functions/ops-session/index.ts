import { verifyOpsKey } from '../_shared/opsAuth.ts'
import { corsHeaders, json } from '../_shared/stripe.ts'

/** Verify operator phrase server-side — hash never ships to browsers. */
Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })
  if (req.method !== 'POST') return json({ error: 'method_not_allowed' }, 405)

  let body: Record<string, unknown>
  try {
    body = await req.json()
  } catch {
    return json({ error: 'invalid_json' }, 400)
  }

  const phrase = String(body.phrase ?? '')
  if (!phrase.trim()) return json({ error: 'phrase_required' }, 400)

  if (!(await verifyOpsKey(phrase))) {
    return json({ error: 'invalid_phrase' }, 403)
  }

  return json({ ok: true })
})
