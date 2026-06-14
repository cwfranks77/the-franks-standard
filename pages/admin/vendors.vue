<script setup>
definePageMeta({ layout: 'default', middleware: 'ops-auth' })

const isSaving = ref(false)
const connectionStatus = ref('Pending Onboarding')
const vendorProfile = ref({
  companyName: '',
  contactName: '',
  businessTaxId: '',
  wholesaleCatalogUrl: '',
  preferredPayoutMethod: 'Stripe Connect',
})

async function handleVendorOnboarding () {
  if (!vendorProfile.value.companyName || !vendorProfile.value.businessTaxId) {
    alert('Please fill in your legal corporate entities and Business Tax ID/EIN.')
    return
  }

  isSaving.value = true
  connectionStatus.value = 'Writing record to Supabase...'

  try {
    const data = await $fetch('/api/ops/vendors', {
      method: 'POST',
      body: {
        companyName: vendorProfile.value.companyName,
        businessTaxId: vendorProfile.value.businessTaxId,
        wholesaleCatalogUrl: vendorProfile.value.wholesaleCatalogUrl,
        preferredPayoutMethod: vendorProfile.value.preferredPayoutMethod,
      },
    })
    connectionStatus.value = 'Saved to Supabase — Stripe Connect Pending'
    alert(`Vendor profile saved (id ${data.vendor?.id ?? 'created'}). Next: Stripe Connect verification.`)
  } catch (e) {
    connectionStatus.value = 'Save failed: ' + (e?.data?.statusMessage || e?.message)
    alert('Could not save vendor: ' + (e?.data?.statusMessage || e?.message))
  } finally {
    isSaving.value = false
  }
}
</script>

<template>
  <div class="vendor-page">
    <div class="container">
      <p class="eyebrow">Owner toolkit</p>
      <h1>Supplier &amp; vendor onboarding</h1>
      <p class="text-muted">Register corporate parameters and activate direct split-payment settlement accounts.</p>

      <div class="card panel">
        <div class="status-row">
          <span class="status-label">Ledger connection state</span>
          <span class="status-value" :class="{ ok: /Saved|Linked/.test(connectionStatus), err: connectionStatus.includes('failed') }">
            {{ connectionStatus }}
          </span>
        </div>

        <div class="form-grid">
          <label>Legal business entity<input v-model="vendorProfile.companyName" type="text" class="input" placeholder="e.g. Petra Logistics Net"></label>
          <label>Corporate representative<input v-model="vendorProfile.contactName" type="text" class="input" placeholder="John Doe"></label>
          <label>Federal EIN / Tax ID<input v-model="vendorProfile.businessTaxId" type="text" class="input" placeholder="XX-XXXXXXX"></label>
          <label>Wholesale catalog URL<input v-model="vendorProfile.wholesaleCatalogUrl" type="text" class="input" placeholder="https://supplier.com/feed.csv"></label>
        </div>

        <button type="button" class="btn btn-primary btn-lg mt-2" :disabled="isSaving" @click="handleVendorOnboarding">
          {{ isSaving ? 'Saving…' : 'Save vendor to Supabase' }}
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.vendor-page { padding: 40px 0 80px; }
.eyebrow { font-size: 0.72rem; letter-spacing: 0.18em; text-transform: uppercase; color: var(--accent); margin-bottom: 8px; }
.card.panel { padding: 24px; border: 1px solid var(--border); border-radius: 12px; background: #fff; margin-top: 20px; }
.status-row { display: flex; justify-content: space-between; gap: 12px; padding: 12px 14px; background: var(--surface-sunken); border-radius: 8px; margin-bottom: 18px; flex-wrap: wrap; }
.status-label { font-size: 0.72rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.08em; color: var(--ink-faint); }
.status-value { font-weight: 800; color: #b45309; }
.status-value.ok { color: #047857; }
.status-value.err { color: #b91c1c; }
.form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
.form-grid label { display: flex; flex-direction: column; gap: 6px; font-size: 0.72rem; font-weight: 700; text-transform: uppercase; color: var(--ink-faint); }
.input { padding: 10px 12px; border: 1px solid var(--border); border-radius: 8px; font: inherit; }
.mt-2 { margin-top: 16px; }
@media (max-width: 720px) { .form-grid { grid-template-columns: 1fr; } }
</style>
