<template>
  <div class="ops-docs-page">
    <div class="container">
      <header class="docs-head">
        <p class="eyebrow">Owner toolkit</p>
        <h1>COA template &amp; policies</h1>
        <p class="text-muted lead">
          View or print the Franks COA specimen (with seal) and binding terms. Use your HP printer from the browser print dialog — pick the printer on your network.
        </p>
        <div class="docs-head-actions no-print">
          <NuxtLink to="/ops/panel" class="btn btn-outline btn-sm">← Operator console</NuxtLink>
        </div>
      </header>

      <section class="card docs-print-hint no-print">
        <h2>Print to your HP printer</h2>
        <ol class="hint-list">
          <li>Click <strong>Print pack</strong> or <strong>Print COA only</strong> below.</li>
          <li>When the dialog opens, choose your <strong>HP</strong> printer (same Wi‑Fi/network as this PC).</li>
          <li>Use letter paper, portrait, and turn off headers/footers if the browser adds URLs.</li>
        </ol>
        <p v-if="printerHint" class="printer-detect text-muted small">{{ printerHint }}</p>
        <button type="button" class="btn btn-primary" @click="openPrintPack">Print full pack now</button>
        <button type="button" class="btn btn-outline" style="margin-left: 8px;" @click="openPrintCoa">Print COA template only</button>
      </section>

      <section class="docs-grid">
        <article v-for="doc in OWNER_DOCUMENT_SECTIONS" :key="doc.id" class="card doc-card">
          <span class="doc-icon" aria-hidden="true">{{ doc.icon }}</span>
          <h2>{{ doc.title }}</h2>
          <p class="text-muted small">{{ doc.desc }}</p>
          <div class="doc-actions">
            <NuxtLink :to="doc.viewPath" class="btn btn-outline btn-sm">View</NuxtLink>
            <NuxtLink :to="doc.printPath" class="btn btn-primary btn-sm" target="_blank" rel="noopener">Print ↗</NuxtLink>
          </div>
        </article>
      </section>

      <section class="card">
        <h2>Binding policies &amp; terms</h2>
        <p class="text-muted small">Open the live policy page or print with site chrome hidden (<code>?print=1</code>).</p>
        <ul class="policy-link-list">
          <li v-for="p in OWNER_POLICY_VIEWS" :key="p.path">
            <div>
              <strong>{{ p.label }}</strong>
              <span class="policy-role">{{ p.role }}</span>
            </div>
            <div class="doc-actions">
              <NuxtLink :to="p.path" class="btn btn-outline btn-sm">View</NuxtLink>
              <NuxtLink :to="p.printPath" class="btn btn-primary btn-sm" target="_blank" rel="noopener">Print ↗</NuxtLink>
            </div>
          </li>
        </ul>
      </section>

      <section class="card">
        <h2>Seller signature bundle</h2>
        <p class="text-muted small">Documents sellers digitally sign before listing (version {{ SELLER_POLICY_VERSION }}).</p>
        <ul class="policy-link-list">
          <li v-for="p in OWNER_SELLER_POLICY_VIEWS" :key="p.path">
            <div>
              <strong>{{ p.label }}</strong>
              <span v-if="p.required" class="req-tag">Required</span>
            </div>
            <div class="doc-actions">
              <NuxtLink :to="p.path" class="btn btn-outline btn-sm">View</NuxtLink>
              <NuxtLink :to="p.printPath" class="btn btn-primary btn-sm" target="_blank" rel="noopener">Print ↗</NuxtLink>
            </div>
          </li>
        </ul>
      </section>
    </div>
  </div>
</template>

<script setup>
import {
  OWNER_DOCUMENT_SECTIONS,
  OWNER_POLICY_VIEWS,
  OWNER_SELLER_POLICY_VIEWS,
} from '~/utils/ownerDocuments.js'
import { SELLER_POLICY_VERSION } from '~/utils/sellerPolicyBundle.js'

definePageMeta({ layout: 'default', middleware: 'ops-auth' })

useSeoMeta({
  title: 'COA & policies (owner) | The Franks Standard',
  robots: 'noindex',
})

const printerHint = ref('')

function openPrintPack () {
  window.open('/ops/print-pack?print=1', '_blank', 'noopener')
}

function openPrintCoa () {
  window.open('/ops/print-coa?print=1', '_blank', 'noopener')
}

onMounted(() => {
  printerHint.value =
    'Tip: This site cannot pick your HP printer automatically (browser security). You choose it in the print dialog. On Windows, Settings → Bluetooth & devices → Printers should show your HP if it is on the network.'
})
</script>

<style scoped>
.ops-docs-page { padding: 32px 0 64px; }
.docs-head h1 { font-family: 'Cinzel', Georgia, serif; font-weight: 800; }
.eyebrow {
  font-size: 0.72rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: #92400e;
}
.lead { max-width: 40rem; line-height: 1.6; font-weight: 600; }
.docs-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 16px;
  margin: 20px 0;
}
.doc-card { padding: 20px; }
.doc-icon { font-size: 1.75rem; display: block; margin-bottom: 8px; }
.doc-card h2 { font-size: 1.05rem; margin-bottom: 8px; }
.doc-actions { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 12px; }
.hint-list { line-height: 1.65; font-weight: 600; color: #374151; padding-left: 1.2rem; }
.policy-link-list { list-style: none; padding: 0; margin: 0; }
.policy-link-list li {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 12px 0;
  border-bottom: 1px solid #e5e7eb;
}
.policy-role { display: block; font-size: 0.82rem; color: #6b7280; font-weight: 600; margin-top: 2px; }
.req-tag {
  margin-left: 8px;
  font-size: 0.68rem;
  font-weight: 800;
  text-transform: uppercase;
  color: #92400e;
}
.printer-detect { margin-top: 12px; line-height: 1.5; }
.card { background: #fff; border: 1px solid #e5e7eb; border-radius: 12px; padding: 20px; margin-bottom: 16px; }
</style>
