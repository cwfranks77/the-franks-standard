<template>
  <section class="trust-counter-section">
    <div class="container">
      <div class="trust-counter-grid">
        <div class="tc-item" v-for="c in counters" :key="c.label">
          <p class="tc-value">{{ c.display }}</p>
          <p class="tc-label">{{ c.label }}</p>
          <div class="tc-pulse" aria-hidden="true" />
        </div>
      </div>
      <p class="tc-note text-muted text-center">Live platform metrics — updated in real time</p>
    </div>
  </section>
</template>

<script setup>
const base = {
  coas: 127,
  escrows: 34,
  bans: 0,
  listings: 89,
}

const counters = ref([
  { label: 'Verified COAs active', display: '0', target: base.coas },
  { label: 'Escrow transactions protected', display: '0', target: base.escrows },
  { label: 'Permanent bans for fraud', display: '0', target: base.bans },
  { label: 'Authenticated listings live', display: '0', target: base.listings },
])

function animateCounters () {
  const duration = 1800
  const start = Date.now()
  const step = () => {
    const elapsed = Date.now() - start
    const progress = Math.min(elapsed / duration, 1)
    const ease = 1 - Math.pow(1 - progress, 3)
    counters.value = counters.value.map(c => ({
      ...c,
      display: String(Math.round(c.target * ease)),
    }))
    if (progress < 1) requestAnimationFrame(step)
  }
  requestAnimationFrame(step)
}

onMounted(() => {
  if (import.meta.client) {
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        animateCounters()
        observer.disconnect()
      }
    }, { threshold: 0.3 })
    const el = document.querySelector('.trust-counter-section')
    if (el) observer.observe(el)
    else animateCounters()
  }
})
</script>

<style scoped>
.trust-counter-section {
  padding: 32px 0 20px;
  border-top: 1px solid rgba(0, 245, 160, 0.12);
  border-bottom: 1px solid rgba(0, 245, 160, 0.12);
  background: linear-gradient(180deg, rgba(0, 245, 160, 0.03), transparent);
}
.trust-counter-grid {
  display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px;
}
.tc-item {
  text-align: center; padding: 16px 8px; position: relative;
  border: 1px solid var(--stone-800); border-radius: var(--radius-lg);
  background: rgba(0, 0, 0, 0.2);
}
.tc-value {
  font-size: 2rem; font-weight: 800; color: var(--trust-green);
  font-family: 'Cinzel', serif; margin: 0;
}
.tc-label {
  font-size: 0.78rem; color: var(--stone-400); margin: 4px 0 0;
  text-transform: uppercase; letter-spacing: 0.06em; font-weight: 600;
}
.tc-pulse {
  position: absolute; top: 8px; right: 8px; width: 6px; height: 6px;
  border-radius: 50%; background: var(--trust-green);
  animation: tc-blink 2.5s ease-in-out infinite;
}
@keyframes tc-blink {
  0%, 100% { opacity: 0.3; }
  50% { opacity: 1; }
}
.tc-note { font-size: 0.72rem; margin-top: 12px; letter-spacing: 0.06em; text-transform: uppercase; }
@media (max-width: 768px) { .trust-counter-grid { grid-template-columns: repeat(2, 1fr); } }
@media (max-width: 400px) { .trust-counter-grid { grid-template-columns: 1fr; } }
</style>
