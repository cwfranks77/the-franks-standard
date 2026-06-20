import { createClient } from 'npm:@supabase/supabase-js@2'
import { recordSupportRating } from '../_shared/supportFollowup.ts'
import { corsHeaders, json } from '../_shared/stripe.ts'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL') ?? ''
const SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? Deno.env.get('SERVICE_ROLE_KEY') ?? ''

const RESOLVED = new Set(['yes', 'no', 'partial'])

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })
  if (req.method !== 'POST') return json({ error: 'method_not_allowed' }, 405)

  let body: Record<string, unknown>
  try {
    body = await req.json()
  } catch {
    return json({ error: 'invalid_json' }, 400)
  }

  const token = String(body.token ?? '').trim()
  const rating = Number(body.rating)
  const issueResolved = String(body.issue_resolved ?? '').trim().toLowerCase()
  const comments = String(body.comments ?? '').trim()

  if (!token || !RESOLVED.has(issueResolved) || !Number.isFinite(rating) || rating < 1 || rating > 5) {
    return json({ error: 'invalid_fields' }, 400)
  }

  const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, { auth: { persistSession: false } })
  const result = await recordSupportRating(admin, {
    token,
    rating,
    issueResolved: issueResolved as 'yes' | 'no' | 'partial',
    comments,
  })

  if (!result.ok) return json({ error: result.error }, 400)
  return json({ ok: true, rating_id: result.rating_id })
})
