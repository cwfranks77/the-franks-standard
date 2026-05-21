/** Start Stripe Checkout for a listing (Supabase Edge Function). */
export function useMarketplaceCheckout () {
  const supabase = useSupabaseClient()
  const router = useRouter()
  const loading = ref(false)
  const error = ref('')

  async function startCheckout (listingId) {
    if (!import.meta.client) return
    loading.value = true
    error.value = ''
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        router.push({ path: '/auth/login', query: { redirect: `/listing/${listingId}` } })
        return
      }
      const { data, error: fnError } = await supabase.functions.invoke('create-checkout-session', {
        body: { listing_id: listingId },
      })
      if (fnError) {
        throw new Error(fnError.message || 'Checkout could not start')
      }
      if (data?.error) {
        throw new Error(String(data.error))
      }
      if (!data?.url) {
        throw new Error('No checkout URL returned. Deploy create-checkout-session and set STRIPE_SECRET_KEY in Supabase.')
      }
      window.location.href = data.url
    } catch (e) {
      error.value = e?.message || 'Checkout failed'
    } finally {
      loading.value = false
    }
  }

  return { loading, error, startCheckout }
}