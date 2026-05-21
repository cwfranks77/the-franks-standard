<template>
  <div class="container order-page">
    <div v-if="loading" class="text-muted">Loading order…</div>
    <div v-else-if="!order" class="text-muted">
      <p>Order not found.</p>
      <NuxtLink to="/dashboard" class="btn btn-outline btn-sm">Dashboard</NuxtLink>
    </div>
    <template v-else>
      <header class="order-head">
        <h1>Order</h1>
        <span class="status-pill" :class="order.status">{{ statusLabel(order.status) }}</span>
      </header>

      <div class="order-card">
        <p><strong>Listing:</strong> <NuxtLink :to="`/listing/${order.listing_id}`">{{ listingTitle }}</NuxtLink></p>
        <p><strong>Amount:</strong> ${{ Number(order.amount).toLocaleString() }} USD</p>
        <p v-if="order.platform_fee != null"><strong>Platform fee:</strong> ${{ Number(order.platform_fee).toLocaleString() }}</p>
        <p><strong>Escrow:</strong> {{ escrowLabel(order.escrow_status) }}</p>
        <p class="text-muted small">Placed {{ formatDate(order.created_at) }}</p>
        <p v-if="order.paid_at" class="text-muted small">Paid {{ formatDate(order.paid_at) }}</p>
      </div>

      <div v-if="isBuyer && canConfirm" class="order-actions">
        <p class="text-muted">Confirm only when the item matches the listing.</p>
        <button type="button" class="btn btn-primary" :disabled="confirming" @click="confirmReceipt">
          {{ confirming ? 'Confirming…' : 'I received it — release escrow' }}
        </button>
        <p v-if="confirmError" class="error-text">{{ confirmError }}</p>
      </div>

      <div v-if="isSeller && canMarkShipped" class="order-actions">
        <button type="button" class="btn btn-primary" :disabled="shipping" @click="markShipped">
          {{ shipping ? 'Saving…' : 'Mark as shipped' }}
        </button>
      </div>
    </template>
  </div>
</template>

<script setup>
definePageMeta({ layout: 'default', middleware: 'requires-auth' })
useSeoMeta({ title: 'Order - The Franks Standard', robots: 'noindex' })

const route = useRoute()
const supabase = useSupabaseClient()
const user = useSupabaseUser()

const loading = ref(true)
const order = ref(null)
const listingTitle = ref('View listing')
const confirming = ref(false)
const confirmError = ref('')
const shipping = ref(false)

const isBuyer = computed(() => order.value && user.value && order.value.buyer_id === user.value.id)
const isSeller = computed(() => order.value && user.value && order.value.seller_id === user.value.id)
const canConfirm = computed(() => order.value && ['paid', 'shipped', 'delivered'].includes(order.value.status))
const canMarkShipped = computed(() => order.value && order.value.status === 'paid')

function statusLabel (s) {
  const map = {
    pending: 'Awaiting payment',
    paid: 'Paid — in escrow',
    confirmed: 'Completed',
    shipped: 'Shipped',
    delivered: 'Delivered',
    cancelled: 'Cancelled',
    refunded: 'Refunded',
  }
  return map[s] || s
}

function escrowLabel (s) {
  const map = { none: '—', held: 'Funds held', released: 'Released to seller', refunded: 'Refunded' }
  return map[s] || s
}

function formatDate (iso) {
  if (!iso) return ''
  return new Date(iso).toLocaleString()
}

async function load () {
  loading.value = true
  order.value = null
  const id = String(route.params.id || '')
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .eq('id', id)
    .maybeSingle()
  if (!error && data) {
    order.value = data
    const { data: listing } = await supabase.from('listings').select('title').eq('id', data.listing_id).maybeSingle()
    if (listing?.title) listingTitle.value = listing.title
  }
  loading.value = false
}

async function confirmReceipt () {
  confirming.value = true
  confirmError.value = ''
  try {
    const { data, error } = await supabase.functions.invoke('confirm-order-receipt', {
      body: { order_id: order.value.id },
    })
    if (error) throw new Error(error.message)
    if (data?.error) throw new Error(String(data.error))
    await load()
  } catch (e) {
    confirmError.value = e?.message || 'Could not confirm'
  } finally {
    confirming.value = false
  }
}

async function markShipped () {
  shipping.value = true
  const { error } = await supabase
    .from('orders')
    .update({ status: 'shipped', shipped_at: new Date().toISOString() })
    .eq('id', order.value.id)
  shipping.value = false
  if (!error) await load()
}

onMounted(load)
watch(() => route.params.id, load)
</script>

<style scoped>
.order-page { padding: 40px 16px 80px; max-width: 720px; }
.order-head { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; margin-bottom: 20px; }
.order-head h1 { margin: 0; font-size: 1.6rem; }
.status-pill {
  font-size: 0.72rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.06em;
  padding: 4px 10px; border-radius: 999px; background: rgba(201, 168, 76, 0.15); color: var(--gold);
}
.order-card {
  padding: 20px; border: 1px solid #d7dde6; border-radius: var(--radius-lg);
  background: #fff; line-height: 1.7; margin-bottom: 20px;
}
.order-card a { color: var(--gold); font-weight: 600; }
.order-actions { margin-top: 16px; }
.error-text { color: #b91c1c; font-size: 0.9rem; margin-top: 8px; }
</style>
