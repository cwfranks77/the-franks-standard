<script setup>
import { MIN_DESCRIPTION_CHARS } from '~/utils/coaIssuance'
import { COA_SELLER_REQUIREMENT_STEPS } from '~/utils/franksCoaModel.js'

const props = defineProps({
  thumbnailCount: { type: Number, default: 0 },
  descriptionLength: { type: Number, default: 0 },
  hasSerial: { type: Boolean, default: false },
  hasSignature: { type: Boolean, default: false },
  authVerified: { type: Boolean, default: false },
})

function stepDone (id) {
  if (id === 'thumbnails') return props.thumbnailCount >= 1
  if (id === 'description') return props.descriptionLength >= MIN_DESCRIPTION_CHARS
  if (id === 'serial') return props.hasSerial
  if (id === 'signature') return props.hasSignature
  if (id === 'verified') return props.authVerified
  return false
}

const allComplete = computed(() =>
  COA_SELLER_REQUIREMENT_STEPS.every((s) => stepDone(s.id)),
)
</script>

<template>
  <div class="coa-req-checklist">
    <p class="coa-req-checklist__title">Requirements before COA print (all required)</p>
    <ul class="coa-req-checklist__list">
      <li
        v-for="step in COA_SELLER_REQUIREMENT_STEPS"
        :key="step.id"
        class="coa-req-checklist__item"
        :class="{ done: stepDone(step.id) }"
      >
        <span class="coa-req-checklist__mark" aria-hidden="true">{{ stepDone(step.id) ? '✓' : '○' }}</span>
        <div>
          <strong>{{ step.title }}</strong>
          <p>{{ step.desc }}</p>
        </div>
      </li>
    </ul>
    <p v-if="allComplete" class="coa-req-checklist__ok" role="status">
      All requirements met — server may issue or unlock print when you publish or sync.
    </p>
    <p v-else class="coa-req-checklist__pending" role="status">
      Complete every step above before print unlocks. COA transfer to another item is never allowed.
    </p>
  </div>
</template>

<style scoped>
.coa-req-checklist {
  border: 1px solid rgba(201, 168, 76, 0.35);
  border-radius: 8px;
  padding: 14px;
  background: rgba(0, 0, 0, 0.25);
}
.coa-req-checklist__title {
  font-weight: 700;
  font-size: 0.85rem;
  margin: 0 0 10px;
  color: #e8d5a3;
}
.coa-req-checklist__list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.coa-req-checklist__item {
  display: flex;
  gap: 10px;
  font-size: 0.82rem;
  line-height: 1.45;
  color: #d1d5db;
  opacity: 0.85;
}
.coa-req-checklist__item.done {
  opacity: 1;
  color: #ecfdf5;
}
.coa-req-checklist__item p {
  margin: 2px 0 0;
  font-size: 0.78rem;
  color: #9ca3af;
}
.coa-req-checklist__item.done p { color: #a7f3d0; }
.coa-req-checklist__mark {
  flex-shrink: 0;
  width: 1.25rem;
  font-weight: 700;
  color: #fbbf24;
}
.coa-req-checklist__item.done .coa-req-checklist__mark { color: #34d399; }
.coa-req-checklist__ok {
  margin: 12px 0 0;
  font-size: 0.8rem;
  color: #6ee7b7;
}
.coa-req-checklist__pending {
  margin: 12px 0 0;
  font-size: 0.8rem;
  color: #fcd34d;
}
</style>
