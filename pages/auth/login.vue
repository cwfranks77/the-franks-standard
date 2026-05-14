<template>
  <div class="auth-page">
    <div class="auth-card">
      <img src="/franks-pavilion.png" alt="" class="auth-logo" role="presentation" />
      <h1>Sign In</h1>
      <p class="text-muted">Welcome back to The Franks Standard</p>

      <p v-if="formError" class="form-err" role="alert">{{ formError }}</p>
      <p v-if="resendOk" class="form-ok" role="status">{{ resendOk }}</p>

      <form @submit.prevent="handleLogin" class="mt-3">
        <div class="form-group">
          <label class="label">Email</label>
          <input class="input" type="email" v-model="email" placeholder="you@example.com" required />
        </div>
        <div class="form-group">
          <label class="label">Password</label>
          <input class="input" type="password" v-model="password" placeholder="Your password" required />
        </div>
        <button type="submit" class="btn btn-primary" style="width: 100%;" :disabled="loading">
          {{ loading ? 'Signing in...' : 'Sign In' }}
        </button>
      </form>

      <p class="resend-row text-muted">
        <button
          type="button"
          class="link-btn"
          :disabled="resendLoading || !email.trim()"
          @click="resendConfirmation"
        >
          {{ resendLoading ? 'Sending…' : 'Resend confirmation email' }}
        </button>
      </p>

      <p class="auth-footer text-muted mt-3">
        Don't have an account? <NuxtLink to="/auth/register">Join Free</NuxtLink>
      </p>
    </div>
  </div>
</template>

<script setup>
const route = useRoute()
const config = useRuntimeConfig()
const email = ref('')
const password = ref('')
const loading = ref(false)
const formError = ref('')
const resendLoading = ref(false)
const resendOk = ref('')

async function resendConfirmation () {
  formError.value = ''
  resendOk.value = ''
  const addr = email.value.trim()
  if (!addr) {
    formError.value = 'Enter your email above first.'
    return
  }
  resendLoading.value = true
  try {
    const supabase = useSupabaseClient()
    const site = String(config.public?.siteUrl || '').replace(/\/$/, '') || 'https://thefranksstandard.com'
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email: addr,
      options: { emailRedirectTo: `${site}/auth/verify` },
    })
    if (error) {
      throw error
    }
    resendOk.value = 'If an account exists for that email, we sent a new confirmation link. Check spam.'
  } catch (err) {
    formError.value = err?.message || 'Could not resend. Try again in a minute.'
  } finally {
    resendLoading.value = false
  }
}

async function handleLogin() {
  formError.value = ''
  resendOk.value = ''
  loading.value = true
  try {
    const supabase = useSupabaseClient()
    const { error } = await supabase.auth.signInWithPassword({
      email: email.value,
      password: password.value,
    })
    if (error) {
      throw error
    }
    const raw = route.query.redirect
    const next = typeof raw === 'string' && raw.startsWith('/') ? raw : '/dashboard'
    await navigateTo(next)
  } catch (err) {
    formError.value = err?.message || 'Sign in failed. Check your email and password.'
  } finally {
    loading.value = false
  }
}
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
.form-err {
  color: var(--rose);
  font-size: 0.9rem;
  margin-top: 8px;
  text-align: left;
}
.form-ok {
  color: var(--emerald);
  font-size: 0.88rem;
  margin-top: 8px;
  text-align: left;
  line-height: 1.45;
}
.resend-row {
  margin-top: 14px;
  font-size: 0.88rem;
}
.link-btn {
  background: none;
  border: none;
  padding: 0;
  color: var(--gold);
  font: inherit;
  font-weight: 600;
  cursor: pointer;
  text-decoration: underline;
  text-underline-offset: 2px;
}
.link-btn:hover:not(:disabled) {
  color: var(--gold-dark);
}
.link-btn:disabled {
  opacity: 0.45;
  cursor: not-allowed;
  text-decoration: none;
}
.auth-logo { max-width: 220px; width: 100%; height: auto; max-height: 100px; object-fit: contain; margin-bottom: 20px; border-radius: 6px; }
.auth-card h1 { font-size: 1.5rem; margin-bottom: 4px; }
.auth-footer { font-size: 0.9rem; }
</style>
