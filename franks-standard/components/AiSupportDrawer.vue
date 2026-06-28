<script setup>
import { getAiReply } from '~/composables/useAiSupport'
import { getFranksSupport } from '~/utils/supportContacts.js'

const config = useRuntimeConfig()
const support = computed(() => getFranksSupport(config))

const open = ref(false)
const input = ref('')
const logEl = ref(null)
const messages = ref([{ role: 'bot', text: getAiReply('') }])
const listening = ref(false)
let recognition = null

const voiceSupported = computed(() => {
  if (!import.meta.client) return false
  return !!(window.SpeechRecognition || window.webkitSpeechRecognition)
})

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
  messages.value.push({ role: 'bot', text: getAiReply(t) })
  nextTick(() => {
    if (logEl.value) logEl.value.scrollTop = logEl.value.scrollHeight
  })
}
</script>

<template>
  <div class="franks-ai-root">
    <button
      type="button"
      class="franks-ai-fab"
      aria-label="Open help assistant"
      :aria-expanded="open"
      @click="open = !open"
    >
      <span class="franks-ai-fab-mark" aria-hidden="true">💬</span>
      <span class="franks-ai-fab-label">Help</span>
    </button>
    <Transition name="franks-ai-panel">
      <div v-show="open" class="franks-ai-backdrop" @click.self="open = false" />
    </Transition>
    <Transition name="franks-ai-panel">
      <aside v-show="open" class="franks-ai-panel" role="dialog" aria-label="The Franks Standard help">
        <div class="franks-ai-head">
          <h2>The Franks Standard · Help</h2>
          <p class="franks-ai-sub">
            Buying, selling, fees, COA, orders. Call <strong>{{ support.phoneDisplay }}</strong> for a person.
          </p>
          <button type="button" class="franks-ai-x" aria-label="Close help" @click="open = false">&times;</button>
        </div>
        <div ref="logEl" class="franks-ai-log" role="log" aria-live="polite">
          <div
            v-for="(m, i) in messages"
            :key="i"
            :class="['franks-ai-msg', m.role === 'user' ? 'is-user' : 'is-bot']"
            v-html="m.role === 'bot' ? formatBotMsg(m.text) : escapeHtml(m.text)"
          />
        </div>
        <form class="franks-ai-form" @submit.prevent="send">
          <input
            v-model="input"
            class="franks-ai-input"
            type="text"
            autocomplete="off"
            placeholder="Ask about buying, selling, fees…"
            maxlength="500"
          />
          <button
            v-if="voiceSupported"
            type="button"
            class="franks-ai-btn franks-ai-btn-outline"
            :class="{ 'is-listening': listening }"
            @click="toggleVoice"
          >
            {{ listening ? '…' : 'Mic' }}
          </button>
          <button type="submit" class="franks-ai-btn franks-ai-btn-primary">Send</button>
        </form>
        <div class="franks-ai-esc-row">
          <a :href="`tel:${support.phoneTel}`" class="franks-ai-esc franks-ai-phone">📞 {{ support.phoneDisplay }}</a>
          <NuxtLink to="/open-door" class="franks-ai-esc" @click="open = false">Open Door — founder feedback →</NuxtLink>
          <NuxtLink to="/support" class="franks-ai-esc" @click="open = false">Support center →</NuxtLink>
          <a :href="`mailto:${support.email}?subject=Franks%20Standard%20support`" class="franks-ai-esc">{{ support.email }}</a>
        </div>
      </aside>
    </Transition>
  </div>
</template>

<style scoped>
.franks-ai-root { position: fixed; z-index: 8000; bottom: 0; right: 0; pointer-events: none; }
.franks-ai-fab {
  pointer-events: auto;
  position: fixed;
  bottom: 22px; right: 20px;
  display: inline-flex; align-items: center; gap: 10px;
  padding: 12px 18px;
  border-radius: 999px;
  border: 1px solid rgba(247, 202, 0, 0.55);
  background: linear-gradient(135deg, rgba(247, 202, 0, 0.9), rgba(12, 6, 25, 0.98));
  color: #0c0619; font-weight: 700; font-size: 0.95rem; cursor: pointer;
  box-shadow: 0 8px 28px rgba(247, 202, 0, 0.25);
}
.franks-ai-fab:hover { filter: brightness(1.05); }
.franks-ai-fab-mark {
  width: 26px; height: 26px; border-radius: 50%;
  background: rgba(0, 0, 0, 0.15);
  border: 1px solid rgba(0, 0, 0, 0.2);
  font-size: 1rem; line-height: 24px; text-align: center;
}
.franks-ai-backdrop { position: fixed; inset: 0; background: rgba(0,0,0,0.5); pointer-events: auto; }
.franks-ai-panel {
  pointer-events: auto;
  position: fixed; bottom: 0; right: 0; width: min(400px, 100vw);
  max-height: min(520px, 100vh);
  display: flex; flex-direction: column;
  background: #16161c; border: 1px solid rgba(247, 202, 0, 0.35);
  border-radius: 16px 16px 0 0;
  box-shadow: 0 -8px 40px rgba(0,0,0,0.55);
}
@media (min-width: 500px) {
  .franks-ai-panel { right: 20px; bottom: 78px; border-radius: 16px; max-height: 70vh; }
  .franks-ai-backdrop { display: none; }
}
.franks-ai-head { padding: 16px; border-bottom: 1px solid rgba(255,255,255,0.08); position: relative; }
.franks-ai-head h2 { font-size: 1.05rem; color: #f7ca00; margin: 0; }
.franks-ai-sub { font-size: 0.8rem; color: #9ca3af; margin-top: 6px; }
.franks-ai-x {
  position: absolute; top: 10px; right: 10px;
  background: none; border: none; color: #9ca3af; font-size: 1.5rem; cursor: pointer;
}
.franks-ai-log { flex: 1; overflow: auto; padding: 12px; display: flex; flex-direction: column; gap: 10px; }
.franks-ai-msg { font-size: 0.9rem; line-height: 1.45; border-radius: 10px; padding: 10px 12px; }
.franks-ai-msg.is-user { background: rgba(247, 202, 0, 0.18); align-self: flex-end; max-width: 92%; color: #fff; }
.franks-ai-msg.is-bot { background: rgba(255,255,255,0.05); align-self: flex-start; color: #e5e7eb; }
.franks-ai-form { display: flex; flex-wrap: wrap; gap: 8px; padding: 12px; border-top: 1px solid rgba(255,255,255,0.08); }
.franks-ai-input {
  flex: 1; min-width: 120px;
  background: #0f0f0f; border: 1px solid rgba(255,255,255,0.15);
  border-radius: 8px; padding: 8px 10px; color: #fff; font-size: 0.9rem;
}
.franks-ai-btn {
  padding: 8px 12px; border-radius: 8px; font-size: 0.85rem; font-weight: 600; cursor: pointer;
}
.franks-ai-btn-primary { background: #f7ca00; color: #0c0619; border: none; }
.franks-ai-btn-outline { background: transparent; border: 1px solid rgba(255,255,255,0.2); color: #fff; }
.franks-ai-btn-outline.is-listening { border-color: #f7ca00; color: #f7ca00; }
.franks-ai-esc-row { display: flex; flex-direction: column; gap: 6px; padding: 0 12px 14px; }
.franks-ai-esc { font-size: 0.82rem; color: #f5f5f7; text-decoration: none; }
.franks-ai-esc:hover { color: #f7ca00; }
.franks-ai-phone { font-weight: 700; color: #f7ca00; font-size: 0.88rem; }
.franks-ai-panel-enter-active, .franks-ai-panel-leave-active { transition: opacity 0.2s ease, transform 0.25s ease; }
.franks-ai-panel-enter-from, .franks-ai-panel-leave-to { opacity: 0; transform: translateY(8px); }
</style>
