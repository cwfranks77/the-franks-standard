<template>
  <div class="print-pack">
    <CoaCertificateTemplate specimen class="pack-page-break" />

    <section class="pack-section page-break">
      <h2>Policies &amp; terms — office appendix</h2>
      <p class="pack-updated text-muted small">Last updated {{ body.policyUpdated }} · Seller bundle {{ body.policyVersion }}</p>

      <div v-for="(block, i) in PRINT_PACK_POLICY_APPENDIX" :key="i" class="pack-block">
        <h3>{{ block.heading }}</h3>
        <p>{{ block.text }}</p>
      </div>

      <h3 class="mt-3">Full documents (print each from links)</h3>
      <ul class="pack-policy-index">
        <li v-for="p in OWNER_POLICY_VIEWS" :key="p.path">
          <strong>{{ p.label }}</strong> — thefranksstandard.com{{ p.path }}
        </li>
        <li v-for="p in OWNER_SELLER_POLICY_VIEWS" :key="'s-' + p.path">
          <strong>{{ p.label }}</strong> — thefranksstandard.com{{ p.path }}
        </li>
      </ul>

      <p class="pack-registry">{{ body.registryRule }}</p>
    </section>
  </div>
</template>

<script setup>
import {
  COA_TEMPLATE_BODY,
  OWNER_POLICY_VIEWS,
  OWNER_SELLER_POLICY_VIEWS,
  PRINT_PACK_POLICY_APPENDIX,
} from '~/utils/ownerDocuments.js'

definePageMeta({ layout: 'print', middleware: 'ops-auth' })

const body = COA_TEMPLATE_BODY

useSeoMeta({
  title: 'Print COA + policies | The Franks Standard',
  robots: 'noindex',
})
</script>

<style scoped>
.print-pack { font-family: system-ui, sans-serif; color: #111827; }
.pack-section { margin-top: 28px; }
.pack-section h2 {
  font-family: 'Cinzel', Georgia, serif;
  font-size: 1.2rem;
  margin-bottom: 8px;
}
.pack-block { margin-bottom: 16px; }
.pack-block h3 { font-size: 0.95rem; margin: 0 0 6px; }
.pack-block p { font-size: 0.85rem; line-height: 1.55; font-weight: 600; color: #374151; margin: 0; }
.pack-policy-index {
  font-size: 0.82rem;
  line-height: 1.6;
  font-weight: 600;
  padding-left: 1.1rem;
}
.pack-registry {
  margin-top: 16px;
  padding: 12px;
  border: 1px solid #e5e7eb;
  font-size: 0.82rem;
  line-height: 1.55;
  font-weight: 600;
}
.page-break { break-before: page; page-break-before: always; }
@media print {
  .pack-page-break { page-break-after: always; }
}
</style>
