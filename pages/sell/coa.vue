<template>
  <div class="list-coa-page">
    <div class="container" style="padding: 48px 16px 80px; max-width: 640px;">
      <p class="eyebrow">Collectible listing</p>
      <h1>Authenticity proof (COA)</h1>
      <p class="lead">
        Collectibles need proof before you publish. <strong>You</strong> back the item — choose how you will show authenticity, then continue to the listing form.
      </p>

      <div class="coa-options">
        <label class="coa-pick" :class="{ active: coaType === 'upload' }">
          <input v-model="coaType" type="radio" value="upload" name="coaPick" />
          <div>
            <h2>Upload a COA</h2>
            <p>You already have a certificate from a grader or issuer.</p>
          </div>
        </label>
        <label class="coa-pick" :class="{ active: coaType === 'guarantee' }">
          <input v-model="coaType" type="radio" value="guarantee" name="coaPick" />
          <div>
            <h2>Seller Authenticity Guarantee</h2>
            <p>Sign our in-platform template with your legal name — you back the item.</p>
          </div>
        </label>
        <label class="coa-pick" :class="{ active: coaType === 'franks_issued' }">
          <input v-model="coaType" type="radio" value="franks_issued" name="coaPick" />
          <div>
            <h2>Franks Standard COA template</h2>
            <p>We issue a serial tied to your listing photos after you upload them on the next step.</p>
          </div>
        </label>
      </div>

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
  title: 'COA & proof for collectibles | The Franks Standard',
  description: 'Choose COA upload, seller guarantee, or Franks Standard COA template before listing a collectible.',
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
