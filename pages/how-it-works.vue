<template>
  <div class="hiw-page">
    <div class="container">
      <div class="text-center" style="max-width: 700px; margin: 0 auto;">
        <h1>How The Franks Standard Works</h1>
        <p class="text-muted mt-1">We built this marketplace on one principle: if you sell it here, you stand behind it.</p>
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
  { title: 'List With Authenticity Proof', desc: 'When you list an item, you must either upload a Certificate of Authenticity (COA) or digitally sign The Franks Standard Guarantee — a legally binding statement that the item is genuine.' },
  { title: 'Buyers Shop With Confidence', desc: 'Every listing on The Franks Standard displays its authenticity status. Buyers can see the COA type and know exactly what they\'re getting before they buy.' },
  { title: 'Secure Escrow Payments', desc: 'When a buyer purchases, their payment is held in secure escrow via Stripe. The money is released to the seller only after the buyer confirms the item arrived as described.' },
  { title: 'Zero Tolerance for Fakes', desc: 'If an item is proven counterfeit, the seller is permanently banned — no warnings, no second chances. The buyer gets a full refund. That\'s The Franks Standard.' },
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
  { q: 'What fees does The Franks Standard charge?', a: 'Sellers pay a small transaction fee (often well below typical marketplace rates of 10–15%+) when an item sells. Buyers pay no extra fees.', open: false },
  { q: 'What is the Franks Standard Guarantee?', a: 'It\'s a legally binding digital signature where the seller stakes their name and reputation on the authenticity of the item. If the item is proven fake, the seller is permanently banned and the buyer is refunded.', open: false },
  { q: 'What if I don\'t have a COA?', a: 'You can sign The Franks Standard Guarantee instead. You\'re personally vouching for the item. This puts your name and account on the line.', open: false },
  { q: 'Can I sell firearms?', a: 'We do not allow firearms or items that require ATF/FBI reporting. Accessories like optics, parts, triggers (non-NFA items), and gear are welcome.', open: false },
  { q: 'What categories can I sell in?', a: 'Sports cards, memorabilia, musical instruments, firearms accessories, coins, art, watches, jewelry, sneakers, vintage electronics, and more. See our full category list on the Browse page.', open: false },
  { q: 'How do I get paid?', a: 'Sellers connect their bank account via Stripe. When a buyer confirms receipt, your payment is released automatically.', open: false },
])
</script>

<style scoped>
.hiw-page { padding: 60px 0; }
.hiw-page h1 { font-size: 2.2rem; }

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
