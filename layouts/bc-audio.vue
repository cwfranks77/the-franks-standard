<template>
  <div class="bc-audio-shell">
    <BcAudioNav />
    <main class="bc-audio-main">
      <slot />
    </main>

    <OperatorUnlockModal
      :open="opModalOpen"
      :phrase="opPhrase"
      :error="opError"
      :submitting="opSubmitting"
      :key-configured="keyConfigured"
      :is-dev="isDev"
      @update:phrase="opPhrase = $event"
      @close="closeOpModal"
      @submit="submitOpModal"
    />

    <NuxtLink v-if="isOwner" to="/ops/panel" class="bc-owner-fab" title="Owner toolkit">
      <span class="bc-owner-fab__icon">⚙</span>
      <span class="bc-owner-fab__label">Owner</span>
    </NuxtLink>
  </div>
</template>

<script setup>
import { BC_BRAND } from '~/utils/bcBrand.js'

useHead({
  titleTemplate: (title) => title ? `${title} · ${BC_BRAND.full}` : BC_BRAND.full,
})

const {
  isDev,
  opModalOpen,
  opPhrase,
  opError,
  opSubmitting,
  keyConfigured,
  onBrandOrLogoClick,
  closeOpModal,
  submitOpModal,
} = useOpsLogoKnock()

provide('opsLogoKnock', onBrandOrLogoClick)

const { isOwner } = useOwnerMode()
</script>

<style scoped>
.bc-audio-shell {
  min-height: 100vh;
  background: #0a0a0c;
  color: #f5f5f7;
}
.bc-audio-main {
  min-height: calc(100vh - 64px);
}
.bc-owner-fab {
  position: fixed;
  bottom: 24px;
  right: 24px;
  z-index: 9000;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 18px;
  border-radius: 999px;
  background: linear-gradient(135deg, #d32f2f 0%, #b71c1c 100%);
  color: #fff;
  font-weight: 700;
  font-size: 0.9rem;
  box-shadow: 0 4px 24px rgba(211, 47, 47, 0.45);
  text-decoration: none;
}
.bc-owner-fab:hover {
  transform: translateY(-2px);
  color: #fff;
}
</style>
