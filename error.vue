<template>
  <div class="error-shell" :class="{ 'error-shell--bc': isBcSite }">
    <div class="error-card">
      <img
        v-if="isBcSite"
        src="/img/bc-logo-primary.png?v=20260622"
        alt="B&amp;C Performance Audio"
        class="error-logo"
        width="160"
        height="160"
      >
      <img
        v-else
        src="/img/TFS-logo.png?v=20260724e"
        alt="The Franks Standard"
        class="error-logo"
        width="160"
        height="160"
      >
      <h1 class="error-title">
        {{ statusCode === 404 ? 'Page not found' : 'Something went wrong' }}
      </h1>
      <p class="error-message">
        {{ statusCode === 404
          ? 'That link may be old or mistyped. Head back to the storefront and try again.'
          : (error?.message || 'Please try again or return home.') }}
      </p>
      <button type="button" class="error-home-btn" @click="goHome">
        Back to home
      </button>
    </div>
  </div>
</template>

<script setup>
import { isBcPowerAudioPrimarySite } from '~/utils/bcPrimarySite.js'

const props = defineProps({
  error: { type: Object, required: true },
})

const config = useRuntimeConfig()
const isBcSite = computed(() => isBcPowerAudioPrimarySite(config.public.siteUrl))
const statusCode = computed(() => Number(props.error?.statusCode) || 500)

function goHome () {
  if (!import.meta.client) return
  window.location.assign('/')
}
</script>

<style scoped>
.error-shell {
  min-height: 100vh;
  display: grid;
  place-items: center;
  padding: 2rem 1rem;
  background: #120a22;
  color: #f5f5f7;
}
.error-shell--bc {
  background: #0a0a0c;
}
.error-card {
  max-width: 28rem;
  text-align: center;
}
.error-logo {
  width: min(160px, 40vw);
  height: auto;
  margin: 0 auto 1.25rem;
  display: block;
  border-radius: 12px;
}
.error-title {
  margin: 0 0 0.75rem;
  font-size: 1.5rem;
}
.error-message {
  margin: 0 0 1.5rem;
  color: #a39ab8;
  line-height: 1.5;
}
.error-shell--bc .error-message {
  color: #b0b0b8;
}
.error-home-btn {
  appearance: none;
  border: none;
  border-radius: 10px;
  padding: 0.75rem 1.25rem;
  font-weight: 700;
  cursor: pointer;
  color: #fff;
  background: linear-gradient(135deg, #c9a84c, #ffd84d);
}
.error-shell--bc .error-home-btn {
  background: #d32f2f;
  color: #fff;
}
</style>
