import { createClient } from 'npm:@supabase/supabase-js@2'
import { corsHeaders, json } from '../_shared/stripe.ts'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL') ?? ''
const SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? Deno.env.get('SERVICE_ROLE_KEY') ?? ''
const CRON_SECRET = Deno.env.get('CRON_SECRET') ?? ''

async function runPostLaunchMonitor (admin: ReturnType<typeof createClient>) {
  const since10m = new Date(Date.now() - 10 * 60 * 1000).toISOString()
  const since1h = new Date(Date.now() - 60 * 60 * 1000).toISOString()
  const checks: Array<{ type: string; status: string; message: string; metrics: Record<string, unknown> }> = []

  const countFailed = async (table: string, filters: Record<string, string>) => {
    let q = admin.from(table).select('id', { count: 'exact', head: true }).gte('created_at', since10m)
    for (const [k, v] of Object.entries(filters)) q = q.eq(k, v)
    const { count } = await q
    return count ?? 0
  }

  const failedJobs = await countFailed('background_jobs', { status: 'failed' })
  checks.push({
    type: 'job_queue_failures',
    status: failedJobs > 5 ? 'critical' : failedJobs > 0 ? 'warning' : 'ok',
    message: `${failedJobs} failed jobs in last 10 minutes`,
    metrics: { failed_jobs: failedJobs },
  })

  const emailFailed = await countFailed('email_logs', { status: 'failed' })
  checks.push({
    type: 'email_failures',
    status: emailFailed > 10 ? 'critical' : emailFailed > 2 ? 'warning' : 'ok',
    message: `${emailFailed} email failures in last 10 minutes`,
    metrics: { email_failures: emailFailed },
  })

  const smsFailed = await countFailed('sms_verification', { status: 'failed' })
  checks.push({
    type: 'sms_failures',
    status: smsFailed > 5 ? 'critical' : smsFailed > 0 ? 'warning' : 'ok',
    message: `${smsFailed} SMS failures in last 10 minutes`,
    metrics: { sms_failures: smsFailed },
  })

  const payoutFailed = await countFailed('payouts', { status: 'failed' })
  checks.push({
    type: 'payout_failures',
    status: payoutFailed > 3 ? 'critical' : payoutFailed > 0 ? 'warning' : 'ok',
    message: `${payoutFailed} payout failures in last 10 minutes`,
    metrics: { payout_failures: payoutFailed },
  })

  const { count: fraudNew } = await admin.from('fraud_cases').select('id', { count: 'exact', head: true }).gte('created_at', since10m)
  checks.push({
    type: 'fraud_spikes',
    status: (fraudNew ?? 0) > 10 ? 'critical' : (fraudNew ?? 0) > 3 ? 'warning' : 'ok',
    message: `${fraudNew ?? 0} new fraud cases in last 10 minutes`,
    metrics: { fraud_cases_new: fraudNew ?? 0 },
  })

  const { count: disputesNew } = await admin.from('dispute_cases').select('id', { count: 'exact', head: true }).gte('created_at', since10m)
  checks.push({
    type: 'dispute_spikes',
    status: (disputesNew ?? 0) > 15 ? 'critical' : (disputesNew ?? 0) > 5 ? 'warning' : 'ok',
    message: `${disputesNew ?? 0} new disputes in last 10 minutes`,
    metrics: { disputes_new: disputesNew ?? 0 },
  })

  const { count: securityEvents } = await admin.from('security_events').select('id', { count: 'exact', head: true }).gte('created_at', since1h)
  const { count: activityEvents } = await admin.from('platform_activity_events').select('id', { count: 'exact', head: true }).gte('created_at', since1h)
  const errorRate = activityEvents ? Math.round(((securityEvents ?? 0) / activityEvents) * 10000) / 100 : 0
  checks.push({
    type: 'error_rate',
    status: errorRate > 5 ? 'critical' : errorRate > 2 ? 'warning' : 'ok',
    message: `Error rate ${errorRate}% (1h window)`,
    metrics: { error_rate: errorRate },
  })

  for (const c of checks) {
    await admin.from('post_launch_events').insert({
      check_type: c.type,
      status: c.status,
      message: c.message,
      metrics: c.metrics,
    })
  }

  return {
    ok: !checks.some((c) => c.status === 'critical'),
    checks,
    ran_at: new Date().toISOString(),
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  const auth = req.headers.get('Authorization')?.replace('Bearer ', '')
    || req.headers.get('x-cron-secret')
    || ''
  if (CRON_SECRET && auth !== CRON_SECRET) {
    return json({ error: 'unauthorized' }, 401)
  }

  const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, { auth: { persistSession: false } })
  const result = await runPostLaunchMonitor(admin)
  return json(result)
})
