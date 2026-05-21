/** Stripe Connect onboarding for sellers. */
export function useStripeConnect () {
  const supabase = useSupabaseClient()
  const loading = ref(false)
  const error = ref('')

  async function startOnboarding () {
    if (!import.meta.client) return
    loading.value = true
    error.value = ''
    try {
      const { data, error: fnError } = await supabase.functions.invoke('stripe-connect-onboard', { body: {} })
      if (fnError) throw new Error(fnError.message)
      if (data?.error) throw new Error(String(data.error))
      if (!data?.url) throw new Error('Connect onboarding URL missing. Deploy stripe-connect-onboard.')
      window.location.href = data.url
    } catch (e) {
      error.value = e?.message || 'Connect setup failed'
    } finally {
      loading.value = false
    }
  }

  return { loading, error, startOnboarding }
}