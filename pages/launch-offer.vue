<template>
  <div class="launch-page">
    <div class="container">
      <div class="launch-hero text-center">
        <span class="launch-tag">Limited time</span>
        <h1>New seller launch offer</h1>
        <p class="text-muted lead">Get started risk-free. We believe so much in what we built that your first experience costs nothing.</p>
      </div>

      <div class="offer-grid">
        <div class="offer-card highlight">
          <span class="offer-icon">🎁</span>
          <h3>10 free listings</h3>
          <p>No card needed. List your first 10 items completely free. Test the floor, see the tools, feel the difference.</p>
        </div>
        <div class="offer-card">
          <span class="offer-icon">💰</span>
          <h3>3% transaction fee for 90 days</h3>
          <p>Our normal 5% is already well below typical marketplace rates (often 10–15%+). For your first 90 days, it's 3%. You keep even more.</p>
        </div>
        <div class="offer-card">
          <span class="offer-icon">🏪</span>
          <h3>Free AI Store Builder</h3>
          <p>Our AI writes your store bio, listing descriptions, pricing strategy, and launch plan. You just sell.</p>
        </div>
        <div class="offer-card">
          <span class="offer-icon">🤝</span>
          <h3>Refer and earn</h3>
          <p>Invite another seller — you both get 1 month of Pro Seller ($9.99 value) free. No limit on referrals.</p>
        </div>
        <div class="offer-card">
          <span class="offer-icon">📦</span>
          <h3>Dropship ready from day one</h3>
          <p>Supplier fields, ship-time management, and the same authenticity standard. No extra fees for dropship.</p>
        </div>
        <div class="offer-card">
          <span class="offer-icon">📞</span>
          <h3>AI customer service included</h3>
          <p>Your buyers get (877) 837-0527, AI chat, video calls, and email support — all built in to every plan.</p>
        </div>
      </div>

      <div class="cta-box text-center">
        <h2>Ready to sell on a marketplace that was built for proof?</h2>
        <p class="text-muted">Create your account, use the AI Store Builder, and list your first items — all free.</p>
        <div class="cta-actions">
          <NuxtLink to="/auth/register" class="btn btn-primary btn-lg">Create free account</NuxtLink>
          <NuxtLink to="/join/founders10" class="btn btn-outline btn-lg">Founding sellers — FOUNDERS10</NuxtLink>
          <NuxtLink to="/honor" class="btn btn-outline btn-lg">Military &amp; heroes — HONOR26</NuxtLink>
          <NuxtLink to="/store-builder" class="btn btn-outline btn-lg">Try AI Store Builder</NuxtLink>
          <NuxtLink to="/pricing" class="btn btn-dark btn-lg">See all pricing</NuxtLink>
        </div>
      </div>

      <section class="referral-section">
        <h2 class="section-title text-center">Invite sellers, earn Pro</h2>
        <p class="text-muted text-center">Share your referral link. When someone signs up and lists an item, you both get 1 month of Pro Seller free.</p>
        <div class="referral-box">
          <div class="referral-step">
            <span class="step-num">1</span>
            <p>Share your invite link or code with another seller</p>
          </div>
          <div class="referral-step">
            <span class="step-num">2</span>
            <p>They sign up and publish their first listing</p>
          </div>
          <div class="referral-step">
            <span class="step-num">3</span>
            <p>You both get 1 month of Pro Seller — free</p>
          </div>
        </div>
        <div class="text-center mt-3">
          <NuxtLink to="/auth/register" class="btn btn-primary">Create free account to refer sellers</NuxtLink>
        </div>
      </section>

      <section class="attract-section">
        <h2 class="section-title text-center">Why sellers switch to The Franks Standard</h2>
        <div class="attract-grid">
          <div class="attract-item">
            <h4>Lower fees, more profit</h4>
            <p>5% vs typical 13%+ elsewhere. On a $100 sale, you keep $95 instead of about $87. That adds up fast.</p>
          </div>
          <div class="attract-item">
            <h4>Authenticity attracts premium buyers</h4>
            <p>Buyers pay more when they trust the item is real. COA requirements filter out the noise and bring in serious collectors.</p>
          </div>
          <div class="attract-item">
            <h4>Dropship without the risk</h4>
            <p>Other platforms ban or restrict dropshipping. We built it in — with authenticity standards that protect everyone.</p>
          </div>
          <div class="attract-item">
            <h4>AI does the hard part</h4>
            <p>Store Builder writes your bio, descriptions, and pricing strategy. AI customer service handles your buyers. You just sell.</p>
          </div>
          <div class="attract-item">
            <h4>Video calls close deals</h4>
            <p>No other marketplace has built-in video. Show the item live, answer questions face-to-face, close faster.</p>
          </div>
          <div class="attract-item">
            <h4>Zero tolerance builds trust</h4>
            <p>Fakes get banned forever — not "3 strikes." Your reputation means something here. Buyers feel that.</p>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup>
useSeoMeta({
  title: 'Launch Offer — The Franks Standard',
  description: '10 free listings, 3% fees for 90 days, AI Store Builder, referral bonuses. Start selling on the authenticity-first marketplace.',
})
</script>

<style scoped>
.launch-page { padding: 40px 0 80px; }
.launch-hero { margin-bottom: 40px; }
.launch-hero h1 { font-size: 2.2rem; margin: 12px 0 8px; }
.lead { font-size: 1.08rem; }
.launch-tag {
  display: inline-block; padding: 5px 14px; border-radius: 999px;
  font-size: 0.72rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em;
  background: linear-gradient(135deg, rgba(255, 45, 122, 0.2), rgba(201, 168, 76, 0.15));
  color: var(--gold); border: 1px solid rgba(201, 168, 76, 0.35);
  animation: pulse-glow 2s ease-in-out infinite;
}
@keyframes pulse-glow {
  0%, 100% { box-shadow: 0 0 0 0 rgba(201, 168, 76, 0.2); }
  50% { box-shadow: 0 0 20px 4px rgba(201, 168, 76, 0.15); }
}
.offer-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
@media (max-width: 900px) { .offer-grid { grid-template-columns: repeat(2, 1fr); } }
@media (max-width: 550px) { .offer-grid { grid-template-columns: 1fr; } }
.offer-card {
  padding: 24px 20px; border: 1px solid var(--stone-800); border-radius: var(--radius-lg);
  background: var(--stone-900); transition: border-color 0.2s, transform 0.2s;
}
.offer-card:hover { border-color: var(--gold); transform: translateY(-2px); }
.offer-card.highlight { border-color: rgba(0, 245, 160, 0.3); background: linear-gradient(135deg, rgba(0, 245, 160, 0.05), var(--stone-900)); }
.offer-icon { font-size: 1.8rem; display: block; margin-bottom: 10px; }
.offer-card h3 { font-size: 1.05rem; margin-bottom: 8px; }
.offer-card p { font-size: 0.85rem; color: var(--stone-400); line-height: 1.5; }
.cta-box {
  margin: 48px 0; padding: 40px 32px; border-radius: var(--radius-lg);
  border: 2px solid var(--gold); background: linear-gradient(135deg, rgba(201, 168, 76, 0.06), rgba(18, 8, 32, 0.95));
}
.cta-box h2 { font-size: 1.5rem; margin-bottom: 8px; }
.cta-actions { display: flex; flex-wrap: wrap; gap: 12px; justify-content: center; margin-top: 20px; }
.referral-section { padding: 48px 0; }
.referral-box { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin-top: 28px; max-width: 700px; margin-left: auto; margin-right: auto; }
@media (max-width: 640px) { .referral-box { grid-template-columns: 1fr; } }
.referral-step { text-align: center; padding: 20px; }
.step-num {
  display: inline-flex; align-items: center; justify-content: center;
  width: 44px; height: 44px; border-radius: 50%; margin-bottom: 12px;
  background: var(--gold); color: var(--stone-950); font-family: 'Cinzel', serif;
  font-weight: 800; font-size: 1.2rem;
}
.referral-step p { font-size: 0.9rem; color: var(--stone-200); }
.attract-section { padding: 48px 0; }
.attract-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-top: 28px; }
@media (max-width: 900px) { .attract-grid { grid-template-columns: repeat(2, 1fr); } }
@media (max-width: 550px) { .attract-grid { grid-template-columns: 1fr; } }
.attract-item {
  padding: 20px; border: 1px solid var(--stone-800); border-radius: var(--radius);
  background: var(--stone-900);
}
.attract-item h4 { font-size: 0.95rem; margin-bottom: 8px; color: var(--gold); }
.attract-item p { font-size: 0.85rem; color: var(--stone-400); line-height: 1.5; }
</style>
