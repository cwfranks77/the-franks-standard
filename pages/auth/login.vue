<template>
  <div class="auth-page">
    <div class="auth-card">
      <img src="/logo.png" alt="The Franks Standard" class="auth-logo" />
      <h1>Sign In</h1>
      <p class="text-muted">Welcome back to The Franks Standard</p>

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

      <p class="auth-footer text-muted mt-3">
        Don't have an account? <NuxtLink to="/auth/register">Join Free</NuxtLink>
      </p>
    </div>
  </div>
</template>

<script setup>
const email = ref('')
const password = ref('')
const loading = ref(false)

async function handleLogin() {
  loading.value = true
  try {
    // TODO: Uncomment when Supabase module is enabled
    // const client = useSupabaseClient()
    // const { error } = await client.auth.signInWithPassword({ email: email.value, password: password.value })
    // if (error) throw error
    alert('Auth will work once Supabase is connected. Redirecting to dashboard preview...')
    navigateTo('/dashboard')
  } catch (err) {
    alert(err.message || 'Login failed')
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
.auth-logo { height: 60px; margin-bottom: 20px; }
.auth-card h1 { font-size: 1.5rem; margin-bottom: 4px; }
.auth-footer { font-size: 0.9rem; }
</style>
