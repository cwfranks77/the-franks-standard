<template>
  <div class="auth-page">
    <div class="auth-card">
      <img src="/franks-pavilion.png" alt="" class="auth-logo" role="presentation" @error="onAuthLogoError" />
      <template v-if="registeredPending">
        <h1>Check your inbox</h1>
        <p class="text-muted">
          We sent a confirmation link to <strong>{{ email }}</strong>. Open it on this device to finish setting up your account.
        </p>
        <p class="text-muted fine">
          Gmail: search for mail from <strong>Supabase</strong> or <strong>noreply</strong> in Spam and All Mail.
          Still nothing after 10 minutes? Supabase must send through custom SMTP (or add your email to the org team) — see note below.
        </p>
        <p v-if="emailHint" class="form-err email-hint" role="status">{{ emailHint }}</p>
        <NuxtLink to="/auth/login" class="btn btn-primary mt-2" style="width: 100%;">Go to sign in</NuxtLink>
      </template>
      <template v-else>
      <h1>Join The Franks Standard</h1>
      <p class="text-muted">Create your free account to buy and sell</p>

      <p v-if="formError" class="form-err" role="alert">{{ formError }}</p>

      <form @submit.prevent="handleRegister" class="mt-3">
        <div class="form-group">
          <label class="label">Full Name</label>
          <input class="input" v-model="fullName" placeholder="Charles Franks" autocomplete="name" required />
        </div>
        <div class="form-group">
          <label class="label">Email</label>
          <input class="input" type="email" v-model="email" placeholder="you@example.com" autocomplete="email" required />
        </div>
        <div class="form-group">
          <label class="label">Password</label>
          <input class="input" type="password" v-model="password" placeholder="At least 8 characters" autocomplete="new-password" minlength="8" required />
        </div>
        <div class="form-group">
          <label class="label">I want to...</label>
          <select class="select" v-model="accountType" required>
            <option value="">Select account type</option>
            <option value="buyer">Buy items</option>
            <option value="sell">Sell items</option>
            <option value="both">Buy &amp; sell items</option>
          </select>
        </div>

        <label class="terms-check">
          <input type="checkbox" v-model="agreeTerms" required />
          <span>I agree to the <NuxtLink to="/terms">Terms of Service</NuxtLink> and <NuxtLink to="/privacy">Privacy Policy</NuxtLink></span>
        </label>

        <button type="submit" class="btn btn-primary mt-2" style="width: 100%;" :disabled="loading">
          {{ loading ? 'Creating Account...' : 'Create Free Account' }}
        </button>
      </form>

      <p class="auth-help text-muted">
        Trouble creating your account?
        <a href="mailto:info@thefranksstandard.com?subject=Account%20signup%20help">Email support</a>
        or call <a href="tel:+18778370527">(877) 837-0527</a>.
      </p>

      <p class="auth-footer text-muted mt-3">
        Already have an account? <NuxtLink to="/auth/login">Sign In</NuxtLink>
      </p>
      </template>
    </div>
  </div>
</template>

<script setup>
function postRegisterPath (type) {
  if (type === 'sell' || type === 'seller') return '/sell'
  if (type === 'both') return '/dashboard'
  return '/dashboard'
}

onMounted(() => {
  useGuestOnly()
})

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

const fullName = ref('')
const email = ref('')
const password = ref('')
const accountType = ref('')
const agreeTerms = ref(false)
const loading = ref(false)
const formError = ref('')
const registeredPending = ref(false)
const emailHint = ref('')

async function handleRegister() {
  formError.value = ''
  loading.value = true
  try {
    const supabase = useSupabaseClient()
    const site = authSiteUrl()
    const emailTrimmed = email.value.trim().toLowerCase()
    const { data, error } = await supabase.auth.signUp({
      email: emailTrimmed,
      password: password.value,
      options: {
        emailRedirectTo: `${site}/auth/verify`,
        data: {
          full_name: fullName.value,
          account_type: accountType.value,
        },
      },
    })
    if (error) {
      throw error
    }
    if (data.user && !data.session) {
      registeredPending.value = true
      const confirmed = data.user.email_confirmed_at || data.user.confirmed_at
      const identities = data.user.identities?.length ?? 0
      if (!confirmed && identities === 0) {
        emailHint.value =
          'Supabase may not have sent mail yet. On the free default sender, only org team emails receive mail — set up SMTP in Supabase (Authentication → SMTP) or add your Gmail to the Supabase org team.'
      }
      return
    }
    await navigateTo(postRegisterPath(accountType.value))
  } catch (err) {
    const msg = err?.message || ''
    if (/already registered|already been registered|user already exists/i.test(msg)) {
      formError.value = 'That email already has an account. Sign in below, or use Resend confirmation on the sign-in page.'
    } else if (/rate limit|too many requests|email.*limit/i.test(msg)) {
      formError.value = 'Too many emails sent. Wait about an hour, then use Sign in → Resend confirmation email.'
    } else if (/not authorized|error sending confirmation/i.test(msg)) {
      formError.value =
        'Supabase cannot email this address until you set up custom SMTP (Authentication → SMTP) or add your Gmail to your Supabase organization team.'
    } else if (/network|fetch failed|failed to fetch|timed out/i.test(msg)) {
      formError.value = 'Network issue while creating your account. Check connection, then try again.'
    } else {
      formError.value = msg || 'Registration failed. Please try again.'
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
.fine { font-size: 0.88rem; margin-top: 16px; }
.form-err {
  color: var(--rose);
  font-size: 0.9rem;
  margin-top: 8px;
  text-align: left;
}
.auth-logo { max-width: 220px; width: 100%; height: auto; max-height: 100px; object-fit: contain; margin-bottom: 20px; border-radius: 6px; }
.auth-card h1 { font-size: 1.5rem; margin-bottom: 4px; }
.auth-footer { font-size: 0.9rem; }
.auth-help {
  margin-top: 12px;
  font-size: 0.85rem;
  line-height: 1.45;
  text-align: left;
}
.auth-help a {
  color: var(--gold-dark);
  font-weight: 600;
}
.terms-check {
  display: flex;
  gap: 8px;
  align-items: flex-start;
  font-size: 0.85rem;
  color: var(--ink-3);
  cursor: pointer;
  text-align: left;
  margin-bottom: 8px;
}
.terms-check input { margin-top: 3px; accent-color: var(--gold); }
.email-hint { margin-top: 12px; line-height: 1.45; }
</style>
