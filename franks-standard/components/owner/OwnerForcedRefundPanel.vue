<script setup lang="ts">
const REFUNDABLE = ['paid', 'shipped', 'delivered', 'disputed', 'confirmed', 'submitted_to_supplier']

const { busy, lastError, callRefundOps } = useForceRefundOps()

const orderIdInput = ref('')
const selectedOrder = ref<Record<string, unknown> | null>(null)
const refundReason = ref('seller_failed_refund')
const opsNote = ref('')
const reportId = ref('')
const confirming = ref(false)
const lastSuccess = ref('')
const refundableList = ref<Record<string, unknown>[]>([])
const frozenSellers = ref<Record<string, unknown>[]>([])

const canRefundSelected = computed(() => {
  const o = selectedOrder.value
  if (!o) return false
  if (o.stripe_refund_id || o.status === 'refunded') return false
  return REFUNDABLE.includes(String(o.status)) && !!o.stripe_payment_intent_id
})

function money (n: unknown) {
  return `$${Number(n || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}`
}

function shortId (id: unknown) {
  const s = String(id || '')
  return s.length > 12 ? `${s.slice(0, 8)}…` : s
}

async function lookupOrder () {
  lastSuccess.value = ''
  const data = await callRefundOps('get_order', { order_id: orderIdInput.value.trim() })
  if (data?.order) selectedOrder.value = data.order as Record<string, unknown>
}

async function loadList () {
  const data = await callRefundOps('list_refundable', { limit: 30 })
  if (data?.orders) refundableList.value = data.orders as Record<string, unknown>[]
}

async function loadFrozen () {
  const data = await callRefundOps('list_frozen_sellers')
  if (data?.sellers) frozenSellers.value = data.sellers as Record<string, unknown>[]
}

async function markPaid (sellerId: string, banAfter: boolean) {
  const label = banAfter
    ? 'Mark debt paid AND permanently ban this seller?'
    : 'Mark debt paid and lift freeze?'
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

async function banOnly (sellerId: string) {
  if (!confirm('Permanently ban this seller (account stays frozen until debt cleared)?')) return
  const data = await callRefundOps('ban_frozen_seller', { seller_id: sellerId })
  if (data?.ok) {
    lastSuccess.value = 'Seller banned.'
    await loadFrozen()
  }
}

function selectFromList (id: string) {
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
    lastSuccess.value = `Dry run OK — refundable: ${data.refundable}, Connect checkout: ${data.connect_checkout}`
  }
}

async function runForceRefund () {
  const id = String(selectedOrder.value?.id || orderIdInput.value.trim())
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
    lastSuccess.value = `Refunded ${money(data.refund_amount)} — Stripe ${data.stripe_refund_id}.${frozenNote}`
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

<template>
  <div class="space-y-6 text-sm">
    <p class="text-white/80">
      When a seller will not refund (counterfeit, not as described, upheld dispute), issue a full Stripe refund
      from escrow. Seller-at-fault refunds can freeze the seller account until platform debt is repaid.
      Buyer and seller personal emails are not shown — use order IDs only.
    </p>

    <section class="border border-border rounded-lg p-4 bg-bg/40 space-y-3">
      <h3 class="font-semibold text-white">Refund by order ID</h3>
      <form class="flex flex-wrap gap-3 items-end" @submit.prevent="lookupOrder">
        <label class="flex-1 min-w-[200px]">
          <span class="block text-xs text-white/70 mb-1">Order ID</span>
          <input
            v-model="orderIdInput"
            type="text"
            class="w-full bg-bg border border-border rounded px-3 py-2 text-white text-sm"
            placeholder="UUID from orders table or dashboard"
            required
          >
        </label>
        <button
          type="submit"
          class="px-4 py-2 border border-border rounded text-white hover:border-primary"
          :disabled="busy"
        >
          Look up
        </button>
      </form>

      <div v-if="selectedOrder" class="pt-3 border-t border-border space-y-2">
        <p class="text-white/85">
          <strong>Status:</strong> {{ selectedOrder.status }}
          · <strong>Escrow:</strong> {{ selectedOrder.escrow_status || '—' }}
        </p>
        <p class="text-white/85">
          <strong>Amount:</strong> {{ money(selectedOrder.amount) }}
          <span v-if="selectedOrder.total_paid"> (paid {{ money(selectedOrder.total_paid) }} incl. tax)</span>
        </p>
        <p class="text-xs text-white/55">
          Buyer account: {{ shortId(selectedOrder.buyer_id) }}
          · Seller account: {{ shortId(selectedOrder.seller_id) }}
        </p>
        <p v-if="selectedOrder.stripe_payment_intent_id" class="text-xs text-white/55">
          Payment intent: {{ String(selectedOrder.stripe_payment_intent_id).slice(0, 24) }}…
        </p>
        <p v-if="selectedOrder.stripe_refund_id" class="text-amber-400 text-xs">
          Already refunded ({{ selectedOrder.stripe_refund_id }})
        </p>
        <p v-else-if="!canRefundSelected" class="text-amber-400 text-xs">
          This order cannot be force-refunded in its current status.
        </p>

        <div v-if="canRefundSelected" class="space-y-3 max-w-md pt-2">
          <label class="block">
            <span class="text-xs text-white/70">Reason</span>
            <select v-model="refundReason" class="w-full mt-1 bg-bg border border-border rounded px-3 py-2 text-white">
              <option value="seller_failed_refund">Seller failed to refund</option>
              <option value="counterfeit">Counterfeit / fake</option>
              <option value="not_as_described">Not as described</option>
              <option value="dispute_upheld">Dispute upheld</option>
              <option value="ops_other">Other (operator)</option>
            </select>
          </label>
          <label class="block">
            <span class="text-xs text-white/70">Operator note (optional)</span>
            <input
              v-model="opsNote"
              type="text"
              class="w-full mt-1 bg-bg border border-border rounded px-3 py-2 text-white"
              placeholder="Case ref, report id"
            >
          </label>
          <label class="block">
            <span class="text-xs text-white/70">Authenticity report ID (optional)</span>
            <input
              v-model="reportId"
              type="text"
              class="w-full mt-1 bg-bg border border-border rounded px-3 py-2 text-white"
            >
          </label>
          <div class="flex flex-wrap gap-2">
            <button
              type="button"
              class="px-4 py-2 bg-red-900/80 border border-red-700 rounded text-white font-medium hover:bg-red-800"
              :disabled="busy || confirming"
              @click="runDryRun"
            >
              {{ busy ? '…' : 'Dry run' }}
            </button>
            <button
              type="button"
              class="px-4 py-2 bg-red-700 border border-red-600 rounded text-white font-semibold hover:bg-red-600"
              :disabled="busy || confirming"
              @click="runForceRefund"
            >
              {{ confirming ? 'Refunding…' : 'Force full refund' }}
            </button>
          </div>
        </div>
      </div>
    </section>

    <section class="border border-border rounded-lg p-4 bg-bg/40 space-y-3">
      <div class="flex justify-between items-center gap-2">
        <h3 class="font-semibold text-white">Frozen sellers (debt recovery)</h3>
        <button type="button" class="text-xs text-primary hover:underline" :disabled="busy" @click="loadFrozen">
          Refresh
        </button>
      </div>
      <p v-if="!frozenSellers.length" class="text-white/60">No sellers awaiting repayment.</p>
      <div
        v-for="s in frozenSellers"
        :key="String(s.id)"
        class="flex flex-wrap justify-between gap-3 py-3 border-b border-border last:border-0"
      >
        <div>
          <p class="text-white font-medium">Owes {{ money(s.seller_debt_balance) }}</p>
          <p class="text-xs text-white/55">Seller {{ shortId(s.id) }}</p>
          <p v-if="s.seller_debt_order_id" class="text-xs text-white/55">Order {{ shortId(s.seller_debt_order_id) }}</p>
        </div>
        <div class="flex flex-col gap-2 min-w-[160px]">
          <button
            type="button"
            class="px-3 py-1.5 bg-primary text-bg rounded text-xs font-medium"
            @click="markPaid(String(s.id), false)"
          >
            Mark paid — unfreeze
          </button>
          <button
            type="button"
            class="px-3 py-1.5 border border-red-700 text-red-300 rounded text-xs"
            @click="markPaid(String(s.id), true)"
          >
            Paid + permanent ban
          </button>
          <button
            type="button"
            class="px-3 py-1.5 border border-border text-white/70 rounded text-xs"
            @click="banOnly(String(s.id))"
          >
            Ban (still frozen)
          </button>
        </div>
      </div>
    </section>

    <section class="border border-border rounded-lg p-4 bg-bg/40 space-y-3">
      <div class="flex justify-between items-center gap-2">
        <h3 class="font-semibold text-white">Recent refundable orders</h3>
        <button type="button" class="text-xs text-primary hover:underline" :disabled="busy" @click="loadList">
          Refresh
        </button>
      </div>
      <p v-if="!refundableList.length" class="text-white/60">None loaded — connect Supabase ops-force-refund.</p>
      <div
        v-for="o in refundableList"
        :key="String(o.id)"
        class="flex justify-between items-center gap-3 py-2 border-b border-border last:border-0"
      >
        <div>
          <p class="text-white">{{ money(o.amount) }} <span class="text-xs uppercase text-primary">{{ o.status }}</span></p>
          <p class="text-xs text-white/55">{{ o.id }}</p>
        </div>
        <button
          type="button"
          class="px-3 py-1 border border-border rounded text-xs text-white hover:border-primary"
          @click="selectFromList(String(o.id))"
        >
          Select
        </button>
      </div>
    </section>

    <p v-if="lastError" class="text-red-400 text-xs">{{ lastError }}</p>
    <p v-if="lastSuccess" class="text-green-400 text-xs">{{ lastSuccess }}</p>

    <p class="text-xs text-white/50">
      Requires Supabase edge function <code class="text-primary">ops-force-refund</code> deployed with your operator phrase.
      Seller-at-fault reasons freeze the account per Marketplace Policies.
    </p>
  </div>
</template>
