<template>
  <div class="ops-landing">
    <div class="container text-center" style="max-width: 520px; margin: 0 auto; padding: 3.5rem 1rem 4rem">
      <h1>Operator</h1>
      <p class="text-muted">
        On the <strong>home page</strong> only: <strong>click five times quickly</strong> on the
        <strong>logo or site name</strong> in the top-left. That opens a dialog. Enter the same value as
        <code>NUXT_PUBLIC_OPS_ACCESS_KEY</code> in your <code>.env</code> or GitHub build (whitespace is trimmed at login).
        Then you land on the panel.
      </p>
      <p class="text-muted">
        This URL does <strong>not</strong> show a password form on purpose, so a random person who guesses <code>/ops</code> cannot
        type a phrase here. Use the home page knock and modal instead.
      </p>
      <NuxtLink to="/" class="btn btn-primary btn-sm mt-2">Go to home</NuxtLink>
    </div>
  </div>
</template>

<script setup>
definePageMeta({ layout: 'default' })
useSeoMeta({ title: 'Operator - The Franks Standard', robots: 'noindex, nofollow' })

const router = useRouter()

onMounted(() => {
  const { isAuthed } = useOpsSession()
  if (isAuthed.value) {
    router.replace('/ops/panel')
  }
})
</script>

<style scoped>
.ops-landing h1 { font-size: 1.5rem; margin-bottom: 1rem; }
</style>
