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
import { useLogoOwnerKnock } from '~/franks-standard/composables/useLogoOwnerKnock'

const {
  modalOpen,
  error,
  submitting,
  keyConfigured,
  closeModal,
  submitModal,
} = useLogoOwnerKnock()

if (import.meta.client) {
  onMounted(() => {
    modalOpen.value = false
  })
}
</script>
