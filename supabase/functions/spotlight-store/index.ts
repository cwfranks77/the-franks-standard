import { createClient } from 'npm:@supabase/supabase-js@2'
import { corsHeaders, json } from '../_shared/stripe.ts'
import { fetchDailySpotlight, pickDailySpotlight, storePayload } from '../_shared/storePromotion.ts'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL') ?? ''
const SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? Deno.env.get('SERVICE_ROLE_KEY') ?? ''

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })
  if (req.method !== 'GET') return json({ error: 'method_not_allowed' }, 405)

  const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, { auth: { persistSession: false } })
  const url = new URL(req.url)
  const refresh = url.searchParams.get('refresh') === '1'

  if (refresh) {
    await pickDailySpotlight(admin)
  }

  const spotlight = await fetchDailySpotlight(admin)
  if (!spotlight) {
    return json({ spotlight: null, message: 'No spotlight store selected for today.' })
  }

  return json({
    spotlight_date: spotlight.spotlight_date,
    store: storePayload(spotlight.store),
  })
})
