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

    <section class="card voice-lane">
      <h2>Voice, AI help, and email</h2>
      <p class="text-muted">
        <strong>Live voice:</strong> open <NuxtLink to="/video">Video</NuxtLink> for a browser room (mic + camera) with your buyer, seller, or team - no phone system required.
        <strong>AI-style help:</strong> use the floating <strong>Help</strong> button; you can use the mic there to dictate your question in supported browsers (Chrome / Edge).
        <strong>Email a human:</strong>
        <a href="mailto:info@thefranksstandard.com?subject=The%20Franks%20Standard%20support">info@thefranksstandard.com</a>
        (include order ID and photos when it is about an item).
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
