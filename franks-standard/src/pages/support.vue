<template>
  <div class="page support-page">
    <header class="support-hero">
      <h1>Support and tech help</h1>
      <p class="lead text-muted">
        Two lanes: <strong>customer support</strong> for orders, accounts, and disputes,
        and <strong>technical support</strong> when the site, video, or checkout misbehaves.
        Use the floating <strong>Help</strong> button for instant answers; use email when you need a human.
      </p>
    </header>

    <section class="card phone-lane">
      <p class="support-line-type">{{ franksSupport.lineType }}</p>
      <h2>📞 {{ franksSupport.name }}</h2>
      <div class="phone-row">
        <a :href="`tel:${franksSupport.phoneTel}`" class="phone-number">{{ franksSupport.phoneDisplay }}</a>
        <span class="phone-badge">AI-Powered</span>
        <span class="phone-badge phone-badge-rec">Calls Recorded</span>
      </div>
      <p class="text-muted">
        Marketplace orders, seller accounts, COA, returns, and billing.
        Email <a :href="`mailto:${franksSupport.email}`">{{ franksSupport.email }}</a>
        · {{ franksSupport.hours }}
      </p>
    </section>

    <section class="card phone-lane phone-lane--bc">
      <p class="support-line-type support-line-type--bc">{{ bcSupport.lineType }}</p>
      <h2>📞 {{ bcSupport.name }}</h2>
      <div class="phone-row">
        <a :href="`tel:${bcSupport.phoneTel}`" class="phone-number phone-number--bc">{{ bcSupport.phoneDisplay }}</a>
        <span class="phone-badge phone-badge--bc">B&amp;C Only</span>
      </div>
      <p class="text-muted">
        Competition subwoofers, amplifiers, and install help.
        Email <a :href="`mailto:${bcSupport.email}`">{{ bcSupport.email }}</a>
        · {{ bcSupport.hours }}
        · Shop at <a href="https://www.bcpoweraudio.com" rel="noopener">www.bcpoweraudio.com</a>
        or <NuxtLink to="/bc-audio">/bc-audio</NuxtLink>.
      </p>
    </section>

    <section class="card voice-lane">
      <h2>More ways to get help</h2>
      <p class="text-muted">
        <strong>AI Chat:</strong> use the floating <strong>Help</strong> button on any page for instant answers.
        <strong>Video call:</strong> open <NuxtLink to="/video">Video</NuxtLink> for a face-to-face room with your buyer, seller, or our team — no app required.
        <strong>Email:</strong>
        <a href="mailto:info@thefranksstandard.com?subject=The%20Franks%20Standard%20support">info@thefranksstandard.com</a>
        (include order ID and photos for order issues).
      </p>
      <p class="text-muted alias-note">
        Department aliases are active and all forward into the same team inbox:
        <a href="mailto:support@thefranksstandard.com">support@thefranksstandard.com</a>,
        <a href="mailto:sales@thefranksstandard.com">sales@thefranksstandard.com</a>,
        <a href="mailto:press@thefranksstandard.com">press@thefranksstandard.com</a>,
        <a href="mailto:partnerships@thefranksstandard.com">partnerships@thefranksstandard.com</a>.
      </p>
    </section>

    <div class="grid two">
      <section class="card lane">
        <h2>Customer support</h2>
        <p class="text-muted">Buying, selling, escrow, COA, refunds, and policy.</p>
        <ul class="checklist">
          <li>Include <strong>order or listing ID</strong> and photos if something arrived wrong.</li>
          <li>Read <NuxtLink to="/how-it-works">How it works</NuxtLink> for escrow and confirmation.</li>
          <li>Email: <a href="mailto:info@thefranksstandard.com">info@thefranksstandard.com</a></li>
        </ul>
        <NuxtLink to="/contact" class="btn btn-outline btn-sm mt-2">Contact page</NuxtLink>
      </section>

      <section class="card lane">
        <h2>Technical support</h2>
        <p class="text-muted">Blank page, video room, payments, or sign-in quirks.</p>
        <ul class="checklist">
          <li><strong>Blank or stuck page:</strong> hard refresh (Ctrl+Shift+R), another browser, relax blockers for this domain.</li>
          <li><strong>Video:</strong> allow camera and mic; open <NuxtLink to="/video">Video</NuxtLink> and share the room link.</li>
          <li><strong>Checkout:</strong> Stripe links on <NuxtLink to="/pay">Pay and fees</NuxtLink>; we do not store full card data here.</li>
          <li>Still broken? Email info@thefranksstandard.com with browser, device, and a screenshot.</li>
        </ul>
      </section>
    </div>

    <section class="card quick">
      <h2>Quick links</h2>
      <div class="quick-links">
        <NuxtLink to="/pay">Pay and fees</NuxtLink>
        <NuxtLink to="/video">Video calls</NuxtLink>
        <NuxtLink to="/how-it-works">How it works</NuxtLink>
        <NuxtLink to="/compare">How we compare</NuxtLink>
        <NuxtLink to="/terms">Terms</NuxtLink>
        <NuxtLink to="/privacy">Privacy</NuxtLink>
      </div>
      <p class="text-muted small mt-2">
        Owner toolkit (operator console) is for site owners only - unlock from the home page logo; ask Help for operator.
      </p>
    </section>

    <section class="section-muted">
      <h2>Social updates</h2>
      <p class="text-muted">
        Posts to Telegram, X, and Facebook use API keys in a local <code>.env</code>. From the site folder run
        <code>npm run post:social</code> after adding tokens (never commit secrets). Reusing the same bot and app
        credentials as other projects is fine if the channel fits your audience.
      </p>
    </section>
  </div>
</template>

<script setup>
import { getBcSupport } from '~/utils/bcSupport.js'
import { getFranksSupport } from '~/utils/supportContacts.js'

const config = useRuntimeConfig()
const franksSupport = computed(() => getFranksSupport(config))
const bcSupport = computed(() => getBcSupport(config))

useSeoMeta({
  title: 'Support and tech - The Franks Standard',
  description: 'Customer and technical support: orders, video, payments, contact.',
})
</script>

<style scoped>
.support-page { padding: 40px 16px 100px; max-width: 900px; margin: 0 auto; }
.support-hero { margin-bottom: 32px; }
.support-hero h1 { margin-bottom: 12px; }
.lead { font-size: 1.05rem; line-height: 1.55; max-width: 52rem; }
.grid.two {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin-bottom: 24px;
}
@media (max-width: 720px) {
  .grid.two { grid-template-columns: 1fr; }
}
.voice-lane { padding: 22px 20px; margin-bottom: 24px; border: 1px solid #fca5a5; background: #fef2f2; }
.voice-lane h2 { color: #7f1d1d; }
.voice-lane .text-muted { color: #1f2937 !important; }
.support-line-type {
  font-size: 0.72rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  color: #166534;
  margin: 0 0 6px;
}
.support-line-type--bc { color: #ff8a80; }
.phone-lane { padding: 28px 24px; margin-bottom: 24px; border: 2px solid #86efac; background: #ecfdf5; }
.phone-lane--bc { border-color: rgba(211, 47, 47, 0.45); background: #1a0a0c; }
.phone-lane--bc h2 { color: #ff8a80; }
.phone-lane--bc .text-muted { color: #d1d5db !important; }
.phone-number--bc { color: #ff5252 !important; }
.phone-badge--bc { background: rgba(211, 47, 47, 0.2); color: #ff8a80; border-color: rgba(211, 47, 47, 0.45); }
.phone-lane h2 { font-size: 1.3rem; margin-bottom: 14px; color: #14532d; }
.phone-lane .text-muted { color: #1f2937 !important; }
.phone-row { display: flex; align-items: center; gap: 12px; margin-bottom: 12px; flex-wrap: wrap; }
.phone-number { font-size: 1.6rem; font-weight: 800; color: var(--trust-green); font-family: 'Cinzel', serif; text-decoration: none; }
.phone-number:hover { color: var(--gold); }
.phone-badge {
  display: inline-flex; align-items: center; padding: 3px 10px; border-radius: 999px;
  font-size: 0.7rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em;
  background: rgba(0, 245, 160, 0.12); color: var(--trust-green); border: 1px solid rgba(0, 245, 160, 0.3);
}
.phone-badge-rec {
  background: rgba(255, 77, 106, 0.1); color: var(--alert-red); border-color: rgba(255, 77, 106, 0.3);
}
.voice-lane h2 { font-size: 1.2rem; margin-bottom: 12px; }
.voice-lane p { line-height: 1.6; font-size: 0.95rem; }
.alias-note { margin-top: 10px; font-size: 0.88rem; }
.lane { padding: 22px 20px; }
.lane h2 { font-size: 1.25rem; margin-bottom: 8px; color: var(--gold); }
.checklist { margin: 14px 0 0; padding-left: 1.15rem; line-height: 1.55; color: #374151; font-weight: 600; }
.checklist li { margin-bottom: 10px; }
.quick { padding: 22px 20px; margin-bottom: 28px; }
.quick h2 { font-size: 1.15rem; margin-bottom: 12px; }
.quick-links { display: flex; flex-wrap: wrap; gap: 12px 18px; }
.section-muted {
  padding: 20px;
  border-radius: var(--radius-lg, 12px);
  border: 1px solid var(--stone-800);
  background: rgba(0, 0, 0, 0.2);
}
.section-muted h2 { font-size: 1.1rem; margin-bottom: 10px; }
.small { font-size: 0.88rem; }
.mt-2 { margin-top: 0.75rem; }
</style>
