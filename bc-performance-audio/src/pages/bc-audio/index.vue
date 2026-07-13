<!--
CURSOR: STRICT MODE — B&C PERFORMANCE AUDIO standalone storefront home.
Only this namespace. No Franks Standard branding in page copy.
-->
<script setup lang="ts">
import { BC_BRAND } from '~/utils/bcBrand.js'

definePageMeta({ layout: false })

useHead({
  title: BC_BRAND.full,
  meta: [{ name: 'description', content: 'Coming soon.' }],
})
</script>

<template>
  <div class="coming-soon coming-soon--bc">
    <h1>{{ BC_BRAND.full }}</h1>
    <p>Coming soon</p>
  </div>
</template>

<style scoped>
.coming-soon {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 2rem;
}

.coming-soon--bc {
  background: #0a0a0a;
  color: #f5f5f5;
}

.coming-soon--bc h1 {
  font-size: clamp(1.75rem, 5vw, 2.75rem);
  font-weight: 700;
  margin: 0 0 1rem;
  color: #fff;
}

.coming-soon--bc p {
  font-size: 1.25rem;
  color: #d32f2f;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  margin: 0;
}
</style>
