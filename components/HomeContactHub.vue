<template>
  <section class="section hub-section">
    <div class="container">
      <ScrollReveal>
        <p class="eyebrow text-center">Reach the team</p>
        <h2 class="section-title text-center">Contact, support &amp; platform help</h2>
        <p class="section-subtitle text-center text-muted">
          Everything you need to buy, sell, or partner with us — in one place.
        </p>
      </ScrollReveal>

      <div class="hub-grid mt-4">
        <ScrollReveal>
          <div class="hub-card hub-contact">
            <h3>Talk to us</h3>
            <ul class="hub-list">
              <li>
                <span class="hub-label">Phone</span>
                <a href="tel:+18778370527" class="hub-value hub-phone">(877) 837-0527</a>
                <span class="hub-note">AI-assisted line — complex cases go to a human</span>
              </li>
              <li>
                <span class="hub-label">Email</span>
                <a href="mailto:info@thefranksstandard.com" class="hub-value">info@thefranksstandard.com</a>
              </li>
              <li>
                <span class="hub-label">Live help</span>
                <span class="hub-value">Help button on every page (AI chat)</span>
              </li>
              <li>
                <span class="hub-label">Video</span>
                <NuxtLink to="/video" class="hub-value hub-link">Start a video room →</NuxtLink>
              </li>
            </ul>
            <div class="hub-actions">
              <NuxtLink to="/contact" class="btn btn-primary">Full contact page</NuxtLink>
              <NuxtLink to="/support" class="btn btn-outline">Support &amp; tech</NuxtLink>
            </div>
          </div>
        </ScrollReveal>

        <ScrollReveal>
          <div class="hub-card hub-dev">
            <span class="dev-badge">Platform &amp; development</span>
            <h3>Developer-led marketplace</h3>
            <p class="hub-lead">
              The Franks Standard is built and maintained by <strong>Charles Franks</strong> — marketplace product,
              seller onboarding, and the integrations that power proof, payments, and support on one floor.
            </p>
            <ul class="dev-stack">
              <li v-for="t in tech" :key="t">{{ t }}</li>
            </ul>
            <p class="hub-lead dev-services-title">Available for sellers &amp; partners</p>
            <ul class="hub-list dev-services">
              <li v-for="s in devServices" :key="s">{{ s }}</li>
            </ul>
            <div class="hub-actions">
              <a
                href="mailto:info@thefranksstandard.com?subject=Platform%20or%20development%20inquiry"
                class="btn btn-primary"
              >Email the developer</a>
              <NuxtLink to="/roadmap" class="btn btn-outline">Launch roadmap</NuxtLink>
            </div>
          </div>
        </ScrollReveal>
      </div>

      <ScrollReveal>
        <div class="hub-strip">
          <div v-for="(item, i) in quickFacts" :key="item" class="hub-strip-item" :style="{ '--i': i }">
            {{ item }}
          </div>
        </div>
      </ScrollReveal>
    </div>
  </section>
</template>

<script setup>
const tech = [
  'Nuxt · Supabase auth & data',
  'Stripe payments & seller links',
  'Jitsi video meet (no extra app)',
  'AI support drawer & store builder',
  'Static deploy · thefranksstandard.com',
]

const devServices = [
  'Custom store onboarding & catalog setup',
  'COA / guarantee workflow configuration',
  'Stripe fee links & seller payment setup',
  'Branded email (SMTP) & auth flows',
  'Technical support for shops on the floor',
]

const quickFacts = [
  'Founded by Charles Franks',
  'COA or guarantee on every listing',
  'Escrow until buyer confirms',
  'Permanent ban for proven fakes',
  'Lower seller fees than big-box apps',
  'Video · chat · phone · email support',
]
</script>

<style scoped>
.hub-section {
  position: relative;
  overflow: hidden;
  background: radial-gradient(ellipse 80% 60% at 50% 0%, rgba(255, 216, 77, 0.08), transparent 55%);
}
.hub-section::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(90deg, transparent, rgba(34, 232, 255, 0.04), transparent);
  animation: hub-shimmer 8s ease-in-out infinite;
  pointer-events: none;
}
@keyframes hub-shimmer {
  0%, 100% { opacity: 0.3; transform: translateX(-30%); }
  50% { opacity: 0.7; transform: translateX(30%); }
}
@media (prefers-reduced-motion: reduce) {
  .hub-section::before { animation: none; display: none; }
}
.eyebrow {
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: var(--gold);
  margin-bottom: 10px;
}
.hub-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
  align-items: stretch;
}
.hub-card {
  padding: 28px 26px;
  border-radius: var(--radius-xl);
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(21, 15, 36, 0.85);
  backdrop-filter: blur(8px);
  height: 100%;
}
.hub-contact {
  border-color: rgba(16, 255, 176, 0.2);
  box-shadow: 0 0 40px rgba(16, 255, 176, 0.06);
}
.hub-dev {
  border-color: rgba(255, 216, 77, 0.25);
  box-shadow: 0 0 40px rgba(255, 216, 77, 0.08);
}
.hub-card h3 {
  font-size: 1.35rem;
  margin: 0 0 16px;
  color: var(--stone-50);
}
.hub-list {
  list-style: none;
  padding: 0;
  margin: 0 0 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.hub-list li {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.hub-label {
  font-size: 0.7rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  color: var(--stone-500);
}
.hub-value {
  font-size: 1rem;
  font-weight: 600;
  color: var(--stone-100);
}
.hub-phone {
  font-family: 'Cinzel', serif;
  font-size: 1.25rem;
  color: var(--trust-green);
  text-decoration: none;
}
.hub-phone:hover { color: var(--gold); }
.hub-link { color: var(--gold); font-weight: 600; text-decoration: none; }
.hub-link:hover { color: var(--gold-light); }
.hub-note { font-size: 0.8rem; color: var(--stone-500); }
.hub-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 8px;
}
.dev-badge {
  display: inline-block;
  font-size: 0.68rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.14em;
  color: var(--stone-950);
  background: linear-gradient(135deg, var(--gold), #ffb020);
  padding: 6px 12px;
  border-radius: 999px;
  margin-bottom: 12px;
}
.hub-lead {
  font-size: 0.95rem;
  line-height: 1.65;
  color: var(--stone-300);
  margin: 0 0 16px;
}
.dev-stack {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  list-style: none;
  padding: 0;
  margin: 0 0 20px;
}
.dev-stack li {
  font-size: 0.78rem;
  font-weight: 600;
  padding: 6px 12px;
  border-radius: 999px;
  border: 1px solid rgba(160, 124, 255, 0.35);
  background: rgba(160, 124, 255, 0.1);
  color: var(--stone-200);
}
.dev-services-title {
  margin-bottom: 8px;
  font-size: 0.85rem;
  color: var(--gold);
  font-weight: 700;
}
.dev-services li {
  font-size: 0.9rem;
  color: var(--stone-300);
  padding-left: 1.1rem;
  position: relative;
}
.dev-services li::before {
  content: '✓';
  position: absolute;
  left: 0;
  color: var(--trust-green);
  font-weight: 800;
}
.hub-strip {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 10px;
  margin-top: 32px;
  padding-top: 28px;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
}
.hub-strip-item {
  font-size: 0.82rem;
  font-weight: 600;
  color: var(--stone-300);
  padding: 8px 14px;
  border-radius: 999px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: rgba(255, 255, 255, 0.03);
  animation: strip-pop 0.6s ease backwards;
  animation-delay: calc(var(--i, 0) * 0.08s);
}
@keyframes strip-pop {
  from { opacity: 0; transform: scale(0.92); }
  to { opacity: 1; transform: scale(1); }
}
@media (prefers-reduced-motion: reduce) {
  .hub-strip-item { animation: none; }
}
@media (max-width: 900px) {
  .hub-grid { grid-template-columns: 1fr; }
}
</style>
