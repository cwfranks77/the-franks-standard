<script setup>
import { BC_BRAND } from '~/utils/bcBrand.js'

const props = defineProps({
  product: { type: Object, default: null },
})

const emit = defineEmits(['success', 'error'])

const form = ref({
  customerName: '',
  customerEmail: '',
  customerZip: '70801',
  shippingAddress: '',
})

const isSubmitting = ref(false)
const statusMessage = ref('')
const statusError = ref(false)
const ledger = ref(null)

async function createBcLiveCheckout (body) {
  try {
    return await $fetch('/api/checkout/live-split-payment', { method: 'POST', body })
  } catch {
    const config = useRuntimeConfig()
    const supabaseUrl = String(config.public.supabaseUrl || '').replace(/\/$/, '')
    const supabaseKey = String(config.public.supabaseKey || '')
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Checkout is unavailable. Try again later.')
    }
    return await $fetch(`${supabaseUrl}/functions/v1/bc-dropship-checkout`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${supabaseKey}`,
        apikey: supabaseKey,
      },
      body,
    })
  }
}

const canSubmit = computed(() => {
  return props.product
    && form.value.customerEmail.trim()
    && form.value.customerName.trim()
    && form.value.customerZip.trim()
    && form.value.shippingAddress.trim()
    && !isSubmitting.value
})

async function submitOrder () {
  if (!props.product || !canSubmit.value) return

  isSubmitting.value = true
  statusMessage.value = ''
  statusError.value = false
  ledger.value = null

  const checkoutBody = {
    productId: props.product.id,
    productName: props.product.name,
    customerEmail: form.value.customerEmail.trim(),
    retailPrice: props.product.retailPrice,
    wholesaleCost: props.product.wholesaleCost,
    customerZip: form.value.customerZip.trim(),
    shippingAddress: `${form.value.customerName.trim()} — ${form.value.shippingAddress.trim()}`,
    productSku: props.product.id,
  }

  try {
    const checkout = await createBcLiveCheckout(checkoutBody)

    if (checkout?.totals) {
      ledger.value = {
        subtotal: checkout.totals.retailCents,
        taxAmount: checkout.totals.laTaxCents,
        taxRatePercentage: '4.45',
        amountToChargeCustomer: checkout.totals.totalCustomerGrossCents,
        applicationFeeAmount: checkout.totals.applicationFeeAmount,
        transferToDistributor: checkout.totals.wholesaleCents,
      }
    }

    if (checkout?.url) {
      statusMessage.value = 'Redirecting to secure Stripe checkout…'
      window.location.assign(checkout.url)
      return
    }

    throw new Error('No checkout URL returned from Stripe.')
  } catch (err) {
    statusError.value = true
    statusMessage.value = err?.data?.statusMessage || err?.message || 'Order submission failed.'
    emit('error', err)
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <div class="bc-order">
    <header class="bc-order__head">
      <p class="bc-order__eyebrow">Dropship order</p>
      <h2 class="bc-order__title">{{ BC_BRAND.short }} fulfillment form</h2>
      <p class="bc-order__sub">
        Live Stripe Connect checkout — Louisiana tax, wholesale distributor payout, and your margin split automatically.
      </p>
    </header>

    <div v-if="!product" class="bc-order__empty">
      <p>Select a product from the catalog grid to begin.</p>
    </div>

    <template v-else>
      <div class="bc-order__selected">
        <p class="bc-order__selected-label">Selected unit</p>
        <p class="bc-order__selected-name">{{ product.brand }} — {{ product.name }}</p>
        <p class="bc-order__selected-price">{{ product.formattedPrice || ('$' + product.retailPrice) }}</p>
      </div>

      <form class="bc-order__form" @submit.prevent="submitOrder">
        <div class="bc-order__field">
          <label for="bc-name">Full name</label>
          <input id="bc-name" v-model="form.customerName" type="text" required autocomplete="name" placeholder="Jane Smith">
        </div>
        <div class="bc-order__field">
          <label for="bc-email">Email</label>
          <input id="bc-email" v-model="form.customerEmail" type="email" required autocomplete="email" placeholder="you@example.com">
        </div>
        <div class="bc-order__row">
          <div class="bc-order__field">
            <label for="bc-zip">Ship-to ZIP (LA tax)</label>
            <input id="bc-zip" v-model="form.customerZip" type="text" required maxlength="10" placeholder="70801">
          </div>
        </div>
        <div class="bc-order__field">
          <label for="bc-address">Shipping address</label>
          <textarea id="bc-address" v-model="form.shippingAddress" required rows="3" placeholder="Street, city, state" />
        </div>

        <button type="submit" class="bc-order__submit" :disabled="!canSubmit">
          {{ isSubmitting ? 'Starting checkout…' : 'Proceed to secure checkout' }}
        </button>
      </form>

      <p v-if="statusMessage" class="bc-order__status" :class="{ 'bc-order__status--err': statusError }">
        {{ statusMessage }}
      </p>

      <div v-if="ledger" class="bc-order__ledger">
        <p class="bc-order__ledger-title">{{ BC_BRAND.short }} split ledger</p>
        <div class="bc-order__ledger-row"><span>Subtotal</span><span>${{ (ledger.subtotal / 100).toFixed(2) }}</span></div>
        <div class="bc-order__ledger-row"><span>LA tax ({{ ledger.taxRatePercentage }}%)</span><span>${{ (ledger.taxAmount / 100).toFixed(2) }}</span></div>
        <div class="bc-order__ledger-row bc-order__ledger-row--strong"><span>Customer charged</span><span>${{ (ledger.amountToChargeCustomer / 100).toFixed(2) }}</span></div>
        <div class="bc-order__ledger-row bc-order__ledger-row--red"><span>{{ BC_BRAND.short }} net profit</span><span>${{ (ledger.applicationFeeAmount / 100).toFixed(2) }}</span></div>
        <div class="bc-order__ledger-row"><span>Distributor transfer</span><span>${{ (ledger.transferToDistributor / 100).toFixed(2) }}</span></div>
      </div>
    </template>
  </div>
</template>

<style scoped>
.bc-order {
  background: #16161c;
  border: 1px solid rgba(211, 47, 47, 0.25);
  border-radius: 14px;
  padding: 1.25rem 1.35rem;
  position: sticky;
  top: 80px;
}
.bc-order__head { margin-bottom: 1rem; }
.bc-order__eyebrow {
  font-size: 0.65rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.16em;
  color: #d32f2f;
  margin: 0 0 6px;
}
.bc-order__title { font-size: 1.15rem; font-weight: 800; margin: 0 0 6px; color: #f5f5f7; }
.bc-order__sub { margin: 0; font-size: 0.8rem; color: #7a8190; line-height: 1.45; }

.bc-order__empty {
  padding: 2rem 1rem;
  text-align: center;
  color: #7a8190;
  font-size: 0.88rem;
  border: 1px dashed rgba(255, 255, 255, 0.1);
  border-radius: 10px;
}

.bc-order__selected {
  background: #0a0a0c;
  border: 1px solid rgba(211, 47, 47, 0.2);
  border-radius: 10px;
  padding: 12px 14px;
  margin-bottom: 1rem;
}
.bc-order__selected-label {
  font-size: 0.65rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: #7a8190;
  margin: 0 0 4px;
}
.bc-order__selected-name { font-weight: 800; margin: 0; font-size: 0.9rem; color: #f5f5f7; }
.bc-order__selected-price { margin: 6px 0 0; color: #ff5252; font-weight: 900; font-size: 1.1rem; }

.bc-order__form { display: flex; flex-direction: column; gap: 12px; }
.bc-order__row { display: grid; grid-template-columns: 1fr; gap: 12px; }
.bc-order__field label {
  display: block;
  font-size: 0.68rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: #9ca3af;
  margin-bottom: 6px;
}
.bc-order__field input,
.bc-order__field textarea {
  width: 100%;
  padding: 10px 12px;
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  background: #0a0a0c;
  color: #f5f5f7;
  font: inherit;
  font-size: 0.88rem;
}
.bc-order__field input:focus,
.bc-order__field textarea:focus {
  outline: none;
  border-color: #d32f2f;
  box-shadow: 0 0 0 3px rgba(211, 47, 47, 0.25);
}

.bc-order__submit {
  margin-top: 4px;
  padding: 12px 16px;
  border: none;
  border-radius: 10px;
  background: linear-gradient(180deg, #d32f2f 0%, #b71c1c 100%);
  color: #fff;
  font-weight: 800;
  font-size: 0.85rem;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  cursor: pointer;
  box-shadow: 0 4px 20px rgba(211, 47, 47, 0.35);
}
.bc-order__submit:disabled { opacity: 0.45; cursor: not-allowed; }
.bc-order__submit:not(:disabled):hover { background: linear-gradient(180deg, #ff5252 0%, #d32f2f 100%); }

.bc-order__status {
  margin: 12px 0 0;
  font-size: 0.82rem;
  color: #86efac;
  line-height: 1.4;
}
.bc-order__status--err { color: #fca5a5; }

.bc-order__ledger {
  margin-top: 14px;
  padding-top: 14px;
  border-top: 1px solid rgba(255, 255, 255, 0.06);
  font-family: ui-monospace, monospace;
  font-size: 0.75rem;
}
.bc-order__ledger-title {
  font-weight: 800;
  color: #ff5252;
  margin: 0 0 8px;
  font-family: inherit;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  font-size: 0.65rem;
}
.bc-order__ledger-row {
  display: flex;
  justify-content: space-between;
  padding: 4px 0;
  color: #9ca3af;
}
.bc-order__ledger-row--strong { color: #f5f5f7; font-weight: 800; }
.bc-order__ledger-row--red { color: #ff5252; }
</style>
