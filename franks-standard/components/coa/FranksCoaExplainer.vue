<script setup>
import { FRANKS_COA_HOW_IT_WORKS_STEPS, PLATFORM_DOES_NOT_BULLETS, PLATFORM_ROLE_BULLETS } from '~/utils/franksCoaModel.js'

defineProps({
  compact: { type: Boolean, default: false },
  showRoles: { type: Boolean, default: true },
})
</script>

<template>
  <div class="coa-explainer" :class="{ 'coa-explainer--compact': compact }">
    <ol class="coa-explainer__steps">
      <li v-for="step in FRANKS_COA_HOW_IT_WORKS_STEPS" :key="step.title">
        <strong>{{ step.title }}</strong> — {{ step.desc }}
      </li>
    </ol>
    <template v-if="showRoles && !compact">
      <p class="coa-explainer__sub">What the Platform does</p>
      <ul><li v-for="(b, i) in PLATFORM_ROLE_BULLETS" :key="'r-' + i">{{ b }}</li></ul>
      <p class="coa-explainer__sub">What the Platform does not do</p>
      <ul class="coa-explainer__not"><li v-for="(b, i) in PLATFORM_DOES_NOT_BULLETS" :key="'n-' + i">{{ b }}</li></ul>
    </template>
  </div>
</template>

<style scoped>
.coa-explainer {
  font-size: 0.85rem;
  line-height: 1.55;
  color: #374151;
  margin: 12px 0;
}
.coa-explainer--compact { font-size: 0.8rem; }
.coa-explainer__steps {
  padding-left: 1.2rem;
  margin: 0 0 10px;
}
.coa-explainer__steps li { margin-bottom: 6px; }
.coa-explainer__sub {
  font-weight: 700;
  font-size: 0.78rem;
  margin: 10px 0 4px;
  text-transform: uppercase;
  letter-spacing: 0.06em;
}
.coa-explainer ul {
  padding-left: 1.1rem;
  margin: 0 0 8px;
  font-size: 0.82rem;
}
.coa-explainer__not { color: #92400e; }
</style>
