<template>
  <div class="ai-root">
    <button
      type="button"
      class="ai-fab"
      aria-label="Open help assistant"
      @click="open = !open"
    >
      <span class="ai-fab-mark" aria-hidden="true">?</span>
      <span class="ai-fab-label">Help</span>
    </button>
    <Transition name="ai-panel">
      <div v-show="open" class="ai-backdrop" @click.self="open = false" />
    </Transition>
    <Transition name="ai-panel">
      <aside v-show="open" class="ai-panel" role="dialog" aria-label="AI help assistant (beta)">
        <div class="ai-head">
          <h2>Assistant (beta)</h2>
          <p class="ai-sub">AI-style answers. Dictate with the mic (Chrome/Edge). Live voice with people: open Video in the menu.</p>
          <button type="button" class="ai-x" aria-label="Close" @click="open = false">&times;</button>
        </div>
        <div ref="logEl" class="ai-log" role="log" aria-live="polite">
          <div
            v-for="(m, i) in messages"
            :key="i"
            :class="['ai-msg', m.role === 'user' ? 'is-user' : 'is-bot']"
          >{{ m.text }}</div>
        </div>
        <form class="ai-form" @submit.prevent="send">
          <input
            v-model="input"
            class="input"
            type="text"
            autocomplete="off"
            placeholder="Type or use mic to ask…"
            maxlength="500"
          />
          <button
            v-if="voiceSupported"
            type="button"
            class="btn btn-outline btn-sm ai-mic"
            :class="{ 'is-listening': listening }"
            :aria-pressed="listening"
            :title="listening ? 'Listening…' : 'Speak your question'"
            @click="toggleVoice"
          >
            {{ listening ? '…' : 'Mic' }}
          </button>
          <button type="submit" class="btn btn-primary btn-sm">Send</button>
        </form>
        <div class="ai-esc-row">
          <NuxtLink to="/support" class="ai-esc" @click="open = false">Support and tech &rarr;</NuxtLink>
          <NuxtLink to="/contact" class="ai-esc" @click="open = false">Contact the team &rarr;</NuxtLink>
        </div>
      </aside>
    </Transition>
  </div>
</template>

<script setup>
import { getAiReply } from '~/composables/useAiSupport'

const open = ref(false)
const input = ref('')
const logEl = ref(null)
const messages = ref([{ role: 'bot', text: getAiReply('') }])
const listening = ref(false)
let recognition = null

const voiceSupported = computed(() => {
  if (!import.meta.client) { return false }
  return !!(window.SpeechRecognition || window.webkitSpeechRecognition)
})

function pushBot (text) {
  messages.value.push({ role: 'bot', text })
  nextTick(() => {
    if (logEl.value) { logEl.value.scrollTop = logEl.value.scrollHeight }
  })
}

function toggleVoice () {
  if (!import.meta.client || !voiceSupported.value) { return }
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition
  if (listening.value && recognition) {
    try { recognition.stop() } catch (_) {}
    listening.value = false
    return
  }
  try {
    recognition = new SR()
    recognition.lang = 'en-US'
    recognition.interimResults = false
    recognition.maxAlternatives = 1
    recognition.onstart = () => { listening.value = true }
    recognition.onend = () => { listening.value = false }
    recognition.onerror = () => {
      listening.value = false
      pushBot('Mic did not catch that. Try again or type your question. Voice works best in Chrome or Edge on desktop.')
    }
    recognition.onresult = (ev) => {
      const t = ev.results?.[0]?.[0]?.transcript?.trim()
      if (t) {
        input.value = (input.value ? `${input.value} ` : '') + t
      }
    }
    recognition.start()
  } catch (_) {
    pushBot('Voice input is not available in this browser. Please type your question.')
  }
}

function send () {
  const t = (input.value || '').trim()
  if (!t) { return }
  messages.value.push({ role: 'user', text: t })
  input.value = ''
  const reply = getAiReply(t).replace(/\*\*([^*]+)\*\*/g, '$1')
  messages.value.push({ role: 'bot', text: reply })
  nextTick(() => {
    if (logEl.value) { logEl.value.scrollTop = logEl.value.scrollHeight }
  })
}
</script>

<style scoped>
.ai-root { position: fixed; z-index: 8000; bottom: 0; right: 0; pointer-events: none; }
.ai-fab {
  pointer-events: auto;
  position: fixed;
  bottom: 22px; right: 20px;
  display: inline-flex; align-items: center; gap: 10px;
  padding: 12px 18px;
  border-radius: 999px;
  border: 1px solid rgba(255, 216, 77, 0.45);
  background: linear-gradient(135deg, rgba(255, 45, 122, 0.45), rgba(18, 8, 32, 0.98));
  color: #fff; font-weight: 700; font-size: 0.95rem; cursor: pointer;
  box-shadow: 0 8px 28px rgba(0, 0, 0, 0.45);
  outline: none;
}
.ai-fab:focus-visible {
  outline: 2px solid var(--gold);
  outline-offset: 3px;
}
.ai-fab:hover { filter: brightness(1.06); }
.ai-fab-mark {
  flex: 0 0 auto;
  width: 26px; height: 26px;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.35);
  border: 1px solid rgba(255, 216, 77, 0.5);
  color: var(--gold);
  font-size: 1rem; font-weight: 800; line-height: 24px; text-align: center;
}
.ai-fab-label { line-height: 1.2; }
.ai-backdrop { position: fixed; inset: 0; background: rgba(0,0,0,0.45); pointer-events: auto; }
.ai-panel {
  pointer-events: auto;
  position: fixed; bottom: 0; right: 0; width: min(400px, 100vw);
  max-height: min(520px, 100vh);
  display: flex; flex-direction: column;
  background: #120e1c; border: 1px solid rgba(0, 224, 255, 0.2);
  border-radius: 16px 0 0 0; box-shadow: -8px 0 40px rgba(0,0,0,0.5);
}
@media (min-width: 500px) {
  .ai-panel { right: 20px; bottom: 78px; border-radius: 16px; max-height: 70vh; }
  .ai-backdrop { display: none; }
}
.ai-head { padding: 16px; border-bottom: 1px solid var(--stone-800); position: relative; }
.ai-head h2 { font-size: 1.1rem; color: var(--gold); }
.ai-sub { font-size: 0.8rem; color: var(--stone-500); margin-top: 4px; }
.ai-x { position: absolute; top: 10px; right: 10px; background: none; border: none; color: var(--stone-400); font-size: 1.5rem; line-height: 1; cursor: pointer; }
.ai-log { flex: 1; overflow: auto; padding: 12px; display: flex; flex-direction: column; gap: 10px; }
.ai-msg { font-size: 0.9rem; line-height: 1.45; border-radius: 10px; padding: 10px 12px; }
.ai-msg.is-user { background: rgba(0, 224, 255, 0.12); align-self: flex-end; max-width: 92%; }
.ai-msg.is-bot { background: rgba(255, 45, 122, 0.08); align-self: flex-start; color: var(--stone-200); }
.ai-form { display: flex; flex-wrap: wrap; gap: 8px; padding: 12px; border-top: 1px solid var(--stone-800); align-items: center; }
.ai-form .input { flex: 1; min-width: 120px; }
.ai-mic { min-width: 44px; }
.ai-mic.is-listening { border-color: var(--magenta, #ff2d7a); color: var(--magenta, #ff2d7a); }
.ai-esc-row { display: flex; flex-direction: column; gap: 6px; padding: 0 12px 14px; }
.ai-esc { display: block; font-size: 0.82rem; }
.ai-panel-enter-active, .ai-panel-leave-active { transition: opacity 0.2s ease, transform 0.25s ease; }
.ai-panel-enter-from, .ai-panel-leave-to { opacity: 0; transform: translateY(8px); }
</style>
