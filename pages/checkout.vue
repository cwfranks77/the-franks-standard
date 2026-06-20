<template>
  <div class="container checkout-page">
    <h1>Checkout</h1>
    <p v-if="loading" class="text-muted">
      Opening secure Stripe checkout…
    </p>
    <p v-else-if="error" class="checkout-error" role="alert">
      {{ error }}
    </p>
    <template v-else>
      <p class="text-muted lede">
        Marketplace checkout runs on Stripe’s secure page (cards, Apple Pay, Google Pay).
        Tax is calculated from your <strong>shipping address</strong> at checkout.
      </p>
      <p class="text-muted">
        Open a listing and tap <strong>Buy now</strong>, or use a link like
        <code>/checkout?listing_id=…</code>.
      </p>
      <NuxtLink to="/browse" class="btn btn-primary">
        Browse listings
      </NuxtLink>
    </template>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'default', middleware: 'requires-auth' })
useSeoMeta({ title: 'Checkout - The Franks Standard', robots: 'noindex' })

const route = useRoute()
const { loading, error, startCheckout } = useMarketplaceCheckout()

onMounted(async () => {
  const listingId = String(route.query.listing_id || route.query.listing || '').trim()
  if (listingId) {
    await startCheckout(listingId)
  }
})
</script>

<style scoped>
.checkout-page {
  padding: 48px 16px 80px;
  max-width: 640px;
}
.checkout-page h1 {
  font-size: 1.75rem;
  margin-bottom: 12px;
}
.lede {
  line-height: 1.6;
  margin-bottom: 16px;
}
.checkout-error {
  color: #b91c1c;
  line-height: 1.5;
}
</style>
