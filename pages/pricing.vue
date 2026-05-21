<template>
  <div class="pricing-page">
    <div class="container">
      <div class="pricing-hero text-center">
        <span class="launch-ribbon">Launch pricing — locked in for early sellers</span>
        <h1>Simple, fair pricing</h1>
        <p class="text-muted">Up to 70% lower fees than typical marketplaces. No hidden fees. No percentage-on-percentage stacking.</p>
      </div>

      <SitePromoOffers :compact="true" class="pricing-promos" />

      <div class="pricing-billing-wrap">
        <div class="pricing-toggle">
          <button :class="{ active: billing === 'monthly' }" @click="billing = 'monthly'">Monthly</button>
          <button :class="{ active: billing === 'annual' }" @click="billing = 'annual'">Annual <span class="save-tag">Save 20%</span></button>
        </div>
      </div>

      <div class="grid grid-3 pricing-plans">
        <div v-for="plan in plans" :key="plan.id" class="plan-card" :class="{ featured: plan.featured, promo: plan.promo }">
          <div v-if="plan.promo" class="plan-promo-tag">{{ plan.promoLabel }}</div>
          <div v-if="plan.featured" class="plan-popular-tag">Most popular</div>
          <h2 class="plan-name">{{ plan.name }}</h2>
          <p class="plan-desc text-muted">{{ plan.desc }}</p>
          <div class="plan-price-row">
            <span class="plan-price">${{ billing === 'annual' ? plan.annualPrice : plan.monthlyPrice }}</span>
            <span class="plan-period">/{{ billing === 'annual' ? 'year' : 'month' }}</span>
          </div>
          <p class="plan-tx-fee">+ {{ plan.txFee }}% on sales</p>
          <ul class="plan-features">
            <li v-for="f in plan.features" :key="f"><span class="check">✓</span> {{ f }}</li>
          </ul>
          <a
            v-if="plan.cta.external"
            :href="plan.cta.external"
            target="_blank"
            rel="noopener noreferrer"
            class="btn"
            :class="plan.featured ? 'btn-primary' : 'btn-outline'"
            style="width: 100%; text-align: center;"
          >{{ plan.cta.label }}</a>
          <NuxtLink
            v-else
            :to="plan.cta.to"
            class="btn"
            :class="plan.featured ? 'btn-primary' : 'btn-outline'"
            style="width: 100%;"
          >{{ plan.cta.label }}</NuxtLink>
        </div>
      </div>

      <div class="compare-section mt-4">
        <h2 class="section-title text-center">See how we compare</h2>
        <div class="compare-table-wrap">
          <table class="compare-table">
            <thead>
              <tr>
                <th>Fee type</th>
                <th class="us">The Franks Standard</th>
                <th>Typical C2C marketplace</th>
                <th>Typical retail marketplace</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Listing fee</td>
                <td class="us"><strong>Free</strong> (first 10)</td>
                <td>Often free tier, then per-listing fees</td>
                <td>Per-item listing fees common</td>
              </tr>
              <tr>
                <td>Transaction fee</td>
                <td class="us"><strong>{{ txRangeLabel }} by plan</strong></td>
                <td>Often 10–15%+ stacked</td>
                <td>Often 8–15% by category</td>
              </tr>
              <tr>
                <td>Monthly subscription</td>
                <td class="us"><strong>$0</strong> (Starter)</td>
                <td>Optional store subscriptions</td>
                <td>Professional seller plans common</td>
              </tr>
              <tr>
                <td>Pro plan</td>
                <td class="us"><strong>${{ proMonthly }}/mo</strong></td>
                <td>Varies by tier</td>
                <td>Varies by tier</td>
              </tr>
              <tr>
                <td>Store plan</td>
                <td class="us"><strong>${{ storeMonthly }}/mo</strong></td>
                <td>Varies by tier</td>
                <td>Varies by tier</td>
              </tr>
              <tr>
                <td>COA / authenticity</td>
                <td class="us"><strong>Built in (required)</strong></td>
                <td>Often optional (extra cost)</td>
                <td>Not built for collectibles proof</td>
              </tr>
              <tr>
                <td>Dropshipping</td>
                <td class="us"><strong>Supported</strong></td>
                <td>Allowed with seller risk</td>
                <td>Strict fulfillment rules</td>
              </tr>
              <tr>
                <td>Video calls</td>
                <td class="us"><strong>Built in (free)</strong></td>
                <td>Not standard</td>
                <td>Not standard</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <section class="section promo-section">
        <div class="promo-card">
          <h2>New seller launch offer</h2>
          <p class="text-muted">Get started with zero risk — we want you to see the difference before you commit.</p>
          <div class="promo-perks">
            <div class="promo-perk"><span class="promo-icon">🎁</span> First 10 listings free — no card needed</div>
            <div class="promo-perk"><span class="promo-icon">💰</span> {{ launchPromoFeeLineText }}</div>
            <div class="promo-perk"><span class="promo-icon">🏪</span> Free AI Store Builder to design your shop</div>
            <div class="promo-perk"><span class="promo-icon">🤝</span> Refer a seller, both get 1 month Pro free</div>
            <div class="promo-perk"><span class="promo-icon">📦</span> Dropship tools included at every tier</div>
          </div>
          <NuxtLink to="/launch-offer" class="btn btn-primary btn-lg mt-3">Claim your launch offer</NuxtLink>
        </div>
      </section>

      <section class="section pay-links-section">
        <h2 class="section-title text-center">Pay with Stripe</h2>
        <p class="text-muted text-center pay-links-lede">Secure checkout for listing fees, Pro plan, orders, and disputes.</p>
        <PaymentLinksPanel :show-status="true" />
      </section>

      <section class="section faq-section">
        <h2 class="section-title text-center">Pricing FAQ</h2>
        <div class="faq-list">
          <details v-for="f in faqs" :key="f.q" class="faq-item">
            <summary>{{ f.q }}</summary>
            <p>{{ f.a }}</p>
          </details>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup>
import { PRICING_PUBLIC, launchPromoFeeLine } from '~/utils/pricingPublic.js'

const { proSellerUrl } = usePaymentLinks()

const txRangeLabel = PRICING_PUBLIC.txRangeLabel
const proMonthly = PRICING_PUBLIC.proMonthly
const storeMonthly = PRICING_PUBLIC.storeMonthly
const launchPromoFeeLineText = launchPromoFeeLine()

useSeoMeta({
  title: 'Pricing — The Franks Standard',
  description: `Fair, transparent pricing. Sale fees from ${PRICING_PUBLIC.storeTxPercent}% (Store) to ${PRICING_PUBLIC.starterTxPercent}% (Starter) — well below typical ${PRICING_PUBLIC.competitorTypical} marketplace rates. Free listings to start.`,
})

const billing = ref('monthly')

const plans = [
  {
    id: 'starter',
    name: 'Starter',
    desc: 'Perfect for trying the floor. List your first items for free.',
    monthlyPrice: '0',
    annualPrice: '0',
    txFee: String(PRICING_PUBLIC.starterTxPercent),
    promo: true,
    promoLabel: 'First 10 listings free',
    featured: false,
    features: [
      '10 free listings',
      `${PRICING_PUBLIC.starterTxPercent}% transaction fee`,
      'COA and guarantee tools',
      'Video call rooms',
      'Dropship support',
      'AI customer service',
      'Basic analytics',
    ],
    cta: { label: 'Start free', to: '/auth/register' },
  },
  {
    id: 'pro',
    name: 'Pro Seller',
    desc: 'For serious sellers. Unlimited listings, featured placement, priority support.',
    monthlyPrice: PRICING_PUBLIC.proMonthly,
    annualPrice: PRICING_PUBLIC.proAnnual,
    txFee: String(PRICING_PUBLIC.proTxPercent),
    promo: false,
    featured: true,
    features: [
      'Unlimited listings',
      `${PRICING_PUBLIC.proTxPercent}% transaction fee`,
      'Featured placement in browse',
      'AI Store Builder',
      'Priority COA review',
      'Advanced analytics',
      'Bulk listing tools',
      'Custom store page',
      'Dropship dashboard',
      'Priority customer service',
    ],
    cta: { label: 'Go Pro — pay in Stripe', to: '/pay', external: proSellerUrl },
  },
  {
    id: 'store',
    name: 'Store',
    desc: 'For businesses and high-volume sellers. Everything in Pro plus white-glove onboarding.',
    monthlyPrice: PRICING_PUBLIC.storeMonthly,
    annualPrice: PRICING_PUBLIC.storeAnnual,
    txFee: String(PRICING_PUBLIC.storeTxPercent),
    promo: false,
    featured: false,
    features: [
      'Everything in Pro',
      `${PRICING_PUBLIC.storeTxPercent}% transaction fee (lowest)`,
      'Dedicated store URL',
      'Team accounts (up to 5)',
      'API access',
      'Inventory management',
      'Wholesale / bulk pricing tools',
      'White-glove onboarding call',
      'Custom branding',
      'Priority dispute resolution',
    ],
    cta: { label: 'Apply for Store', to: '/sellers' },
  },
]

const faqs = [
  { q: 'When am I charged the transaction fee?', a: 'Only when a sale completes and the buyer confirms receipt. No sale, no fee. The percentage is taken from the sale price before payout.' },
  { q: 'Can I change plans later?', a: 'Yes, upgrade or downgrade anytime. If you upgrade mid-month, you get prorated credit. Annual plans can switch to monthly at renewal.' },
  { q: 'Is there a contract or commitment?', a: 'No contracts. Monthly plans cancel anytime. Annual plans are billed once and lock in the discounted rate for 12 months.' },
  { q: 'How do I get paid when something sells?', a: 'Payments go through Stripe. You connect your bank account or debit card in your Stripe dashboard. Payouts are automatic after buyer confirmation.' },
  { q: 'Are dropshipping fees different?', a: 'No. Same pricing for direct and dropship listings. The only difference is you provide supplier info at listing time.' },
  { q: 'What does the launch offer include?', a: `First 10 listings free (no card needed), ${PRICING_PUBLIC.launchTxPromoPercent}% transaction fee for the first 90 days (then ${PRICING_PUBLIC.txRangeLabel} by plan), free AI Store Builder access, and a referral bonus: invite another seller and both get 1 month of Pro free (${PRICING_PUBLIC.proValueLabel} value).` },
  { q: 'Where do my fees go?', a: 'All payments are collected through Stripe and go directly to The Franks Standard operating account. Stripe handles PCI compliance, fraud detection, and secure processing. You can see all transactions in your Stripe dashboard.' },
]
</script>

<style scoped>
.pricing-page { padding: 40px 0 80px; }
.pricing-hero { margin-bottom: 32px; }
.pricing-hero h1 { font-size: 2.2rem; margin-bottom: 8px; }
.launch-ribbon {
  display: inline-block; padding: 6px 18px; border-radius: 999px;
  font-size: 0.75rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em;
  background: linear-gradient(135deg, rgba(0, 245, 160, 0.15), rgba(201, 168, 76, 0.15));
  color: var(--trust-green); border: 1px solid rgba(0, 245, 160, 0.3);
  margin-bottom: 16px;
}
.pricing-billing-wrap {
  display: flex;
  justify-content: center;
  margin-bottom: 40px;
  position: relative;
  z-index: 3;
}
.pricing-toggle {
  display: flex; justify-content: center; gap: 4px;
  background: var(--stone-900); border: 1px solid var(--stone-800); border-radius: 999px;
  padding: 4px; width: fit-content;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.25);
}
.pricing-plans {
  margin-top: 0;
  position: relative;
  z-index: 1;
  align-items: stretch;
}
.pricing-toggle button {
  padding: 10px 24px; border: none; border-radius: 999px; background: none;
  color: var(--stone-400); font-weight: 600; font-size: 0.9rem; cursor: pointer;
  font-family: inherit; transition: all 0.2s;
}
.pricing-toggle button.active { background: var(--gold); color: var(--stone-950); }
.save-tag {
  display: inline-block; padding: 1px 6px; border-radius: 4px; margin-left: 4px;
  font-size: 0.65rem; background: rgba(0, 245, 160, 0.15); color: var(--trust-green);
}
.plan-card {
  position: relative;
  padding: 28px 24px;
  margin-top: 0;
  border: 1px solid var(--stone-800); border-radius: var(--radius-lg);
  background: var(--stone-900); display: flex; flex-direction: column;
  overflow: visible;
}
.plan-card.featured { border-color: var(--gold); border-width: 2px; }
.plan-card.promo { border-color: rgba(0, 245, 160, 0.3); }
.plan-promo-tag, .plan-popular-tag {
  display: inline-block;
  align-self: flex-start;
  margin-bottom: 10px;
  padding: 3px 12px; border-radius: 999px;
  font-size: 0.7rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em;
}
.plan-promo-tag { background: rgba(0, 245, 160, 0.15); color: var(--trust-green); border: 1px solid rgba(0, 245, 160, 0.3); }
.plan-popular-tag { background: rgba(201, 168, 76, 0.2); color: var(--gold); border: 1px solid rgba(201, 168, 76, 0.4); }
.plan-name { font-size: 1.3rem; margin: 8px 0 6px; }
.plan-desc { font-size: 0.85rem; margin-bottom: 16px; min-height: 40px; }
.plan-price-row { display: flex; align-items: baseline; gap: 2px; }
.plan-price { font-size: 2.4rem; font-weight: 800; color: var(--gold); font-family: 'Cinzel', serif; }
.plan-period { font-size: 0.9rem; color: var(--stone-400); }
.plan-tx-fee { font-size: 0.82rem; color: var(--stone-400); margin: 4px 0 20px; }
.plan-features {
  list-style: none; padding: 0; margin: 0 0 24px; flex: 1;
  display: flex; flex-direction: column; gap: 8px;
}
.plan-features li { font-size: 0.88rem; color: var(--stone-200); display: flex; align-items: flex-start; gap: 8px; }
.check { color: var(--trust-green); font-weight: 800; flex: 0 0 auto; }
.compare-section { padding-top: 48px; }
.compare-table-wrap { overflow-x: auto; margin-top: 24px; }
.compare-table {
  width: 100%; border-collapse: collapse; font-size: 0.88rem;
}
.compare-table th, .compare-table td {
  padding: 12px 14px; text-align: left;
  border-bottom: 1px solid var(--stone-800);
}
.compare-table th { font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.08em; color: var(--stone-400); }
.compare-table th.us, .compare-table td.us { background: rgba(0, 245, 160, 0.04); }
.compare-table td.us { color: var(--trust-green); font-weight: 600; }
.promo-section { padding-top: 48px; }
.promo-card {
  padding: 36px 32px; border-radius: var(--radius-lg);
  border: 2px solid rgba(201, 168, 76, 0.35);
  background: linear-gradient(135deg, rgba(201, 168, 76, 0.06), rgba(0, 245, 160, 0.04));
  text-align: center;
}
.promo-card h2 { font-size: 1.6rem; color: var(--gold); margin-bottom: 8px; }
.promo-perks {
  display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 12px; margin-top: 24px; text-align: left;
}
.promo-perk {
  display: flex; align-items: center; gap: 10px;
  padding: 12px 16px; border-radius: var(--radius);
  background: rgba(0, 0, 0, 0.2); border: 1px solid var(--stone-800);
  font-size: 0.9rem; color: var(--stone-200);
}
.promo-icon { font-size: 1.4rem; flex: 0 0 auto; }
.faq-section { padding-top: 48px; max-width: 700px; margin: 0 auto; }
.faq-list { display: flex; flex-direction: column; gap: 8px; margin-top: 24px; }
.faq-item {
  padding: 16px 18px; border: 1px solid var(--stone-800); border-radius: var(--radius);
  background: var(--stone-900);
}
.faq-item summary { cursor: pointer; font-weight: 600; color: var(--stone-100); font-size: 0.95rem; }
.faq-item p { margin-top: 10px; font-size: 0.88rem; color: var(--stone-300); line-height: 1.6; }
.pay-links-section { padding-top: 48px; max-width: 900px; margin: 0 auto; }
.pay-links-lede { max-width: 560px; margin: 0 auto 20px; font-size: 0.95rem; }
</style>
