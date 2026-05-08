<template>
  <div class="auth-page">
    <div class="auth-card">
      <img src="/franks-pavilion.png" alt="" class="auth-logo" role="presentation" />
      <h1>Join The Franks Standard</h1>
      <p class="text-muted">Create your free account to buy and sell</p>

      <div v-if="showConfirmNotice" class="confirm-notice">
        <p class="confirm-icon">✉️</p>
        <h2>Check your email</h2>
        <p>We sent a confirmation link from <strong>The Franks Standard</strong> to <strong>{{ email }}</strong>.</p>
        <p class="text-muted">Click the link in the email to activate your account, then sign in below.</p>
        <NuxtLink to="/auth/login" class="btn btn-primary mt-2" style="width: 100%;">Go to Sign In</NuxtLink>
      </div>

      <form v-else @submit.prevent="handleRegister" class="mt-3">
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
    </div>
  </div>
</template>

<script setup>
const fullName = ref('')
const email = ref('')
const password = ref('')
const accountType = ref('')
const agreeTerms = ref(false)
const loading = ref(false)
const showConfirmNotice = ref(false)

async function handleRegister() {
  loading.value = true
  try {
    const supabase = useSupabaseClient()
    const siteUrl = useRuntimeConfig().public.siteUrl || window.location.origin
    const { data, error } = await supabase.auth.signUp({
      email: email.value,
      password: password.value,
      options: {
        emailRedirectTo: `${siteUrl}/auth/login?confirmed=1`,
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
      showConfirmNotice.value = true
      return
    }
    if (accountType.value === 'seller') {
      await navigateTo('/sellers')
    } else {
      await navigateTo('/dashboard')
    }
  } catch (err) {
    alert(err?.message || 'Registration failed')
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
  background: var(--stone-900);
  border: 1px solid var(--stone-800);
  border-radius: var(--radius-xl);
  text-align: center;
}
.auth-logo { max-width: 220px; width: 100%; height: auto; max-height: 100px; object-fit: contain; margin-bottom: 20px; border-radius: 6px; }
.auth-card h1 { font-size: 1.5rem; margin-bottom: 4px; }
.auth-footer { font-size: 0.9rem; }
.terms-check {
  display: flex;
  gap: 8px;
  align-items: flex-start;
  font-size: 0.85rem;
  color: var(--stone-400);
  cursor: pointer;
  text-align: left;
  margin-bottom: 8px;
}
.terms-check input { margin-top: 3px; accent-color: var(--gold); }
.confirm-notice {
  text-align: center; padding: 20px 0;
}
.confirm-notice h2 { font-size: 1.3rem; margin: 12px 0 8px; color: var(--gold); }
.confirm-notice p { font-size: 0.92rem; line-height: 1.6; color: var(--stone-200); }
.confirm-icon { font-size: 3rem; margin-bottom: 4px; }
</style>
