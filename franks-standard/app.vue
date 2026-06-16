<!-- app.vue -->
<template>
  <NuxtPage />
  <OwnerUnlockModal
    :open="modalOpen"
    :phrase="phrase"
    :error="error"
    :submitting="submitting"
    :key-configured="keyConfigured"
    @update:phrase="onPhraseInput"
    @close="closeModal"
    @submit="submitModal"
  />
</template>

<script setup>
const {
  modalOpen,
  phrase,
  submitting,
  keyConfigured,
  error,
  closeModal,
  submitModal,
} = useLogoOwnerKnock()

function onPhraseInput (value) {
  phrase.value = value
}
</script>
