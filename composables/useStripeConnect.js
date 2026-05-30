/** Stripe Connect onboarding + status sync for sellers. */
export function useStripeConnect () {
  const supabase = useSupabaseClient()
  const loading = ref(false)
  const syncing = ref(false)
  const error = ref('')
  const status = ref(null)

  async function syncStatus () {
    if (!import.meta.client) return null
    syncing.value = true
    error.value = ''
    try {
      const { data, error: fnError } = await supabase.functions.invoke('stripe-connect-sync', { body: {} })
      if (fnError) throw new Error(fnError.message)
      if (data?.error) throw new Error(String(data.error))
      status.value = data
      return data
    } catch (e) {
      error.value = e?.message || 'Could not refresh payout status'
      return null
    } finally {
      syncing.value = false
    }
  }

  async function startOnboarding () {
    if (!import.meta.client) return
    loading.value = true
    error.value = ''
    try {
      const { data, error: fnError } = await supabase.functions.invoke('stripe-connect-onboard', { body: {} })
      if (fnError) throw new Error(fnError.message)
      if (data?.error) throw new Error(String(data.error))
      if (!data?.url) throw new Error('Connect onboarding URL missing. Deploy stripe-connect-onboard.')
      if (data.stripe_charges_enabled) {
        status.value = data
        error.value = 'Payouts are already active on your Stripe account.'
        return
      }
      window.location.href = data.url
    } catch (e) {
      error.value = e?.message || 'Connect setup failed'
    } finally {
      loading.value = false
    }
  }

  return { loading, syncing, error, status, startOnboarding, syncStatus }
}
