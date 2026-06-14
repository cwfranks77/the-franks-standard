<template>
  <div class="verify-hub">
    <div class="container" style="padding: 48px 16px 80px; max-width: 480px;">
      <p class="eyebrow">COA verification</p>
      <h1>Verify a Franks COA serial</h1>
      <p class="lead text-muted">
        Each Franks serial carries the seller&apos;s <strong>Seller Written Guarantee</strong> on our certificate — digitally attached to one listing and item snapshot at issue. Enter a serial to see registry status.
      </p>

      <FranksCoaExplainer compact :show-title="false" :show-roles="false" />

      <form class="verify-form" @submit.prevent="goVerify">
        <label class="label" for="coa-serial-input">COA serial</label>
        <input
          id="coa-serial-input"
          v-model="serialInput"
          class="input"
          type="text"
          placeholder="FS-2026-000001"
          autocomplete="off"
          required
        />
        <button type="submit" class="btn btn-primary" style="width: 100%;">Verify serial</button>
      </form>

      <p v-if="formError" class="form-err" role="alert">{{ formError }}</p>

      <p class="text-muted small mt-3">
        <NuxtLink to="/protection">Protection overview</NuxtLink>
        ·
        <NuxtLink to="/how-it-works">How proof works</NuxtLink>
      </p>
      <CoaSellerDisclosure variant="full" class="mt-3" />
    </div>
  </div>
</template>

<script setup>
const serialInput = ref('FS-2026-000001')
const formError = ref('')

function normalizeSerial (raw) {
  const s = String(raw || '').trim().toUpperCase().replace(/\s+/g, '')
  if (!/^FS-\d{4}-\d{6}$/.test(s)) return ''
  return s
}

function goVerify () {
  formError.value = ''
  const serial = normalizeSerial(serialInput.value)
  if (!serial) {
    formError.value = 'Enter a valid serial like FS-2026-000001.'
    return
  }
  navigateTo(`/verify/coa/${serial}`)
}

useSeoMeta({
  title: 'Verify COA serial — The Franks Standard',
  description: 'Look up a Franks Standard COA serial in our registry before you buy.',
})
</script>

<style scoped>
.verify-hub h1 {
  font-family: 'Cinzel', Georgia, serif;
  font-weight: 800;
  margin-bottom: 10px;
}
.eyebrow {
  font-size: 0.72rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: #92400e;
}
.lead { line-height: 1.6; font-weight: 600; }
.verify-form { margin-top: 20px; }
.form-err {
  color: #7f1d1d;
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 8px;
  padding: 10px 12px;
  font-size: 0.88rem;
  font-weight: 600;
  margin-top: 12px;
}
</style>
