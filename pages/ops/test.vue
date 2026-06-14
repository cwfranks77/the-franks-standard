<template>
  <div class="container" style="padding: 3rem 1rem; text-align: center;">
    <p class="text-muted">Redirecting to QA tests…</p>
  </div>
</template>
<script setup>
definePageMeta({ layout: 'default', middleware: 'ops-auth' })
await navigateTo('/ops/test-checkout', { replace: true })
</script>