<template>
  <div class="hiw-page">
    <div class="container">
      <div class="text-center" style="max-width: 700px; margin: 0 auto;">
        <h1>How The Franks Standard Works</h1>
        <p class="text-muted mt-1">We are a marketplace facilitator: sellers stand behind collectible listings; we screen, facilitate escrow, and enforce when representations fail.</p>
        <p class="collectible-proof-note mt-2">{{ COLLECTIBLE_PROOF_REGISTRY }}</p>
      </div>

      <div class="steps mt-4">
        <div class="step" v-for="(step, i) in steps" :key="i">
          <div class="step-num">{{ i + 1 }}</div>
          <div class="step-content">
            <h2>{{ step.title }}</h2>
            <p>{{ step.desc }}</p>
          </div>
        </div>
      </div>

      <div class="faq-section mt-4">
        <h2 class="text-center mb-4">Frequently Asked Questions</h2>
        <div class="faq" v-for="(q, i) in faqs" :key="i">
          <button class="faq-toggle" @click="q.open = !q.open">
            <span>{{ q.q }}</span>
            <span class="faq-arrow">{{ q.open ? '−' : '+' }}</span>
          </button>
          <div class="faq-answer" v-if="q.open">
            <p>{{ q.a }}</p>
          </div>
        </div>
      </div>

      <div class="text-center mt-4" style="padding: 40px 0;">
        <h2>Ready to Get Started?</h2>
        <div style="display: flex; gap: 16px; justify-content: center; margin-top: 20px;">
          <NuxtLink to="/auth/register" class="btn btn-primary btn-lg">Create Free Account</NuxtLink>
          <NuxtLink to="/browse" class="btn btn-outline btn-lg">Browse Marketplace</NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const steps = [
  { title: 'Create Your Account', desc: 'Sign up for free in 30 seconds. Choose whether you want to buy, sell, or both. No listing fees to get started.' },
  { title: 'List With Authenticity Proof', desc: 'When you list an item, you must either upload a COA or sign the Seller Authenticity Guarantee — you back the item; Franks Standard provides the template and marketplace rules, not a Platform guarantee of genuineness.' },
  { title: 'Buyers Shop With Confidence', desc: 'Listings show what proof the seller provided (COA type, guarantee, or general merchandise standards). The Platform facilitates the sale and enforces policies — it does not warrant that any item is authentic.' },
  { title: 'Secure Escrow Payments', desc: 'When a buyer purchases, their payment is held in secure escrow via Stripe. The money is released to the seller only after the buyer confirms the item arrived as described.' },
  { title: 'Zero Tolerance for Proven Fakes', desc: 'Proven counterfeits: listing removed, buyer refunded, seller account frozen or banned per our Marketplace Policies. COA revoked when applicable. See /marketplace-policy for the full enforcement list.' },
]

const faqs = reactive([
  {
    q: 'Is the public marketplace floor and checkout live for every seller right now?',
    a: 'The site is open to the public, and we onboard stores and high-trust inventory in stages so proof and policies stay ahead of scale. If you are a shop or volume seller, use For sellers to apply. Single-item drafts can be sent from the Sell page. Full connected accounts, hosted listings, and seller payouts follow as your store is enabled—no surprise “go live” without a conversation with the team.',
    open: false,
  },
  {
    q: 'I run a store. How do I get on the floor?',
    a: 'Start with the For sellers page: email the team with what you sell and a link to your site or social. The same inbox (info@thefranksstandard.com) is our official channel, listed on Contact. We will confirm authenticity rules, fees, and timing for your catalog.',
    open: false,
  },
  { q: 'Is it free to sign up?', a: 'Yes, creating an account is completely free for buyers and sellers.', open: false },
  { q: 'What fees does The Franks Standard charge?', a: 'Sellers pay a sale fee when an item sells: 5% on Starter, 4.5% on Pro ($14.99/mo), 4% on Store ($32.99/mo). New sellers get 3% for the first 90 days. Buyers pay no platform fee on top of the list price, but applicable sales tax is added at Stripe checkout from the buyer billing address (the total can be higher than the listed price).', open: false },
  { q: 'What is a Franks Standard COA?', a: 'A platform-issued serial (FS-YYYY-NNNNNN) tied to your listing photos and description at publish, stored in our coa_certificates registry. You — the seller — back the item; it is not a Platform warranty that the item is genuine. Buyers can verify at /verify/coa.', open: false },
  { q: 'Where are refund and account-freeze rules written?', a: 'In our Marketplace Policies & Enforcement at /marketplace-policy — incorporated into Terms and the Seller Agreement. Marketing pages summarize; policies govern.', open: false },
  { q: 'What if I don\'t have a third-party COA?', a: 'Use the Franks Standard COA template when you list a collectible. We issue a serial at publish and record it with your listing. You still back authenticity; there is no signature-only bypass.', open: false },
  { q: 'Can I sell firearms?', a: 'We do not allow firearms or items that require ATF/FBI reporting. Accessories like optics, parts, triggers (non-NFA items), and gear are welcome.', open: false },
  { q: 'What categories can I sell in?', a: 'Sports cards, memorabilia, musical instruments, firearms accessories, coins, art, watches, jewelry, sneakers, vintage electronics, and more. See our full category list on the Browse page.', open: false },
  { q: 'How do I get paid?', a: 'Sellers connect their bank account via Stripe. When a buyer confirms receipt, your payment is released automatically.', open: false },
])
</script>

<style scoped>
.hiw-page { padding: 60px 0; }
.hiw-page h1 { font-size: 2.2rem; }
.collectible-proof-note {
  font-size: 0.92rem;
  font-weight: 600;
  line-height: 1.6;
  color: #374151;
  padding: 14px 16px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  text-align: left;
}

.steps { max-width: 700px; margin: 0 auto; display: flex; flex-direction: column; gap: 0; }
.step {
  display: flex;
  gap: 20px;
  padding: 28px 0;
  border-bottom: 1px solid var(--stone-800);
}
.step:last-child { border-bottom: none; }
.step-num {
  flex-shrink: 0;
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: var(--gold);
  color: var(--stone-950);
  font-family: 'Cinzel', serif;
  font-weight: 900;
  font-size: 1.2rem;
}
.step-content h2 { font-size: 1.15rem; margin-bottom: 6px; }
.step-content p { color: #374151; font-size: 0.9rem; font-weight: 600; }

.faq-section { max-width: 700px; margin: 60px auto 0; }
.faq {
  border-bottom: 1px solid var(--stone-800);
}
.faq-toggle {
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 18px 0;
  background: none;
  border: none;
  color: #111827;
  font-size: 1rem;
  font-weight: 700;
  cursor: pointer;
  text-align: left;
}
.faq-arrow { color: var(--gold); font-size: 1.3rem; flex-shrink: 0; }
.faq-answer { padding: 0 0 18px; }
.faq-answer p { color: #374151; font-size: 0.9rem; line-height: 1.6; font-weight: 600; }
</style>
