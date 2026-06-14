<template>
  <div class="dropship-ops-page">
    <div class="container">
      <p class="eyebrow">Owner toolkit</p>
      <h1>Dropship Automation Control Room</h1>
      <p class="lead text-muted">
        This page tracks listing setup, order queueing, supplier dispatch, webhook tracking updates, and delivery status.
      </p>

      <div class="cards">
        <section class="card">
          <h2>Live queue</h2>
          <p class="text-muted small">Reads from <code>dropship_orders</code> in Supabase.</p>
          <button type="button" class="btn btn-primary btn-sm mt-2" @click="refresh" :disabled="loading">
            {{ loading ? 'Refreshing...' : 'Refresh now' }}
          </button>
          <p v-if="lastCheck" class="small text-muted mt-2">Last refresh: {{ lastCheck }}</p>

          <div class="queue-grid">
            <div class="queue-stat">
              <span class="queue-value">{{ stats.queued }}</span>
              <span class="queue-label">Queued</span>
            </div>
            <div class="queue-stat">
              <span class="queue-value">{{ stats.submitted }}</span>
              <span class="queue-label">Submitted</span>
            </div>
            <div class="queue-stat">
              <span class="queue-value">{{ stats.shipped }}</span>
              <span class="queue-label">Shipped</span>
            </div>
            <div class="queue-stat">
              <span class="queue-value">{{ stats.delivered }}</span>
              <span class="queue-label">Delivered</span>
            </div>
            <div class="queue-stat queue-stat-alert">
              <span class="queue-value">{{ stats.error }}</span>
              <span class="queue-label">Errors</span>
            </div>
          </div>
        </section>

        <section class="card ai-card">
          <h2>Full AI + automation setup</h2>
          <p class="text-muted small">Sellers use <strong>/sell/dropship-setup</strong> → “Full AI dropship setup” (generates provider, fulfillment, import steps). Platform side:</p>
          <ol class="small setup-list">
            <li>Run <code>scripts/setup-doba-automation.ps1</code> (FLXPOINT + Doba secrets + deploy functions).</li>
            <li>Confirm cron: <code>.github/workflows/dropship-dispatch-cron.yml</code> every 2–5 min.</li>
            <li>Sellers import catalog: <NuxtLink to="/sell/import">/sell/import</NuxtLink> → <strong>eBay CSV (best)</strong> tab.</li>
            <li>Each listing: dropship mode + supplier SKU + COA/guarantee.</li>
          </ol>
          <NuxtLink to="/sell/dropship-setup?ai=1" class="btn btn-primary btn-sm mt-2">Open AI dropship wizard</NuxtLink>
        </section>

        <section class="card">
          <h2>Provider setup (FLXPOINT + Doba)</h2>
          <ol class="small setup-list">
            <li>Set <code>FLXPOINT_API_KEY</code> and <code>FLXPOINT_WEBHOOK_SECRET</code> in Supabase Edge Functions secrets.</li>
            <li>If using Doba: set <code>DOBA_INVENTORY_SOURCE_SUPPLIER_ID</code> and <code>DOBA_INVENTORY_SOURCE_WAREHOUSE_ID</code>.</li>
            <li>Deploy <code>inventory-source-dispatch</code> and <code>inventory-source-webhook</code>.</li>
            <li>Point FLXPOINT webhook URL to your <code>inventory-source-webhook</code> endpoint.</li>
            <li>Run dispatch on a schedule (every 2-5 minutes).</li>
          </ol>
          <p class="small text-muted">
            Dropship listings now persist provider, channel, and supplier metadata for automation.
          </p>
        </section>
      </div>

      <section class="card mt-3">
        <h2>Recent dropship orders</h2>
        <p v-if="!rows.length && !loading" class="text-muted small">No dropship orders yet.</p>
        <div v-else class="table-wrap">
          <table class="table">
            <thead>
              <tr>
                <th>Order</th>
                <th>Status</th>
                <th>Provider</th>
                <th>Supplier Ref</th>
                <th>Tracking</th>
                <th>Updated</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="row in rows" :key="row.id">
                <td>
                  <div class="order-id">{{ row.order_id }}</div>
                  <div class="text-muted small">{{ row.listing_title }}</div>
                </td>
                <td>
                  <span class="status-pill" :class="'status-' + row.provider_status">{{ row.provider_status }}</span>
                </td>
                <td>{{ row.provider_key }}</td>
                <td>{{ row.provider_order_id || '-' }}</td>
                <td>
                  <span v-if="row.tracking_number">{{ row.tracking_carrier || 'Carrier' }} #{{ row.tracking_number }}</span>
                  <span v-else>-</span>
                </td>
                <td>{{ formatDate(row.updated_at) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup>
definePageMeta({ layout: 'default', middleware: 'ops-auth' })
useSeoMeta({ title: 'Dropship Automation - The Franks Standard', robots: 'noindex, nofollow' })

const supabase = useSupabaseClient()
const loading = ref(false)
const lastCheck = ref('')
const rows = ref([])

const stats = computed(() => {
  const by = (key) => rows.value.filter((r) => r.provider_status === key).length
  return {
    queued: by('queued'),
    submitted: by('submitted') + by('acknowledged'),
    shipped: by('shipped'),
    delivered: by('delivered'),
    error: by('error'),
  }
})

function formatDate(v) {
  if (!v) return '-'
  const d = new Date(v)
  if (Number.isNaN(d.getTime())) return '-'
  return d.toLocaleString()
}

async function refresh() {
  loading.value = true
  const { data } = await supabase
    .from('dropship_orders')
    .select('id,order_id,provider_key,provider_status,provider_order_id,updated_at,order:orders(tracking_number,tracking_carrier),listing:listings(title)')
    .order('updated_at', { ascending: false })
    .limit(100)

  rows.value = (data || []).map((r) => ({
    id: r.id,
    order_id: r.order_id,
    provider_key: r.provider_key,
    provider_status: r.provider_status || 'queued',
    provider_order_id: r.provider_order_id,
    tracking_number: r.order?.tracking_number || '',
    tracking_carrier: r.order?.tracking_carrier || '',
    listing_title: r.listing?.title || 'Listing',
    updated_at: r.updated_at,
  }))
  lastCheck.value = new Date().toLocaleString()
  loading.value = false
}

onMounted(() => {
  refresh()
})
</script>

<style scoped>
.dropship-ops-page { padding: 40px 0 80px; }
.eyebrow { font-size: 0.72rem; letter-spacing: 0.2em; text-transform: uppercase; color: var(--gold); margin-bottom: 8px; }
h1 { margin: 0 0 8px; }
.lead { max-width: 760px; margin-bottom: 24px; }
.cards { display: grid; grid-template-columns: 1fr 1fr; gap: 18px; }
@media (max-width: 900px) { .cards { grid-template-columns: 1fr; } }
.card { padding: 20px; border: 1px solid #d7dde6; border-radius: 12px; background: #fff; color: #111827; }
.small { font-size: 0.85rem; }
.setup-list { margin: 8px 0 10px; padding-left: 1.15rem; line-height: 1.6; }
.queue-grid { margin-top: 14px; display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; }
@media (max-width: 640px) { .queue-grid { grid-template-columns: repeat(2, 1fr); } }
.queue-stat { border: 1px solid #d7dde6; border-radius: 10px; background: #f8f9fb; padding: 10px 12px; display: flex; flex-direction: column; gap: 3px; }
.queue-stat-alert { border-color: #f3b7b7; background: #fff6f6; }
.queue-value { font-size: 1.1rem; font-weight: 900; color: #111827; }
.queue-label { font-size: 0.76rem; text-transform: uppercase; letter-spacing: 0.08em; color: #4b5563; font-weight: 700; }
.table-wrap { overflow-x: auto; margin-top: 10px; }
.table { width: 100%; border-collapse: collapse; font-size: 0.88rem; }
.table th, .table td { text-align: left; padding: 10px 8px; border-bottom: 1px solid #e5e7eb; vertical-align: top; color: #111827; }
.order-id { font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: 0.77rem; word-break: break-all; }
.status-pill { display: inline-flex; border-radius: 999px; padding: 3px 10px; font-size: 0.7rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.08em; border: 1px solid #d7dde6; background: #f8f9fb; }
.status-queued { background: #fff8d9; border-color: #f7ca00; }
.status-submitted, .status-acknowledged { background: #eaf6ff; border-color: #9fd9ff; }
.status-shipped { background: #e8f8ee; border-color: #8fd8ad; }
.status-delivered { background: #dbfce7; border-color: #54d38b; }
.status-error { background: #fff1f2; border-color: #f7a3ad; }
.mt-2 { margin-top: 0.5rem; }
.mt-3 { margin-top: 1rem; }
</style>
