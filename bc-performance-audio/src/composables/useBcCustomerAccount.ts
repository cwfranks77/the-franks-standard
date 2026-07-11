import { hasPublicSupabase } from '~/utils/publicSupabase.js'

export type BcCustomerStatus = 'pending' | 'approved' | 'blocked'

export type BcCustomerProfile = {
  id: string
  user_id: string
  email: string
  full_name: string | null
  phone: string | null
  status: BcCustomerStatus
  created_at: string
  approved_at: string | null
}

export function useBcCustomerAccount () {
  const config = useRuntimeConfig()
  const user = useSupabaseUser()

  function getSupabase () {
    if (!hasPublicSupabase(config)) return null
    return useSupabaseClient()
  }

  const profile = ref<BcCustomerProfile | null>(null)
  const loading = ref(false)
  const error = ref('')

  const accountsRequired = computed(() => {
    return String(config.public.bcAccountsRequired ?? 'true').toLowerCase() !== 'false'
  })

  const isLoggedIn = computed(() => Boolean(user.value?.id))
  const isApproved = computed(() => profile.value?.status === 'approved')
  const isPending = computed(() => profile.value?.status === 'pending')
  const canPurchase = computed(() => !accountsRequired.value || isApproved.value)

  async function loadProfile () {
    error.value = ''
    if (!user.value?.id) {
      profile.value = null
      return null
    }
    const sb = getSupabase()
    if (!sb) {
      error.value = 'Sign-in is temporarily unavailable. Please try again later.'
      profile.value = null
      return null
    }
    loading.value = true
    try {
      const { data, error: qErr } = await sb
        .from('bc_customer_profiles')
        .select('*')
        .eq('user_id', user.value.id)
        .maybeSingle()

      if (qErr) throw qErr
      profile.value = data as BcCustomerProfile | null
      return profile.value
    } catch (e: any) {
      error.value = e?.message || 'Could not load your account.'
      profile.value = null
      return null
    } finally {
      loading.value = false
    }
  }

  async function registerProfile (payload: { fullName: string; phone?: string }) {
    if (!user.value?.id || !user.value.email) {
      throw new Error('Sign in first.')
    }
    const res = await $fetch<{ profile?: BcCustomerProfile }>('/api/customer/profile', {
      method: 'POST',
      body: {
        userId: user.value.id,
        email: user.value.email,
        fullName: payload.fullName,
        phone: payload.phone,
      },
    })
    if (res?.profile) {
      profile.value = res.profile
      return profile.value
    }
    return loadProfile()
  }

  async function signUp (email: string, password: string, fullName: string, phone?: string) {
    error.value = ''
    const sb = getSupabase()
    if (!sb) throw new Error('Sign-in is temporarily unavailable. Please try again later.')
    const { data, error: signErr } = await sb.auth.signUp({ email, password })
    if (signErr) throw signErr
    if (data.user) {
      await registerProfile({ fullName, phone })
    }
    return data
  }

  async function signIn (email: string, password: string) {
    error.value = ''
    const sb = getSupabase()
    if (!sb) throw new Error('Sign-in is temporarily unavailable. Please try again later.')
    const { data, error: signErr } = await sb.auth.signInWithPassword({ email, password })
    if (signErr) throw signErr
    await loadProfile()
    return data
  }

  async function signOut () {
    const sb = getSupabase()
    if (sb) await sb.auth.signOut()
    profile.value = null
  }

  watch(user, () => { loadProfile() }, { immediate: true })

  return {
    user,
    profile,
    loading,
    error,
    accountsRequired,
    isLoggedIn,
    isApproved,
    isPending,
    canPurchase,
    loadProfile,
    registerProfile,
    signUp,
    signIn,
    signOut,
  }
}
