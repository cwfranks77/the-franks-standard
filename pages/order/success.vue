<template>
  <div class="container order-success">
    <h1>Payment received</h1>
    <p class="text-muted lede">
      Thank you. Stripe has processed your payment. Your order is in escrow until you confirm the item arrived as described.
    </p>
    <p v-if="sessionId" class="small text-muted">Reference: {{ sessionId }}</p>
    <div class="actions">
      <NuxtLink v-if="orderId" :to="`/order/${orderId}`" class="btn btn-primary">View order</NuxtLink>
      <NuxtLink to="/dashboard" class="btn btn-outline">Dashboard</NuxtLink>
      <NuxtLink to="/browse" class="btn btn-outline">Browse more</NuxtLink>
    </div>
  </div>
</template>

<script setup>
definePageMeta({ layout: 'default', middleware: 'requires-auth' })
useSeoMeta({ title: 'Order confirmed - The Franks Standard', robots: 'noindex' })

const route = useRoute()
const supabase = useSupabaseClient()
const sessionId = computed(() => String(route.query.session_id || '').trim())
const orderId = ref('')

onMounted(async () => {
  if (!sessionId.value) return
  const { data } = await supabase
    .from('orders')
    .select('id')
    .eq('stripe_checkout_session_id', sessionId.value)
    .maybeSingle()
  if (data?.id) orderId.value = data.id
})
</script>

<style scoped>
.order-success { padding: 48px 16px 80px; max-width: 640px; }
.order-success h1 { font-size: 1.75rem; margin-bottom: 12px; }
.lede { line-height: 1.6; margin-bottom: 16px; }
.actions { display: flex; flex-wrap: wrap; gap: 10px; margin-top: 24px; }
.small { font-size: 0.85rem; }
</style>
