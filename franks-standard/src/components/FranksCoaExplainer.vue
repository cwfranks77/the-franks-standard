<template>
  <div class="franks-coa-explainer" :class="{ compact }">
    <h3 v-if="showTitle" class="explainer-title">{{ SELLER_WRITTEN_GUARANTEE_LABEL }}</h3>
    <p class="explainer-lead">{{ SELLER_WRITTEN_GUARANTEE_DEFINITION }}</p>
    <ol class="explainer-steps">
      <li v-for="(step, i) in FRANKS_COA_HOW_IT_WORKS_STEPS" :key="i">
        <strong>{{ step.title }}</strong> — {{ step.desc }}
      </li>
    </ol>
    <div v-if="showRoles" class="role-grid">
      <div>
        <p class="role-head">What we provide</p>
        <ul>
          <li v-for="(line, i) in PLATFORM_ROLE_BULLETS" :key="'p' + i">{{ line }}</li>
        </ul>
      </div>
      <div>
        <p class="role-head">What we do not do</p>
        <ul>
          <li v-for="(line, i) in PLATFORM_DOES_NOT_BULLETS" :key="'n' + i">{{ line }}</li>
        </ul>
      </div>
    </div>
    <slot />
  </div>
</template>

<script setup>
import {
  FRANKS_COA_HOW_IT_WORKS_STEPS,
  PLATFORM_DOES_NOT_BULLETS,
  PLATFORM_ROLE_BULLETS,
  SELLER_WRITTEN_GUARANTEE_DEFINITION,
  SELLER_WRITTEN_GUARANTEE_LABEL,
} from '~/utils/franksCoaModel.js'

defineProps({
  showTitle: { type: Boolean, default: true },
  showRoles: { type: Boolean, default: true },
  compact: { type: Boolean, default: false },
})
</script>

<style scoped>
.franks-coa-explainer {
  margin-top: 12px;
  padding: 14px 16px;
  border-radius: 10px;
  background: #fffbeb;
  border: 1px solid #fde68a;
}
.franks-coa-explainer.compact {
  padding: 10px 12px;
  font-size: 0.88rem;
}
.explainer-title {
  font-size: 0.95rem;
  font-weight: 800;
  color: #92400e;
  margin: 0 0 8px;
}
.explainer-lead {
  margin: 0 0 12px;
  line-height: 1.55;
  font-weight: 600;
  color: #374151;
  font-size: 0.86rem;
}
.explainer-steps {
  margin: 0 0 12px;
  padding-left: 1.2rem;
  line-height: 1.5;
  font-size: 0.84rem;
  color: #4b5563;
}
.explainer-steps li { margin-bottom: 8px; }
.role-grid {
  display: grid;
  gap: 12px;
  grid-template-columns: 1fr 1fr;
}
@media (max-width: 640px) {
  .role-grid { grid-template-columns: 1fr; }
}
.role-head {
  font-size: 0.72rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: #92400e;
  margin: 0 0 6px;
}
.role-grid ul {
  margin: 0;
  padding-left: 1.1rem;
  font-size: 0.8rem;
  line-height: 1.45;
  color: #4b5563;
}
.role-grid li { margin-bottom: 4px; }
</style>
