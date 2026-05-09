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
      <h2>📞 Customer Service</h2>
      <div class="phone-row">
        <a href="tel:+18008374357" class="phone-number">{{ phoneDisplay }}</a>
        <span class="phone-badge">AI-Powered</span>
        <span class="phone-badge phone-badge-rec">Calls Recorded</span>
      </div>
      <p class="text-muted">
        Our AI customer service handles orders, returns, billing, and general inquiries.
        For complex issues, the AI connects you to the owner directly. All calls are recorded for quality and training.
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
        <NuxtLink to="/compare">Us vs eBay and Amazon</NuxtLink>
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
const config = useRuntimeConfig()
const phoneDisplay = computed(() => config.public.customerServicePhone || '1-800-TFS-HELP')

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
.voice-lane { padding: 22px 20px; margin-bottom: 24px; border: 1px solid rgba(201, 168, 76, 0.35); background: linear-gradient(135deg, rgba(201, 168, 76, 0.08), rgba(18, 8, 32, 0.95)); }
.phone-lane { padding: 28px 24px; margin-bottom: 24px; border: 2px solid rgba(0, 245, 160, 0.35); background: linear-gradient(135deg, rgba(0, 245, 160, 0.06), rgba(18, 8, 32, 0.95)); }
.phone-lane h2 { font-size: 1.3rem; margin-bottom: 14px; color: var(--trust-green); }
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
.voice-lane h2 { font-size: 1.2rem; margin-bottom: 12px; color: var(--gold); }
.voice-lane p { line-height: 1.6; font-size: 0.95rem; }
.lane { padding: 22px 20px; }
.lane h2 { font-size: 1.25rem; margin-bottom: 8px; color: var(--gold); }
.checklist { margin: 14px 0 0; padding-left: 1.15rem; line-height: 1.55; color: var(--stone-200); }
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
