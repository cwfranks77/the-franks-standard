<script setup lang="ts">
const props = withDefaults(defineProps<{
  label: string
  modelValue: string
  rows?: number
  mono?: boolean
  charMax?: number
  rewriting?: boolean
  showCopy?: boolean
  hint?: string
}>(), {
  rows: 3,
  mono: false,
  rewriting: false,
  showCopy: true,
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
  rewrite: []
  copy: []
}>()

function onInput (event: Event) {
  emit('update:modelValue', (event.target as HTMLTextAreaElement).value)
}
</script>

<template>
  <div class="result-section editable-section">
    <div class="section-head">
      <h4>
        {{ label }}
        <span v-if="charMax" class="char-count">{{ (modelValue || '').length }}/{{ charMax }}</span>
      </h4>
      <div class="section-actions">
        <button
          type="button"
          class="btn-ai"
          :disabled="rewriting"
          @click="emit('rewrite')"
        >
          {{ rewriting ? 'Rewriting…' : '✨ AI rewrite' }}
        </button>
        <button
          v-if="showCopy"
          type="button"
          class="btn btn-outline btn-sm"
          @click="emit('copy')"
        >
          Copy
        </button>
      </div>
    </div>
    <p v-if="hint" class="section-hint">{{ hint }}</p>
    <textarea
      :value="modelValue"
      class="editable-block"
      :class="{ mono }"
      :rows="rows"
      @input="onInput"
    />
  </div>
</template>

<style scoped>
.section-head {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 8px;
}
.section-head h4 { margin-bottom: 0; }
.section-actions { display: flex; flex-wrap: wrap; gap: 6px; }
.section-hint {
  font-size: 0.78rem;
  color: var(--stone-400);
  margin: 0 0 8px;
  line-height: 1.4;
}
.btn-ai {
  padding: 6px 12px;
  border-radius: 999px;
  border: 1px solid rgba(139, 92, 255, 0.5);
  background: linear-gradient(135deg, rgba(139, 92, 255, 0.18), rgba(0, 224, 255, 0.12));
  color: var(--cyan);
  font-size: 0.78rem;
  font-weight: 700;
  cursor: pointer;
  font-family: inherit;
}
.btn-ai:disabled { opacity: 0.55; cursor: wait; }
.editable-block {
  width: 100%;
  padding: 12px 14px;
  border: 1px solid var(--stone-600);
  border-radius: var(--radius);
  background: rgba(0, 0, 0, 0.35);
  color: var(--stone-100);
  font-size: 0.88rem;
  line-height: 1.55;
  resize: vertical;
  min-height: 72px;
  font-family: inherit;
}
.editable-block.mono {
  font-family: ui-monospace, monospace;
  font-size: 0.78rem;
}
.editable-block:focus {
  outline: none;
  border-color: var(--gold);
  box-shadow: 0 0 0 2px rgba(201, 168, 76, 0.15);
}
</style>
