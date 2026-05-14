<template>
  <div class="auth-page">
    <div class="auth-card">
      <img src="/franks-pavilion.png" alt="" class="auth-logo" role="presentation" />
      <template v-if="registeredPending">
        <h1>Check your inbox</h1>
        <p class="text-muted">
          We sent a confirmation link to <strong>{{ email }}</strong>. Open it on this device to finish setting up your account.
        </p>
        <p class="text-muted fine">Did not get it? Check spam, then try signing in — you can request another email from there.</p>
        <NuxtLink to="/auth/login" class="btn btn-primary mt-2" style="width: 100%;">Go to sign in</NuxtLink>
      </template>
      <template v-else>
      <h1>Join The Franks Standard</h1>
      <p class="text-muted">Create your free account to buy and sell</p>

      <p v-if="formError" class="form-err" role="alert">{{ formError }}</p>

      <form @submit.prevent="handleRegister" class="mt-3">
        <div class="form-group">
          <label class="label">Full Name</label>
          <input class="input" v-model="fullName" placeholder="Charles Franks" required />
        </div>
        <div class="form-group">
          <label class="label">Email</label>
          <input class="input" type="email" v-model="email" placeholder="you@example.com" required />
        </div>
        <div class="form-group">
          <label class="label">Password</label>
          <input class="input" type="password" v-model="password" placeholder="At least 8 characters" minlength="8" required />
        </div>
        <div class="form-group">
          <label class="label">I want to...</label>
          <select class="select" v-model="accountType" required>
            <option value="">Select account type</option>
            <option value="buyer">Buy items</option>
            <option value="seller">Buy & Sell items</option>
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

      <p class="auth-footer text-muted mt-3">
        Already have an account? <NuxtLink to="/auth/login">Sign In</NuxtLink>
      </p>
      </template>
    </div>
  </div>
</template>

<script setup>
const config = useRuntimeConfig()

const fullName = ref('')
const email = ref('')
const password = ref('')
const accountType = ref('')
const agreeTerms = ref(false)
const loading = ref(false)
const formError = ref('')
const registeredPending = ref(false)

async function handleRegister() {
  formError.value = ''
  loading.value = true
  try {
    const supabase = useSupabaseClient()
    const site = String(config.public?.siteUrl || '').replace(/\/$/, '') || 'https://thefranksstandard.com'
    const { data, error } = await supabase.auth.signUp({
      email: email.value,
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
      return
    }
    if (accountType.value === 'seller') {
      await navigateTo('/sellers')
    } else {
      await navigateTo('/dashboard')
    }
  } catch (err) {
    formError.value = err?.message || 'Registration failed. Please try again.'
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
</style>
