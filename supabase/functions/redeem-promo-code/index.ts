import { createClient } from 'npm:@supabase/supabase-js@2'
import { corsHeaders, json } from '../_shared/stripe.ts'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL') ?? ''
const SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? Deno.env.get('SERVICE_ROLE_KEY') ?? ''

const HONOR_CATEGORIES = new Set([
  'veteran', 'police', 'fire', 'ems', 'dispatcher', 'corrections', 'other',
])

function normalizeCode (raw: string) {
  return String(raw || '').trim().toUpperCase().replace(/\s+/g, '')
}

function normalizeCategory (raw: unknown) {
  const c = String(raw ?? '').trim().toLowerCase()
  return HONOR_CATEGORIES.has(c) ? c : null
}

function soldOutMessage (program: string) {
  if (program === 'honors') return 'Honors program redemptions are temporarily paused. Contact support.'
  return 'All founding seller spots are claimed.'
}

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

    const body = await req.json().catch(() => ({})) as {
      code?: string
      service_category?: string
    }
    const code = normalizeCode(body.code ?? '')
    if (!code) {
      return json({ error: 'code_required' }, 400)
    }

    const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, { auth: { persistSession: false } })

    const { data: promo, error: promoError } = await admin
      .from('promo_codes')
      .select('id, code, slug, label, max_uses, uses_count, benefit_months, active, program')
      .eq('code', code)
      .eq('active', true)
      .maybeSingle()

    if (promoError || !promo) {
      return json({ error: 'invalid_code' }, 404)
    }

    const program = String(promo.program || 'general')
    const isHonors = program === 'honors'
    const isFounding = program === 'founding' || promo.code === 'FOUNDERS10'
    const isOutreach = program === 'outreach'

    if (isHonors) {
      const category = normalizeCategory(body.service_category)
        ?? normalizeCategory(user.user_metadata?.service_category)
        ?? normalizeCategory(user.user_metadata?.honor_category)
      if (!category) {
        return json({
          error: 'service_category_required',
          message: 'Select how you serve (veteran, police, fire, EMS, etc.) before applying this code.',
        }, 400)
      }
    }

    if (promo.uses_count >= promo.max_uses) {
      return json({
        error: 'sold_out',
        message: soldOutMessage(program),
        remaining: 0,
        max_uses: promo.max_uses,
      }, 409)
    }

    const { data: existing } = await admin
      .from('promo_redemptions')
      .select('id')
      .eq('promo_code_id', promo.id)
      .eq('user_id', user.id)
      .maybeSingle()

    if (existing) {
      const { data: profile } = await admin
        .from('profiles')
        .select('pro_free_until, founding_seller, honors_member, seller_tier, service_category')
        .eq('id', user.id)
        .maybeSingle()
      return json({
        ok: true,
        already_redeemed: true,
        code: promo.code,
        program,
        pro_free_until: profile?.pro_free_until ?? null,
        founding_seller: !!profile?.founding_seller,
        honors_member: !!profile?.honors_member,
        service_category: profile?.service_category ?? null,
        seller_tier: profile?.seller_tier ?? 'starter',
        remaining: Math.max(0, promo.max_uses - promo.uses_count),
        max_uses: promo.max_uses,
      })
    }

    const { data: claimed, error: claimError } = await admin
      .from('promo_codes')
      .update({ uses_count: promo.uses_count + 1 })
      .eq('id', promo.id)
      .eq('uses_count', promo.uses_count)
      .lt('uses_count', promo.max_uses)
      .select('uses_count, max_uses')
      .maybeSingle()

    if (claimError || !claimed) {
      return json({
        error: 'sold_out',
        message: 'Someone just claimed the last spot. Try again later.',
        remaining: 0,
        max_uses: promo.max_uses,
      }, 409)
    }

    const months = isOutreach ? 0 : (Number(promo.benefit_months) || 3)
    const { data: existingProfile } = await admin
      .from('profiles')
      .select('pro_free_until')
      .eq('id', user.id)
      .maybeSingle()

    let proFreeUntil: Date | null = null
    if (!isOutreach && months > 0) {
      const base = new Date()
      if (existingProfile?.pro_free_until) {
        const existingUntil = new Date(existingProfile.pro_free_until)
        if (existingUntil > base) base.setTime(existingUntil.getTime())
      }
      proFreeUntil = new Date(base)
      proFreeUntil.setMonth(proFreeUntil.getMonth() + months)
    }

    const serviceCategory = isHonors
      ? (normalizeCategory(body.service_category)
        ?? normalizeCategory(user.user_metadata?.service_category)
        ?? normalizeCategory(user.user_metadata?.honor_category))
      : null

    const { error: redeemError } = await admin.from('promo_redemptions').insert({
      promo_code_id: promo.id,
      user_id: user.id,
      email: user.email ?? null,
      service_category: serviceCategory,
    })

    if (redeemError) {
      await admin
        .from('promo_codes')
        .update({ uses_count: promo.uses_count })
        .eq('id', promo.id)
      if (redeemError.code === '23505') {
        return json({ error: 'already_used', message: 'This account already used this promo.' }, 409)
      }
      return json({ error: 'redeem_failed', detail: redeemError.message }, 500)
    }

    const accountType = String(user.user_metadata?.account_type ?? '').trim()
    const isSeller = ['sell', 'seller', 'both'].includes(accountType)
    const profilePatch: Record<string, unknown> = {
      promo_code_used: promo.code,
    }
    if (!isOutreach) {
      profilePatch.seller_tier = 'pro'
      if (proFreeUntil) profilePatch.pro_free_until = proFreeUntil.toISOString()
    }
    if (isFounding) profilePatch.founding_seller = true
    if (isHonors) {
      profilePatch.honors_member = true
      profilePatch.service_category = serviceCategory
    }
    if (isSeller) {
      profilePatch.account_type = accountType === 'both' ? 'both' : 'seller'
    } else {
      profilePatch.account_type = 'both'
    }

    const { error: profileError } = await admin
      .from('profiles')
      .update(profilePatch)
      .eq('id', user.id)

    if (profileError) {
      return json({ error: 'profile_update_failed', detail: profileError.message }, 500)
    }

    return json({
      ok: true,
      code: promo.code,
      label: promo.label,
      program,
      months,
      outreach_only: isOutreach,
      message: isOutreach
        ? 'Partner code recorded. Our team will confirm your store partner benefits after you list.'
        : undefined,
      pro_free_until: proFreeUntil?.toISOString() ?? null,
      founding_seller: isFounding,
      honors_member: isHonors,
      service_category: serviceCategory,
      seller_tier: isOutreach ? undefined : 'pro',
      remaining: Math.max(0, claimed.max_uses - claimed.uses_count),
      max_uses: claimed.max_uses,
    })
  } catch (e) {
    const message = e instanceof Error ? e.message : 'redeem_failed'
    return json({ error: message }, 500)
  }
})
