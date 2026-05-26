<template>
  <div class="dash-page">
    <div class="container">
      <h1>Dashboard</h1>
      <p class="text-muted">Manage your listings, orders, and account</p>

      <div v-if="honorsMember" class="honors-banner">
        <span class="honors-badge">Honors member</span>
        <span>Thank you for your service{{ honorsLabel }} — Pro free until {{ honorsUntil }}.</span>
      </div>

      <div v-else-if="foundingSeller" class="founding-banner">
        <span class="founding-badge">Founding seller</span>
        <span>Pro plan free until {{ foundingUntil }} — unlimited listings &amp; featured placement during this period.</span>
      </div>

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

      <SitePromoOffers class="mt-4" :compact="true" :show-heading="false" />

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
          <li v-for="l in myListings" :key="l.id" class="dash-listing-row">
            <div class="dash-listing-main">
              <NuxtLink :to="`/listing/${l.id}`">{{ l.title }}</NuxtLink>
              <span class="text-muted small">${{ Number(l.price).toLocaleString() }} — {{ l.status }}</span>
            </div>
            <button
              v-if="l.status === 'published'"
              type="button"
              class="btn btn-outline btn-sm dash-remove-btn"
              :disabled="removingId === l.id"
              @click="removeListing(l.id)"
            >
              {{ removingId === l.id ? 'Removing…' : 'Remove' }}
            </button>
          </li>
        </ul>
        <p v-if="removeMessage" class="dash-remove-msg" role="status">{{ removeMessage }}</p>
      </div>

      <div v-if="showConnectBanner" class="connect-banner mt-4">
        <p><strong>Connect payouts.</strong> Link your bank via Stripe to receive sale proceeds automatically.</p>
        <button type="button" class="btn btn-primary btn-sm" :disabled="connectLoading" @click="startOnboarding">
          {{ connectLoading ? 'Loading…' : 'Set up Stripe payouts' }}
        </button>
        <p v-if="connectError" class="small" style="color: #b91c1c; margin-top: 8px;">{{ connectError }}</p>
      </div>

      <div class="dash-section mt-4">
        <h2>Recent Orders</h2>
        <div v-if="!recentOrders.length" class="empty-state text-center" style="padding: 40px;">
          <p style="font-size: 2rem;">🛒</p>
          <p class="text-muted mt-1">No orders yet.</p>
          <NuxtLink to="/browse" class="btn btn-outline btn-sm mt-2">Browse Marketplace</NuxtLink>
        </div>
        <ul v-else class="dash-listings">
          <li v-for="o in recentOrders" :key="o.id">
            <NuxtLink :to="`/order/${o.id}`">{{ orderLabel(o) }}</NuxtLink>
            <span class="text-muted small">${{ Number(o.amount).toLocaleString() }} — {{ o.status }}</span>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup>
definePageMeta({ layout: 'default', middleware: 'requires-auth' })
useSeoMeta({ title: 'Dashboard - The Franks Standard' })

const { isOwner } = useOwnerMode()
const supabase = useSupabaseClient()
const { loading: connectLoading, error: connectError, startOnboarding } = useStripeConnect()
const stats = reactive({ count: 0, totalSales: '0.00', pendingOrders: 0 })
const myListings = ref([])
const recentOrders = ref([])
const showConnectBanner = ref(false)
const removingId = ref(null)
const removeMessage = ref('')
const foundingSeller = ref(false)
const foundingUntil = ref('')
const honorsMember = ref(false)
const honorsUntil = ref('')
const honorsLabel = ref('')

const HONOR_LABELS = {
  veteran: ' (U.S. Military Veteran)',
  police: ' (Law Enforcement)',
  fire: ' (Firefighter)',
  ems: ' (EMS / Paramedic)',
  dispatcher: ' (911 Dispatcher)',
  corrections: ' (Corrections)',
  other: ' (First Responder)',
}

function formatFoundingDate (iso) {
  if (!iso) return ''
  try {
    return new Date(iso).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })
  } catch {
    return iso
  }
}

async function removeListing (id) {
  if (!id || removingId.value) return
  removingId.value = id
  removeMessage.value = ''
  const { error } = await supabase
    .from('listings')
    .update({ status: 'archived' })
    .eq('id', id)
  removingId.value = null
  if (error) {
    removeMessage.value = error.message || 'Could not remove listing.'
    return
  }
  myListings.value = myListings.value.map((l) =>
    l.id === id ? { ...l, status: 'archived' } : l
  )
  stats.count = myListings.value.filter((l) => l.status === 'published').length
  removeMessage.value = 'Listing removed from the marketplace.'
}

function orderLabel (o) {
  return o.listing_title || `Order ${o.id.slice(0, 8)}`
}

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
  if (!error) {
    myListings.value = data || []
    stats.count = myListings.value.filter((l) => l.status === 'published').length
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('stripe_account_id, stripe_charges_enabled, account_type, founding_seller, honors_member, service_category, pro_free_until')
    .eq('id', user.id)
    .maybeSingle()

  if (profile?.pro_free_until) {
    const until = new Date(profile.pro_free_until)
    if (until > new Date()) {
      if (profile.honors_member) {
        honorsMember.value = true
        honorsUntil.value = formatFoundingDate(profile.pro_free_until)
        honorsLabel.value = HONOR_LABELS[profile.service_category] || ''
      } else if (profile.founding_seller) {
        foundingSeller.value = true
        foundingUntil.value = formatFoundingDate(profile.pro_free_until)
      }
    }
  }

  showConnectBanner.value = !isOwner.value
    && !profile?.stripe_charges_enabled
    && (profile?.account_type === 'seller' || myListings.value.length > 0)

  const { data: orders } = await supabase
    .from('orders')
    .select('id, amount, status, created_at, listing_id, buyer_id, seller_id')
    .or(`buyer_id.eq.${user.id},seller_id.eq.${user.id}`)
    .order('created_at', { ascending: false })
    .limit(20)

  recentOrders.value = orders || []
  stats.pendingOrders = recentOrders.value.filter((o) => o.status === 'pending').length
  const paidTotal = recentOrders.value
    .filter((o) => o.seller_id === user.id && ['paid', 'confirmed', 'shipped', 'delivered'].includes(o.status))
    .reduce((sum, o) => sum + Number(o.amount || 0), 0)
  stats.totalSales = paidTotal.toFixed(2)

  if (stats.pendingOrders > 0) {
    const { data: reconciled } = await supabase.functions.invoke('reconcile-orders', { body: {} })
    if (reconciled?.summary?.paid || reconciled?.summary?.cancelled) {
      const { data: refreshed } = await supabase
        .from('orders')
        .select('id, amount, status, created_at, listing_id, buyer_id, seller_id')
        .or(`buyer_id.eq.${user.id},seller_id.eq.${user.id}`)
        .order('created_at', { ascending: false })
        .limit(20)
      if (refreshed) {
        recentOrders.value = refreshed
        stats.pendingOrders = refreshed.filter((o) => o.status === 'pending').length
      }
    }
  }
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
.stat-label {
  font-size: 0.85rem;
  color: #d1d5db !important;
  -webkit-text-fill-color: #d1d5db !important;
  margin-bottom: 6px;
  font-weight: 700;
}
.stat-value {
  font-size: 2rem;
  font-weight: 700;
  color: var(--gold) !important;
  -webkit-text-fill-color: var(--gold) !important;
  font-family: 'Cinzel', serif;
}
.dash-section {
  background: var(--stone-900);
  border: 1px solid var(--stone-800);
  border-radius: var(--radius-lg);
  padding: 24px;
}
.dash-section h2 { font-size: 1.2rem; color: var(--gold); }
.dash-listings { list-style: none; margin: 0; padding: 0; }
.dash-listing-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
}
.dash-listing-main { display: flex; flex-direction: column; gap: 4px; min-width: 0; }
.dash-remove-btn { flex-shrink: 0; }
.dash-remove-msg { margin-top: 10px; font-size: 0.88rem; color: var(--gold); }
.dash-listings li {
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
.founding-banner {
  display: flex; flex-wrap: wrap; align-items: center; gap: 10px;
  margin-top: 14px; padding: 14px 18px;
  background: linear-gradient(135deg, rgba(4, 120, 87, 0.1), rgba(201, 168, 76, 0.08));
  border: 1px solid rgba(4, 120, 87, 0.3); border-radius: var(--radius-lg);
  font-size: 0.88rem; color: var(--stone-200); line-height: 1.5;
}
.founding-badge {
  display: inline-flex; padding: 4px 12px; border-radius: 999px;
  font-size: 0.72rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.1em;
  background: rgba(4, 120, 87, 0.2); color: #6ee7b7; border: 1px solid rgba(4, 120, 87, 0.4);
}
.honors-banner {
  display: flex; flex-wrap: wrap; align-items: center; gap: 10px;
  margin-top: 14px; padding: 14px 18px;
  background: linear-gradient(135deg, rgba(37, 99, 235, 0.12), rgba(201, 168, 76, 0.08));
  border: 1px solid rgba(147, 197, 253, 0.35); border-radius: var(--radius-lg);
  font-size: 0.88rem; color: var(--stone-200); line-height: 1.5;
}
.honors-badge {
  display: inline-flex; padding: 4px 12px; border-radius: 999px;
  font-size: 0.72rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.1em;
  background: rgba(37, 99, 235, 0.25); color: #93c5fd; border: 1px solid rgba(147, 197, 253, 0.45);
}
.connect-banner {
  padding: 18px 20px; border-radius: var(--radius-lg);
  border: 1px solid rgba(201, 168, 76, 0.35);
  background: rgba(201, 168, 76, 0.08);
}
.connect-banner p { margin: 0 0 12px; color: #1f2937; }
</style>
