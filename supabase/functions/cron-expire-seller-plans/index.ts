import { createClient } from 'npm:@supabase/supabase-js@2'
import { expireStarterPlans } from '../_shared/sellerSubscriptionPlans.ts'
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
  const result = await expireStarterPlans(admin)
  return json({ ok: true, ...result })
})
