<script setup>
defineProps({
  open: { type: Boolean, default: false },
  phrase: { type: String, default: '' },
  error: { type: String, default: '' },
  submitting: { type: Boolean, default: false },
  keyConfigured: { type: Boolean, default: false },
  isDev: { type: Boolean, default: false },
})

const emit = defineEmits(['update:phrase', 'close', 'submit'])
</script>

<template>
  <Teleport to="body">
    <div
      v-if="open"
      class="op-modal-backdrop"
      @click.self="emit('close')"
    >
      <div
        class="op-modal"
        role="dialog"
        aria-modal="true"
        aria-label="Operator unlock"
      >
        <h2 class="op-modal-h">Operator access</h2>
        <p class="op-modal-sub text-muted">
          Enter your <strong>owner password</strong> (the private phrase you set for this site — not your email login).
        </p>
        <p v-if="isDev" class="op-hint text-muted">
          Dev: open the modal with <code>?ops=unlock</code> on any URL, then set a key in <code>.env</code> and restart.
        </p>
        <form @submit.prevent="emit('submit')">
          <div v-if="!keyConfigured" class="op-warn" role="alert">
            Add owner unlock secrets (build + Supabase <code>ops-session</code>), then rebuild and deploy.
          </div>
          <template v-else>
            <div class="form-group">
              <label class="label" for="op-phrase">Your phrase (access key)</label>
              <input
                id="op-phrase"
                :value="phrase"
                class="input"
                type="password"
                autocomplete="off"
                placeholder="Owner password"
                @input="emit('update:phrase', $event.target.value)"
              />
            </div>
          </template>
          <p v-if="error" class="op-err" role="alert">{{ error }}</p>
          <div class="op-modal-actions">
            <button type="button" class="btn btn-outline btn-sm" @click="emit('close')">Cancel</button>
            <button
              type="submit"
              class="btn btn-primary btn-sm"
              :disabled="!keyConfigured || submitting"
            >{{ submitting ? 'Checking' : 'Unlock' }}</button>
          </div>
        </form>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.op-modal-backdrop {
  position: fixed;
  inset: 0;
  z-index: 10000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(4px);
}
.op-modal {
  max-width: 400px;
  width: 100%;
  padding: 28px 24px;
  background: #16161c;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  box-shadow: 0 24px 50px rgba(0, 0, 0, 0.5);
}
.op-modal-h { font-size: 1.25rem; margin-bottom: 6px; color: #f5f5f7; }
.op-modal-sub { font-size: 0.9rem; margin-bottom: 16px; }
.op-warn {
  font-size: 0.85rem;
  color: #e5e7eb;
  background: rgba(211, 47, 47, 0.12);
  border: 1px solid rgba(211, 47, 47, 0.35);
  border-radius: 8px;
  padding: 10px;
  margin-bottom: 12px;
}
.op-err { color: #ff5252; font-size: 0.88rem; margin-top: 6px; }
.op-modal-actions { display: flex; justify-content: flex-end; gap: 10px; margin-top: 16px; }
.op-hint { font-size: 0.8rem; margin: 0 0 8px; }
</style>
