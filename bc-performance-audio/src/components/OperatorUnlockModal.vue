<script setup>
const props = defineProps({
  open: { type: Boolean, default: false },
  phrase: { type: String, default: '' },
  error: { type: String, default: '' },
  submitting: { type: Boolean, default: false },
  keyConfigured: { type: Boolean, default: true },
  isDev: { type: Boolean, default: false },
})

const emit = defineEmits(['update:phrase', 'close', 'submit'])

function onInput (e) {
  emit('update:phrase', e.target.value)
}

function onKeydown (e) {
  if (e.key === 'Enter') emit('submit')
  if (e.key === 'Escape') emit('close')
}
</script>

<template>
  <div v-if="open" class="op-modal" role="dialog" aria-modal="true" aria-label="Owner unlock">
    <div class="op-modal__backdrop" @click="emit('close')" />
    <div class="op-modal__card">
      <h2>Owner unlock</h2>
      <p>Enter your owner phrase to open the B&amp;C console.</p>
      <p v-if="!keyConfigured" class="op-modal__warn">Owner phrase is not configured on this deploy.</p>
      <input
        :value="phrase"
        class="input op-modal__input"
        type="password"
        autocomplete="off"
        placeholder="Owner phrase"
        @input="onInput"
        @keydown="onKeydown"
      >
      <p v-if="error" class="op-modal__err">{{ error }}</p>
      <div class="op-modal__actions">
        <button type="button" class="btn btn-outline btn-sm" @click="emit('close')">Cancel</button>
        <button type="button" class="btn btn-primary btn-sm" :disabled="submitting" @click="emit('submit')">
          {{ submitting ? 'Checking…' : 'Unlock' }}
        </button>
      </div>
      <p v-if="isDev" class="op-modal__hint">Dev mode — phrase hash must match NUXT_PUBLIC_OPS_ACCESS_KEY.</p>
    </div>
  </div>
</template>

<style scoped>
.op-modal {
  position: fixed;
  inset: 0;
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
}
.op-modal__backdrop {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.72);
}
.op-modal__card {
  position: relative;
  width: min(420px, 100%);
  padding: 1.5rem;
  border-radius: 12px;
  border: 1px solid rgba(211, 47, 47, 0.35);
  background: #16161c;
  color: #f5f5f7;
}
.op-modal__card h2 { margin: 0 0 8px; color: #ff5252; font-size: 1.2rem; }
.op-modal__card p { margin: 0 0 12px; color: #b8bcc6; font-size: 0.9rem; line-height: 1.5; }
.op-modal__input { width: 100%; margin-bottom: 10px; }
.op-modal__err { color: #ff8a80; font-size: 0.88rem; }
.op-modal__warn { color: #ffd814; }
.op-modal__hint { font-size: 0.75rem; color: #7a8190; margin-top: 10px; }
.op-modal__actions { display: flex; gap: 8px; justify-content: flex-end; margin-top: 12px; }
</style>
