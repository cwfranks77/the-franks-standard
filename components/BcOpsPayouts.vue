<script setup>
import { getStoredOpsPhrase } from '~/utils/opsClientAuth'
import { BC_PLATFORM_LINKS } from '~/utils/bcMarketingAutomation.js'

const rows = ref([])
const loading = ref(false)
const error = ref('')
const message = ref('')
const connectUrl = ref('')
const form = ref({
  sellerId: 'petra-distributor',
  amount: 0,
  email: '',
})

function opsErrorMessage (e, fallback) {
  const data = e?.data
  if (data && typeof data === 'object') return String(data.error || data.statusMessage || fallback)
  return String(e?.message || fallback)
}

async function load () {
  loading.value = true
  error.value = ''
  try {
    const data = await opsFetch('/api/ops/bc-payouts')
    rows.value = data?.rows || []
    if (data?.message) error.value = data.message
  } catch (e) {
    error.value = opsErrorMessage(e, 'Could not load payouts.')
  } finally {
    loading.value = false
  }
}

async function queuePayout () {
  message.value = ''
  error.value = ''
  if (!getStoredOpsPhrase()) {
    error.value = 'Owner password needed — tap the B&C logo 5× and unlock first.'
    return
  }
  if (!form.value.sellerId || !Number(form.value.amount)) {
    error.value = 'Enter seller ID and payout amount.'
    return
  }
  loading.value = true
  try {
    await opsFetch('/api/ops/bc-payouts', { method: 'POST', body: { ...form.value } })
    message.value = 'Payout queued. Remember your 25% tax reserve stays in the ledger tab.'
    form.value.amount = 0
    await load()
  } catch (e) {
    error.value = opsErrorMessage(e, 'Could not queue payout.')
  } finally {
    loading.value = false
  }
}

async function transfer (row) {
  if (!getStoredOpsPhrase()) {
    error.value = 'Owner password needed — unlock first.'
    return
  }
  loading.value = true
  message.value = ''
  try {
    await opsFetch('/api/ops/bc-payouts-transfer', { method: 'POST', body: { payoutId: row.id } })
    message.value = 'Stripe transfer sent.'
    await load()
  } catch (e) {
    error.value = opsErrorMessage(e, 'Transfer failed — is the seller onboarded?')
  } finally {
    loading.value = false
  }
}

async function onboardSeller () {
  if (!getStoredOpsPhrase()) {
    error.value = 'Owner password needed — unlock first.'
    return
  }
  loading.value = true
  try {
    const data = await opsFetch('/api/ops/bc-connect-onboard', {
      method: 'POST',
      body: { sellerId: form.value.sellerId, email: form.value.email },
    })
    connectUrl.value = data?.url || ''
    message.value = 'Stripe Connect link ready — open it to finish seller onboarding.'
  } catch (e) {
    error.value = opsErrorMessage(e, 'Connect onboarding failed.')
  } finally {
    loading.value = false
  }
}

function formatDate (v) {
  if (!v) return '—'
  const d = new Date(v)
  return Number.isNaN(d.getTime()) ? '—' : d.toLocaleString()
}

onMounted(load)
</script>

<template>
  <div>
    <p class="bc-muted">Seller payouts via Stripe Connect. Tax reserve (25%) is tracked separately in Transactions &amp; tax.</p>
    <p v-if="error" class="bc-alert bc-alert--err">{{ error }}</p>
    <p v-if="message" class="bc-alert bc-alert--ok">{{ message }}</p>

    <div class="bc-form-stack">
      <label>Seller ID<input v-model="form.sellerId" class="input" type="text"></label>
      <label>Seller email (Connect)<input v-model="form.email" class="input" type="email" placeholder="for Stripe onboarding"></label>
      <label>Payout amount ($)<input v-model.number="form.amount" class="input" type="number" min="0" step="0.01"></label>
      <div class="bc-panel__actions">
        <button type="button" class="btn btn-primary btn-sm" :disabled="loading" @click="queuePayout">Queue payout</button>
        <button type="button" class="btn btn-outline btn-sm" :disabled="loading" @click="onboardSeller">Stripe Connect link</button>
        <a v-if="connectUrl" :href="connectUrl" target="_blank" rel="noopener noreferrer" class="btn btn-outline btn-sm">Open onboarding ↗</a>
      </div>
    </div>

    <button type="button" class="btn btn-outline btn-sm" :disabled="loading" @click="load">Refresh</button>
    <a :href="BC_PLATFORM_LINKS.stripe_payouts" target="_blank" rel="noopener noreferrer" class="btn btn-outline btn-sm">Stripe payouts ↗</a>

    <div v-if="rows.length" class="bc-table-wrap">
      <table class="bc-table">
        <thead>
          <tr>
            <th>Seller</th>
            <th>Amount</th>
            <th>Status</th>
            <th>Created</th>
            <th />
          </tr>
        </thead>
        <tbody>
          <tr v-for="row in rows" :key="row.id">
            <td>{{ row.seller_id }}</td>
            <td>${{ Number(row.amount).toFixed(2) }}</td>
            <td><span class="bc-status">{{ row.status }}</span></td>
            <td class="bc-muted small">{{ formatDate(row.created_at) }}</td>
            <td>
              <button v-if="row.status === 'pending'" type="button" class="btn btn-outline btn-sm" @click="transfer(row)">Send transfer</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <p v-else-if="!loading" class="bc-muted">No payouts queued yet.</p>
  </div>
</template>

<style scoped>
.bc-form-stack { display: flex; flex-direction: column; gap: 12px; margin-bottom: 14px; max-width: 420px; }
.bc-form-stack label { display: flex; flex-direction: column; gap: 6px; font-size: 0.72rem; font-weight: 700; text-transform: uppercase; color: #9ca3af; }
.bc-panel__actions { display: flex; flex-wrap: wrap; gap: 8px; }
.bc-table-wrap { overflow-x: auto; margin-top: 14px; }
.bc-table { width: 100%; border-collapse: collapse; font-size: 0.85rem; }
.bc-table th, .bc-table td { padding: 10px 8px; border-bottom: 1px solid rgba(255,255,255,0.08); text-align: left; }
.bc-table th { color: #9ca3af; font-size: 0.72rem; text-transform: uppercase; }
.bc-status { text-transform: capitalize; color: #ff5252; font-weight: 600; }
.bc-muted { color: #7a8190; font-size: 0.88rem; margin-bottom: 10px; }
.bc-muted.small { font-size: 0.78rem; }
.bc-alert { padding: 10px 12px; border-radius: 8px; margin: 10px 0; font-size: 0.88rem; }
.bc-alert--err { background: rgba(211,47,47,0.15); color: #ff8a80; }
.bc-alert--ok { background: rgba(74,222,128,0.1); color: #4ade80; }
</style>
