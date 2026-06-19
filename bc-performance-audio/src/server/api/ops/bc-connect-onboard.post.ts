import { getBcServiceSupabase } from '#bc-server-utils/bcSupabase'
import { requireBcOpsAuth } from '#bc-server-utils/bcOpsAuth'
import { getBcStripe } from '#bc-server-utils/bcStripe'

/** Create a Stripe Connect Express account link for a seller. */
export default defineEventHandler(async (event) => {
  requireBcOpsAuth(event)
  const body = await readBody(event)
  const sellerId = String(body?.sellerId || 'bc-seller').trim()
  const email = String(body?.email || '').trim()

  const stripe = getBcStripe()
  if (!stripe) {
    throw createError({ statusCode: 503, statusMessage: 'STRIPE_SECRET_KEY not configured' })
  }

  const config = useRuntimeConfig(event)
  const appUrl = String(config.public.siteUrl || process.env.NUXT_PUBLIC_SITE_URL || '').replace(/\/$/, '')

  const account = await stripe.accounts.create({
    type: 'express',
    country: 'US',
    email: email || undefined,
  })

  const sb = getBcServiceSupabase()
  if (sb) {
    await sb.from('bc_seller_accounts').upsert({
      seller_id: sellerId,
      connected_account_id: account.id,
      email: email || null,
      updated_at: new Date().toISOString(),
    })
  }

  const accountLink = await stripe.accountLinks.create({
    account: account.id,
    refresh_url: `${appUrl}/bc-audio/ops/panel`,
    return_url: `${appUrl}/bc-audio/ops/panel`,
    type: 'account_onboarding',
  })

  return { accountId: account.id, url: accountLink.url }
})
