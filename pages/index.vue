<template>
  <div>
    <section class="hero-epic">
      <div class="hero-aurora" aria-hidden="true" />
      <div class="container hero-grid">
        <div class="hero-copy">
          <p class="hero-pulse-ribbon">{{ HERO_RIBBON }}</p>
          <h1 class="hero-title-epic">
            <span class="t-line">{{ HERO_TITLE_LINE_1 }}</span>
            <span class="t-line t-gold-shine">{{ HERO_TITLE_LINE_2 }}</span>
            <span class="t-line t-sub">{{ HERO_TITLE_SUB }}</span>
          </h1>
          <p class="hero-sub-epic">
            {{ HERO_LEDE }}
          </p>
          <p class="hero-facilitator-note">{{ FACILITATOR_ONE_LINER }}</p>
          <HomeQuickNav />
          <p class="hero-help text-muted">
            Need help getting in?
            <a href="tel:+18778370527">(877) 837-0527</a> ·
            <a href="mailto:info@thefranksstandard.com">info@thefranksstandard.com</a>
          </p>
        </div>
        <HomeHeroVisual />
      </div>
    </section>

    <HomeShowcaseReel />

    <HomeBrowsePreview />

    <HomeTrustMission />

    <HomeAuthenticityEducation />

    <TopSellersShowcase />

    <section class="founder-bar" aria-label="Founder is reachable">
      <div class="container founder-bar-inner">
        <div class="founder-bar-copy">
          <p class="founder-bar-eyebrow">Open Door Policy</p>
          <p class="founder-bar-text">
            <strong>Charles Franks</strong> &mdash; the founder &mdash; reads feedback personally.
            No ticket queues. No 7&ndash;10 business day waits.
          </p>
        </div>
        <div class="founder-bar-actions">
          <a href="tel:+18778370527" class="mkt-btn mkt-btn--ghost mkt-btn--compact">Call (877) 837-0527</a>
          <NuxtLink to="/open-door" class="mkt-btn mkt-btn--secondary mkt-btn--compact">Open Door</NuxtLink>
        </div>
      </div>
    </section>

    <HomeFloorHub />

    <HomeLiveNow />

    <section class="activity-ticker" aria-label="What the Standard stands for">
      <div class="container">
        <ul class="ticker-list">
          <li v-for="(b, j) in tickerBeltDoubled" :key="j" class="ticker-bubble">{{ b }}</li>
        </ul>
      </div>
    </section>

    <TrustCounter />

    <section class="section proof-strip">
      <div class="container proof-inner">
        <div>
          <h2>Staying on the page should feel like confidence</h2>
          <p class="text-muted">
            Every section here is a promise. Create an account, save your seller profile, and be first when new categories open.
            No spam — the Standard is a membership for people who are tired of gambling on the big apps.
          </p>
        </div>
        <NuxtLink to="/auth/register" class="btn btn-primary btn-lg">Create your free account</NuxtLink>
      </div>
    </section>

    <HomeContactHub />

    <section class="section section-sellers-cta">
      <div class="container text-center">
        <h2 class="section-title">Bring your store to the floor</h2>
        <p class="section-subtitle text-muted">
          We are onboarding shops and pro sellers with authenticity-backed inventory—public listings and checkout roll out
          in stages so there are no surprises. Collectible listings require seller proof; we screen and enforce policies — we do not guarantee authenticity.
        </p>
        <div class="hero-actions mt-3">
          <NuxtLink to="/sellers" class="btn btn-primary btn-lg">For sellers &amp; stores</NuxtLink>
          <NuxtLink to="/sell" class="btn btn-outline btn-lg">Send a listing draft</NuxtLink>
        </div>
      </div>
    </section>

    <section class="section app-section">
      <div class="container">
        <div class="app-promo">
          <div class="app-promo-copy">
            <h2 class="section-title">Take the Standard with you</h2>
            <p class="text-muted">
              Download the app for Android or Windows. Browse, buy, sell, and get notifications — same account as the website.
            </p>
          </div>
          <div class="app-promo-install">
            <AppDownloadCards />
          </div>
        </div>
      </div>
    </section>

    <section class="section cta-section">
      <div class="container text-center">
        <h2 class="section-title">The floor is open</h2>
        <p class="section-subtitle text-muted">Buy with proof. Sell with reputation. It takes minutes to get inside.</p>
        <div class="hero-actions mt-3">
          <NuxtLink to="/browse" class="btn btn-primary btn-lg">Browse marketplace</NuxtLink>
          <NuxtLink to="/auth/register" class="btn btn-outline btn-lg">Join the Standard</NuxtLink>
          <NuxtLink to="/how-it-works" class="btn btn-dark btn-lg">Read the play-by-play</NuxtLink>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import {
  FACILITATOR_ONE_LINER,
  HERO_LEDE,
  HERO_RIBBON,
  HERO_TITLE_LINE_1,
  HERO_TITLE_LINE_2,
  HERO_TITLE_SUB,
} from '~/utils/marketplaceFacilitatorCopy.js'

const tickerBelt = [
  'Sellers: COA upload in flow. ',
  'Sneaker grails, slabbed cards. ',
  'Escrow and confirm on every handoff. ',
  'We ban fraud for life, not strikes. ',
  'Art, watches, games: the floor is the story. ',
  'See how we differ from other marketplaces. ',
]
const tickerBeltDoubled = [...tickerBelt, ...tickerBelt]
</script>

<style scoped>
.hero-epic {
  position: relative;
  padding: 40px 0 28px;
  overflow: hidden;
}
.hero-aurora {
  position: absolute;
  inset: -20% -20% 40% -20%;
  background: conic-gradient(
    from 120deg at 30% 30%,
    rgba(255, 45, 122, 0.35) 0deg,
    rgba(0, 224, 255, 0.15) 90deg,
    rgba(139, 92, 255, 0.25) 200deg,
    transparent 320deg
  );
  filter: blur(50px);
  pointer-events: none;
  opacity: 0.85;
  animation: aurora-drift 18s ease-in-out infinite alternate;
}
@keyframes aurora-drift {
  0% { transform: rotate(0deg) scale(1); opacity: 0.75; }
  100% { transform: rotate(8deg) scale(1.08); opacity: 0.95; }
}
@media (prefers-reduced-motion: reduce) {
  .hero-aurora { animation: none; }
}
@media (prefers-reduced-motion: reduce) {
  .hero-aurora { opacity: 0.75; }
}
.hero-copy {
  position: relative;
  z-index: 2;
}
.hero-grid {
  position: relative;
  display: grid;
  grid-template-columns: 1fr;
  max-width: 1120px;
  gap: 28px;
  align-items: center;
}
@media (min-width: 960px) {
  .hero-grid {
    grid-template-columns: minmax(0, 1.05fr) minmax(280px, 0.95fr);
    gap: 32px;
  }
}
.hero-pulse-ribbon {
  display: inline-block;
  font-size: 0.72rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.2em;
  color: #000000;
  margin-bottom: 14px;
  background: rgba(255, 255, 255, 0.92);
  padding: 8px 16px;
  border-radius: 999px;
  border: 1px solid rgba(0, 0, 0, 0.12);
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
}
.hero-pulse-ribbon span { color: #000000; font-weight: 800; }
.hero-title-epic {
  font-family: 'Syne', 'Inter', sans-serif;
  font-size: clamp(2rem, 4.2vw, 3.15rem);
  line-height: 1.04;
  margin: 0 0 20px;
  display: flex;
  flex-direction: column;
  gap: 0.1em;
  color: #000000;
}
.t-line:not(.t-gold-shine):not(.t-sub) {
  color: #000000;
  -webkit-text-fill-color: #000000;
}
.t-gold-shine {
  background: linear-gradient(110deg, var(--gold) 0%, #fff1a8 30%, var(--gold) 55%, var(--magenta) 100%);
  background-size: 200% auto;
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  animation: shine 5s ease-in-out infinite;
}
@keyframes shine {
  0% { background-position: 0% 50%; }
  100% { background-position: 200% 50%; }
}
.t-line { display: block; }
.t-line.t-sub {
  font-size: 0.5em;
  -webkit-text-fill-color: #111827;
  color: #111827;
  font-weight: 700;
  margin-top: 0.2em;
  line-height: 1.3;
  letter-spacing: 0.02em;
  background: none;
  animation: none;
}
.hero-sub-epic {
  font-size: 1.06rem;
  color: #111827;
  font-weight: 700;
  line-height: 1.7;
  max-width: 640px;
  margin: 0 0 8px;
}
.hero-facilitator-note {
  font-size: 0.82rem;
  font-weight: 700;
  color: #374151;
  line-height: 1.5;
  max-width: 640px;
  margin: 0 0 4px;
}
.hero-actions { display: flex; flex-wrap: wrap; gap: 12px; margin-top: 24px; }
.hero-help {
  margin: 12px 0 0;
  font-size: 0.9rem;
  color: #111827;
  font-weight: 700;
}
.hero-help a {
  color: #146eb4;
  font-weight: 700;
}
.hero-help a:hover { color: #0f5f9c; }
.hero-avatars {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 10px;
  margin: 20px 0 10px;
}
.mosaic-img {
  width: 40px; height: 40px; border-radius: 50%;
  object-fit: cover;
  border: 2px solid var(--gold);
  box-shadow: 0 0 0 1px rgba(0, 224, 255, 0.22), 0 8px 20px rgba(255, 45, 122, 0.18);
  animation: mosaic-float 5s ease-in-out infinite;
}
.mosaic-img:nth-child(2) { animation-delay: 0.4s; }
.mosaic-img:nth-child(3) { animation-delay: 0.8s; }
.mosaic-img:nth-child(4) { animation-delay: 1.2s; }
.mosaic-img:nth-child(5) { animation-delay: 1.6s; }
.mosaic-img:nth-child(6) { animation-delay: 2s; }
@keyframes mosaic-float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-4px); }
}
.mosaic-img.mosaic-fallback {
  background: rgba(255, 255, 255, 0.06);
  border-color: rgba(0, 224, 255, 0.25);
  box-shadow: none;
}
@media (prefers-reduced-motion: reduce) {
  .t-gold-shine { animation: none; }
  .mosaic-img { animation: none; }
  .ticker-list { animation: none; flex-wrap: wrap; justify-content: center; width: auto; }
}
.hero-badges { display: flex; flex-wrap: wrap; gap: 10px; margin-top: 6px; }
.coa-badge-link {
  text-decoration: none;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}
.coa-badge-link:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
}
.hero-help a {
  position: relative;
  z-index: 2;
}
.hero-actions {
  position: relative;
  z-index: 3;
  pointer-events: auto;
}
.hero-actions :deep(a) {
  position: relative;
  z-index: 2;
  pointer-events: auto;
}
.coa-badge-bright {
  border-color: #fca5a5 !important;
  color: #7f1d1d !important;
  background: #fef2f2 !important;
  font-weight: 700;
}
.coa-badge-bright::before {
  background: #b91c1c !important;
  color: #fff !important;
}
.coa-badge.soft {
  border-color: #86efac;
  color: #14532d !important;
  background: #ecfdf5 !important;
  font-weight: 700;
}
.coa-badge.soft::before {
  background: #15803d !important;
  color: #fff !important;
}
@media (max-width: 1024px) {
  .hero-grid { grid-template-columns: 1fr; }
}
.founder-bar {
  border-block: 1px solid rgba(0, 245, 160, 0.18);
  background: linear-gradient(90deg, rgba(0, 245, 160, 0.06), rgba(255, 216, 77, 0.05));
  padding: 14px 0;
}
.founder-bar-inner {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}
.founder-bar-copy { flex: 1 1 320px; min-width: 0; }
.founder-bar-eyebrow {
  margin: 0 0 4px;
  font-size: 0.68rem;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: var(--trust-green, #00f5a0);
  font-weight: 800;
}
.founder-bar-text {
  margin: 0;
  font-size: 0.95rem;
  color: #111827;
  font-weight: 700;
  line-height: 1.5;
}
.founder-bar-text strong { color: #111827; font-weight: 900; }
.founder-bar-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  flex-shrink: 0;
}
@media (max-width: 640px) {
  .founder-bar-inner { flex-direction: column; align-items: flex-start; }
}

.activity-ticker {
  border-block: 1px solid rgba(0, 224, 255, 0.22);
  background: #0f0a1a;
  margin-bottom: 8px;
  padding: 16px 0;
}
.ticker-list {
  display: flex;
  flex-wrap: nowrap;
  justify-content: flex-start;
  gap: 10px 12px;
  list-style: none;
  margin: 0;
  padding: 0;
  width: max-content;
  animation: ticker-drift 38s linear infinite;
}
@keyframes ticker-drift {
  0% { transform: translateX(0); }
  100% { transform: translateX(-50%); }
}
.activity-ticker .container {
  overflow: hidden;
  mask-image: linear-gradient(90deg, transparent, #000 8%, #000 92%, transparent);
}
.ticker-bubble {
  font-size: 0.88rem;
  font-weight: 700;
  line-height: 1.45;
  color: #ffffff;
  -webkit-text-fill-color: #ffffff;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(0, 224, 255, 0.35);
  border-radius: 999px;
  padding: 8px 14px;
  user-select: text;
  -webkit-user-select: text;
  cursor: text;
  pointer-events: auto;
}
.sig-section {
  padding: 56px 0 24px;
  border-bottom: 1px solid rgba(0, 224, 255, 0.08);
}
.sig-grid { gap: 18px; }
.sig-card {
  padding: 20px 18px;
  border-radius: var(--radius-lg);
  border: 1px solid var(--stone-800);
  background: linear-gradient(160deg, rgba(0, 224, 255, 0.06), rgba(18, 8, 32, 0.95));
  text-align: left;
}
.sig-card h3 { font-size: 1.02rem; margin: 0 0 8px; color: var(--stone-100); line-height: 1.25; }
.sig-tag {
  font-size: 0.68rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.14em;
  color: var(--magenta, #ff2d7a); margin: 0 0 10px;
}
.sig-desc { margin: 0; font-size: 0.88rem; line-height: 1.5; color: var(--stone-400); }
@media (max-width: 900px) {
  .sig-grid.grid-4 { grid-template-columns: repeat(2, 1fr); }
}
@media (max-width: 520px) {
  .sig-grid.grid-4 { grid-template-columns: 1fr; }
}
.stats { padding: 12px 0 36px; }
.stats-row {
  display: grid; grid-template-columns: repeat(3, 1fr);
  gap: 16px; border: 1px solid var(--stone-800);
  border-radius: var(--radius-lg); background: rgba(0,0,0,0.2);
  padding: 20px 16px;
}
.stat { text-align: center; padding: 0 6px; }
.stat-n { font-family: 'Cinzel', serif; font-size: 1.8rem; color: var(--gold); margin-bottom: 4px; }
.stat-t { color: var(--stone-400); font-size: 0.86rem; line-height: 1.35; }
@media (max-width: 640px) { .stats-row { grid-template-columns: 1fr; } }
.section { padding: 80px 0; }
.section-subtitle { font-size: 1.05rem; }
.pillar-card {
  text-align: left; padding: 28px 24px;
  border: 1px solid var(--stone-800);
  border-radius: var(--radius-lg);
  background: linear-gradient(180deg, rgba(201, 168, 76, 0.04) 0%, var(--stone-900) 40%);
}
.pillar-top { display: flex; align-items: center; margin-bottom: 14px; }
.pillar-num {
  width: 40px; height: 40px; border-radius: 10px; display: inline-flex; align-items: center; justify-content: center;
  background: var(--gold); color: var(--stone-950); font-family: 'Cinzel', serif; font-weight: 800;
}
.pillar-card h3 { font-size: 1.15rem; color: var(--stone-100); margin-bottom: 8px; }
.pillar-card p { color: var(--stone-400); font-size: 0.92rem; }
.only-here { background: rgba(0, 0, 0, 0.15); }
.bento { gap: 16px; }
.bento-card {
  display: flex; gap: 16px; padding: 22px;
  border: 1px solid var(--stone-800); border-radius: var(--radius-lg);
  background: var(--stone-900); align-items: flex-start; transition: border-color 0.2s, transform 0.2s;
}
.bento-card:hover { border-color: rgba(201, 168, 76, 0.4); transform: translateY(-2px); }
.bento-card h3 { font-size: 1.05rem; color: var(--stone-100); margin-bottom: 6px; }
.bento-card p { color: var(--stone-400); font-size: 0.9rem; }
.bento-icon { flex: 0 0 auto; padding: 4px; }
@media (min-width: 1024px) { .bento { grid-template-columns: repeat(2, 1fr); } }
.inline-link { display: inline-block; margin-top: 20px; color: var(--gold); font-weight: 600; }
.category-card {
  display: block;
  padding: 24px;
  border: 1px solid #d7dde6;
  border-radius: var(--radius-lg);
  background: #fff;
  text-align: center;
  text-decoration: none;
  color: inherit;
  cursor: pointer;
  transition: border-color 0.2s, box-shadow 0.2s, transform 0.2s;
  box-shadow: 0 2px 8px rgba(17, 24, 39, 0.06);
}
.category-card:hover {
  border-color: var(--gold);
  box-shadow: 0 8px 20px rgba(17, 24, 39, 0.1);
  transform: translateY(-2px);
  color: inherit;
}
.category-emoji { font-size: 2.1rem; margin-bottom: 10px; }
.category-card h4 {
  font-size: 0.9rem;
  margin-bottom: 6px;
  color: #111827;
  font-weight: 700;
  font-family: 'Cinzel', serif;
}
.category-card p { color: #1f2937; font-size: 0.85rem; font-weight: 700; line-height: 1.5; }
.section-categories {
  padding: 48px 0;
  background: #fff;
}
.section-categories .section-title { color: #111827 !important; font-size: 1.35rem; }
.section-categories .section-subtitle { color: #374151 !important; font-weight: 600 !important; font-size: 0.9rem; }
.section-categories .category-shelf {
  grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  gap: 8px;
}
.comparison { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; }
.comp-col { padding: 28px; border-radius: var(--radius-lg); }
.comp-bad { background: rgba(231, 76, 60, 0.05); border: 1px solid rgba(231, 76, 60, 0.18); }
.comp-good { background: rgba(46, 204, 113, 0.05); border: 1px solid rgba(46, 204, 113, 0.2); }
.comp-col h3 { font-size: 1.1rem; margin-bottom: 14px; }
.comp-bad h3 { color: var(--alert-red); }
.comp-good h3 { color: var(--trust-green); }
.comp-col ul { list-style: none; display: flex; flex-direction: column; gap: 12px; }
.comp-col li { color: #1f2937; font-size: 0.92rem; font-weight: 600; padding-left: 24px; position: relative; }
.comp-bad li::before { content: '\00d7'; position: absolute; left: 0; color: var(--alert-red); font-size: 1.1rem; }
.comp-good li::before { content: '\2713'; position: absolute; left: 0; color: var(--trust-green); }
.comp-cta { margin-top: 20px; }
@media (max-width: 800px) { .comparison { grid-template-columns: 1fr; } }
.proof-strip { background: linear-gradient(100deg, rgba(201, 168, 76, 0.1), rgba(0,0,0,0)); border-top: 1px solid var(--stone-800); }
.proof-inner { display: flex; align-items: center; justify-content: space-between; gap: 24px; flex-wrap: wrap; }
.proof-inner h2 { font-size: 1.6rem; margin-bottom: 8px; }
.cta-section { background: radial-gradient(ellipse at 50% 100%, rgba(201, 168, 76, 0.1) 0%, transparent 60%); }
.app-section { padding: 48px 0; border-top: 1px solid var(--stone-800); }
.app-promo { display: grid; grid-template-columns: 1fr 1fr; gap: 32px; align-items: center; }
.app-promo-copy { }
.app-promo-copy .section-title { text-align: left; font-size: 1.6rem; }
.app-promo-copy .text-muted { font-size: 1rem; line-height: 1.65; }
@media (max-width: 768px) { .app-promo { grid-template-columns: 1fr; } }
</style>
