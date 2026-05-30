<template>
  <div class="list-start-page">
    <div class="container" style="padding: 48px 16px 80px; max-width: 720px;">
      <div v-if="policyLoading" class="text-muted">Loading seller requirements…</div>
      <SellerPolicyAgreement v-else-if="needsPolicyAcceptance" @accepted="onPoliciesAccepted" />
      <template v-else>
      <SellListingPathChooser />
      <p class="text-muted small foot-note">
        Not sure?
        <NuxtLink to="/categories">Browse categories</NuxtLink>
        ·
        <NuxtLink to="/how-it-works">How listing proof works</NuxtLink>
      </p>
      </template>
    </div>
  </div>
</template>

<script setup>
definePageMeta({ middleware: 'requires-auth' })

const {
  needsAcceptance: needsPolicyAcceptance,
  loading: policyLoading,
  loadStatus: loadPolicyStatus,
} = useSellerPolicyAcceptance()

onMounted(() => loadPolicyStatus())

async function onPoliciesAccepted () {
  await loadPolicyStatus()
}

useSeoMeta({
  title: 'List an item | The Franks Standard',
  description: 'Choose collectible (COA required) or non-collectible general merchandise listing.',
})
</script>

<style scoped>
.foot-note { margin-top: 24px; }
</style>
