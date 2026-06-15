<script setup>
import { DEFAULT_PRIVATE_TXN_LEDGER } from '~/utils/privateTxnLedgerDefaults.js'
import { getStoredOpsPhrase } from '~/utils/opsClientAuth'

const emit = defineEmits(['saved', 'error'])

const loading = ref(true)
const saving = ref(false)
const message = ref('')
const loadError = ref('')
const rows = ref([])
const newTx = ref({ account: '', desc: '', amount: '' })

async function load () {
  loading.value = true
  loadError.value = ''
  message.value = ''
  try {
    const data = await opsFetch('/api/ops/site-content', { query: { keys: 'privateTxnLedger' } })
    const txs = data?.privateTxnLedger?.transactions
    rows.value = Array.isArray(txs) ? [...txs] : [...DEFAULT_PRIVATE_TXN_LEDGER.transactions]
  } catch (e) {
    rows.value = [...DEFAULT_PRIVATE_TXN_LEDGER.transactions]
    loadError.value = e?.data?.statusMessage || 'Using local starter rows — cloud copy unavailable.'
  } finally {
    loading.value = false
  }
}

function addRow (isCredit) {
  const amt = parseFloat(newTx.value.amount)
  if (!newTx.value.account || !Number.isFinite(amt)) return
  rows.value.unshift({
    id: `tx-${Date.now()}`,
    date: new Date().toISOString().replace('T', ' ').slice(0, 16),
    account: newTx.value.account.toUpperCase(),
    desc: newTx.value.desc || 'Manual entry',
    amount: `${isCredit ? '+' : '-'}$${amt.toFixed(2)}`,
    isCredit,
  })
  newTx.value = { account: '', desc: '', amount: '' }
}

function removeRow (id) {
  rows.value = rows.value.filter((r) => r.id !== id)
}

async function save () {
  saving.value = true
  message.value = ''
  if (!getStoredOpsPhrase()) {
    loadError.value = 'Owner password needed — tap the B&C logo 5×, unlock, then save again.'
    saving.value = false
    return
  }
  try {
    await opsFetch('/api/ops/site-content', {
      method: 'PUT',
      body: {
        contentKey: 'privateTxnLedger',
        payload: { transactions: rows.value },
      },
    })
    message.value = 'Transaction ledger saved to cloud.'
    emit('saved')
  } catch (e) {
    loadError.value = e?.data?.statusMessage || e?.message || 'Save failed'
    emit('error', loadError.value)
  } finally {
    saving.value = false
  }
}

onMounted(load)
</script>

<template>
  <div class="bc-ledger">
    <p v-if="loadError" class="bc-alert bc-alert--err">{{ loadError }}</p>
    <p v-if="message" class="bc-alert bc-alert--ok">{{ message }}</p>
    <p class="bc-ledger__note">
      Private ledger for Stripe revenue, Louisiana tax reserve (25%), Mercury bank, and Petra wholesale clearing.
    </p>
    <div v-if="loading" class="bc-muted">Loading ledger…</div>
    <template v-else>
      <div class="bc-ledger__form">
        <input v-model="newTx.account" class="input" placeholder="Account (STRIPE-REVENUE)">
        <input v-model="newTx.desc" class="input" placeholder="Description">
        <input v-model="newTx.amount" class="input" type="number" step="0.01" min="0" placeholder="Amount">
        <button type="button" class="btn btn-outline btn-sm" @click="addRow(true)">Add credit</button>
        <button type="button" class="btn btn-outline btn-sm" @click="addRow(false)">Add debit</button>
      </div>
      <div class="bc-ledger__table-wrap">
        <table class="bc-ledger__table">
          <thead>
            <tr><th>Date</th><th>Account</th><th>Description</th><th>Amount</th><th /></tr>
          </thead>
          <tbody>
            <tr v-for="row in rows" :key="row.id">
              <td>{{ row.date }}</td>
              <td>{{ row.account }}</td>
              <td>{{ row.desc }}</td>
              <td :class="row.isCredit ? 'is-credit' : 'is-debit'">{{ row.amount }}</td>
              <td><button type="button" class="btn btn-outline btn-sm" @click="removeRow(row.id)">Remove</button></td>
            </tr>
          </tbody>
        </table>
      </div>
      <button type="button" class="btn btn-primary btn-sm" :disabled="saving" @click="save">
        {{ saving ? 'Saving…' : 'Save ledger' }}
      </button>
    </template>
  </div>
</template>

<style scoped>
.bc-ledger__note { font-size: 0.88rem; color: #b8bcc6; margin: 0 0 12px; line-height: 1.5; }
.bc-ledger__form { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 12px; }
.bc-ledger__form .input { flex: 1 1 140px; min-width: 120px; }
.bc-ledger__table-wrap { overflow-x: auto; margin-bottom: 12px; }
.bc-ledger__table { width: 100%; border-collapse: collapse; font-size: 0.85rem; }
.bc-ledger__table th, .bc-ledger__table td { padding: 8px; border-bottom: 1px solid rgba(255,255,255,0.08); text-align: left; }
.bc-ledger__table th { color: #9ca3af; font-size: 0.72rem; text-transform: uppercase; }
.is-credit { color: #4ade80; font-weight: 700; }
.is-debit { color: #ff8a80; font-weight: 700; }
.bc-alert { padding: 10px 12px; border-radius: 8px; margin: 10px 0; font-size: 0.88rem; }
.bc-alert--err { background: rgba(211,47,47,0.15); color: #ff8a80; }
.bc-alert--ok { background: rgba(74,222,128,0.1); color: #4ade80; }
.bc-muted { color: #7a8190; font-size: 0.88rem; }
</style>
