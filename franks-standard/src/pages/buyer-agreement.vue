<template>
  <div class="page">
    <div class="container legal">
      <h1>Buyer Marketplace Facilitator Agreement</h1>
      <p class="updated">
        Version {{ BUYER_POLICY_VERSION }} · The Franks Standard LLC — marketplace facilitator only.
        See also <NuxtLink to="/terms">Terms of Service</NuxtLink> and
        <NuxtLink to="/marketplace-policy">Marketplace Policies</NuxtLink>.
      </p>
      <p class="policy-draft-note text-muted small" role="note">
        <strong>Attorney review:</strong> Draft for operational use — replace with counsel-stamped finals when received.
      </p>
      <section v-for="(para, idx) in BUYER_AGREEMENT_SECTIONS" :key="idx">
        <p>{{ para }}</p>
      </section>
      <h2>Electronic signature</h2>
      <p>{{ BUYER_DIGITAL_AGREEMENT_CLOSING }}</p>
      <p><strong>Required acknowledgment:</strong> {{ BUYER_AGREEMENT_CHECKBOX }}</p>
    </div>
  </div>
</template>

<script setup>
import {
  BUYER_POLICY_VERSION,
  BUYER_AGREEMENT_SECTIONS,
  BUYER_AGREEMENT_CHECKBOX,
  BUYER_DIGITAL_AGREEMENT_CLOSING,
} from '~/utils/buyerPolicyBundle.js'

useSeoMeta({
  title: 'Buyer Agreement — The Franks Standard LLC',
  description: 'Buyer Marketplace Facilitator Agreement for The Franks Standard LLC.',
})
</script>

<style scoped>
.page { padding: 64px 0 100px; }
.legal { max-width: 800px; }
.updated { color: #6b7280; font-size: 0.9rem; }
.policy-draft-note { margin-bottom: 1.25rem; }
</style>
