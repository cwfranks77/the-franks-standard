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

      <div v-if="accountFrozen" class="freeze-banner">
        <strong>Account frozen</strong>
        <p>{{ freezeMessage }}</p>
        <p class="text-muted small">Repay the balance to info@thefranksstandard.com. After payment, your account may still be permanently closed per policy.</p>
      </div>

      <div class="quick-actions">
        <NuxtLink v-if="!isOwner" to="/pay" class="btn btn-primary btn-sm">Pay fees (Stripe)</NuxtLink>
        <NuxtLink v-else to="/ops/panel" class="btn btn-primary btn-sm">Owner toolkit</NuxtLink>
        <NuxtLink to="/sell" class="btn btn-primary btn-sm">+ New Listing</NuxtLink>
        <NuxtLink to="/sell/import" class="btn btn-outline btn-sm">Import from eBay / CSV</NuxtLink>
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

      <div v-if="connectMessage" class="connect-status mt-4" :class="connectMessage.tone">
        <p><strong>{{ connectMessage.title }}</strong> {{ connectMessage.body }}</p>
      </div>

      <div v-if="showConnectBanner" class="connect-banner mt-4">
        <p><strong>Connect payouts.</strong> Link your bank via Stripe to receive sale proceeds automatically. Buyers pay through escrow; funds route to you when Connect is active.</p>
        <div class="connect-actions">
          <button type="button" class="btn btn-primary btn-sm" :disabled="connectLoading" @click="startOnboarding">
            {{ connectLoading ? 'Loading…' : (hasConnectAccount ? 'Finish Stripe setup' : 'Set up Stripe payouts') }}
          </button>
          <button
            v-if="hasConnectAccount"
            type="button"
            class="btn btn-outline btn-sm"
            :disabled="connectSyncing"
            @click="refreshConnect"
          >
            {{ connectSyncing ? 'Syncing…' : 'Refresh payout status' }}
          </button>
        </div>
        <p v-if="connectError" class="connect-err">{{ connectError }}</p>
      </div>

      <div class="dash-section mt-4">
        <div class="dash-section-header">
          <h2>Dropship orders to fulfill</h2>
          <NuxtLink to="/sell/dropship-setup" class="btn btn-outline btn-sm">Dropship setup</NuxtLink>
        </div>
        <p v-if="!dropshipSetupComplete" class="text-muted small">
          <NuxtLink to="/sell/dropship-setup">Complete dropship setup</NuxtLink> to choose your supplier and fulfillment mode.
        </p>
        <div v-if="!dropshipFulfill.length" class="empty-state text-center" style="padding: 32px;">
          <p class="text-muted">No dropship orders waiting on you.</p>
        </div>
        <ul v-else class="dash-listings dropship-fulfill-list">
          <li v-for="d in dropshipFulfill" :key="d.id" class="dropship-fulfill-row">
            <div class="dash-listing-main">
              <NuxtLink :to="`/order/${d.order_id}`">{{ d.listing_title || 'Order' }}</NuxtLink>
              <span class="text-muted small">
                {{ d.provider_status }} · SKU {{ d.supplier_sku || '—' }} · {{ formatDate(d.created_at) }}
              </span>
              <span v-if="d.buyer_email" class="text-muted small">Buyer: {{ d.buyer_email }}</span>
              <span v-if="d.shipping_line" class="text-muted small">Ship to: {{ d.shipping_line }}</span>
            </div>
            <NuxtLink :to="`/order/${d.order_id}`" class="btn btn-primary btn-sm">Fulfill</NuxtLink>
          </li>
        </ul>
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
import { useSellerDropship } from '~/composables/useSellerDropship.js'

definePageMeta({ layout: 'default', middleware: 'requires-auth' })
useSeoMeta({ title: 'Dashboard - The Franks Standard' })

const { isOwner } = useOwnerMode()
const { loadFreezeState, freezeAlertMessage } = useAccountFreeze()
const supabase = useSupabaseClient()
const accountFrozen = ref(false)
const freezeMessage = ref('')
const route = useRoute()
const {
  loading: connectLoading,
  syncing: connectSyncing,
  error: connectError,
  status: connectStatus,
  startOnboarding,
  syncStatus,
} = useStripeConnect()
const hasConnectAccount = ref(false)
const connectMessage = ref(null)
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
const dropshipFulfill = ref([])

const { setupComplete: dropshipSetupComplete, load: loadSellerDropship } = useSellerDropship()

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
  if (accountFrozen.value) {
    removeMessage.value = freezeMessage.value
    return
  }
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

function formatDate (iso) {
  if (!iso) return ''
  try {
    return new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
  } catch {
    return iso
  }
}

function shippingLineFromPayload (payload) {
  if (!payload || typeof payload !== 'object') return ''
  const addr = payload.shipping_address
  if (!addr || typeof addr !== 'object') return ''
  const parts = [addr.line1, addr.city, addr.state, addr.postal_code].filter(Boolean)
  return parts.join(', ')
}

function skuFromPayload (payload) {
  if (!payload || typeof payload !== 'object') return ''
  const items = Array.isArray(payload.line_items) ? payload.line_items : []
  const first = items[0]
  if (!first || typeof first !== 'object') return ''
  return String(first.sku || '').trim()
}

async function loadDropshipFulfill (userId) {
  const { data, error } = await supabase
    .from('dropship_orders')
    .select('id, order_id, provider_status, supplier_payload, created_at, listing_id')
    .eq('seller_id', userId)
    .in('provider_status', ['awaiting_seller', 'manual_fulfillment'])
    .order('created_at', { ascending: false })
    .limit(20)

  if (error) {
    console.warn('[dashboard] dropship_orders', error.message)
    return
  }

  const rows = data || []
  const listingIds = [...new Set(rows.map((r) => r.listing_id).filter(Boolean))]
  let titles = {}
  if (listingIds.length) {
    const { data: listings } = await supabase.from('listings').select('id, title').in('id', listingIds)
    titles = Object.fromEntries((listings || []).map((l) => [l.id, l.title]))
  }

  const orderIds = [...new Set(rows.map((r) => r.order_id).filter(Boolean))]
  let buyerEmails = {}
  if (orderIds.length) {
    const { data: orders } = await supabase.from('orders').select('id, buyer_email').in('id', orderIds)
    buyerEmails = Object.fromEntries((orders || []).map((o) => [o.id, o.buyer_email]))
  }

  dropshipFulfill.value = rows.map((r) => ({
    id: r.id,
    order_id: r.order_id,
    provider_status: r.provider_status,
    created_at: r.created_at,
    listing_title: titles[r.listing_id] || null,
    buyer_email: buyerEmails[r.order_id] || r.supplier_payload?.customer?.email || null,
    supplier_sku: skuFromPayload(r.supplier_payload),
    shipping_line: shippingLineFromPayload(r.supplier_payload),
  }))
}

onMounted(async () => {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return
  }

  await loadSellerDropship()
  await loadDropshipFulfill(user.id)

  const freeze = await loadFreezeState(user.id)
  if (freeze.frozen) {
    accountFrozen.value = true
    freezeMessage.value = freezeAlertMessage(freeze.profile)
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

  hasConnectAccount.value = !!profile?.stripe_account_id
  showConnectBanner.value = !isOwner.value
    && !profile?.stripe_charges_enabled
    && (profile?.account_type === 'seller' || profile?.account_type === 'both' || myListings.value.length > 0)

  if (profile?.stripe_charges_enabled) {
    connectMessage.value = {
      tone: 'connect-ok',
      title: 'Payouts active.',
      body: 'Stripe Connect is enabled — sale proceeds can transfer to your linked account.',
    }
  } else if (route.query.connect === 'done') {
    connectMessage.value = {
      tone: 'connect-pending',
      title: 'Stripe setup submitted.',
      body: 'We are syncing your account. If payouts are not active in a minute, tap Refresh payout status.',
    }
    await syncStatus()
    if (connectStatus.value?.stripe_charges_enabled) {
      showConnectBanner.value = false
      connectMessage.value = {
        tone: 'connect-ok',
        title: 'Payouts active.',
        body: 'Your Stripe account is ready to receive funds.',
      }
    }
  } else if (route.query.connect === 'refresh') {
    connectMessage.value = {
      tone: 'connect-pending',
      title: 'Continue setup.',
      body: 'Your Stripe session expired — tap Set up Stripe payouts to continue.',
    }
  }

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

async function refreshConnect () {
  const data = await syncStatus()
  if (data?.stripe_charges_enabled) {
    showConnectBanner.value = false
    connectMessage.value = {
      tone: 'connect-ok',
      title: 'Payouts active.',
      body: 'Stripe Connect is enabled on your account.',
    }
  } else if (data?.synced) {
    connectMessage.value = {
      tone: 'connect-pending',
      title: 'Still finishing setup.',
      body: 'Complete any remaining steps in Stripe, then refresh again.',
    }
  }
}
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
.freeze-banner {
  margin-top: 1rem;
  padding: 16px 20px;
  background: rgba(139, 38, 53, 0.15);
  border: 1px solid #8b2635;
  border-radius: var(--radius-lg);
}
.freeze-banner strong { color: #e8a0a8; display: block; margin-bottom: 6px; }
.freeze-banner p { margin: 0; font-size: 0.9rem; line-height: 1.5; color: #f0d0d4; }

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
.dropship-fulfill-row {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
}
.connect-banner p { margin: 0 0 12px; color: var(--stone-200); }
.connect-actions { display: flex; flex-wrap: wrap; gap: 10px; }
.connect-err { margin-top: 8px; font-size: 0.85rem; color: #fca5a5; }
.connect-status {
  padding: 14px 18px;
  border-radius: var(--radius-lg);
  font-size: 0.9rem;
  line-height: 1.5;
}
.connect-status p { margin: 0; color: var(--stone-200); }
.connect-status strong { color: var(--gold); margin-right: 6px; }
.connect-ok {
  border: 1px solid rgba(0, 245, 160, 0.35);
  background: rgba(0, 245, 160, 0.08);
}
.connect-pending {
  border: 1px solid rgba(201, 168, 76, 0.35);
  background: rgba(201, 168, 76, 0.08);
}
</style>
