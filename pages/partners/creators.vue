<template>
  <div class="creators-page">
    <div class="container" style="max-width: 40rem; padding: 48px 16px 64px;">
      <p class="eyebrow"><NuxtLink to="/partners">Partners</NuxtLink> · Creators</p>
      <h1>Creator &amp; affiliate program</h1>
      <p class="lead text-muted">
        For YouTube, TikTok, Instagram, and Whatnot-style hosts in <strong>collectibles</strong> — not generic lifestyle influencers.
      </p>

      <section class="block">
        <h2>What you promote</h2>
        <ul>
          <li>Proof-first marketplace — COA or signed guarantee on every listing</li>
          <li>4–5% seller fees vs typical ~13% stacked elsewhere</li>
          <li>eBay import, AI store builder, video inspect, Stripe escrow</li>
        </ul>
      </section>

      <section class="block">
        <h2>Your tracking link</h2>
        <p>Once approved, you receive:</p>
        <pre class="link-example">https://thefranksstandard.com/r/your-handle</pre>
        <p class="text-muted small">Optional promo <code>CREATOR</code> in bio — signups attributed to your handle for payouts.</p>
      </section>

      <section class="block">
        <h2>Example earnings (launch phase)</h2>
        <ul>
          <li><strong>Nano:</strong> 1 month Pro per 3 referred sellers who publish a listing</li>
          <li><strong>Micro:</strong> flat fee per post + bonus per seller signup (negotiated)</li>
          <li><strong>Co-marketing:</strong> we feature your break or shop on Learn + social</li>
        </ul>
      </section>

      <section class="block disclosure">
        <h2>Disclosure template</h2>
        <p>Copy into captions and descriptions:</p>
        <blockquote>{{ ftcLine }}</blockquote>
      </section>

      <section class="block">
        <h2>Content ideas</h2>
        <ul>
          <li>“I imported my eBay store in 20 minutes” — link <NuxtLink to="/learn/import-ebay-to-franks-standard">import guide</NuxtLink></li>
          <li>Fee calculator reaction — <NuxtLink to="/learn/tools/fee-calculator">free tool</NuxtLink></li>
          <li>Live video inspect + escrow checkout demo</li>
        </ul>
      </section>

      <div class="cta-row">
        <a
          :href="applyMailto"
          class="btn btn-primary btn-lg"
        >Apply as a creator</a>
        <NuxtLink to="/learn" class="btn btn-outline btn-lg">Media kit articles</NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup>
import { AFFILIATE_FTC_DISCLOSURE } from '~/utils/affiliateProgram.js'

const ftcLine = AFFILIATE_FTC_DISCLOSURE
const applyMailto = 'mailto:info@thefranksstandard.com?subject=Creator%20affiliate%20application&body=Handle%20(%40name)%3A%0APlatform%3A%0AFollower%20count%3A%0ANiche%20(cards%2Fcoins%2Fetc)%3A%0ASample%20content%20URL%3A'

useSeoMeta({
  title: 'Creator affiliate program | The Franks Standard',
  description: 'Apply for tracked affiliate links and co-marketing as a collectibles nano or micro influencer.',
})
</script>

<style scoped>
.eyebrow a { color: #146eb4; font-weight: 700; }
h1 { font-family: 'Cinzel', Georgia, serif; font-weight: 800; margin-bottom: 12px; }
.lead { line-height: 1.6; font-weight: 600; }
.block { margin: 28px 0; }
.block h2 { font-size: 1.1rem; font-weight: 800; color: #92400e; margin-bottom: 10px; }
.block ul { padding-left: 1.2rem; line-height: 1.6; font-weight: 600; color: #374151; }
.link-example {
  padding: 12px;
  background: #0f172a;
  color: #fde047;
  border-radius: 8px;
  font-size: 0.88rem;
  overflow-x: auto;
}
blockquote {
  margin: 12px 0 0;
  padding: 14px;
  border-left: 4px solid #f7ca00;
  background: #f8f9fb;
  font-weight: 600;
  line-height: 1.55;
}
.cta-row { display: flex; flex-wrap: wrap; gap: 12px; margin-top: 32px; }
</style>
