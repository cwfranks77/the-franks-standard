/** B&C checkout — proxies to Supabase edge function (Stripe session). */
export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const supabaseUrl = String(process.env.SUPABASE_URL || process.env.NUXT_PUBLIC_SUPABASE_URL || '').replace(/\/$/, '')
  const anonKey = String(process.env.NUXT_PUBLIC_SUPABASE_KEY || process.env.NUXT_PUBLIC_SUPABASE_ANON_KEY || '').trim()

  if (!supabaseUrl || !anonKey) {
    throw createError({ statusCode: 503, statusMessage: 'Checkout is not configured on this deploy.' })
  }

  try {
    return await $fetch(`${supabaseUrl}/functions/v1/bc-dropship-checkout`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${anonKey}`,
        apikey: anonKey,
        'Content-Type': 'application/json',
      },
      body,
    })
  } catch (e: any) {
    throw createError({
      statusCode: e?.statusCode || e?.response?.status || 500,
      statusMessage: e?.data?.error || e?.message || 'Checkout failed',
    })
  }
})
