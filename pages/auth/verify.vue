<template>
  <div class="auth-page">
    <div class="auth-card">
      <img src="/franks-pavilion.png" alt="" class="auth-logo" role="presentation" @error="onAuthLogoError" />
      <h1>Confirming your email</h1>
      <p v-if="phase === 'loading'" class="text-muted">One moment while we finish signing you in...</p>
      <p v-else-if="phase === 'error'" class="err">{{ message }}</p>
      <p v-else class="text-muted">{{ message }}</p>
      <NuxtLink v-if="phase === 'error'" to="/auth/login" class="btn btn-primary mt-2" style="width: 100%;">Back to sign in</NuxtLink>
    </div>
  </div>
</template>

<script setup>
useHead({
  title: 'Confirm email - The Franks Standard',
  meta: [{ name: 'robots', content: 'noindex, nofollow' }],
})

const route = useRoute()
const router = useRouter()
const supabase = useSupabaseClient()

const phase = ref('loading')
const message = ref('')

function onAuthLogoError (e) {
  const el = e?.target
  if (el && !el.dataset?.logoFallback) {
    el.dataset.logoFallback = '1'
    el.src = '/logo.svg'
  }
}

onMounted(async () => {
  try {
    const code = typeof route.query.code === 'string' ? route.query.code : ''
    const tokenHash = typeof route.query.token_hash === 'string' ? route.query.token_hash : ''
    const typeRaw = typeof route.query.type === 'string' ? route.query.type : 'signup'
    const otpTypes = new Set(['signup', 'email', 'magiclink', 'recovery', 'invite', 'email_change'])
    const otpType = otpTypes.has(typeRaw) ? typeRaw : 'signup'

    if (code) {
      const { error } = await supabase.auth.exchangeCodeForSession(code)
      if (error) throw error
    } else if (tokenHash) {
      const { error } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type: otpType })
      if (error) throw error
    } else if (typeof window !== 'undefined' && window.location.hash && window.location.hash.includes('access_token')) {
      const params = new URLSearchParams(window.location.hash.slice(1))
      const access_token = params.get('access_token')
      const refresh_token = params.get('refresh_token')
      if (access_token && refresh_token) {
        const { error } = await supabase.auth.setSession({ access_token, refresh_token })
        if (error) throw error
      } else {
        throw new Error('This confirmation link is incomplete or has expired.')
      }
    } else {
      throw new Error('This link is invalid or has expired. Sign in and use Resend confirmation if you still need to verify.')
    }

    const { data: { user } } = await supabase.auth.getUser()
    const accountType = user && user.user_metadata ? user.user_metadata.account_type : undefined
    phase.value = 'done'
    message.value = 'You are signed in. Redirecting...'
    if (accountType === 'sell' || accountType === 'seller') await router.replace('/sell')
    else await router.replace('/dashboard')
  } catch (err) {
    phase.value = 'error'
    const msg = err && typeof err === 'object' && 'message' in err ? String(err.message) : ''
    message.value = msg || 'We could not confirm your email. Try signing in or register again.'
  }
})
</script>

<style scoped>
.auth-page {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: calc(100vh - 200px);
  padding: 40px 20px;
}
.auth-card {
  width: 100%;
  max-width: 420px;
  padding: 40px;
  background: #fff;
  border: 1px solid var(--line);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-lg);
  text-align: center;
}
.auth-logo {
  max-width: 220px;
  width: 100%;
  height: auto;
  max-height: 100px;
  object-fit: contain;
  margin-bottom: 20px;
  border-radius: 6px;
}
.auth-card h1 {
  font-size: 1.5rem;
  margin-bottom: 12px;
}
.err {
  color: var(--rose);
  font-size: 0.95rem;
  line-height: 1.5;
}
.mt-2 {
  margin-top: 16px;
}
</style>