<template>
  <section class="section offerings-section">
    <div class="container">
      <ScrollReveal>
        <p class="eyebrow text-center">Everything on the floor</p>
        <h2 class="section-title text-center">What The Franks Standard offers</h2>
        <p class="section-subtitle text-center text-muted">
          Buyers, sellers, and stores get the same proof-first toolkit — not a patchwork of third-party tabs.
        </p>
      </ScrollReveal>
      <div class="offer-grid mt-4">
        <ScrollReveal v-for="(o, i) in offerings" :key="o.title">
          <NuxtLink :to="o.to" class="offer-card hover-lift" :style="{ '--stagger': i }">
            <span class="offer-icon" aria-hidden="true">{{ o.icon }}</span>
            <h3>{{ o.title }}</h3>
            <p>{{ o.desc }}</p>
            <span class="offer-cta">{{ o.cta }} →</span>
          </NuxtLink>
        </ScrollReveal>
      </div>
    </div>
  </section>
</template>

<script setup>
const offerings = [
  { icon: '🏅', title: 'Founding sellers — 3 months Pro free', desc: 'First 10 sellers only. Sign up to sell and enter code FOUNDERS10 at registration.', to: '/join/founders10', cta: 'Code FOUNDERS10' },
  { icon: '🎖️', title: 'Military & first responders — 6 months Pro', desc: 'Veterans, police, fire, EMS, dispatch, corrections. Code HONOR26 on the honors page.', to: '/honor', cta: 'Code HONOR26' },
  { icon: '🛡️', title: 'COA & signed guarantee', desc: 'Every public listing needs proof before it goes live — upload a COA or sign our in-platform guarantee.', to: '/how-it-works', cta: 'How it works' },
  { icon: '🏛️', title: 'Browse the floor', desc: 'Cards, watches, gear, art, sneakers, and more — curated categories for high-trust inventory.', to: '/browse', cta: 'Browse' },
  { icon: '📦', title: 'Sell & list', desc: 'Create listings with photos, COA flow, and seller tools. Stores onboard through For sellers.', to: '/sell', cta: 'Start listing' },
  { icon: '🔒', title: 'Escrow & Stripe checkout', desc: 'Payments held until the buyer confirms. Seller payouts through Stripe when a sale completes.', to: '/pay', cta: 'Pay & fees' },
  { icon: '📹', title: 'Video meet', desc: 'Face-to-face rooms in the browser — inspect items with buyers or sellers without another app.', to: '/video', cta: 'Open video' },
  { icon: '🤖', title: 'AI Help & support', desc: 'Instant answers on fees, COA, and tech from the Help button. Escalate to humans when you need to.', to: '/support', cta: 'Support' },
  { icon: '🏪', title: 'Stores & pro sellers', desc: 'Volume sellers and shops apply with inventory proof. Same authenticity rules, white-glove onboarding.', to: '/sellers', cta: 'For sellers' },
  { icon: '✨', title: 'AI Store Builder', desc: 'Generate bios, listing copy, and launch checklists tuned for authenticity-backed selling.', to: '/store-builder', cta: 'Try builder' },
  { icon: '💎', title: 'Pricing & launch offer', desc: 'Lower fees than big-box marketplaces. New sellers: free listings and launch pricing on the floor.', to: '/pricing', cta: 'See pricing' },
  { icon: '📱', title: 'Download the app', desc: 'Android APK and Windows installer — browse, sell, and get help like a native app.', to: '/download', cta: 'Download' },
  { icon: '⚖️', title: 'How we compare', desc: 'Side-by-side on proof, escrow, and how we handle fakes — built for collectors, not SKU floods.', to: '/compare', cta: 'Compare' },
  { icon: '🚪', title: 'Open Door policy', desc: 'How we listen to buyers and sellers — feedback, partnerships, and improving the Standard.', to: '/open-door', cta: 'Open Door' },
]
</script>

<style scoped>
.offerings-section {
  background: linear-gradient(180deg, rgba(12, 6, 25, 0.92) 0%, rgba(20, 14, 38, 0.88) 100%);
  border-block: 1px solid rgba(255, 216, 77, 0.08);
}
.offerings-section .section-title {
  color: #f9fafb;
  -webkit-text-fill-color: #f9fafb;
}
.offerings-section .section-subtitle {
  color: #e5e7eb;
  -webkit-text-fill-color: #e5e7eb;
}
.eyebrow {
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: var(--cyan);
  margin-bottom: 10px;
}
.offer-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 18px;
}
.offer-card {
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 22px 20px;
  border-radius: var(--radius-lg);
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: linear-gradient(155deg, rgba(160, 124, 255, 0.06), rgba(20, 14, 38, 0.95));
  text-decoration: none;
  color: #f3f4f6;
  user-select: text;
  -webkit-user-select: text;
}
.offer-icon {
  font-size: 1.75rem;
  margin-bottom: 12px;
  display: inline-block;
}
.offer-card h3 {
  font-size: 1.05rem;
  color: #ffffff;
  -webkit-text-fill-color: #ffffff;
  margin: 0 0 8px;
  font-family: 'Cinzel', serif;
}
.offer-card p {
  flex: 1;
  margin: 0;
  font-size: 0.88rem;
  line-height: 1.55;
  color: #e5e7eb;
  -webkit-text-fill-color: #e5e7eb;
  font-weight: 600;
}
.offer-cta {
  margin-top: 14px;
  font-size: 0.82rem;
  font-weight: 700;
  color: var(--gold);
}
@media (max-width: 1024px) {
  .offer-grid { grid-template-columns: repeat(2, 1fr); }
}
@media (max-width: 560px) {
  .offer-grid { grid-template-columns: 1fr; }
}
</style>
