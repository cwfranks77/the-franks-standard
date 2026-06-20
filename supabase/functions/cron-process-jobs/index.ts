import { createClient } from 'npm:@supabase/supabase-js@2'
import { corsHeaders, json } from '../_shared/stripe.ts'
import { processEmailJobPayload } from '../_shared/emailQueue.ts'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL') ?? ''
const SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? Deno.env.get('SERVICE_ROLE_KEY') ?? ''
const CRON_SECRET = Deno.env.get('CRON_SECRET') ?? ''

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  const auth = req.headers.get('Authorization')?.replace('Bearer ', '')
    || req.headers.get('x-cron-secret')
    || ''
  if (!CRON_SECRET || auth !== CRON_SECRET) {
    return json({ error: 'unauthorized' }, 401)
  }

  const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, { auth: { persistSession: false } })
  const { data: jobs } = await admin
    .from('background_jobs')
    .select('*')
    .eq('status', 'pending')
    .lte('scheduled_at', new Date().toISOString())
    .order('scheduled_at', { ascending: true })
    .limit(10)

  const processed: { id: string; ok: boolean; error?: string }[] = []

  for (const job of jobs ?? []) {
    try {
      await admin.from('background_jobs').update({
        status: 'processing',
        started_at: new Date().toISOString(),
        attempts: (job.attempts || 0) + 1,
      }).eq('id', job.id)

      if (job.job_type === 'cleanup_logs') {
        const cutoff = new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString()
        for (const table of ['platform_activity_events', 'violation_events', 'security_events', 'audit_logs']) {
          await admin.from(table).delete().lt('created_at', cutoff)
        }
      }

      if (job.job_type === 'send_email') {
        const payload = (job.payload as Record<string, unknown>) || {}
        const result = await processEmailJobPayload(admin, payload)
        if (!result.ok && !result.skipped) throw new Error(String(result.error || 'send_email_failed'))
      }

      await admin.from('background_jobs').update({
        status: 'completed',
        completed_at: new Date().toISOString(),
      }).eq('id', job.id)

      processed.push({ id: job.id, ok: true })
    } catch (e) {
      const errMsg = e instanceof Error ? e.message : String(e)
      await admin.from('job_failures').insert({
        job_id: job.id,
        job_type: job.job_type,
        error_message: errMsg,
        payload: job.payload,
        attempts: (job.attempts || 0) + 1,
      })
      await admin.from('background_jobs').update({
        status: 'pending',
        last_error: errMsg,
      }).eq('id', job.id)
      processed.push({ id: job.id, ok: false, error: errMsg })
    }
  }

  return json({ ok: true, processed })
})
