<template>
  <div class="auth-page">
    <div class="auth-card">
      <img src="/franks-pavilion.png" alt="" class="auth-logo" role="presentation" @error="onAuthLogoError" />
      <h1>Reset password</h1>
      <p class="text-muted">Choose a new password for your account.</p>
      <p v-if="formError" class="form-err" role="alert">{{ formError }}</p>
      <p v-if="formOk" class="form-ok" role="status">{{ formOk }}</p>
      <form class="mt-3" @submit.prevent="updatePassword">
        <div class="form-group">
          <label class="label">New password</label>
          <input v-model="password" class="input" type="password" minlength="8" autocomplete="new-password" required />
        </div>
        <div class="form-group">
          <label class="label">Confirm password</label>
          <input v-model="confirmPassword" class="input" type="password" minlength="8" autocomplete="new-password" required />
        </div>
        <button type="submit" class="btn btn-primary" style="width:100%" :disabled="loading">
          {{ loading ? 'Saving...' : 'Save new password' }}
        </button>
      </form>
      <p class="auth-footer text-muted mt-3">
        Remembered it? <NuxtLink to="/auth/login">Back to sign in</NuxtLink>
      </p>
    </div>
  </div>
</template>

<script setup>
definePageMeta({ layout: 'default' })
useSeoMeta({ title: 'Reset password - The Franks Standard', robots: 'noindex, nofollow' })

const supabase = useSupabaseClient()
const router = useRouter()

const password = ref('')
const confirmPassword = ref('')
const loading = ref(false)
const formError = ref('')
const formOk = ref('')

function onAuthLogoError (e) {
  const el = e?.target
  if (el && !el.dataset?.logoFallback) {
    el.dataset.logoFallback = '1'
    el.src = '/logo.svg'
  }
}

async function updatePassword () {
  formError.value = ''
  formOk.value = ''
  if (password.value !== confirmPassword.value) {
    formError.value = 'Passwords do not match.'
    return
  }
  loading.value = true
  try {
    const { error } = await supabase.auth.updateUser({ password: password.value })
    if (error) throw error
    formOk.value = 'Password updated. Redirecting to dashboard...'
    setTimeout(() => router.replace('/dashboard'), 900)
  } catch (err) {
    formError.value = err?.message || 'Could not update password. Open the reset link again and retry.'
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
.auth-logo { max-width: 220px; width: 100%; max-height: 100px; object-fit: contain; margin-bottom: 20px; }
.form-group { margin-bottom: 1rem; text-align: left; }
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
}
.form-ok {
  color: #14532d;
  background: #ecfdf5;
  border: 1px solid #86efac;
  border-radius: 8px;
  padding: 10px 12px;
  font-size: 0.9rem;
  font-weight: 600;
  margin-top: 8px;
}
.mt-3 { margin-top: 24px; }
</style>
