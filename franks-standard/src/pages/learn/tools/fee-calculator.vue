<template>
  <div class="learn-page">
    <div class="container" style="max-width: 800px; padding: 40px 16px 64px;">
      <p class="eyebrow"><NuxtLink to="/learn/tools">Tools</NuxtLink></p>
      <h1>Fee savings calculator</h1>
      <p class="text-muted mb-2">Compare {{ txRange }} Franks Standard fees (by plan) vs an illustrative stacked marketplace rate.</p>
      <FeeSavingsCalculator />
      <p class="text-muted small mt-2">
        <NuxtLink to="/compare">Full comparison chart</NuxtLink>
        · <NuxtLink to="/pricing">Pricing</NuxtLink>
      </p>
    </div>
  </div>
</template>

<script setup>
import { PRICING_PUBLIC } from '~/utils/pricingPublic.js'

const txRange = PRICING_PUBLIC.txRangeLabel

useSeoMeta({
  title: 'Fee savings calculator | The Franks Standard',
  description: 'Free calculator: compare 4–5% collectibles marketplace fees vs typical 13%+ stacked fees.',
})
</script>

<style scoped>
.eyebrow a { font-weight: 700; color: #146eb4; }
h1 { font-family: 'Cinzel', Georgia, serif; font-weight: 800; margin-bottom: 12px; }
</style>
