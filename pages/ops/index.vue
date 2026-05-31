<template>
  <div class="ops-landing">
    <div class="container ops-box">
      <h1>Operator area</h1>
      <p class="text-muted">
        Owner toolkit — not the same as signing in with email on <NuxtLink to="/auth/login">/auth/login</NuxtLink>.
        Use your <strong>operator phrase</strong> (the <code>NUXT_PUBLIC_OPS_ACCESS_KEY</code> value from your <code>.env</code> and GitHub Actions).
      </p>

      <form class="ops-form" @submit.prevent="submitAndGoPanel">
        <div v-if="!keyConfigured" class="ops-warn" role="alert">
          Operator key is missing on this build. Set <code>NUXT_PUBLIC_OPS_ACCESS_KEY</code> in GitHub Actions secrets and redeploy.
        </div>
        <template v-else>
          <label class="label" for="ops-phrase">Operator phrase</label>
          <input
            id="ops-phrase"
            v-model="phrase"
            class="input"
            type="password"
            autocomplete="off"
            placeholder="Same as NUXT_PUBLIC_OPS_ACCESS_KEY"
          />
          <p class="text-muted small">
            Or on the <NuxtLink to="/">home page</NuxtLink>, tap the logo and site name together five times quickly.
          </p>
        </template>
        <p v-if="error" class="ops-err" role="alert">{{ error }}</p>
        <div class="ops-actions">
          <NuxtLink to="/" class="btn btn-outline btn-sm">Home</NuxtLink>
          <button
            type="submit"
            class="btn btn-primary btn-sm"
            :disabled="!keyConfigured || submitting"
          >
            {{ submitting ? 'Checking…' : 'Unlock owner toolkit' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
definePageMeta({ layout: 'default' })

const router = useRouter()
const { isAuthed } = useOpsSession()
const { phrase, error, submitting, keyConfigured, submitAndGoPanel } = useOpsUnlock()

onMounted(() => {
  if (isAuthed.value) {
    router.replace('/ops/panel')
  }
})

useSeoMeta({
  title: 'Operator — The Franks Standard',
  robots: 'noindex, nofollow',
})
</script>

<style scoped>
.ops-landing { padding: 2rem 1rem; }
.ops-box { max-width: 520px; margin: 0 auto; }
.ops-landing h1 { font-size: 1.5rem; margin-bottom: 1rem; }
.ops-form { margin-top: 1.25rem; text-align: left; }
.ops-actions { display: flex; gap: 0.75rem; flex-wrap: wrap; margin-top: 1rem; }
.ops-err { color: #ff6b8a; margin-top: 0.75rem; font-size: 0.9rem; }
.ops-warn {
  padding: 0.75rem 1rem;
  border-radius: 8px;
  background: rgba(255, 107, 138, 0.12);
  border: 1px solid rgba(255, 107, 138, 0.35);
  margin-bottom: 1rem;
  font-size: 0.9rem;
}
.small { font-size: 0.88rem; }
</style>
