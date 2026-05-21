<template>
  <div>
    <section class="hero-epic">
      <div class="hero-aurora" aria-hidden="true" />
      <div class="container hero-grid">
        <div class="hero-copy">
          <p class="hero-pulse-ribbon">Proof-first marketplace. <span>Live floor energy.</span></p>
          <h1 class="hero-title-epic">
            <span class="t-line">If it is here,</span>
            <span class="t-line t-gold-shine">it is real.</span>
            <span class="t-line t-sub">Provenance you can see, and enforce.</span>
          </h1>
          <p class="hero-sub-epic">
            Every listing ships a COA or a signed, in-platform guarantee. Escrow, buyer confirm, and a permanent ban
            for fraud. This is the collector economy, not the endless scroll.
          </p>
          <div class="hero-actions">
            <NuxtLink to="/auth/register" class="btn btn-primary btn-lg">Start free — 10 listings on us</NuxtLink>
            <NuxtLink to="/pricing" class="btn btn-outline btn-lg">See pricing (5% vs 13%)</NuxtLink>
            <NuxtLink to="/browse" class="btn btn-dark btn-lg">Hit the floor</NuxtLink>
          </div>
          <p class="hero-help text-muted">
            Need help getting in?
            <a href="tel:+18778370527">(877) 837-0527</a> ·
            <a href="mailto:info@thefranksstandard.com">info@thefranksstandard.com</a>
          </p>
          <div class="hero-avatars" aria-label="Product examples">
            <img
              v-for="(a, i) in heroMosaic"
              :key="i"
              :src="a"
              alt=""
              width="72"
              height="72"
              class="mosaic-img"
              @error="onHeroMosaicError"
            />
          </div>
          <div class="hero-badges">
            <NuxtLink to="/how-it-works" class="coa-badge coa-badge-bright coa-badge-link">
              COA or platform guarantee on every public listing
            </NuxtLink>
            <NuxtLink to="/prohibited-items" class="coa-badge soft coa-badge-link">
              Zero room for fakes
            </NuxtLink>
          </div>
        </div>
      </div>
    </section>

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
          <a href="tel:+18778370527" class="btn btn-outline btn-sm">Call (877) 837-0527</a>
          <NuxtLink to="/open-door" class="btn btn-primary btn-sm">Open Door Policy &rarr;</NuxtLink>
        </div>
      </div>
    </section>

    <section class="activity-ticker" aria-label="What the Standard stands for">
      <div class="container">
        <ul class="ticker-list">
          <li v-for="(b, j) in tickerBelt" :key="j" class="ticker-bubble">{{ b }}</li>
        </ul>
      </div>
    </section>

    <section class="section sig-section">
      <div class="container">
        <h2 class="section-title text-center">Signature moves you will not find bolted onto a bazaar app</h2>
        <p class="section-subtitle text-center text-muted">
          Proof, meetups, and help without shipping you to a generic help center maze.
        </p>
        <div class="grid grid-4 mt-4 sig-grid">
          <article v-for="s in signatures" :key="s.title" class="sig-card">
            <p class="sig-tag">{{ s.tag }}</p>
            <h3>{{ s.title }}</h3>
            <p class="sig-desc">{{ s.desc }}</p>
          </article>
        </div>
      </div>
    </section>

    <section class="stats">
      <div class="container stats-row">
        <div class="stat" v-for="s in stats" :key="s.t">
          <p class="stat-n">{{ s.n }}</p>
          <p class="stat-t">{{ s.t }}</p>
        </div>
      </div>
    </section>

    <TrustCounter />

    <ShowcaseReel />

    <HomeOfferings />

    <section class="section">
      <div class="container">
        <h2 class="section-title text-center">The three pillars of The Standard</h2>
        <p class="section-subtitle text-center text-muted">Proof first. Pay second. Ban forever for fraud — no passes.</p>
        <div class="grid grid-3 mt-4">
          <div class="pillar-card" v-for="(p, i) in pillars" :key="p.t">
            <div class="pillar-top">
              <span class="pillar-num">{{ i + 1 }}</span>
            </div>
            <h3>{{ p.t }}</h3>
            <p>{{ p.d }}</p>
          </div>
        </div>
      </div>
    </section>

    <section class="section only-here">
      <div class="container">
        <h2 class="section-title">What you get here, not in a bazaar or big-box</h2>
        <p class="section-subtitle text-muted">Built for the collector economy — not the endless SKU line.</p>
        <div class="grid grid-2 mt-4 bento">
          <article class="bento-card" v-for="f in exclusives" :key="f.title">
            <div class="bento-icon" v-html="f.icon" />
            <div>
              <h3>{{ f.title }}</h3>
              <p>{{ f.body }}</p>
            </div>
          </article>
        </div>
        <NuxtLink to="/compare" class="inline-link">See how we compare to other marketplaces</NuxtLink>
      </div>
    </section>

    <section class="section section-categories">
      <div class="container">
        <h2 class="section-title text-center">Curated for serious inventory</h2>
        <p class="section-subtitle text-center text-muted">If it belongs on a stage, a slab, a wall, or a rack — and it is real</p>
        <div class="grid grid-4 mt-4">
          <NuxtLink
            v-for="cat in categories"
            :key="cat.name"
            :to="{ path: '/browse', query: { category: cat.name } }"
            class="category-card"
          >
            <div class="category-emoji">{{ cat.icon }}</div>
            <h4>{{ cat.name }}</h4>
            <p>{{ cat.desc }}</p>
          </NuxtLink>
        </div>
      </div>
    </section>

    <section class="section">
      <div class="container">
        <h2 class="section-title text-center">Other marketplaces vs. the Standard</h2>
        <p class="section-subtitle text-center text-muted">They are built for size. We are built for what cannot be faked on purpose.</p>
        <div class="comparison mt-4">
          <div class="comp-col comp-bad">
            <h3>What breaks outside</h3>
            <ul>
              <li>Open listings, optional paperwork, endless gray-market noise</li>
              <li>Fees and policies tuned for retail turns, not provenance</li>
              <li>Disputes that can drag while bad actors re-list elsewhere</li>
            </ul>
          </div>
          <div class="comp-col comp-good">
            <h3>How The Franks Standard answers</h3>
            <ul>
              <li>Auth gate before a listing is public — COA or a signed in-platform guarantee</li>
              <li>Escrow and buyer confirmation to match how collectibles are actually traded</li>
              <li>Permanent ban on proven fakes, not a “strike” system</li>
            </ul>
            <NuxtLink to="/compare" class="btn btn-outline btn-sm comp-cta">Open the full comparison</NuxtLink>
          </div>
        </div>
      </div>
    </section>

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
          in stages so there are no surprises. Same standards: COA or a signed in-platform guarantee on what goes public.
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
          <NuxtLink to="/auth/register" class="btn btn-primary btn-lg">Join the Standard</NuxtLink>
          <NuxtLink to="/how-it-works" class="btn btn-outline btn-lg">Read the play-by-play</NuxtLink>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { CATEGORY_CATALOG } from '~/utils/marketplaceCategories'

function onHeroMosaicError (e) {
  const el = e?.target
  if (!el || el.dataset?.fallbackHeroMosaic) { return }
  el.dataset.fallbackHeroMosaic = '1'
  el.src =
    'data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw=='
  el.classList.add('mosaic-fallback')
}

const heroMosaic = [
  '/franks-pavilion.png',
  '/logo.svg',
  '/img/reel-cards.svg',
  '/img/reel-watches.svg',
  '/img/reel-guitars.svg',
  '/img/reel-coins.svg',
]

const tickerBelt = [
  'Sellers: COA upload in flow. ',
  'Sneaker grails, slabbed cards. ',
  'Escrow and confirm on every handoff. ',
  'We ban fraud for life, not strikes. ',
  'Art, watches, games: the floor is the story. ',
  'See how we differ from other marketplaces. ',
]

const stats = [
  { n: '1', t: 'Proof before publish — no exceptions' },
  { n: '100%', t: 'Listings with COA or a signed platform guarantee' },
  { n: '0', t: 'Chances to come back as a known fraud' },
]

const pillars = [
  { t: 'List with evidence', d: 'Upload a COA or sign The Franks Standard authenticity backing so the buyer can review before the sale closes.' },
  { t: 'Pay with hold', d: 'Escrow and buyer confirmation are built in — your funds stay protected until the item matches the story.' },
  { t: 'Lose the account if you fake it', d: 'Counterfeit is not a “dispute” — it is a removal, a refund, and a permanent bar from the community.' },
]

const signatures = [
  {
    tag: 'Witness room',
    title: 'Video meet on the same floor as escrow',
    desc: 'Open a Jitsi room from Video in the header, share one link, and keep the deal inside the Standard’s story — no random app hopping.',
  },
  {
    tag: 'Policy desk',
    title: 'Help that knows your playbook',
    desc: 'The Help assistant is tuned for fees, COA, disputes, and tech paths. Escalate to humans via Support and email when it is not enough.',
  },
  {
    tag: 'Proof vault',
    title: 'No public listing without COA or a signed guarantee',
    desc: 'Authentication is the listing, not an add-on PDF. Buyers see proof before money moves; fraud is a permanent ban, not a strike.',
  },
  {
    tag: 'Seller shield',
    title: 'Reputation that is hard to fake',
    desc: 'You are on a named standard for high-trust inventory — collectibles, gear, and pieces that deserve paperwork, not a SKU flood.',
  },
]

const exclusives = [
  {
    title: 'Auth is the listing, not a sticker',
    body: 'Big marketplaces optimize for volume and optional paperwork. Here, proof is a gate before publish — not buried fine print.',
    icon: '<svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="#c9a84c" stroke-width="1.4"><path d="M4 7h16v10H4zM8 7V5a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2"/><path d="M8 12h8M8 16h4"/></svg>',
  },
  {
    title: 'We punish the right people',
    body: 'Proven fakes end the seller relationship. Buyers are protected first — not parked in an endless dispute queue.',
    icon: '<svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="#2ecc71" stroke-width="1.4"><path d="M7 12l3 3 7-7"/><circle cx="12" cy="12" r="9.5"/></svg>',
  },
  {
    title: 'Built for inventory that deserves paperwork',
    body: 'Cards, watches, art, instruments, grails — categories where a photo and a hunch are not a substitute for evidence.',
    icon: '<svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="#c9a84c" stroke-width="1.4"><path d="M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z"/></svg>',
  },
  {
    title: 'Support and tech in plain sight',
    body: 'Customer and technical help live on Support; the Help button covers common cases. No generic maze — just the Standard’s lanes.',
    icon: '<svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="#2ecc71" stroke-width="1.4"><path d="M12 3l2.2 4.4L19 8.3l-3.4 3.2L16.2 19 12 16.6 7.8 19l.6-7.5L5 8.3l4.8-.9z"/></svg>',
  },
]

const categories = CATEGORY_CATALOG
</script>

<style scoped>
.hero-epic {
  position: relative;
  padding: 64px 0 48px;
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
  grid-template-columns: 1.08fr 0.92fr;
  gap: 40px;
  align-items: center;
}
.hero-pulse-ribbon {
  display: inline-block;
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.2em;
  color: var(--magenta, #ff2d7a);
  margin-bottom: 14px;
  background: linear-gradient(90deg, rgba(255, 45, 122, 0.15), rgba(0, 224, 255, 0.12));
  padding: 8px 16px;
  border-radius: 999px;
  border: 1px solid rgba(0, 224, 255, 0.35);
  box-shadow: 0 0 0 1px rgba(255, 45, 122, 0.12), 0 0 18px rgba(0, 224, 255, 0.08);
}
.hero-pulse-ribbon span { color: var(--cyan, #00e0ff); }
.hero-title-epic {
  font-family: 'Syne', 'Inter', sans-serif;
  font-size: clamp(2rem, 4.2vw, 3.15rem);
  line-height: 1.04;
  margin: 0 0 20px;
  display: flex;
  flex-direction: column;
  gap: 0.1em;
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
  max-width: 560px;
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
  width: 48px; height: 48px; border-radius: 50%;
  object-fit: cover;
  border: 2px solid var(--gold);
  box-shadow: 0 0 0 1px rgba(0, 224, 255, 0.22), 0 8px 20px rgba(255, 45, 122, 0.18);
}
.mosaic-img.mosaic-fallback {
  background: rgba(255, 255, 255, 0.06);
  border-color: rgba(0, 224, 255, 0.25);
  box-shadow: none;
}
@media (prefers-reduced-motion: reduce) {
  .t-gold-shine { animation: none; }
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
.hero-actions :deep(a) {
  position: relative;
  z-index: 2;
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
  flex: 0 0 auto;
}
@media (max-width: 640px) {
  .founder-bar-inner { flex-direction: column; align-items: flex-start; }
  .founder-bar-actions { width: 100%; }
  .founder-bar-actions .btn { flex: 1 1 auto; text-align: center; }
}

.activity-ticker {
  border-block: 1px solid rgba(0, 224, 255, 0.22);
  background: #0f0a1a;
  margin-bottom: 8px;
  padding: 16px 0;
}
.ticker-list {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 10px 12px;
  list-style: none;
  margin: 0;
  padding: 0;
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
.section-categories .section-title { color: #111827 !important; }
.section-categories .section-subtitle { color: #374151 !important; font-weight: 700 !important; }
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
