<template>
  <section class="buyer-policy-gate card" role="region" aria-labelledby="buyer-policy-title">
    <h2 id="buyer-policy-title">Buyer agreement (required before first purchase)</h2>
    <p class="intro">{{ BUYER_DIGITAL_AGREEMENT_INTRO }}</p>
    <p class="version text-muted small">
      Policy version: <strong>{{ BUYER_POLICY_VERSION }}</strong>
    </p>
    <ul class="doc-list">
      <li v-for="doc in BUYER_POLICY_DOCUMENTS" :key="doc.id">
        <NuxtLink :to="doc.path" target="_blank" rel="noopener">{{ doc.label }}</NuxtLink>
      </li>
    </ul>
    <ul class="summary-list">
      <li v-for="(line, idx) in BUYER_AGREEMENT_SECTIONS" :key="idx">{{ line }}</li>
    </ul>
    <div class="form-group">
      <label class="label" for="buyer-policy-legal-name">Full legal name (electronic signature)</label>
      <input
        id="buyer-policy-legal-name"
        v-model="legalName"
        class="input"
        type="text"
        autocomplete="name"
        :disabled="submitting"
      />
    </div>
    <label class="agree-all">
      <input v-model="agreeAll" type="checkbox" :disabled="submitting" />
      <span>{{ BUYER_AGREEMENT_CHECKBOX }} {{ BUYER_DIGITAL_AGREEMENT_CLOSING }}</span>
    </label>
    <p v-if="error" class="error-text" role="alert">{{ error }}</p>
    <button
      type="button"
      class="btn btn-primary btn-lg"
      :disabled="submitting || !canSubmit"
      @click="onSubmit"
    >
      {{ submitting ? 'Recording…' : 'Sign & continue to checkout' }}
    </button>
  </section>
</template>

<script setup>
import {
  BUYER_POLICY_DOCUMENTS,
  BUYER_POLICY_VERSION,
  BUYER_DIGITAL_AGREEMENT_INTRO,
  BUYER_DIGITAL_AGREEMENT_CLOSING,
  BUYER_AGREEMENT_SECTIONS,
  BUYER_AGREEMENT_CHECKBOX,
} from '~/utils/buyerPolicyBundle.js'

const emit = defineEmits(['accepted'])

const {
  submitting,
  error,
  submitAcceptance,
} = useBuyerPolicyAcceptance()

const legalName = ref('')
const agreeAll = ref(false)

const canSubmit = computed(() => agreeAll.value && legalName.value.trim().length >= 2)

async function onSubmit () {
  if (!canSubmit.value || submitting.value) return
  const docIds = BUYER_POLICY_DOCUMENTS.filter((d) => d.required).map((d) => d.id)
  const ok = await submitAcceptance(legalName.value.trim(), docIds)
  if (ok) emit('accepted')
}
</script>

<style scoped>
.buyer-policy-gate {
  padding: 24px 20px;
  margin-bottom: 20px;
  border: 2px solid rgba(201, 168, 76, 0.45);
  border-radius: var(--radius-lg);
}
.intro { font-size: 0.9rem; line-height: 1.55; font-weight: 600; }
.doc-list { list-style: none; padding: 0; margin: 12px 0; }
.doc-list li { padding: 6px 0; border-bottom: 1px solid #e5e7eb; }
.doc-list a { color: var(--gold); font-weight: 700; }
.summary-list { font-size: 0.82rem; line-height: 1.5; color: #374151; margin-bottom: 14px; }
.agree-all {
  display: flex;
  gap: 10px;
  align-items: flex-start;
  margin: 14px 0;
  font-size: 0.84rem;
  font-weight: 600;
  cursor: pointer;
}
.error-text { color: #b91c1c; font-size: 0.88rem; }
</style>
