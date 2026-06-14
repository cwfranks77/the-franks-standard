<template>
  <div class="list-coa-page">
    <div class="container" style="padding: 48px 16px 80px; max-width: 640px;">
      <p class="eyebrow">Collectible listing</p>
      <h1>Authenticity proof (COA)</h1>
      <p class="lead">
        Every collectible processed on The Franks Standard is recorded with proof on file.
        <strong>You</strong> back the item — choose how buyers will verify it, then continue to the listing form.
      </p>

      <div class="coa-options">
        <label class="coa-pick" :class="{ active: coaType === 'upload' }">
          <input v-model="coaType" type="radio" value="upload" name="coaPick" />
          <div>
            <h2>Upload a COA</h2>
            <p>Third-party certificate (PSA, PCGS, issuer PDF, etc.). We store the file with your listing.</p>
          </div>
        </label>
        <label class="coa-pick coa-pick--featured" :class="{ active: coaType === 'franks_issued' }">
          <input v-model="coaType" type="radio" value="franks_issued" name="coaPick" />
          <div>
            <h2>Franks COA + Seller Written Guarantee</h2>
            <p>One serial (<code>FS-YYYY-NNNNNN</code>) per listing — your written guarantee digitally attached to the certificate and registry at publish.</p>
          </div>
        </label>
      </div>

      <FranksCoaExplainer v-if="coaType === 'franks_issued'" />
      <p v-else class="registry-note">
        Upload path: you supply a third-party COA file. You back the listing; we do not guarantee third-party certificate content.
      </p>

      <CoaSellerDisclosure variant="full" />

      <div class="actions">
        <NuxtLink v-if="coaType" :to="continueTo" class="btn btn-primary btn-lg">
          Continue to listing form
        </NuxtLink>
        <span v-else class="btn btn-primary btn-lg btn-disabled" aria-disabled="true">
          Choose a proof option above
        </span>
        <NuxtLink to="/sell/start" class="btn btn-outline">Back</NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup>
import { collectibleListingRoute, SELL_FORM_PATH } from '~/utils/listItemRoutes.js'

const coaType = ref('')

const continueTo = computed(() => {
  if (!coaType.value) return SELL_FORM_PATH
  return collectibleListingRoute(coaType.value)
})

useSeoMeta({
  title: 'COA proof for collectibles | The Franks Standard',
  description: 'Upload a third-party COA or use the Franks Standard COA serial registry before listing collectibles.',
})
</script>

<style scoped>
.list-coa-page h1 {
  font-family: 'Cinzel', Georgia, serif;
  font-weight: 800;
  margin-bottom: 12px;
}
.eyebrow {
  font-size: 0.72rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: #92400e;
}
.lead {
  font-weight: 600;
  line-height: 1.6;
  color: #111827;
  margin-bottom: 20px;
}
.registry-note {
  font-size: 0.88rem;
  font-weight: 600;
  line-height: 1.55;
  color: #4b5563;
  margin: 0 0 16px;
  padding: 12px 14px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
}
.coa-options { display: flex; flex-direction: column; gap: 10px; margin-bottom: 8px; }
.coa-pick {
  display: flex;
  gap: 12px;
  padding: 14px 16px;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  cursor: pointer;
  background: #fff;
}
.coa-pick--featured { border-color: rgba(201, 168, 76, 0.5); }
.coa-pick.active { border-color: var(--gold, #c9a84c); background: rgba(201, 168, 76, 0.06); }
.coa-pick input { margin-top: 4px; accent-color: var(--gold, #c9a84c); }
.coa-pick h2 { font-size: 1rem; margin: 0 0 4px; color: #111827; }
.coa-pick p { margin: 0; font-size: 0.85rem; color: #4b5563; font-weight: 600; line-height: 1.45; }
.actions {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 24px;
}
.actions .disabled {
  pointer-events: none;
  opacity: 0.45;
}
</style>
