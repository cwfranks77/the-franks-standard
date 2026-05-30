import { createClient } from 'npm:@supabase/supabase-js@2'
import { corsHeaders, json, siteUrl, stripeClient } from '../_shared/stripe.ts'

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
      .select('id, stripe_account_id, full_name')
      .eq('id', user.id)
      .maybeSingle()

    const stripe = stripeClient()
    let accountId = profile?.stripe_account_id ?? ''

    if (!accountId) {
      const account = await stripe.accounts.create({
        type: 'express',
        country: 'US',
        email: user.email ?? undefined,
        capabilities: {
          card_payments: { requested: true },
          transfers: { requested: true },
        },
        business_profile: {
          name: profile?.full_name || 'Franks Standard Seller',
          url: siteUrl(),
        },
        metadata: { profile_id: user.id },
      })
      accountId = account.id
      await admin
        .from('profiles')
        .update({ stripe_account_id: accountId })
        .eq('id', user.id)
    }

    const account = await stripe.accounts.retrieve(accountId)
    const linkType = account.details_submitted && (!account.charges_enabled || !account.payouts_enabled)
      ? 'account_update'
      : 'account_onboarding'

    const link = await stripe.accountLinks.create({
      account: accountId,
      refresh_url: `${siteUrl()}/dashboard?connect=refresh`,
      return_url: `${siteUrl()}/dashboard?connect=done`,
      type: linkType,
    })

    await admin
      .from('profiles')
      .update({
        stripe_charges_enabled: !!account.charges_enabled,
        stripe_payouts_enabled: !!account.payouts_enabled,
      })
      .eq('id', user.id)

    return json({
      url: link.url,
      account_id: accountId,
      link_type: linkType,
      stripe_charges_enabled: !!account.charges_enabled,
      stripe_payouts_enabled: !!account.payouts_enabled,
    })
  } catch (e) {
    const message = e instanceof Error ? e.message : 'connect_failed'
    return json({ error: message }, 500)
  }
})
