import type { SupabaseClient } from 'npm:@supabase/supabase-js@2'

export const STARTER_FREE_SLUG = 'starter_free_90'
export const DEFAULT_PAID_SLUG = 'marketplace_standard'

export async function assignStarterFreePlan (
  admin: SupabaseClient,
  sellerId: string,
): Promise<{ ok: true; subscription_id: string } | { ok: false; error: string }> {
  const { data: plan } = await admin
    .from('subscription_plans')
    .select('id, duration_days')
    .eq('slug', STARTER_FREE_SLUG)
    .eq('active', true)
    .maybeSingle()

  if (!plan?.id) return { ok: false, error: 'starter_plan_not_found' }

  const { data: existing } = await admin
    .from('seller_subscriptions')
    .select('id')
    .eq('seller_id', sellerId)
    .eq('status', 'active')
    .maybeSingle()

  if (existing?.id) return { ok: true, subscription_id: existing.id }

  const days = Number(plan.duration_days) || 90
  const expiresAt = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString()

  const { data, error } = await admin.from('seller_subscriptions').insert({
    seller_id: sellerId,
    plan_id: plan.id,
    expires_at: expiresAt,
    status: 'active',
  }).select('id').single()

  if (error || !data?.id) return { ok: false, error: error?.message ?? 'insert_failed' }
  return { ok: true, subscription_id: data.id }
}

export async function expireStarterPlans (
  admin: SupabaseClient,
): Promise<{ switched: number; errors: string[] }> {
  const { data: defaultPlan } = await admin
    .from('subscription_plans')
    .select('id')
    .eq('slug', DEFAULT_PAID_SLUG)
    .eq('is_default_paid', true)
    .maybeSingle()

  if (!defaultPlan?.id) return { switched: 0, errors: ['default_paid_plan_not_found'] }

  const { data: starterPlan } = await admin
    .from('subscription_plans')
    .select('id')
    .eq('slug', STARTER_FREE_SLUG)
    .maybeSingle()

  if (!starterPlan?.id) return { switched: 0, errors: ['starter_plan_not_found'] }

  const now = new Date().toISOString()
  const { data: expired, error } = await admin
    .from('seller_subscriptions')
    .select('id, seller_id')
    .eq('plan_id', starterPlan.id)
    .eq('status', 'active')
    .lt('expires_at', now)

  if (error) return { switched: 0, errors: [error.message] }

  let switched = 0
  const errors: string[] = []

  for (const row of expired ?? []) {
    const { error: updErr } = await admin
      .from('seller_subscriptions')
      .update({ status: 'expired', updated_at: now })
      .eq('id', row.id)

    if (updErr) {
      errors.push(updErr.message)
      continue
    }

    const { error: insErr } = await admin.from('seller_subscriptions').insert({
      seller_id: row.seller_id,
      plan_id: defaultPlan.id,
      status: 'active',
      expires_at: null,
    })

    if (insErr) errors.push(insErr.message)
    else switched += 1
  }

  return { switched, errors }
}
