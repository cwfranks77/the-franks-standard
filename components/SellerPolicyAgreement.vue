<template>
  <section class="seller-policy-gate card" role="region" aria-labelledby="seller-policy-title">
    <h2 id="seller-policy-title">Seller policy agreement (required)</h2>
    <p class="intro">{{ SELLER_DIGITAL_AGREEMENT_INTRO }}</p>
    <p class="version text-muted small">
      Policy version: <strong>{{ SELLER_POLICY_VERSION }}</strong> (effective {{ SELLER_POLICY_EFFECTIVE_LABEL }})
    </p>

    <ul class="doc-list">
      <li v-for="doc in SELLER_POLICY_DOCUMENTS" :key="doc.id">
        <NuxtLink :to="doc.path" target="_blank" rel="noopener">{{ doc.label }}</NuxtLink>
        <span v-if="doc.required" class="req">Required</span>
      </li>
    </ul>

    <div class="form-group">
      <label class="label" for="seller-policy-legal-name">Full legal name (electronic signature)</label>
      <input
        id="seller-policy-legal-name"
        v-model="legalName"
        class="input"
        type="text"
        autocomplete="name"
        placeholder="As it appears on government ID or tax documents"
        :disabled="submitting"
      />
    </div>

    <label class="agree-all">
      <input v-model="agreeAll" type="checkbox" :disabled="submitting" />
      <span>
        {{ SELLER_DIGITAL_AGREEMENT_CLOSING }}
        I have read and digitally agree to <strong>all</strong> policies listed above.
      </span>
    </label>

    <p v-if="error" class="error-text" role="alert">{{ error }}</p>

    <div class="policy-actions">
      <button
        type="button"
        class="btn btn-primary btn-lg policy-sign-btn"
        :disabled="submitting || !canSubmit"
        @click="onSubmit"
      >
        {{ submitting ? 'Recording signature…' : 'Digitally sign & agree — unlock selling' }}
      </button>
      <button
        v-if="error && !submitting"
        type="button"
        class="btn btn-outline btn-lg policy-retry-btn"
        @click="onSubmit"
      >
        Try again
      </button>
    </div>
  </section>
</template>

<script setup>
import {
  SELLER_POLICY_DOCUMENTS,
  SELLER_POLICY_VERSION,
  SELLER_POLICY_EFFECTIVE_LABEL,
  SELLER_DIGITAL_AGREEMENT_INTRO,
  SELLER_DIGITAL_AGREEMENT_CLOSING,
} from '~/utils/sellerPolicyBundle.js'

const emit = defineEmits(['accepted'])

const {
  submitting,
  error,
  submitAcceptance,
} = useSellerPolicyAcceptance()

const legalName = ref('')
const agreeAll = ref(false)

const canSubmit = computed(() => {
  return agreeAll.value && legalName.value.trim().length >= 2
})

onMounted(() => {
  if (submitting.value) submitting.value = false
})

async function onSubmit () {
  if (!canSubmit.value || submitting.value) return
  const docIds = SELLER_POLICY_DOCUMENTS.filter((d) => d.required).map((d) => d.id)
  const ok = await submitAcceptance(legalName.value.trim(), docIds)
  if (ok) emit('accepted')
}
</script>

<style scoped>
.seller-policy-gate {
  padding: 28px 24px;
  margin-bottom: 28px;
  border: 2px solid rgba(201, 168, 76, 0.45);
  border-radius: var(--radius-lg);
  background: linear-gradient(135deg, rgba(201, 168, 76, 0.06), rgba(15, 23, 42, 0.04));
}
.seller-policy-gate h2 {
  font-family: 'Cinzel', Georgia, serif;
  font-size: 1.25rem;
  margin-bottom: 12px;
}
.intro { font-size: 0.92rem; line-height: 1.6; color: #374151; font-weight: 600; }
.doc-list {
  list-style: none;
  padding: 0;
  margin: 16px 0;
}
.doc-list li {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 0;
  border-bottom: 1px solid #e5e7eb;
  font-size: 0.9rem;
}
.doc-list a { color: var(--gold); font-weight: 700; }
.req {
  font-size: 0.7rem;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: #92400e;
  font-weight: 800;
}
.agree-all {
  display: flex;
  gap: 10px;
  align-items: flex-start;
  margin: 16px 0 20px;
  font-size: 0.88rem;
  line-height: 1.5;
  font-weight: 600;
  cursor: pointer;
}
.agree-all input { margin-top: 4px; accent-color: var(--gold); }
.error-text { color: #b91c1c; font-size: 0.88rem; margin-bottom: 12px; }
.policy-actions {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.policy-sign-btn,
.policy-retry-btn {
  width: 100%;
}
</style>
