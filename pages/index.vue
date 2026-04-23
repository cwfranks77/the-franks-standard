<template>
  <div>
    <!-- Hero -->
    <section class="hero">
      <div class="container text-center">
        <img src="/logo.png" alt="The Franks Standard" class="hero-logo" />
        <h1 class="hero-title">If It's on The Franks Standard,<br /><span class="text-gold">It's Real.</span></h1>
        <p class="hero-subtitle">
          The marketplace where every seller must provide a Certificate of Authenticity
          before listing. No fakes. No guessing. No exceptions.
        </p>
        <div class="hero-actions">
          <NuxtLink to="/browse" class="btn btn-primary btn-lg">Browse Marketplace</NuxtLink>
          <NuxtLink to="/sell" class="btn btn-outline btn-lg">Start Selling</NuxtLink>
        </div>
        <div class="hero-trust">
          <span class="coa-badge">COA Required on Every Listing</span>
        </div>
      </div>
    </section>

    <!-- How it works -->
    <section class="section">
      <div class="container">
        <h2 class="section-title text-center">How The Franks Standard Works</h2>
        <p class="section-subtitle text-center text-muted">Three pillars. One guarantee.</p>
        <div class="grid grid-3 mt-4">
          <div class="pillar-card">
            <div class="pillar-icon">1</div>
            <h3>List With Proof</h3>
            <p>Sellers upload a Certificate of Authenticity or digitally sign The Franks Standard Guarantee backing the item's authenticity.</p>
          </div>
          <div class="pillar-card">
            <div class="pillar-icon">2</div>
            <h3>Buy With Confidence</h3>
            <p>Every listing displays its COA status. Your payment is held in escrow until you confirm the item is as described.</p>
          </div>
          <div class="pillar-card">
            <div class="pillar-icon">3</div>
            <h3>Protected by The Standard</h3>
            <p>If an item is proven counterfeit, the seller is permanently banned and you get a full refund. Zero tolerance.</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Categories -->
    <section class="section section-dark">
      <div class="container">
        <h2 class="section-title text-center">What You'll Find Here</h2>
        <p class="section-subtitle text-center text-muted">Authentic goods across every category</p>
        <div class="grid grid-4 mt-4">
          <div class="category-card" v-for="cat in categories" :key="cat.name">
            <div class="category-emoji">{{ cat.icon }}</div>
            <h4>{{ cat.name }}</h4>
            <p>{{ cat.desc }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Why not eBay -->
    <section class="section">
      <div class="container">
        <h2 class="section-title text-center">Why Not eBay?</h2>
        <div class="comparison mt-4">
          <div class="comp-col comp-bad">
            <h3>Other Marketplaces</h3>
            <ul>
              <li>Anyone can list anything, no proof required</li>
              <li>Flooded with counterfeits and knockoffs</li>
              <li>Dispute process favors scammers</li>
              <li>No accountability for fake sellers</li>
              <li>13%+ fees eat into your profits</li>
            </ul>
          </div>
          <div class="comp-col comp-good">
            <h3>The Franks Standard</h3>
            <ul>
              <li>COA or signed guarantee required to list</li>
              <li>Every item backed by authenticity proof</li>
              <li>Escrow payments protect every transaction</li>
              <li>Fake sellers permanently banned, no second chances</li>
              <li>Fair fees — sellers keep more of their money</li>
            </ul>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA -->
    <section class="section cta-section">
      <div class="container text-center">
        <h2 class="section-title">Ready to Buy or Sell the Real Deal?</h2>
        <p class="section-subtitle text-muted">Join The Franks Standard today. It's free to sign up.</p>
        <div class="hero-actions mt-3">
          <NuxtLink to="/auth/register" class="btn btn-primary btn-lg">Create Free Account</NuxtLink>
          <NuxtLink to="/how-it-works" class="btn btn-outline btn-lg">Learn More</NuxtLink>
        </div>
      </div>
    </section>

    <!-- FretPilot sub-brand -->
    <section class="section section-dark">
      <div class="container text-center">
        <p class="text-muted" style="font-size: 0.85rem;">A FRANKS STANDARD BRAND</p>
        <h3 class="mt-1">FretPilot Studio</h3>
        <p class="text-muted mt-1">Learn guitar with AI-powered lessons, a built-in trainer, and a curated gear store.</p>
        <a href="https://fretpilotstudio.com" target="_blank" class="btn btn-dark mt-2">Visit FretPilot Studio</a>
      </div>
    </section>
  </div>
</template>

<script setup>
const categories = [
  { icon: '🏆', name: 'Sports Cards & Memorabilia', desc: 'Graded cards, signed jerseys, game-used gear' },
  { icon: '🎸', name: 'Musical Instruments', desc: 'Vintage guitars, amps, pro audio equipment' },
  { icon: '🔧', name: 'Firearms Accessories', desc: 'Parts, optics, triggers — no ATF-reportable items' },
  { icon: '🪙', name: 'Coins & Currency', desc: 'Rare coins, bullion, graded numismatics' },
  { icon: '🎨', name: 'Art & Antiques', desc: 'Original artwork, vintage collectibles, estate pieces' },
  { icon: '⌚', name: 'Watches & Jewelry', desc: 'Luxury watches, vintage jewelry, certified gems' },
  { icon: '👟', name: 'Sneakers & Streetwear', desc: 'Authenticated kicks, limited drops, designer apparel' },
  { icon: '🎮', name: 'Vintage Electronics & Games', desc: 'Retro consoles, sealed games, rare tech' },
]
</script>

<style scoped>
.hero {
  padding: 100px 0 80px;
  background: radial-gradient(ellipse at 50% 0%, rgba(201, 168, 76, 0.08) 0%, transparent 60%);
}
.hero-logo {
  height: 120px;
  margin-bottom: 30px;
  filter: drop-shadow(0 4px 20px rgba(201, 168, 76, 0.2));
}
.hero-title {
  font-size: clamp(2rem, 5vw, 3.5rem);
  margin-bottom: 20px;
  letter-spacing: 1px;
}
.hero-subtitle {
  font-size: 1.15rem;
  color: var(--stone-300);
  max-width: 650px;
  margin: 0 auto 30px;
}
.hero-actions {
  display: flex;
  gap: 16px;
  justify-content: center;
  flex-wrap: wrap;
}
.hero-trust { margin-top: 30px; }

.section { padding: 80px 0; }
.section-dark { background: rgba(0, 0, 0, 0.2); }
.section-title { font-size: clamp(1.5rem, 3vw, 2.2rem); margin-bottom: 8px; }
.section-subtitle { font-size: 1.05rem; }

.pillar-card {
  text-align: center;
  padding: 30px 24px;
  border: 1px solid var(--stone-800);
  border-radius: var(--radius-lg);
  background: var(--stone-900);
}
.pillar-icon {
  width: 50px;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 16px;
  border-radius: 50%;
  background: var(--gold);
  color: var(--stone-950);
  font-family: 'Cinzel', serif;
  font-weight: 900;
  font-size: 1.3rem;
}
.pillar-card h3 {
  font-size: 1.15rem;
  margin-bottom: 10px;
  color: var(--gold);
}
.pillar-card p { color: var(--stone-400); font-size: 0.9rem; }

.category-card {
  padding: 24px;
  border: 1px solid var(--stone-800);
  border-radius: var(--radius-lg);
  background: var(--stone-900);
  text-align: center;
  transition: border-color 0.2s;
}
.category-card:hover { border-color: var(--gold); }
.category-emoji { font-size: 2.5rem; margin-bottom: 12px; }
.category-card h4 { font-size: 0.95rem; margin-bottom: 6px; }
.category-card p { color: var(--stone-400); font-size: 0.8rem; }

.comparison {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
}
.comp-col {
  padding: 30px;
  border-radius: var(--radius-lg);
}
.comp-bad {
  background: rgba(231, 76, 60, 0.06);
  border: 1px solid rgba(231, 76, 60, 0.2);
}
.comp-good {
  background: rgba(46, 204, 113, 0.06);
  border: 1px solid rgba(46, 204, 113, 0.2);
}
.comp-col h3 { font-size: 1.1rem; margin-bottom: 16px; }
.comp-bad h3 { color: var(--alert-red); }
.comp-good h3 { color: var(--trust-green); }
.comp-col ul { list-style: none; display: flex; flex-direction: column; gap: 12px; }
.comp-col li { color: var(--stone-300); font-size: 0.9rem; padding-left: 24px; position: relative; }
.comp-bad li::before { content: '\2717'; position: absolute; left: 0; color: var(--alert-red); }
.comp-good li::before { content: '\2713'; position: absolute; left: 0; color: var(--trust-green); }

@media (max-width: 768px) {
  .comparison { grid-template-columns: 1fr; }
}

.cta-section {
  background: radial-gradient(ellipse at 50% 100%, rgba(201, 168, 76, 0.08) 0%, transparent 60%);
}
</style>
