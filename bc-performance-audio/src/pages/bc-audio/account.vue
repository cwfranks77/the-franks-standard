<script setup>
definePageMeta({ layout: 'bc-audio' })

const route = useRoute()
const {
  profile,
  loading,
  error: accountError,
  accountsRequired,
  isLoggedIn,
  isApproved,
  isPending,
  canPurchase,
  signUp,
  signIn,
  signOut,
  loadProfile,
} = useBcCustomerAccount()

const mode = ref('signin')
const form = ref({ email: '', password: '', fullName: '', phone: '' })
const busy = ref(false)
const message = ref('')

const config = useRuntimeConfig()
const androidUrl = computed(() => String(config.public.androidApkUrl || '').trim())
const windowsUrl = computed(() => String(config.public.windowsInstallerUrl || '').trim())

async function submit () {
  busy.value = true
  message.value = ''
  try {
    if (mode.value === 'signup') {
      await signUp(form.value.email, form.value.password, form.value.fullName, form.value.phone)
      message.value = 'Account created — waiting for owner approval before you can buy.'
    } else {
      await signIn(form.value.email, form.value.password)
      message.value = isApproved.value ? 'Signed in — you can shop now.' : 'Signed in — your account is pending owner approval.'
    }
    await loadProfile()
    if (canPurchase.value && route.query.redirect) {
      await navigateTo(String(route.query.redirect))
    }
  } catch (e) {
    message.value = e?.message || 'Could not complete request.'
  } finally {
    busy.value = false
  }
}

useSeoMeta({
  title: 'My account — B&C Performance Audio',
  description: 'Create your B&C account. Owner approval is required before checkout.',
})
</script>

<template>
  <div class="bc-account">
    <header class="bc-account__head">
      <h1>My B&amp;C account</h1>
      <p v-if="accountsRequired">
        You need an approved account before checkout. Sign up, then the owner approves you in the console.
      </p>
      <p v-else>Sign in to save your details for faster checkout.</p>
    </header>

    <section v-if="isLoggedIn" class="bc-account__card">
      <h2>Signed in</h2>
      <p><strong>{{ profile?.full_name || profile?.email }}</strong></p>
      <p class="bc-account__status" :class="profile?.status">
        Status: {{ profile?.status || 'unknown' }}
      </p>
      <p v-if="isPending" class="bc-account__note">Your account is waiting for owner approval. You cannot checkout yet.</p>
      <p v-if="isApproved" class="bc-account__ok">Approved — you can shop and checkout.</p>
      <div class="bc-account__actions">
        <NuxtLink v-if="canPurchase" to="/bc-audio" class="btn btn-primary btn-sm">Go shopping</NuxtLink>
        <button type="button" class="btn btn-outline btn-sm" @click="signOut">Sign out</button>
      </div>
    </section>

    <section v-else class="bc-account__card">
      <div class="bc-account__tabs">
        <button type="button" :class="{ active: mode === 'signin' }" @click="mode = 'signin'">Sign in</button>
        <button type="button" :class="{ active: mode === 'signup' }" @click="mode = 'signup'">Create account</button>
      </div>

      <form class="bc-account__form" @submit.prevent="submit">
        <label v-if="mode === 'signup'">Full name<input v-model="form.fullName" class="input" required></label>
        <label>Email<input v-model="form.email" class="input" type="email" required autocomplete="email"></label>
        <label>Password<input v-model="form.password" class="input" type="password" required minlength="8" autocomplete="current-password"></label>
        <label v-if="mode === 'signup'">Phone (optional)<input v-model="form.phone" class="input" type="tel"></label>
        <button type="submit" class="btn btn-primary" :disabled="busy || loading">
          {{ busy ? 'Working…' : (mode === 'signup' ? 'Create account' : 'Sign in') }}
        </button>
      </form>
    </section>

    <p v-if="message" class="bc-account__msg">{{ message }}</p>
    <p v-if="accountError" class="bc-account__err">{{ accountError }}</p>

    <section class="bc-account__app">
      <BcInstallApp variant="panel" />
      <div v-if="androidUrl || windowsUrl" class="bc-account__app-links bc-account__app-links--extra">
        <p class="bc-account__note">Optional native builds (if published):</p>
        <a v-if="androidUrl" :href="androidUrl" class="btn btn-outline btn-sm" target="_blank" rel="noopener">Android APK ↗</a>
        <a v-if="windowsUrl" :href="windowsUrl" class="btn btn-outline btn-sm" target="_blank" rel="noopener">Windows installer ↗</a>
      </div>
    </section>
  </div>
</template>

<style scoped>
.bc-account { max-width: 520px; margin: 0 auto; padding: 2rem 1.25rem 4rem; }
.bc-account__head h1 { color: #ff5252; margin: 0 0 8px; }
.bc-account__head p { color: #9ca3af; margin: 0 0 1.5rem; line-height: 1.5; }
.bc-account__card {
  padding: 1.25rem; border-radius: 12px; border: 1px solid rgba(255,255,255,0.08);
  background: #16161c; margin-bottom: 1rem;
}
.bc-account__card h2 { font-size: 1rem; color: #ff5252; margin: 0 0 12px; }
.bc-account__tabs { display: flex; gap: 8px; margin-bottom: 14px; }
.bc-account__tabs button {
  padding: 8px 14px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.12);
  background: #0a0a0c; color: #b8bcc6; font-weight: 700; cursor: pointer;
}
.bc-account__tabs button.active { border-color: #ff5252; color: #fff; background: rgba(211,47,47,0.15); }
.bc-account__form { display: flex; flex-direction: column; gap: 12px; }
.bc-account__form label { display: flex; flex-direction: column; gap: 6px; font-size: 0.72rem; font-weight: 700; text-transform: uppercase; color: #9ca3af; }
.bc-account__status { text-transform: capitalize; font-weight: 700; }
.bc-account__status.pending { color: #ffd814; }
.bc-account__status.approved { color: #4ade80; }
.bc-account__status.blocked { color: #ff8a80; }
.bc-account__note { color: #ffd814; font-size: 0.9rem; }
.bc-account__ok { color: #4ade80; }
.bc-account__actions { display: flex; gap: 8px; margin-top: 12px; flex-wrap: wrap; }
.bc-account__msg { color: #93c5fd; margin-top: 12px; }
.bc-account__err { color: #ff8a80; margin-top: 12px; }
.bc-account__app { margin-top: 2rem; padding-top: 1.5rem; border-top: 1px solid rgba(255,255,255,0.08); }
.bc-account__app h2 { font-size: 1rem; color: #ff5252; margin: 0 0 8px; }
.bc-account__app p { color: #9ca3af; font-size: 0.9rem; }
.bc-account__app-links { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 12px; }
.bc-account__app-links--extra { margin-top: 1rem; }
</style>
