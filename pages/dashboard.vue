<template>
  <div class="dash-page">
    <div class="container">
      <h1>Dashboard</h1>
      <p class="text-muted">Manage your listings, orders, and account</p>

      <div v-if="isOwner" class="owner-banner">
        <span class="owner-badge-dash">Owner mode</span>
        <span class="owner-fee-text">All fees waived — list freely, sell without charges</span>
      </div>

      <div class="quick-actions">
        <NuxtLink v-if="!isOwner" to="/pay" class="btn btn-primary btn-sm">Pay fees (Stripe)</NuxtLink>
        <NuxtLink v-else to="/ops/panel" class="btn btn-primary btn-sm">Owner toolkit</NuxtLink>
        <NuxtLink to="/sell" class="btn btn-primary btn-sm">+ New Listing</NuxtLink>
        <NuxtLink to="/video" class="btn btn-outline btn-sm">Start a video call</NuxtLink>
      </div>

      <div class="grid grid-3 mt-4">
        <div class="stat-card hover-lift">
          <p class="stat-label">Active Listings</p>
          <p class="stat-value">{{ stats.count }}</p>
        </div>
        <div class="stat-card hover-lift">
          <p class="stat-label">Total Sales</p>
          <p class="stat-value">${{ stats.totalSales }}</p>
        </div>
        <div class="stat-card hover-lift">
          <p class="stat-label">Pending Orders</p>
          <p class="stat-value">{{ stats.pendingOrders }}</p>
        </div>
      </div>

      <div class="dash-section mt-4">
        <div class="dash-section-header">
          <h2>My Listings</h2>
          <NuxtLink to="/sell" class="btn btn-primary btn-sm">+ New Listing</NuxtLink>
        </div>
        <div v-if="!myListings.length" class="empty-state text-center" style="padding: 40px;">
          <p style="font-size: 2rem;">🏛️</p>
          <p class="text-muted mt-1">You haven't listed anything yet.</p>
          <NuxtLink to="/sell" class="btn btn-outline btn-sm mt-2">Create Your First Listing</NuxtLink>
        </div>
        <ul v-else class="dash-listings">
          <li v-for="l in myListings" :key="l.id">
            <NuxtLink :to="`/listing/${l.id}`">{{ l.title }}</NuxtLink>
            <span class="text-muted small">${{ Number(l.price).toLocaleString() }} — {{ l.status }}</span>
          </li>
        </ul>
      </div>

      <div class="dash-section mt-4">
        <h2>Recent Orders</h2>
        <div class="empty-state text-center" style="padding: 40px;">
          <p style="font-size: 2rem;">🛒</p>
          <p class="text-muted mt-1">No orders yet. Start browsing the floor!</p>
          <NuxtLink to="/browse" class="btn btn-outline btn-sm mt-2">Browse Marketplace</NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
definePageMeta({ layout: 'default', middleware: 'requires-auth' })
useSeoMeta({ title: 'Dashboard - The Franks Standard' })

const { isOwner } = useOwnerMode()
const supabase = useSupabaseClient()
const stats = reactive({ count: 0, totalSales: '0.00', pendingOrders: 0 })
const myListings = ref([])

onMounted(async () => {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return
  }
  const { data, error } = await supabase
    .from('listings')
    .select('id, title, price, status, created_at')
    .eq('seller_id', user.id)
    .order('created_at', { ascending: false })
  if (error) {
    return
  }
  myListings.value = data || []
  stats.count = myListings.value.filter((l) => l.status === 'published').length
})
</script>

<style scoped>
.dash-page { padding: 40px 0; }
.quick-actions { display: flex; flex-wrap: wrap; gap: 10px; margin-top: 1rem; }
.dash-page h1 { font-size: 2rem; }
.stat-card {
  padding: 24px;
  background: var(--stone-900);
  border: 1px solid var(--stone-800);
  border-radius: var(--radius-lg);
  text-align: center;
}
.stat-label { font-size: 0.85rem; color: var(--stone-400); margin-bottom: 6px; }
.stat-value { font-size: 2rem; font-weight: 700; color: var(--gold); font-family: 'Cinzel', serif; }
.dash-section {
  background: var(--stone-900);
  border: 1px solid var(--stone-800);
  border-radius: var(--radius-lg);
  padding: 24px;
}
.dash-section h2 { font-size: 1.2rem; color: var(--gold); }
.dash-listings { list-style: none; margin: 0; padding: 0; }
.dash-listings li {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  padding: 10px 0;
  border-bottom: 1px solid var(--stone-800);
}
.dash-listings a { color: var(--stone-100); text-decoration: none; }
.dash-listings a:hover { color: var(--gold); }
.dash-listings .small { font-size: 0.8rem; }
.dash-section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}
.owner-banner {
  display: flex; flex-wrap: wrap; align-items: center; gap: 10px;
  margin-top: 14px; padding: 14px 18px;
  background: linear-gradient(135deg, rgba(0, 245, 160, 0.08), rgba(201, 168, 76, 0.08));
  border: 1px solid rgba(0, 245, 160, 0.25); border-radius: var(--radius-lg);
}
.owner-badge-dash {
  display: inline-flex; align-items: center; gap: 4px;
  padding: 4px 12px; border-radius: 999px;
  font-size: 0.72rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.1em;
  background: rgba(201, 168, 76, 0.18); color: var(--gold); border: 1px solid rgba(201, 168, 76, 0.4);
}
.owner-fee-text { font-size: 0.88rem; color: var(--trust-green); font-weight: 600; }
</style>
