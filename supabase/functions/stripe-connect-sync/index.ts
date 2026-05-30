import { createClient } from 'npm:@supabase/supabase-js@2'
import { corsHeaders, json, stripeClient } from '../_shared/stripe.ts'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL') ?? ''
const SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? Deno.env.get('SERVICE_ROLE_KEY') ?? ''

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }
  if (req.method !== 'POST') {
    return json({ error: 'method_not_allowed' }, 405)
  }

  try {
    const authHeader = req.headers.get('Authorization') ?? ''
    if (!authHeader.startsWith('Bearer ')) {
      return json({ error: 'unauthorized' }, 401)
    }

    const supabaseUser = createClient(SUPABASE_URL, Deno.env.get('SUPABASE_ANON_KEY') ?? '', {
      global: { headers: { Authorization: authHeader } },
      auth: { persistSession: false },
    })
    const { data: { user }, error: userError } = await supabaseUser.auth.getUser()
    if (userError || !user) {
      return json({ error: 'unauthorized' }, 401)
    }

    const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, { auth: { persistSession: false } })
    const { data: profile } = await admin
      .from('profiles')
      .select('stripe_account_id')
      .eq('id', user.id)
      .maybeSingle()

    const accountId = profile?.stripe_account_id ?? ''
    if (!accountId) {
      return json({
        ok: true,
        synced: false,
        stripe_charges_enabled: false,
        stripe_payouts_enabled: false,
        message: 'no_connect_account',
      })
    }

    const stripe = stripeClient()
    const account = await stripe.accounts.retrieve(accountId)

    const stripe_charges_enabled = !!account.charges_enabled
    const stripe_payouts_enabled = !!account.payouts_enabled

    await admin
      .from('profiles')
      .update({ stripe_charges_enabled, stripe_payouts_enabled })
      .eq('id', user.id)

    return json({
      ok: true,
      synced: true,
      account_id: accountId,
      stripe_charges_enabled,
      stripe_payouts_enabled,
      details_submitted: !!account.details_submitted,
      requirements_due: (account.requirements?.currently_due?.length ?? 0) > 0,
    })
  } catch (e) {
    const message = e instanceof Error ? e.message : 'sync_failed'
    return json({ error: message }, 500)
  }
})
