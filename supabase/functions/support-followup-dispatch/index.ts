import { createClient } from 'npm:@supabase/supabase-js@2'
import { sendFollowupEmail } from '../_shared/supportFollowup.ts'
import { corsHeaders, json } from '../_shared/stripe.ts'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL') ?? ''
const SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? Deno.env.get('SERVICE_ROLE_KEY') ?? ''
const CRON_SECRET = Deno.env.get('CRON_SECRET') ?? Deno.env.get('OPS_CRON_SECRET') ?? ''

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  const auth = req.headers.get('Authorization') ?? ''
  const cronHeader = req.headers.get('x-cron-secret') ?? ''
  if (CRON_SECRET && auth !== `Bearer ${CRON_SECRET}` && cronHeader !== CRON_SECRET) {
    return json({ error: 'forbidden' }, 403)
  }

  const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, { auth: { persistSession: false } })
  const { data: pending, error } = await admin
    .from('support_followup_emails')
    .select('id, user_id, source_type, source_id')
    .is('email_dispatched_at', null)
    .order('sent_at', { ascending: true })
    .limit(50)

  if (error) return json({ error: error.message }, 500)

  let sent = 0
  const errors: string[] = []

  for (const row of pending ?? []) {
    const result = await sendFollowupEmail(
      admin,
      row.user_id,
      row.source_type as 'dispute' | 'contact' | 'call' | 'ticket',
      row.source_id,
      row.id,
    )
    if (result.ok) sent += 1
    else errors.push(result.error)
  }

  return json({ ok: true, processed: pending?.length ?? 0, sent, errors })
})
