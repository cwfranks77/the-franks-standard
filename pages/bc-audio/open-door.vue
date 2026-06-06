<script setup>
import { BC_BRAND } from '~/utils/bcBrand.js'
import { getBcSupport } from '~/utils/bcSupport.js'

definePageMeta({ layout: 'bc-audio' })

const config = useRuntimeConfig()
const support = computed(() => getBcSupport(config))

useSeoMeta({
  title: `Open Door Policy — ${BC_BRAND.full}`,
  description: `${BC_BRAND.full} — speak directly with the owner. Open Door feedback, partnerships, and technical help.`,
})
</script>

<template>
  <div class="bc-od">
    <div class="bc-od__inner">
      <p class="bc-od__eyebrow">Open Door · {{ BC_BRAND.full }}</p>
      <h1>Talk to the owner</h1>
      <p class="bc-od__lead">
        B&amp;C Performance Audio is run by people, not bots. <strong>{{ support.ownerName }}</strong> reads Open Door
        feedback personally. No ticket maze — real answers for installs, orders, and partnerships.
      </p>

      <section class="bc-od__card">
        <h2>How to reach us</h2>
        <div class="bc-od__channels">
          <div class="bc-od__channel">
            <span aria-hidden="true">📞</span>
            <div>
              <h3>B&amp;C support line</h3>
              <p><a :href="`tel:${support.phoneTel}`">{{ support.phoneDisplay }}</a></p>
              <p class="bc-od__muted">AI answers first. Say <strong>“speak to the owner”</strong> or <strong>“dispatch desk”</strong> — we escalate complex issues automatically or on request.</p>
            </div>
          </div>
          <div class="bc-od__channel">
            <span aria-hidden="true">✉️</span>
            <div>
              <h3>Email (Open Door)</h3>
              <p>
                <a :href="`mailto:${support.email}?subject=Open%20Door%20-%20B%26C%20Audio`">{{ support.email }}</a>
              </p>
              <p class="bc-od__muted">Subject: <strong>Open Door — B&amp;C Audio</strong> — goes to the owner team.</p>
            </div>
          </div>
          <div class="bc-od__channel">
            <span aria-hidden="true">💬</span>
            <div>
              <h3>AI chat on this site</h3>
              <p class="bc-od__muted">Tap <strong>B&amp;C Help</strong> (bottom-left). Ask for the owner anytime — the AI will route you here or to the phone line.</p>
            </div>
          </div>
        </div>
      </section>

      <section class="bc-od__card bc-od__card--accent">
        <h2>Our commitment</h2>
        <ul class="bc-od__list">
          <li><strong>Owner-accessible</strong> — {{ support.ownerName }} reads B&amp;C feedback personally.</li>
          <li><strong>Human escalation</strong> — AI handles routine questions; installs, warranty, and billing go to a person.</li>
          <li><strong>Recorded calls</strong> — for quality and training, same as The Franks Standard hub.</li>
          <li><strong>Parent company</strong> — B&amp;C is a division of The Franks Standard LLC; checkout and tax compliance stay on the parent stack.</li>
        </ul>
      </section>

      <div class="bc-od__cta">
        <a :href="`mailto:${support.email}?subject=Open%20Door%20-%20B%26C%20Audio`" class="bc-od__btn bc-od__btn--primary">Send feedback</a>
        <a :href="`tel:${support.phoneTel}`" class="bc-od__btn">Call {{ support.phoneDisplay }}</a>
        <NuxtLink to="/bc-audio" class="bc-od__btn bc-od__btn--ghost">Back to storefront</NuxtLink>
      </div>
    </div>
  </div>
</template>

<style scoped>
.bc-od { padding: 2.5rem 1.25rem 4rem; }
.bc-od__inner { max-width: 720px; margin: 0 auto; }
.bc-od__eyebrow {
  font-size: 0.72rem; letter-spacing: 0.18em; text-transform: uppercase;
  color: #ff5252; margin: 0 0 10px;
}
.bc-od h1 { font-size: 2rem; margin: 0 0 12px; }
.bc-od__lead { font-size: 1.05rem; line-height: 1.65; color: #b8bcc6; margin-bottom: 28px; }
.bc-od__card {
  margin-bottom: 20px; padding: 24px;
  border: 1px solid rgba(211, 47, 47, 0.25);
  border-radius: 12px; background: #16161c;
}
.bc-od__card--accent { border-color: rgba(211, 47, 47, 0.45); background: linear-gradient(135deg, rgba(211,47,47,0.08), #16161c); }
.bc-od__card h2 { font-size: 1.1rem; color: #ff5252; margin: 0 0 14px; }
.bc-od__channels { display: flex; flex-direction: column; gap: 18px; }
.bc-od__channel { display: flex; gap: 14px; align-items: flex-start; }
.bc-od__channel span { font-size: 1.5rem; }
.bc-od__channel h3 { font-size: 0.95rem; margin: 0 0 4px; }
.bc-od__channel p { margin: 0; font-size: 0.9rem; }
.bc-od__channel a { color: #ff5252; font-weight: 600; text-decoration: none; }
.bc-od__channel a:hover { text-decoration: underline; }
.bc-od__muted { color: #9ca3af !important; font-size: 0.85rem !important; margin-top: 4px !important; }
.bc-od__list { margin: 0; padding-left: 1.2rem; color: #e5e7eb; line-height: 1.6; }
.bc-od__cta { display: flex; flex-wrap: wrap; gap: 10px; margin-top: 28px; }
.bc-od__btn {
  display: inline-block; padding: 12px 20px; border-radius: 10px;
  font-weight: 700; text-decoration: none; border: 1px solid rgba(255,255,255,0.2); color: #f5f5f7;
}
.bc-od__btn--primary { background: linear-gradient(135deg, #d32f2f, #b71c1c); border-color: transparent; color: #fff; }
.bc-od__btn--ghost { color: #9ca3af; }
</style>
