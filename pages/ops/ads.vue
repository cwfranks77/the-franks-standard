<template>
  <div class="ads-page">
    <div class="container">
      <p class="eyebrow">Owner toolkit</p>
      <h1>Social Media Ads — Ready to Post</h1>
      <p class="text-muted lead">Copy the text below and pair it with the ad images from the artifacts folder. Each ad is tailored for its platform.</p>

      <div class="ads-list">
        <section v-for="ad in ads" :key="ad.platform" class="ad-card">
          <div class="ad-header">
            <span class="ad-platform-icon">{{ ad.icon }}</span>
            <div>
              <h2>{{ ad.platform }}</h2>
              <p class="ad-format text-muted">{{ ad.format }}</p>
            </div>
            <button type="button" class="btn btn-primary btn-sm" @click="copyAd(ad)">{{ ad.copied ? 'Copied!' : 'Copy text' }}</button>
          </div>
          <div class="ad-body">
            <pre class="ad-text">{{ ad.text }}</pre>
          </div>
          <div class="ad-notes">
            <p class="text-muted small"><strong>Image:</strong> {{ ad.image }}</p>
            <p class="text-muted small"><strong>Tip:</strong> {{ ad.tip }}</p>
          </div>
        </section>
      </div>
    </div>
  </div>
</template>

<script setup>
definePageMeta({ layout: 'default', middleware: 'ops-auth' })
useSeoMeta({ title: 'Social Ads — The Franks Standard', robots: 'noindex, nofollow' })

const ads = reactive([
  {
    platform: 'Facebook (Feed)',
    icon: '📘',
    format: 'Landscape 1200x628 or Square 1080x1080',
    image: 'ad_real_accountability_wide.png or ad_zero_tolerance.png',
    tip: 'Facebook rewards engagement. Ask a question in the first line. Use the wide image for feed, square for mobile.',
    copied: false,
    text: `The developer isn't anonymous. The COA isn't optional. The ban for fakes isn't temporary.

The Franks Standard is the marketplace where every collectible needs a Certificate of Authenticity BEFORE it goes live. No COA? No listing. No exceptions.

Here's what makes us different:

🔒 Zero tolerance for counterfeits — permanent ban, not 3 strikes
📜 COA or signed guarantee required on every single listing
💰 5% fees vs typical 13%+ elsewhere — you keep more
🏪 Open your own store — AI builds it for you in minutes
📞 Real customer service: (877) 837-0527
🤝 Open Door Policy — founder Charles Franks reads every feedback email

🎁 NEW SELLER LAUNCH OFFER:
• 10 free listings — no card needed
• 3% transaction fee for 90 days
• Free AI Store Builder
• Referral bonus: invite a seller, both get 1 month Pro free

Buy with proof. Sell with reputation.

👉 thefranksstandard.com

#TheFranksStandard #Collectibles #SportsCards #Authenticated #COA #NoCOANoListing #Marketplace #ZeroToleranceForFakes`,
  },
  {
    platform: 'Instagram (Feed + Stories)',
    icon: '📸',
    format: 'Square 1080x1080 (feed) + Vertical 1080x1920 (stories)',
    image: 'ad_zero_tolerance.png (feed) + ad_proof_before_profit_story.png (story)',
    tip: 'Lead with the strongest visual. Use carousel for multiple images. Stories get swipe-up to thefranksstandard.com.',
    copied: false,
    text: `ZERO. TOLERANCE. FOR. FAKES. 🚫

Every listing on @thefranksstandard requires proof — a real COA or a legally signed guarantee. No exceptions.

Other platforms give strikes and warnings.
We give a permanent ban. First offense. Done.

The developer isn't hiding behind a corporation. Charles Franks built this and put his name on it. Open door policy — reach the founder anytime.

Why sellers are switching:
✅ 5% fees (typical marketplaces charge 13%+)
✅ AI builds your store in minutes
✅ Dropshipping supported
✅ Video calls built into every listing
✅ (877) 837-0527 — real customer service

🎁 10 free listings for new sellers. No card needed.

Link in bio 👆

#TheFranksStandard #AuthenticOnly #COARequired #Collectibles #SportsCards #Numismatics #Watches #Sneakers #VintageGuitars #NoFakes #OpenDoor #MarketplaceRevolution`,
  },
  {
    platform: 'X (Twitter)',
    icon: '🐦',
    format: 'Square 1080x1080 or Wide 1200x675',
    image: 'ad_developer_open_door.png or ad_own_your_store.png',
    tip: 'X rewards bold, short copy. Thread the longer story. Use the image with the first tweet.',
    copied: false,
    text: `The developer isn't anonymous.
The COA isn't optional.
The ban for fakes isn't temporary.

That's The Franks Standard.

Every collectible needs proof before it goes live. No COA = no listing.

Fakes? Permanent ban. Not 3 strikes — one and done.

5% fees vs typical 13%+ elsewhere.
AI builds your store.
Founder picks up the phone.

10 free listings for new sellers 👇
thefranksstandard.com

#AuthenticOnly #COA #Collectibles`,
  },
  {
    platform: 'Telegram',
    icon: '✈️',
    format: 'Square 1080x1080 — share as photo with caption',
    image: 'ad_zero_tolerance.png or ad_real_accountability_wide.png',
    tip: 'Telegram groups love direct, no-BS messaging. Post in collector groups and card trading channels.',
    copied: false,
    text: `🏛️ THE FRANKS STANDARD — Now open for sellers

The marketplace where every item needs PROOF to be listed.

What makes us different:
🔒 No COA = No listing (zero exceptions)
❌ Fakes = Permanent ban (not 3 strikes)
💰 5% fees (typical marketplaces take 13%+)
🏪 AI builds your store in minutes
📞 (877) 837-0527 — real humans
🤝 Founder Charles Franks — reachable anytime (open door policy)

🎁 LAUNCH OFFER:
→ 10 free listings
→ 3% fees for 90 days
→ Referral bonus

Sports cards, coins, watches, guitars, sneakers, art — if it's real and you can prove it, list it.

👉 thefranksstandard.com`,
  },
])

async function copyAd (ad) {
  try {
    await navigator.clipboard.writeText(ad.text)
    ad.copied = true
    setTimeout(() => { ad.copied = false }, 2500)
  } catch {}
}
</script>

<style scoped>
.ads-page { padding: 40px 0 80px; }
.eyebrow { font-size: 0.72rem; letter-spacing: 0.2em; text-transform: uppercase; color: var(--gold); margin-bottom: 8px; }
h1 { font-size: 1.8rem; margin-bottom: 8px; }
.lead { font-size: 1rem; margin-bottom: 32px; max-width: 700px; }
.ads-list { display: flex; flex-direction: column; gap: 24px; }
.ad-card {
  padding: 24px; border: 1px solid var(--stone-800); border-radius: var(--radius-lg);
  background: rgba(255, 255, 255, 0.03);
}
.ad-header { display: flex; align-items: center; gap: 14px; margin-bottom: 16px; }
.ad-platform-icon { font-size: 2rem; flex: 0 0 auto; }
.ad-header h2 { font-size: 1.15rem; margin: 0; }
.ad-format { font-size: 0.8rem; margin: 2px 0 0; }
.ad-header .btn { margin-left: auto; }
.ad-body { margin-bottom: 14px; }
.ad-text {
  white-space: pre-wrap; font-family: inherit; font-size: 0.88rem;
  line-height: 1.6; color: var(--stone-200); padding: 16px;
  background: rgba(0, 0, 0, 0.3); border-radius: var(--radius);
  border: 1px solid rgba(255, 255, 255, 0.06); max-height: 400px; overflow-y: auto;
}
.ad-notes { display: flex; flex-direction: column; gap: 4px; }
.small { font-size: 0.82rem; }
</style>
