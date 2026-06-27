<script setup>
import { COA_TEMPLATE_BODY } from '~/utils/ownerDocuments.js'
import {
  COA_NON_TRANSFERABLE_NOTICE,
  SELLER_WRITTEN_GUARANTEE_CERTIFICATE_TEXT,
} from '~/utils/franksCoaModel.js'
import { SEAL_ASSET } from '~/utils/authenticitySeal.js'

const props = defineProps({
  specimen: { type: Boolean, default: false },
  serial: { type: String, default: '' },
  copyToken: { type: String, default: '' },
  copyNumber: { type: Number, default: 0 },
  title: { type: String, default: '' },
  descriptionExcerpt: { type: String, default: '' },
  sellerName: { type: String, default: '' },
  sellerSignedAt: { type: String, default: '' },
  issuedAt: { type: String, default: '' },
  floorSlot: { type: String, default: '' },
  verifyUrl: { type: String, default: '' },
  copyVerifyUrl: { type: String, default: '' },
  thirdPartySerial: { type: String, default: '' },
  documentSource: { type: String, default: 'franks_issued' },
  primaryImageUrl: { type: String, default: '' },
})

const body = COA_TEMPLATE_BODY

const displaySerial = computed(() => props.serial || body.serial)
const displayFloor = computed(() => props.floorSlot || displaySerial.value)
const displayTitle = computed(() => props.title || (props.specimen ? 'Specimen item — office template only' : '—'))
const displayCopyLabel = computed(() => {
  if (props.specimen) return body.specimenLabel
  if (!props.copyNumber) return 'PENDING REGISTRY COPY'
  return props.copyNumber === 1 ? 'ORIGINAL REGISTRY ISSUE — COPY 1' : `REGISTERED REPRINT — COPY ${props.copyNumber}`
})
const issuedLabel = computed(() => {
  const raw = props.issuedAt || props.sellerSignedAt
  if (!raw) return '—'
  return new Date(raw).toLocaleString('en-US', { dateStyle: 'long', timeStyle: 'short' })
})
const verifyHref = computed(() => props.copyVerifyUrl || props.verifyUrl || `https://thefranksstandard.com/verify/coa/${displaySerial.value}`)
const watermarkTokens = computed(() => {
  const token = props.copyToken || displaySerial.value || 'SPECIMEN'
  return Array.from({ length: 12 }, (_, i) => `${token} · ${i + 1}`)
})
const printReady = computed(() => {
  if (props.specimen) return true
  return Boolean(
    props.primaryImageUrl
    && String(props.descriptionExcerpt || '').trim().length >= 20
    && props.copyToken
    && props.copyNumber >= 1,
  )
})
</script>

<template>
  <article
    id="coa-certificate-document"
    class="coa-cert"
    :class="{ 'coa-cert--specimen': specimen, 'coa-cert--locked': !printReady }"
    aria-label="Franks Standard Certificate of Authenticity"
  >
    <div v-if="!printReady && !specimen" class="coa-cert__lock-screen no-print" role="alert">
      <p><strong>COA print locked</strong></p>
      <p>Item thumbnail, description, serial, and verification must be complete before this certificate can print.</p>
    </div>
    <div class="coa-cert__wm-layer" aria-hidden="true">
      <div class="coa-cert__wm-tile" />
      <div
        v-for="(tok, i) in watermarkTokens"
        :key="i"
        class="coa-cert__wm-token"
        :style="{ top: `${8 + (i % 4) * 22}%`, left: `${4 + Math.floor(i / 4) * 30}%` }"
      >
        {{ tok }}
      </div>
    </div>

    <div class="coa-cert__frame">
      <header class="coa-cert__head">
        <div>
          <p class="coa-cert__eyebrow">{{ body.subtitle }}</p>
          <h1 class="coa-cert__title">{{ body.title }}</h1>
        </div>
        <img :src="SEAL_ASSET" alt="" class="coa-cert__seal" width="120" height="120">
      </header>

      <p class="coa-cert__copy-banner">{{ displayCopyLabel }}</p>

      <dl class="coa-cert__grid">
        <div><dt>Floor office #</dt><dd class="mono">{{ displayFloor }}</dd></div>
        <div><dt>Platform serial</dt><dd class="mono">{{ displaySerial }}</dd></div>
        <div v-if="thirdPartySerial"><dt>Issuer serial</dt><dd class="mono">{{ thirdPartySerial }}</dd></div>
        <div v-if="copyToken"><dt>Document copy ID</dt><dd class="mono coa-cert__copy-id">{{ copyToken }}</dd></div>
        <div><dt>Issued</dt><dd>{{ issuedLabel }}</dd></div>
        <div><dt>Seller of record</dt><dd>{{ sellerName || (specimen ? 'Specimen seller' : '—') }}</dd></div>
      </dl>

      <section class="coa-cert__item">
        <h2>{{ body.itemLabel }}</h2>
        <p class="coa-cert__item-title">{{ displayTitle }}</p>
        <p v-if="descriptionExcerpt" class="coa-cert__item-desc">{{ descriptionExcerpt }}</p>
        <figure v-if="primaryImageUrl && !specimen" class="coa-cert__thumb">
          <img :src="primaryImageUrl" alt="Certified listing thumbnail">
          <figcaption>Certified thumbnail at issue (required for print)</figcaption>
        </figure>
        <p v-else-if="!specimen" class="coa-cert__thumb-missing" role="alert">
          Item thumbnail missing — this certificate cannot be printed until a listing photo is frozen on the COA.
        </p>
      </section>

      <section v-if="documentSource === 'franks_issued'" class="coa-cert__guarantee">
        <h2>Seller Written Guarantee</h2>
        <p>{{ SELLER_WRITTEN_GUARANTEE_CERTIFICATE_TEXT }}</p>
        <p v-if="sellerName" class="coa-cert__sig">
          <strong>Electronic signature:</strong> {{ sellerName }}
          <span v-if="sellerSignedAt"> · {{ issuedLabel }}</span>
        </p>
      </section>

      <section v-else class="coa-cert__guarantee">
        <h2>Third-party certificate on file</h2>
        <p>
          This registry document wraps a seller-uploaded third-party COA. The issuer serial above is bound to this listing.
          The Franks Standard does not guarantee third-party certificate content.
        </p>
      </section>

      <footer class="coa-cert__foot">
        <p class="coa-cert__non-transfer">{{ COA_NON_TRANSFERABLE_NOTICE }}</p>
        <p class="coa-cert__anti-copy">
          <strong>Anti-copy protection:</strong> This document carries a unique copy ID watermarked across the page.
          Photocopies, screenshots, or reprints without a valid copy ID issued from thefranksstandard.com are not authentic registry copies.
          Request additional copies only through your account on this site — every copy is logged.
        </p>
        <p class="coa-cert__verify">
          Verify serial: <strong>{{ verifyHref }}</strong>
          <span v-if="copyToken"> · Verify this copy ID at the same URL with <code>?copy={{ copyToken }}</code></span>
        </p>
        <p class="coa-cert__fine">{{ body.finePrintShort }}</p>
      </footer>
    </div>
  </article>
</template>

<style scoped>
.coa-cert {
  position: relative;
  max-width: 8.5in;
  margin: 0 auto;
  background: #faf8f2;
  color: #111827;
  font-family: Georgia, 'Times New Roman', serif;
  overflow: hidden;
  user-select: none;
  -webkit-user-select: none;
  print-color-adjust: exact;
  -webkit-print-color-adjust: exact;
}
.coa-cert__wm-layer {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 0;
}
.coa-cert__wm-tile {
  position: absolute;
  inset: 0;
  background: url('/img/franks-coa-watermark.svg') center/420px repeat;
  opacity: 0.55;
}
.coa-cert__wm-token {
  position: absolute;
  font-size: 9px;
  font-weight: 700;
  letter-spacing: 0.08em;
  color: rgba(122, 92, 18, 0.14);
  transform: rotate(-28deg);
  white-space: nowrap;
  font-family: 'Courier New', monospace;
}
.coa-cert__frame {
  position: relative;
  z-index: 1;
  margin: 14px;
  padding: 28px 32px 24px;
  border: 3px double #c9a84c;
  box-shadow: inset 0 0 0 1px #8b6914, inset 0 0 60px rgba(201, 168, 76, 0.08);
  background: rgba(255, 255, 255, 0.92);
}
.coa-cert__head {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
  border-bottom: 1px solid #d1d5db;
  padding-bottom: 16px;
  margin-bottom: 12px;
}
.coa-cert__eyebrow {
  font-size: 0.72rem;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: #047857;
  margin: 0 0 6px;
  font-family: system-ui, sans-serif;
}
.coa-cert__title {
  font-size: 1.65rem;
  margin: 0;
  color: #1f2937;
  letter-spacing: 0.04em;
}
.coa-cert__seal {
  flex-shrink: 0;
  filter: drop-shadow(0 2px 6px rgba(0, 0, 0, 0.2));
}
.coa-cert__copy-banner {
  text-align: center;
  font-size: 0.78rem;
  font-weight: 700;
  letter-spacing: 0.12em;
  color: #7a5c12;
  background: linear-gradient(90deg, transparent, rgba(201, 168, 76, 0.2), transparent);
  padding: 6px 8px;
  margin: 0 0 16px;
  font-family: system-ui, sans-serif;
}
.coa-cert--specimen .coa-cert__copy-banner {
  color: #b45309;
  background: rgba(251, 191, 36, 0.15);
}
.coa-cert__grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px 20px;
  margin: 0 0 18px;
  font-size: 0.88rem;
}
.coa-cert__grid dt {
  font-size: 0.68rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: #6b7280;
  font-family: system-ui, sans-serif;
}
.coa-cert__grid dd {
  margin: 2px 0 0;
  font-weight: 600;
}
.coa-cert__grid .mono {
  font-family: 'Courier New', monospace;
  font-size: 0.95rem;
}
.coa-cert__copy-id {
  color: #047857;
  word-break: break-all;
}
.coa-cert__item h2,
.coa-cert__guarantee h2 {
  font-size: 0.82rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: #374151;
  margin: 0 0 8px;
  font-family: system-ui, sans-serif;
}
.coa-cert__item-title {
  font-size: 1.1rem;
  font-weight: 700;
  margin: 0 0 8px;
}
.coa-cert__item-desc {
  font-size: 0.9rem;
  line-height: 1.55;
  margin: 0 0 12px;
  color: #374151;
}
.coa-cert__thumb {
  margin: 0;
  max-width: 200px;
}
.coa-cert__thumb img {
  width: 100%;
  border: 1px solid #d1d5db;
  border-radius: 4px;
}
.coa-cert__thumb figcaption {
  font-size: 0.7rem;
  color: #6b7280;
  margin-top: 4px;
  font-family: system-ui, sans-serif;
}
.coa-cert__guarantee {
  margin-top: 18px;
  padding-top: 14px;
  border-top: 1px solid #e5e7eb;
}
.coa-cert__guarantee p {
  font-size: 0.86rem;
  line-height: 1.6;
  margin: 0 0 10px;
}
.coa-cert__sig {
  font-size: 0.82rem;
}
.coa-cert__foot {
  margin-top: 18px;
  padding-top: 14px;
  border-top: 2px solid #c9a84c;
  font-size: 0.74rem;
  line-height: 1.55;
  color: #4b5563;
  font-family: system-ui, sans-serif;
}
.coa-cert__non-transfer {
  color: #92400e;
  font-weight: 700;
  margin-bottom: 8px;
}
.coa-cert__anti-copy {
  margin-bottom: 8px;
}
.coa-cert__verify {
  margin-bottom: 8px;
  word-break: break-all;
}
.coa-cert__verify code {
  font-size: 0.68rem;
}
.coa-cert__fine {
  margin: 0;
  font-style: italic;
}
.coa-cert--locked .coa-cert__frame {
  opacity: 0.35;
  filter: blur(1px);
  pointer-events: none;
}
.coa-cert__lock-screen {
  position: relative;
  z-index: 5;
  max-width: 8.5in;
  margin: 0 auto 12px;
  padding: 16px;
  border: 2px solid #b45309;
  background: #fffbeb;
  color: #92400e;
  font-family: system-ui, sans-serif;
  font-size: 0.9rem;
  line-height: 1.5;
}
.coa-cert__thumb-missing {
  padding: 12px;
  border: 2px dashed #b45309;
  color: #92400e;
  font-size: 0.85rem;
  font-family: system-ui, sans-serif;
}
@media print {
  .coa-cert--locked,
  .coa-cert--locked * {
    display: none !important;
  }
  .coa-cert {
    box-shadow: none;
    max-width: none;
  }
  .coa-cert__frame {
    margin: 0;
    box-shadow: none;
  }
}
</style>
