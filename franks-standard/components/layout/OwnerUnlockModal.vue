<script setup>
const props = defineProps({
  open: { type: Boolean, default: false },
  error: { type: String, default: '' },
  submitting: { type: Boolean, default: false },
  keyConfigured: { type: Boolean, default: false },
})

const emit = defineEmits(['close', 'submit'])

const localPhrase = ref('')

watch(
  () => props.open,
  (isOpen) => {
    if (isOpen) localPhrase.value = ''
  },
)

function submit () {
  emit('submit', String(localPhrase.value || '').trim())
}
</script>

<template>
  <Teleport to="body">
    <div
      v-if="open"
      class="fixed inset-0 z-[300] flex items-center justify-center bg-black/70 p-4"
      @click.self="emit('close')"
    >
      <div
        class="w-full max-w-md rounded-xl border border-border bg-surface2 p-6 text-textMain shadow-xl"
        role="dialog"
        aria-modal="true"
        aria-label="Operator unlock"
        @click.stop
      >
        <h2 class="text-lg font-bold text-white mb-2">Operator access</h2>
        <p class="text-sm text-white/80 mb-4">
          Enter your private operator phrase. This is not your email login password.
        </p>
        <p v-if="!keyConfigured" class="text-sm text-amber-300 mb-4" role="alert">
          Operator unlock is not configured on this build yet. Add your phrase in GitHub Secrets, then redeploy.
        </p>
        <form v-if="keyConfigured" @submit.prevent="submit">
          <label class="block text-sm font-medium text-white mb-1" for="operator-phrase">Operator phrase</label>
          <input
            id="operator-phrase"
            v-model="localPhrase"
            type="password"
            autocomplete="off"
            class="w-full bg-bg border border-border rounded-md px-3 py-2 text-sm text-white mb-3"
            placeholder="Your private phrase"
          />
          <p v-if="error" class="text-sm text-red-300 mb-3" role="alert">{{ error }}</p>
        </form>
        <div class="flex justify-end gap-2 mt-2">
          <button
            type="button"
            class="px-3 py-2 text-sm rounded-md border border-border text-white/90 hover:border-gold"
            @click="emit('close')"
          >
            Cancel
          </button>
          <button
            v-if="keyConfigured"
            type="button"
            class="px-3 py-2 text-sm rounded-md bg-gold text-stone-900 font-medium hover:bg-goldLight disabled:opacity-50"
            :disabled="submitting"
            @click="submit"
          >
            {{ submitting ? 'Checking…' : 'Unlock' }}
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>
