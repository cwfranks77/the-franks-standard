<template>
  <div class="roadmap-page">
    <div class="container narrow">
      <p class="eyebrow">Transparency</p>
      <h1>Launch Roadmap</h1>
      <p class="lead text-muted">
        We believe in building in public. Here is where we are, what is coming next, and what we are
        committed to delivering. This roadmap is shaped by seller and buyer feedback —
        <NuxtLink to="/open-door">tell us what matters to you</NuxtLink>.
      </p>

      <div class="timeline">
        <div v-for="phase in phases" :key="phase.title" class="timeline-item" :class="phase.status">
          <div class="timeline-marker">
            <span class="marker-icon">{{ phase.icon }}</span>
          </div>
          <div class="timeline-content">
            <div class="phase-header">
              <h2>{{ phase.title }}</h2>
              <span class="phase-badge" :class="phase.status">{{ phase.statusLabel }}</span>
            </div>
            <p class="phase-date text-muted">{{ phase.date }}</p>
            <ul class="phase-items">
              <li v-for="item in phase.items" :key="item.text" :class="item.done ? 'done' : ''">
                <span class="item-check">{{ item.done ? '✓' : '○' }}</span>
                <span>{{ item.text }}</span>
                <span v-if="item.tag" class="item-tag" :class="item.tag">{{ item.tag }}</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <section class="security-section">
        <h2>Security commitment</h2>
        <p class="text-muted">
          The Franks Standard takes security seriously. As a pre-launch marketplace handling payments and personal data,
          we are committed to industry-standard protections and transparent auditing.
        </p>
        <div class="security-grid">
          <div class="sec-item">
            <span class="sec-icon">🔒</span>
            <h4>Stripe PCI compliance</h4>
            <p>All payments processed by Stripe — PCI DSS Level 1 certified. We never see or store full card numbers.</p>
          </div>
          <div class="sec-item">
            <span class="sec-icon">🛡️</span>
            <h4>Supabase Row Level Security</h4>
            <p>Database access controlled by row-level policies. Users can only read/write their own data.</p>
          </div>
          <div class="sec-item">
            <span class="sec-icon">🔐</span>
            <h4>HTTPS everywhere</h4>
            <p>All traffic encrypted in transit. GitHub Pages and Cloudflare provide TLS certificates automatically.</p>
          </div>
          <div class="sec-item">
            <span class="sec-icon">📋</span>
            <h4>Security audit (planned)</h4>
            <p>Third-party penetration testing and code audit scheduled before full public launch.</p>
          </div>
          <div class="sec-item">
            <span class="sec-icon">🐛</span>
            <h4>Responsible disclosure</h4>
            <p>Security researchers: report vulnerabilities to info@thefranksstandard.com with "Security" in the subject. We respond within 48 hours.</p>
          </div>
          <div class="sec-item">
            <span class="sec-icon">📊</span>
            <h4>Transparency reports</h4>
            <p>We will publish quarterly reports on fraud bans, dispute resolutions, and platform health metrics.</p>
          </div>
        </div>
      </section>

      <div class="roadmap-cta text-center">
        <p class="text-muted">Have a feature request or see something missing?</p>
        <div class="cta-row">
          <a href="mailto:info@thefranksstandard.com?subject=Roadmap%20Feedback" class="btn btn-primary btn-lg">Send roadmap feedback</a>
          <NuxtLink to="/open-door" class="btn btn-outline btn-lg">Open Door Policy</NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
useSeoMeta({
  title: 'Launch Roadmap — The Franks Standard',
  description: 'Our public roadmap: security audits, feature releases, and long-term commitment to the authenticity-first marketplace.',
})

const phases = [
  {
    title: 'Foundation',
    date: 'Completed',
    status: 'done',
    statusLabel: 'Complete',
    icon: '✅',
    items: [
      { text: 'Marketplace core: listings, browse, search, categories', done: true },
      { text: 'COA and in-platform guarantee system', done: true },
      { text: 'Supabase auth, database, and file storage', done: true },
      { text: 'Stripe payment integration (Payment Links)', done: true },
      { text: 'Per-item Stripe Checkout + orders + escrow', done: true },
      { text: 'Video calls via Jitsi — built into every listing', done: true },
      { text: 'Static site deploy to GitHub Pages', done: true },
    ],
  },
  {
    title: 'Seller Experience',
    date: 'Current phase',
    status: 'active',
    statusLabel: 'In progress',
    icon: '🔨',
    items: [
      { text: 'AI Store Builder — generate store bio, descriptions, pricing strategy', done: true },
      { text: 'Dropshipping support — supplier fields, ship time, origin', done: true },
      { text: 'Pricing tiers: Starter (free), Pro ($9.99), Store ($24.99)', done: true },
      { text: 'Owner mode with free full access (hidden room)', done: true },
      { text: 'Launch offer: 10 free listings, 3% promo fee, referral program', done: true },
      { text: 'Native Android and Windows app downloads', done: true },
      { text: 'AI customer service chatbot with 20+ topics', done: true },
      { text: 'Seller dashboard with listing management', done: true },
      { text: 'Stripe Connect for seller payouts', done: true },
      { text: 'Bulk listing import (CSV upload)', done: false, tag: 'next' },
    ],
  },
  {
    title: 'Buyer Experience',
    date: 'Next phase',
    status: 'upcoming',
    statusLabel: 'Upcoming',
    icon: '🎯',
    items: [
      { text: 'Wishlist and saved items', done: false },
      { text: 'Price drop alerts', done: false },
      { text: 'In-app messaging (buyer ↔ seller)', done: false },
      { text: 'Order tracking dashboard', done: false },
      { text: 'Buyer reviews and seller ratings', done: false },
      { text: 'Advanced search with filters (price, condition, COA type)', done: false },
    ],
  },
  {
    title: 'Scale and Security',
    date: 'Q3–Q4',
    status: 'upcoming',
    statusLabel: 'Planned',
    icon: '🔒',
    items: [
      { text: 'Third-party security audit and penetration testing', done: false, tag: 'security' },
      { text: 'SOC 2 compliance evaluation', done: false, tag: 'security' },
      { text: 'Quarterly transparency reports (fraud, disputes, bans)', done: false, tag: 'security' },
      { text: 'Multi-factor authentication for sellers', done: false, tag: 'security' },
      { text: 'API for third-party integrations', done: false },
      { text: 'Mobile-native app (React Native)', done: false },
      { text: 'International shipping and multi-currency', done: false },
      { text: 'Auction-style listings', done: false },
    ],
  },
]
</script>

<style scoped>
.roadmap-page { padding: 48px 0 80px; }
.narrow { max-width: 820px; margin: 0 auto; }
.eyebrow { font-size: 0.72rem; letter-spacing: 0.2em; text-transform: uppercase; color: var(--gold); margin-bottom: 10px; }
.lead { font-size: 1.05rem; line-height: 1.65; margin-bottom: 36px; }
h1 { font-size: 2rem; margin-bottom: 12px; }

.timeline { position: relative; padding-left: 40px; }
.timeline::before {
  content: ''; position: absolute; left: 15px; top: 0; bottom: 0; width: 2px;
  background: linear-gradient(180deg, var(--trust-green), var(--gold), var(--stone-700));
}
.timeline-item { position: relative; margin-bottom: 36px; }
.timeline-marker {
  position: absolute; left: -40px; top: 0;
  width: 32px; height: 32px; border-radius: 50%;
  background: var(--stone-900); border: 2px solid var(--stone-700);
  display: flex; align-items: center; justify-content: center; z-index: 1;
}
.timeline-item.done .timeline-marker { border-color: var(--trust-green); }
.timeline-item.active .timeline-marker { border-color: var(--gold); box-shadow: 0 0 12px rgba(201, 168, 76, 0.3); }
.marker-icon { font-size: 0.9rem; }
.timeline-content {
  padding: 20px 24px; border: 1px solid var(--stone-800);
  border-radius: var(--radius-lg); background: var(--stone-900);
}
.timeline-item.active .timeline-content { border-color: rgba(201, 168, 76, 0.35); }
.phase-header { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; margin-bottom: 4px; }
.phase-header h2 { font-size: 1.2rem; margin: 0; }
.phase-badge {
  padding: 3px 10px; border-radius: 999px; font-size: 0.68rem; font-weight: 700;
  text-transform: uppercase; letter-spacing: 0.08em;
}
.phase-badge.done { background: rgba(0, 245, 160, 0.12); color: var(--trust-green); border: 1px solid rgba(0, 245, 160, 0.3); }
.phase-badge.active { background: rgba(201, 168, 76, 0.15); color: var(--gold); border: 1px solid rgba(201, 168, 76, 0.35); }
.phase-badge.upcoming { background: rgba(0, 224, 255, 0.08); color: var(--cyan); border: 1px solid rgba(0, 224, 255, 0.2); }
.phase-date { font-size: 0.8rem; margin-bottom: 12px; }
.phase-items { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 8px; }
.phase-items li { display: flex; align-items: flex-start; gap: 8px; font-size: 0.88rem; color: var(--stone-300); }
.phase-items li.done { color: var(--stone-200); }
.item-check { flex: 0 0 auto; font-size: 0.85rem; }
.phase-items li.done .item-check { color: var(--trust-green); }
.item-tag {
  display: inline-block; padding: 1px 6px; border-radius: 4px; font-size: 0.65rem;
  font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em; margin-left: 4px;
}
.item-tag.next { background: rgba(201, 168, 76, 0.15); color: var(--gold); }
.item-tag.security { background: rgba(0, 245, 160, 0.1); color: var(--trust-green); }

.security-section { margin: 48px 0 40px; }
.security-section h2 { font-size: 1.4rem; color: var(--gold); margin-bottom: 10px; }
.security-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; margin-top: 20px; }
@media (max-width: 768px) { .security-grid { grid-template-columns: repeat(2, 1fr); } }
@media (max-width: 480px) { .security-grid { grid-template-columns: 1fr; } }
.sec-item {
  padding: 18px 16px; border: 1px solid var(--stone-800); border-radius: var(--radius);
  background: var(--stone-900);
}
.sec-icon { font-size: 1.5rem; display: block; margin-bottom: 8px; }
.sec-item h4 { font-size: 0.9rem; margin: 0 0 6px; color: var(--stone-100); font-family: 'Inter', sans-serif; }
.sec-item p { font-size: 0.82rem; color: var(--stone-400); line-height: 1.5; margin: 0; }
.roadmap-cta { margin-top: 48px; }
.cta-row { display: flex; flex-wrap: wrap; gap: 12px; justify-content: center; margin-top: 14px; }
</style>
