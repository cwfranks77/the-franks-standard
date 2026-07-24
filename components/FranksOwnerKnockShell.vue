<template>
  <ClientOnly>
    <OwnerUnlockModal
      :open="modalOpen"
      :error="error"
      :submitting="submitting"
      :key-configured="keyConfigured"
      @close="closeModal()"
      @submit="submitModal"
    />
  </ClientOnly>
</template>

<script setup>
/**
 * Mounts the hidden operator unlock modal for The Franks Standard only.
 * Logo 5-tap logic lives in useLogoOwnerKnock (shared with MainHeader).
 * Do not clear modalOpen on mount — that raced LazyFranksOwnerKnockShell and closed the popup.
 */
import { useLogoOwnerKnock } from '~/composables/useLogoOwnerKnock'

const {
  modalOpen,
  error,
  submitting,
  keyConfigured,
  closeModal,
  submitModal,
} = useLogoOwnerKnock()
</script>
