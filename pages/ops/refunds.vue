<template>
  <div class="refund-ops-page">
    <div class="container">
      <p class="eyebrow">Owner toolkit</p>
      <h1>Forced buyer refunds</h1>
      <p class="lead text-muted">
        When a seller will not honor a refund (counterfeit, not as described, upheld dispute), issue a full Stripe
        refund from escrow or reverse Connect transfers. Buyer receives funds back; order is marked refunded.
        Seller-at-fault refunds <strong>freeze the seller account</strong> (no buy/sell/listing edits; escrow held) until they repay the platform.
      </p>

      <section class="card panel">
        <h2>Refund by order ID</h2>
        <form class="refund-form" @submit.prevent="lookupOrder">
          <label>
            Order UUID
            <input v-model="orderIdInput" type="text" class="input" placeholder="Order id from dashboard or Stripe metadata" required>
          </label>
          <button type="submit" class="btn btn-outline btn-sm" :disabled="busy">Look up</button>
        </form>

        <div v-if="selectedOrder" class="order-detail">
          <p><strong>Status:</strong> {{ selectedOrder.status }} · <strong>Escrow:</strong> {{ selectedOrder.escrow_status }}</p>
          <p><strong>Amount:</strong> ${{ Number(selectedOrder.amount).toLocaleString() }}
            <span v-if="selectedOrder.total_paid"> (paid ${{ Number(selectedOrder.total_paid).toLocaleString() }} incl. tax)</span>
          </p>
          <p v-if="selectedOrder.buyer_email" class="text-muted small">Buyer: {{ selectedOrder.buyer_email }}</p>
          <p v-if="selectedOrder.stripe_payment_intent_id" class="text-muted small">PI: {{ selectedOrder.stripe_payment_intent_id.slice(0, 20) }}…</p>
          <p v-if="selectedOrder.stripe_refund_id" class="warn-text">Already refunded ({{ selectedOrder.stripe_refund_id }})</p>
          <p v-else-if="!canRefundSelected" class="warn-text">This order cannot be force-refunded in its current status.</p>

          <div v-if="canRefundSelected" class="refund-actions">
            <label>
              Reason
              <select v-model="refundReason" class="input">
                <option value="seller_failed_refund">Seller failed to refund</option>
                <option value="counterfeit">Counterfeit / fake</option>
                <option value="not_as_described">Not as described</option>
                <option value="dispute_upheld">Dispute upheld</option>
                <option value="ops_other">Other (ops)</option>
              </select>
            </label>
            <label>
              Ops note (optional)
              <input v-model="opsNote" type="text" class="input" placeholder="Case ref, report id, etc.">
            </label>
            <label>
              Authenticity report ID (optional)
              <input v-model="reportId" type="text" class="input" placeholder="Links refund to report">
            </label>
            <button
              type="button"
              class="btn btn-primary danger"
              :disabled="busy || confirming"
              @click="runDryRun"
            >
              {{ busy ? '…' : 'Dry run' }}
            </button>
            <button
              type="button"
              class="btn btn-primary danger"
              :disabled="busy || confirming"
              @click="runForceRefund"
            >
              {{ confirming ? 'Refunding…' : 'Force full refund' }}
            </button>
          </div>
        </div>
        <p v-if="lastError" class="error-text">{{ lastError }}</p>
        <p v-if="lastSuccess" class="success-text">{{ lastSuccess }}</p>
      </section>

      <section class="card panel">
        <h2>Frozen sellers (debt recovery)</h2>
        <button type="button" class="btn btn-outline btn-sm mb-2" :disabled="busy" @click="loadFrozen">Refresh</button>
        <div v-if="!frozenSellers.length" class="text-muted">No sellers awaiting repayment.</div>
        <div v-for="s in frozenSellers" :key="s.id" class="queue-row">
          <div>
            <strong>Owes ${{ Number(s.seller_debt_balance).toLocaleString() }}</strong>
            <p class="text-muted small">{{ s.id }}</p>
            <p class="text-muted small">{{ s.account_freeze_reason?.slice(0, 100) }}…</p>
            <p v-if="s.seller_debt_order_id" class="text-muted small">Order: {{ s.seller_debt_order_id }}</p>
          </div>
          <div class="queue-actions col">
            <button type="button" class="btn btn-primary btn-sm" @click="markPaid(s.id, false)">Mark paid — unfreeze</button>
            <button type="button" class="btn btn-outline btn-sm danger" @click="markPaid(s.id, true)">Paid + permanent ban</button>
            <button type="button" class="btn btn-outline btn-sm danger" @click="banOnly(s.id)">Ban (still frozen)</button>
          </div>
        </div>
      </section>

      <section class="card panel">
        <h2>Recent refundable orders</h2>
        <button type="button" class="btn btn-outline btn-sm mb-2" :disabled="busy" @click="loadList">Refresh</button>
        <div v-if="!refundableList.length" class="text-muted">None loaded.</div>
        <div v-for="o in refundableList" :key="o.id" class="queue-row">
          <div>
            <strong>${{ Number(o.amount).toLocaleString() }}</strong>
            <span class="status-pill">{{ o.status }}</span>
            <p class="text-muted small">{{ o.id }}</p>
            <p v-if="o.buyer_email" class="text-muted small">{{ o.buyer_email }}</p>
          </div>
          <button type="button" class="btn btn-outline btn-sm" @click="selectFromList(o.id)">Select</button>
        </div>
      </section>

      <p class="text-muted small">
        <NuxtLink to="/ops/panel">← Ops panel</NuxtLink> ·
        <NuxtLink to="/ops/authenticity">Authenticity enforcement</NuxtLink> ·
        <NuxtLink to="/marketplace-policy">Marketplace Policies (§6–8)</NuxtLink> ·
        <code>docs/FORCED-REFUNDS.md</code>
      </p>
    </div>
  </div>
</template>

<script setup>
definePageMeta({ middleware: 'ops-auth' })

const REFUNDABLE = ['paid', 'shipped', 'delivered', 'disputed', 'confirmed', 'submitted_to_supplier']

const { busy, lastError, callRefundOps } = useForceRefundOps()
const orderIdInput = ref('')
const selectedOrder = ref(null)
const refundEvents = ref([])
const refundReason = ref('seller_failed_refund')
const opsNote = ref('')
const reportId = ref('')
const confirming = ref(false)
const lastSuccess = ref('')
const refundableList = ref([])
const frozenSellers = ref([])

const canRefundSelected = computed(() => {
  const o = selectedOrder.value
  if (!o) return false
  if (o.stripe_refund_id || o.status === 'refunded') return false
  return REFUNDABLE.includes(o.status) && !!o.stripe_payment_intent_id
})

async function lookupOrder () {
  lastSuccess.value = ''
  const data = await callRefundOps('get_order', { order_id: orderIdInput.value.trim() })
  if (data?.order) {
    selectedOrder.value = data.order
    refundEvents.value = data.events || []
  }
}

async function loadList () {
  const data = await callRefundOps('list_refundable', { limit: 30 })
  if (data?.orders) refundableList.value = data.orders
}

async function loadFrozen () {
  const data = await callRefundOps('list_frozen_sellers')
  if (data?.sellers) frozenSellers.value = data.sellers
}

async function markPaid (sellerId, banAfter) {
  const label = banAfter ? 'Mark debt paid AND permanently ban this seller?' : 'Mark debt paid and lift freeze?'
  if (!confirm(label)) return
  const data = await callRefundOps('record_debt_payment', {
    seller_id: sellerId,
    ban_after_payment: banAfter,
    ban_reason: banAfter ? 'Banned after repaying platform debt — policy violation' : undefined,
  })
  if (data?.ok) {
    lastSuccess.value = banAfter ? 'Debt recorded paid; seller banned.' : 'Debt recorded paid; account unfrozen.'
    await loadFrozen()
  }
}

async function banOnly (sellerId) {
  if (!confirm('Permanently ban this seller (account stays frozen until debt cleared)?')) return
  const data = await callRefundOps('ban_frozen_seller', { seller_id: sellerId })
  if (data?.ok) {
    lastSuccess.value = 'Seller banned.'
    await loadFrozen()
  }
}

function selectFromList (id) {
  orderIdInput.value = id
  lookupOrder()
}

async function runDryRun () {
  lastSuccess.value = ''
  const data = await callRefundOps('force_refund', {
    order_id: selectedOrder.value?.id || orderIdInput.value.trim(),
    reason: refundReason.value,
    dry_run: true,
  })
  if (data?.dry_run) {
    lastSuccess.value = `Dry run OK — refundable: ${data.refundable}, Connect: ${data.connect_checkout}`
  }
}

async function runForceRefund () {
  const id = selectedOrder.value?.id || orderIdInput.value.trim()
  if (!id) return
  if (!window.confirm('Issue a FULL Stripe refund to the buyer? This cannot be undone.')) return
  confirming.value = true
  lastSuccess.value = ''
  const data = await callRefundOps('force_refund', {
    order_id: id,
    reason: refundReason.value,
    ops_note: opsNote.value || undefined,
    authenticity_report_id: reportId.value || undefined,
  })
  confirming.value = false
  if (data?.ok) {
    const frozenNote = data.seller_frozen ? ' Seller account frozen pending repayment.' : ''
    lastSuccess.value = `Refunded $${Number(data.refund_amount).toLocaleString()} — Stripe ${data.stripe_refund_id}.${frozenNote}`
    await lookupOrder()
    await loadList()
    await loadFrozen()
  }
}

onMounted(() => {
  loadList()
  loadFrozen()
})
</script>

<style scoped>
.refund-form {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  align-items: flex-end;
  margin-bottom: 1rem;
}
.refund-form label {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  flex: 1;
  min-width: 200px;
}
.order-detail {
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid var(--border, #333);
}
.refund-actions {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-top: 1rem;
  max-width: 420px;
}
.queue-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  padding: 0.75rem 0;
  border-bottom: 1px solid var(--border, #333);
}
.warn-text { color: #c9a227; }
.success-text { color: #3d9a6a; }
.danger { background: #8b2635; border-color: #8b2635; }
.queue-actions.col { flex-direction: column; align-items: stretch; gap: 6px; }
</style>
