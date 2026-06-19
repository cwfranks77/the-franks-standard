<script setup>
import { getBcAiReply } from '~/composables/useBcAiSupport'
import { getBcSupport } from '~/utils/bcSupport.js'
import { BC_BRAND } from '~/utils/bcBrand.js'

const config = useRuntimeConfig()
const support = computed(() => getBcSupport(config))

const open = ref(false)
const input = ref('')
const logEl = ref(null)
const messages = ref([{ role: 'bot', text: getBcAiReply('', support.value) }])
const listening = ref(false)
let recognition = null

const voiceSupported = computed(() => {
  if (!import.meta.client) return false
  return !!(window.SpeechRecognition || window.webkitSpeechRecognition)
})

watch(support, () => {
  messages.value = [{ role: 'bot', text: getBcAiReply('', support.value) }]
}, { deep: true })

function pushBot (text) {
  messages.value.push({ role: 'bot', text })
  nextTick(() => {
    if (logEl.value) logEl.value.scrollTop = logEl.value.scrollHeight
  })
}

function toggleVoice () {
  if (!import.meta.client || !voiceSupported.value) return
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
      pushBot('Mic did not catch that. Try again or type your question.')
    }
    recognition.onresult = (ev) => {
      const t = ev.results?.[0]?.[0]?.transcript?.trim()
      if (t) input.value = (input.value ? `${input.value} ` : '') + t
    }
    recognition.start()
  } catch {
    pushBot('Voice input is not available in this browser. Please type your question.')
  }
}

function escapeHtml (text) {
  const d = document.createElement('div')
  d.textContent = text
  return d.innerHTML
}

function formatBotMsg (text) {
  let s = escapeHtml(text)
  s = s.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
  s = s.replace(/\n/g, '<br>')
  s = s.replace(/• /g, '&bull; ')
  return s
}

function send () {
  const t = (input.value || '').trim()
  if (!t) return
  messages.value.push({ role: 'user', text: t })
  input.value = ''
  messages.value.push({ role: 'bot', text: getBcAiReply(t, support.value) })
  nextTick(() => {
    if (logEl.value) logEl.value.scrollTop = logEl.value.scrollHeight
  })
}
</script>

<template>
  <div class="bc-ai-root">
    <button
      type="button"
      class="bc-ai-fab"
      aria-label="Open B and C help assistant"
      @click="open = !open"
    >
      <span class="bc-ai-fab-mark" aria-hidden="true">💬</span>
      <span class="bc-ai-fab-label">B&amp;C Help</span>
    </button>
    <Transition name="bc-ai-panel">
      <div v-show="open" class="bc-ai-backdrop" @click.self="open = false" />
    </Transition>
    <Transition name="bc-ai-panel">
      <aside v-show="open" class="bc-ai-panel" role="dialog" aria-label="B and C AI help">
        <div class="bc-ai-head">
          <h2>{{ BC_BRAND.full }} · AI Support</h2>
          <p class="bc-ai-sub">
            Orders, product fit, install basics. Call <strong>{{ support.phoneDisplay }}</strong> — ask for the owner anytime.
          </p>
          <button type="button" class="bc-ai-x" aria-label="Close" @click="open = false">&times;</button>
        </div>
        <div ref="logEl" class="bc-ai-log" role="log" aria-live="polite">
          <div
            v-for="(m, i) in messages"
            :key="i"
            :class="['bc-ai-msg', m.role === 'user' ? 'is-user' : 'is-bot']"
            v-html="m.role === 'bot' ? formatBotMsg(m.text) : escapeHtml(m.text)"
          />
        </div>
        <form class="bc-ai-form" @submit.prevent="send">
          <input
            v-model="input"
            class="input"
            type="text"
            autocomplete="off"
            placeholder="Ask about subs, amps, orders…"
            maxlength="500"
          />
          <button
            v-if="voiceSupported"
            type="button"
            class="btn btn-outline btn-sm bc-ai-mic"
            :class="{ 'is-listening': listening }"
            @click="toggleVoice"
          >
            {{ listening ? '…' : 'Mic' }}
          </button>
          <button type="submit" class="btn btn-primary btn-sm">Send</button>
        </form>
        <div class="bc-ai-esc-row">
          <a :href="`tel:${support.phoneTel}`" class="bc-ai-esc bc-ai-phone">📞 {{ support.phoneDisplay }}</a>
          <NuxtLink to="/bc-audio/open-door" class="bc-ai-esc" @click="open = false">Open Door — speak to owner →</NuxtLink>
          <a :href="`mailto:${support.email}?subject=B%26C%20Support`" class="bc-ai-esc">{{ support.email }}</a>
        </div>
      </aside>
    </Transition>
  </div>
</template>

<style scoped>
.bc-ai-root { position: fixed; z-index: 8000; bottom: 0; left: 0; pointer-events: none; }
.bc-ai-fab {
  pointer-events: auto;
  position: fixed;
  bottom: 22px; left: 20px;
  display: inline-flex; align-items: center; gap: 10px;
  padding: 12px 18px;
  border-radius: 999px;
  border: 1px solid rgba(211, 47, 47, 0.55);
  background: linear-gradient(135deg, rgba(211, 47, 47, 0.85), rgba(10, 10, 12, 0.98));
  color: #fff; font-weight: 700; font-size: 0.95rem; cursor: pointer;
  box-shadow: 0 8px 28px rgba(211, 47, 47, 0.35);
}
.bc-ai-fab:hover { filter: brightness(1.08); }
.bc-ai-fab-mark {
  width: 26px; height: 26px; border-radius: 50%;
  background: rgba(0, 0, 0, 0.35);
  border: 1px solid rgba(255, 255, 255, 0.25);
  font-size: 1rem; line-height: 24px; text-align: center;
}
.bc-ai-backdrop { position: fixed; inset: 0; background: rgba(0,0,0,0.5); pointer-events: auto; }
.bc-ai-panel {
  pointer-events: auto;
  position: fixed; bottom: 0; left: 0; width: min(400px, 100vw);
  max-height: min(520px, 100vh);
  display: flex; flex-direction: column;
  background: #16161c; border: 1px solid rgba(211, 47, 47, 0.35);
  border-radius: 16px 16px 0 0;
  box-shadow: 0 -8px 40px rgba(0,0,0,0.55);
}
@media (min-width: 500px) {
  .bc-ai-panel { left: 20px; bottom: 78px; border-radius: 16px; max-height: 70vh; }
  .bc-ai-backdrop { display: none; }
}
.bc-ai-head { padding: 16px; border-bottom: 1px solid rgba(255,255,255,0.08); position: relative; }
.bc-ai-head h2 { font-size: 1.05rem; color: #ff5252; margin: 0; }
.bc-ai-sub { font-size: 0.8rem; color: #9ca3af; margin-top: 6px; }
.bc-ai-x {
  position: absolute; top: 10px; right: 10px;
  background: none; border: none; color: #9ca3af; font-size: 1.5rem; cursor: pointer;
}
.bc-ai-log { flex: 1; overflow: auto; padding: 12px; display: flex; flex-direction: column; gap: 10px; }
.bc-ai-msg { font-size: 0.9rem; line-height: 1.45; border-radius: 10px; padding: 10px 12px; }
.bc-ai-msg.is-user { background: rgba(211, 47, 47, 0.2); align-self: flex-end; max-width: 92%; }
.bc-ai-msg.is-bot { background: rgba(255,255,255,0.05); align-self: flex-start; color: #e5e7eb; }
.bc-ai-form { display: flex; flex-wrap: wrap; gap: 8px; padding: 12px; border-top: 1px solid rgba(255,255,255,0.08); }
.bc-ai-form .input { flex: 1; min-width: 120px; }
.bc-ai-mic.is-listening { border-color: #ff5252; color: #ff5252; }
.bc-ai-esc-row { display: flex; flex-direction: column; gap: 6px; padding: 0 12px 14px; }
.bc-ai-esc { font-size: 0.82rem; color: #f5f5f7; text-decoration: none; }
.bc-ai-esc:hover { color: #ff5252; }
.bc-ai-phone { font-weight: 700; color: #ff5252; font-size: 0.88rem; }
.bc-ai-panel-enter-active, .bc-ai-panel-leave-active { transition: opacity 0.2s ease, transform 0.25s ease; }
.bc-ai-panel-enter-from, .bc-ai-panel-leave-to { opacity: 0; transform: translateY(8px); }
</style>
