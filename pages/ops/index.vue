<template>
  <div class="ops-landing">
    <div class="container text-center" style="max-width: 520px; margin: 0 auto; padding: 3rem 1rem;">
      <h1>Operator area</h1>
      <p class="text-muted">
        This page is for the site owner. There is no password form here on purpose: guessing <code>/ops</code> alone does not grant access.
      </p>
      <p class="text-muted">
        On the <strong>home page only</strong>, tap the <strong>logo and site name</strong> together five times quickly, then enter your build phrase
        (same value as <code>NUXT_PUBLIC_OPS_ACCESS_KEY</code>).
      </p>
      <p class="text-muted small">
        If you are already signed in as operator, you go straight to the toolkit.
      </p>
      <NuxtLink to="/" class="btn btn-primary btn-sm mt-2">Back to home</NuxtLink>
    </div>
  </div>
</template>

<script setup>
definePageMeta({ layout: 'default' })

const router = useRouter()
const { isAuthed } = useOpsSession()

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
.ops-landing h1 { font-size: 1.5rem; margin-bottom: 1rem; }
.small { font-size: 0.88rem; }
.mt-2 { margin-top: 1rem; }
</style>
