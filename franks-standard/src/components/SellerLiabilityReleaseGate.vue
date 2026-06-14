<template>
  <section class="liability-gate card" role="region" aria-labelledby="seller-liability-title">
    <h2 id="seller-liability-title">{{ meta.title }}</h2>
    <p class="liability-eyebrow">{{ meta.subtitle }} · Version {{ LIABILITY_POLICY_VERSION }}</p>
    <p class="attorney-note text-muted small" role="note">
      Draft for operational use — have Louisiana counsel review when ready.
    </p>
    <ul class="liability-body">
      <li v-for="(para, idx) in paragraphs" :key="idx">{{ para }}</li>
    </ul>
    <div class="form-group">
      <label class="label" for="seller-liability-legal-name">Full legal name (electronic signature)</label>
      <input
        id="seller-liability-legal-name"
        :value="legalName"
        class="input"
        type="text"
        autocomplete="name"
        placeholder="As on government ID or tax documents"
        @input="emit('update:legalName', ($event.target).value)"
      />
    </div>
    <label class="agree-row">
      <input :checked="agreed" type="checkbox" @change="emit('update:agreed', ($event.target).checked)" />
      <span>{{ checkboxText }}</span>
    </label>
  </section>
</template>

<script setup>
import {
  LIABILITY_POLICY_VERSION,
  SELLER_RELEASE_GENERAL,
  SELLER_RELEASE_META,
  sellerReleaseBody,
  sellerReleaseCheckbox,
} from '~/utils/sellerLiabilityReleases.js'

const props = defineProps({
  releaseType: { type: String, required: true },
  legalName: { type: String, default: '' },
  agreed: { type: Boolean, default: false },
})

const emit = defineEmits(['update:legalName', 'update:agreed'])

const meta = computed(() => SELLER_RELEASE_META[props.releaseType] || SELLER_RELEASE_META[SELLER_RELEASE_GENERAL])
const paragraphs = computed(() => sellerReleaseBody(props.releaseType))
const checkboxText = computed(() => sellerReleaseCheckbox(props.releaseType))
</script>

<style scoped>
.liability-gate {
  padding: 20px 18px;
  margin: 20px 0;
  border: 2px solid rgba(185, 28, 28, 0.35);
  border-radius: var(--radius-lg);
  background: #fffbeb;
}
.liability-gate h2 {
  font-size: 1.05rem;
  margin: 0 0 6px;
  font-weight: 800;
}
.liability-eyebrow {
  font-size: 0.72rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: #92400e;
  margin: 0 0 12px;
  font-weight: 700;
}
.liability-body {
  margin: 0 0 14px;
  padding-left: 1.1rem;
  font-size: 0.82rem;
  line-height: 1.55;
  color: #374151;
}
.liability-body li { margin-bottom: 8px; }
.agree-row {
  display: flex;
  gap: 10px;
  align-items: flex-start;
  font-size: 0.84rem;
  line-height: 1.5;
  font-weight: 600;
  cursor: pointer;
}
.agree-row input { margin-top: 4px; accent-color: var(--gold); }
</style>
