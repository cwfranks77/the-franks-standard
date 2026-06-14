<template>
  <article class="coa-cert" :class="{ 'coa-cert--specimen': specimen }">
    <header class="coa-cert-head">
      <img :src="SEAL_ASSET" alt="" class="coa-cert-seal" width="96" height="96" />
      <div class="coa-cert-head-text">
        <p v-if="specimen" class="coa-specimen-tag">{{ body.specimenLabel }}</p>
        <h1 class="coa-cert-title">{{ body.title }}</h1>
        <p class="coa-cert-sub">{{ body.subtitle }}</p>
      </div>
    </header>

    <div class="coa-cert-serial-block">
      <p class="coa-serial-label">Floor office serial</p>
      <p class="coa-serial-num">{{ serial }}</p>
      <p class="coa-verify">{{ body.verifyLabel }}<strong>{{ serial }}</strong></p>
    </div>

    <dl class="coa-cert-fields">
      <dt>{{ body.sellerLabel }}</dt>
      <dd>{{ sellerName || '_______________________________' }}</dd>
      <dt>{{ body.itemLabel }}</dt>
      <dd>{{ itemTitle || 'As described in listing photos and description at time of issue' }}</dd>
      <dt>Category</dt>
      <dd>{{ category || 'Collectible' }}</dd>
      <dt>Issued</dt>
      <dd>{{ issuedLabel }}</dd>
      <dt>Listing ID</dt>
      <dd>{{ listingId || 'Assigned at publish' }}</dd>
    </dl>

    <p class="coa-cert-fine">{{ body.finePrintFull }}</p>
    <p class="coa-cert-short">{{ body.finePrintShort }}</p>

    <footer class="coa-cert-foot">
      <p>The Franks Standard LLC · Marketplace facilitator · {{ body.policyUpdated }}</p>
      <p class="coa-cert-foot-small">Policy bundle version {{ body.policyVersion }} · Not a Platform warranty of authenticity</p>
    </footer>
  </article>
</template>

<script setup>
import { SEAL_ASSET } from '~/utils/authenticitySeal.js'
import { COA_TEMPLATE_BODY } from '~/utils/ownerDocuments.js'

const props = defineProps({
  serial: { type: String, default: COA_TEMPLATE_BODY.serial },
  sellerName: { type: String, default: '' },
  itemTitle: { type: String, default: '' },
  category: { type: String, default: '' },
  listingId: { type: String, default: '' },
  issuedAt: { type: String, default: '' },
  specimen: { type: Boolean, default: true },
})

const body = COA_TEMPLATE_BODY

const issuedLabel = computed(() => {
  if (props.issuedAt) {
    try {
      return new Date(props.issuedAt).toLocaleString()
    } catch {
      return props.issuedAt
    }
  }
  return new Date().toLocaleString()
})
</script>

<style scoped>
.coa-cert {
  border: 3px double #c9a84c;
  border-radius: 4px;
  padding: 28px 24px;
  background: #fff;
  font-family: Georgia, 'Times New Roman', serif;
  color: #111827;
  break-inside: avoid;
}
.coa-cert-head {
  display: flex;
  gap: 16px;
  align-items: flex-start;
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 1px solid #d1d5db;
}
.coa-cert-seal { flex-shrink: 0; }
.coa-cert-title {
  font-family: 'Cinzel', Georgia, serif;
  font-size: 1.45rem;
  margin: 0 0 4px;
  color: #92400e;
}
.coa-cert-sub {
  margin: 0;
  font-size: 0.9rem;
  font-weight: 600;
  color: #4b5563;
}
.coa-specimen-tag {
  margin: 0 0 6px;
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: #b45309;
}
.coa-cert-serial-block {
  text-align: center;
  margin: 0 0 20px;
  padding: 14px;
  background: linear-gradient(135deg, rgba(201, 168, 76, 0.12), rgba(15, 23, 42, 0.04));
  border: 1px solid rgba(201, 168, 76, 0.45);
}
.coa-serial-label {
  margin: 0;
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  font-weight: 700;
  color: #6b7280;
}
.coa-serial-num {
  margin: 6px 0;
  font-family: ui-monospace, monospace;
  font-size: 1.65rem;
  font-weight: 800;
  color: #111827;
}
.coa-verify {
  margin: 0;
  font-size: 0.82rem;
  color: #374151;
}
.coa-cert-fields {
  display: grid;
  grid-template-columns: 140px 1fr;
  gap: 8px 12px;
  margin: 0 0 18px;
  font-size: 0.9rem;
}
.coa-cert-fields dt { font-weight: 700; color: #4b5563; }
.coa-cert-fields dd { margin: 0; font-weight: 600; }
.coa-cert-fine {
  font-size: 0.78rem;
  line-height: 1.55;
  color: #374151;
  margin: 0 0 10px;
}
.coa-cert-short {
  font-size: 0.75rem;
  font-weight: 700;
  color: #6b7280;
  margin: 0 0 16px;
}
.coa-cert-foot {
  border-top: 1px solid #e5e7eb;
  padding-top: 12px;
  font-size: 0.78rem;
  color: #6b7280;
  text-align: center;
}
.coa-cert-foot-small { margin: 4px 0 0; font-size: 0.72rem; }
@media print {
  .coa-cert { border-width: 2px; padding: 20px; }
}
</style>
