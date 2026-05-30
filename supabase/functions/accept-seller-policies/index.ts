import { createClient } from 'npm:@supabase/supabase-js@2'
import {
  CURRENT_SELLER_POLICY_VERSION,
  sellerPoliciesCurrent,
} from '../_shared/sellerPolicyAcceptance.ts'
import { corsHeaders, json } from '../_shared/stripe.ts'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL') ?? ''
const SERVICE_ROLE_KEY =
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ??
  Deno.env.get('SERVICE_ROLE_KEY') ??
  ''

const REQUIRED_DOC_IDS = [
  'terms',
  'marketplace_policy',
  'seller_agreement',
  'prohibited_items',
  'privacy',
]

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })
  if (req.method !== 'POST') return json({ error: 'method_not_allowed' }, 405)

  const authHeader = req.headers.get('Authorization') ?? ''
  if (!authHeader.startsWith('Bearer ')) return json({ error: 'unauthorized' }, 401)

  const userClient = createClient(SUPABASE_URL, Deno.env.get('SUPABASE_ANON_KEY') ?? '', {
    global: { headers: { Authorization: authHeader } },
    auth: { persistSession: false },
  })
  const { data: { user }, error: userError } = await userClient.auth.getUser()
  if (userError || !user) return json({ error: 'unauthorized' }, 401)

  let body: { legal_name?: string; policy_version?: string; documents?: string[] }
  try {
    body = await req.json()
  } catch {
    return json({ error: 'invalid_json' }, 400)
  }

  const legalName = String(body.legal_name ?? '').trim()
  const policyVersion = String(body.policy_version ?? '').trim()
  const documents = Array.isArray(body.documents) ? body.documents.map(String) : []

  if (!legalName || legalName.length < 2) {
    return json({ error: 'legal_name_required', message: 'Enter your full legal name to sign.' }, 400)
  }
  if (policyVersion !== CURRENT_SELLER_POLICY_VERSION) {
    return json({
      error: 'policy_version_mismatch',
      message: 'Policies were updated. Refresh the page and sign the current version.',
      current_version: CURRENT_SELLER_POLICY_VERSION,
    }, 400)
  }
  for (const id of REQUIRED_DOC_IDS) {
    if (!documents.includes(id)) {
      return json({ error: 'documents_incomplete', message: 'You must agree to all listed policies.' }, 400)
    }
  }

  if (!SERVICE_ROLE_KEY) {
    return json({
      error: 'server_misconfigured',
      message: 'Policy signing uses record_seller_policy_acceptance in the database. Refresh and try again.',
    }, 503)
  }

  const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, { auth: { persistSession: false } })
  const now = new Date().toISOString()

  const { data: existingProfile } = await admin
    .from('profiles')
    .select('id')
    .eq('id', user.id)
    .maybeSingle()

  if (!existingProfile) {
    const { error: insErr } = await admin.from('profiles').insert({
      id: user.id,
      full_name: legalName,
      account_type: 'seller',
    })
    if (insErr) return json({ error: 'profile_create_failed', detail: insErr.message }, 500)
  }

  const { error: profileErr } = await admin
    .from('profiles')
    .update({
      seller_policies_accepted_at: now,
      seller_policies_version: CURRENT_SELLER_POLICY_VERSION,
      seller_policies_signer_name: legalName,
    })
    .eq('id', user.id)

  if (profileErr) return json({ error: 'update_failed', detail: profileErr.message }, 500)

  const { error: auditErr } = await admin.from('seller_policy_acceptances').insert({
    seller_id: user.id,
    policy_version: CURRENT_SELLER_POLICY_VERSION,
    signer_legal_name: legalName,
    documents_accepted: documents,
  })
  if (auditErr) {
    console.error('seller_policy_acceptances insert failed:', auditErr.message)
  }

  const { data: profile } = await admin
    .from('profiles')
    .select('seller_policies_accepted_at, seller_policies_version, seller_policies_signer_name')
    .eq('id', user.id)
    .maybeSingle()

  return json({
    ok: true,
    accepted_at: profile?.seller_policies_accepted_at ?? now,
    policy_version: CURRENT_SELLER_POLICY_VERSION,
    signer_name: legalName,
    already_current: sellerPoliciesCurrent(profile as { seller_policies_accepted_at: string | null; seller_policies_version: string | null }),
  })
})
