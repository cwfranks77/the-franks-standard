<template>
  <div class="auth-page">
    <div class="auth-card">
      <img src="/franks-pavilion.png" alt="" class="auth-logo" role="presentation" @error="onAuthLogoError" />
      <h1>Sign In</h1>
      <p class="text-muted">Welcome back to The Franks Standard</p>

      <p v-if="existingSessionEmail" class="auth-session-note" role="status">
        Currently signed in as <strong>{{ existingSessionEmail }}</strong>.
        <button type="button" class="link-btn" @click="signOutForSwitch">Sign out to use a different account</button>
      </p>

      <p v-if="formError" class="form-err" role="alert">{{ formError }}</p>
      <p v-if="resendOk" class="form-ok" role="status">{{ resendOk }}</p>

      <form @submit.prevent="handleLogin" class="mt-3">
        <div class="form-group">
          <label class="label">Email</label>
          <input class="input" type="email" v-model="email" placeholder="you@example.com" autocomplete="email" required />
        </div>
        <div class="form-group">
          <label class="label">Password</label>
          <input class="input" type="password" v-model="password" placeholder="Your password" autocomplete="current-password" required />
        </div>
        <label class="remember-row">
          <input v-model="rememberMe" type="checkbox" />
          <span>Keep me signed in on this device</span>
        </label>
        <p class="remember-hint text-muted">If unchecked, you stay signed in until you close the browser (no auto-login next visit).</p>
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

      <p class="auth-help text-muted">
        Still stuck?
        <a href="mailto:info@thefranksstandard.com?subject=Sign-in%20help">Email support</a>
        or call <a href="tel:+18778370527">(877) 837-0527</a>.
      </p>

      <p class="auth-footer text-muted mt-3">
        Don't have an account? <NuxtLink to="/auth/register">Join Free</NuxtLink>
      </p>
    </div>
  </div>
</template>

<script setup>
import { resolveAuthRedirect } from '~/utils/listItemRoutes.js'
import {
  clearAllAuthStorage,
  getRememberMe,
  migrateAuthTokenToPreferredStorage,
  setRememberMe,
} from '~/utils/authPersistence.js'

const route = useRoute()
const config = useRuntimeConfig()
const supabase = useSupabaseClient()
const existingSessionEmail = ref('')
const rememberMe = ref(false)

onMounted(async () => {
  rememberMe.value = getRememberMe()
  await useGuestOnly()
  const { data: { session } } = await supabase.auth.getSession()
  if (session?.user?.email) {
    existingSessionEmail.value = session.user.email
  }
})

async function signOutForSwitch () {
  await supabase.auth.signOut()
  clearAllAuthStorage(config.public.supabase?.url)
  existingSessionEmail.value = ''
  formError.value = ''
}

function onAuthLogoError (e) {
  const el = e?.target
  if (el && !el.dataset?.logoFallback) {
    el.dataset.logoFallback = '1'
    el.src = '/logo.svg'
  }
}

function authSiteUrl () {
  if (import.meta.client && typeof window !== 'undefined') {
    const { hostname, protocol, host } = window.location
    if (hostname && !/localhost|127\.0\.0\.1/i.test(hostname)) {
      return protocol + '//' + host
    }
  }
  const cfg = String(useRuntimeConfig().public?.siteUrl || '').trim().replace(/\/$/, '')
  if (cfg && !/localhost|127\.0\.0\.1/i.test(cfg)) return cfg
  return 'https://thefranksstandard.com'
}

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
    const site = authSiteUrl()
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
    const msg = err?.message || ''
    if (/not authorized|error sending confirmation/i.test(msg)) {
      formError.value =
        'Email not sent: set up custom SMTP in Supabase (Authentication → SMTP), or add this Gmail to your Supabase org team.'
    } else {
      formError.value = msg || 'Could not resend. Try again in a minute.'
    }
  } finally {
    resendLoading.value = false
  }
}

async function handleLogin() {
  formError.value = ''
  resendOk.value = ''
  loading.value = true
  try {
    setRememberMe(rememberMe.value)
    migrateAuthTokenToPreferredStorage(config.public.supabase?.url)
    const supabase = useSupabaseClient()
    const emailTrimmed = email.value.trim().toLowerCase()
    const { error } = await supabase.auth.signInWithPassword({
      email: emailTrimmed,
      password: password.value,
    })
    if (error) {
      throw error
    }
    const next = resolveAuthRedirect(route.query)
    await navigateTo(next)
  } catch (err) {
    const msg = err?.message || ''
    if (/email not confirmed|email.*not.*confirmed/i.test(msg)) {
      formError.value = 'Your email is not confirmed yet. Use "Resend confirmation email" below, then open that link on this device.'
    } else if (/invalid login credentials|invalid.*credentials/i.test(msg)) {
      formError.value = 'Email/password did not match. Check spelling, then try again.'
    } else if (/network|fetch failed|failed to fetch|timed out/i.test(msg)) {
      formError.value = 'Network issue while signing in. Check connection, then try again.'
    } else {
      formError.value = msg || 'Sign in failed. Check your email and password.'
    }
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
  color: #7f1d1d;
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 8px;
  padding: 10px 12px;
  font-size: 0.9rem;
  font-weight: 600;
  margin-top: 8px;
  text-align: left;
  line-height: 1.45;
}
.form-ok {
  color: #14532d;
  background: #ecfdf5;
  border: 1px solid #86efac;
  border-radius: 8px;
  padding: 10px 12px;
  font-size: 0.88rem;
  font-weight: 600;
  margin-top: 8px;
  text-align: left;
  line-height: 1.45;
}
.auth-session-note {
  font-size: 0.88rem;
  font-weight: 600;
  line-height: 1.5;
  margin: 12px 0 0;
  padding: 10px 12px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  text-align: left;
}
.auth-session-note .link-btn {
  display: block;
  margin-top: 6px;
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
.auth-card h1 {
  font-size: 1.5rem;
  margin-bottom: 4px;
  color: #111827;
  font-weight: 800;
}
.auth-card > p.text-muted {
  color: #374151 !important;
  font-weight: 600;
}
.auth-footer {
  font-size: 0.9rem;
  color: #374151;
  font-weight: 600;
}
.auth-help {
  margin-top: 10px;
  font-size: 0.88rem;
  text-align: left;
  line-height: 1.5;
  color: #374151 !important;
  font-weight: 600;
}
.auth-help a {
  color: #b45309;
  font-weight: 700;
}
.resend-row {
  color: #374151;
  font-weight: 600;
}
.remember-row {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  margin: 4px 0 6px;
  font-size: 0.88rem;
  font-weight: 700;
  color: #111827;
  text-align: left;
  cursor: pointer;
}
.remember-row input {
  margin-top: 3px;
  accent-color: var(--gold);
}
.remember-hint {
  font-size: 0.78rem;
  font-weight: 600;
  line-height: 1.45;
  margin: 0 0 14px;
  text-align: left;
}
</style>
