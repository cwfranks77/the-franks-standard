import { createClient } from 'npm:@supabase/supabase-js@2'
import { corsHeaders, json } from '../_shared/stripe.ts'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL') ?? ''
const SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? Deno.env.get('SERVICE_ROLE_KEY') ?? ''
const CRON_SECRET = Deno.env.get('CRON_SECRET') ?? ''

const RETENTION_DAYS = 180

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  const auth = req.headers.get('Authorization')?.replace('Bearer ', '')
    || req.headers.get('x-cron-secret')
    || ''
  if (!CRON_SECRET || auth !== CRON_SECRET) {
    return json({ error: 'unauthorized' }, 401)
  }

  const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, { auth: { persistSession: false } })
  const cutoff = new Date(Date.now() - RETENTION_DAYS * 24 * 60 * 60 * 1000).toISOString()
  const tables = ['platform_activity_events', 'violation_events', 'security_events', 'audit_logs']
  const deleted: Record<string, number> = {}

  for (const table of tables) {
    const { error, count } = await admin.from(table).delete({ count: 'exact' }).lt('created_at', cutoff)
    if (error) return json({ error: `${table}:${error.message}` }, 500)
    deleted[table] = count ?? 0
  }

  await admin.from('system_health_meta').upsert({
    key: 'last_cleanup_run',
    value: { ran_at: new Date().toISOString(), deleted, retention_days: RETENTION_DAYS },
    updated_at: new Date().toISOString(),
  })

  return json({ ok: true, deleted, cutoff })
})
