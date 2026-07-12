<template>
  <div class="ads-page">
    <div class="container">
      <p class="eyebrow">Owner toolkit</p>
      <h1>Social Media Ads — The Franks Standard</h1>
      <p class="text-muted lead">
        Rebrand X/Facebook/Instagram from ZFuel to <strong>The Franks Standard</strong>. Use <code>public/franks-pavilion.png</code> as profile and ad image.
        Run <code>npm run x:rebrand</code> for X profile API update — see <code>docs/X-PROFILE-REBRAND.md</code>.
      </p>

      <section class="rebrand-card automation-card">
        <h2>Bot automation (you set up accounts — bots run ads)</h2>
        <p class="text-muted small">
          Organic posts run <strong>Mon/Wed/Fri</strong> via GitHub Actions when secrets are set.
          Paid Meta creates <strong>PAUSED</strong> campaigns until you enable spend.
        </p>
        <ol>
          <li>Add GitHub secrets — see <code>docs/ADS-AUTOMATION-SETUP.md</code></li>
          <li>Actions → <strong>Post Franks Social Ads</strong> → campaign <strong>security</strong></li>
          <li>Actions → <strong>Run ads (organic + optional Meta paid)</strong> — dry-run first</li>
          <li>Local: <code>npm run post:social:security</code> · <code>npm run ads:meta:dry</code></li>
          <li>Reddit/Google paid: <code>npm run ads:run</code> exports copy → <code>assets/paid-ads-export/</code></li>
        </ol>
        <p class="text-muted small">
          <NuxtLink to="/social/community">Reddit organic playbook</NuxtLink> ·
          <NuxtLink to="/ops/marketing">Marketing panel</NuxtLink>
        </p>
      </section>

      <section class="rebrand-card">
        <h2>X profile checklist</h2>
        <ol>
          <li>Run <code>npm run x:rebrand</code> (name, bio, URL, photo)</li>
          <li>In X Settings → change <strong>@zfuel</strong> → <strong>@thefranksstandard</strong> if available</li>
          <li>Post one fresh tweet: copy <strong>X</strong> ad below</li>
        </ol>
      </section>

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
          <figure v-if="ad.imageSrc" class="ad-preview">
            <img
              :src="ad.imageSrc"
              :alt="`${ad.platform} creative preview`"
              class="ad-preview__img"
              loading="lazy"
              decoding="async"
            >
            <figcaption class="ad-preview__caption text-muted small">{{ ad.image }}</figcaption>
          </figure>
          <p v-else-if="ad.image" class="ad-preview__note text-muted small"><strong>Image:</strong> {{ ad.image }}</p>
          <div class="ad-body">
            <pre class="ad-text">{{ ad.text }}</pre>
          </div>
          <div class="ad-notes">
            <p v-if="ad.imageSrc" class="text-muted small"><strong>Creative file:</strong> {{ ad.image }}</p>
            <p v-else class="text-muted small"><strong>Image:</strong> {{ ad.image }}</p>
            <p class="text-muted small"><strong>Tip:</strong> {{ ad.tip }}</p>
          </div>
        </section>
      </div>
    </div>
  </div>
</template>

<script setup>
import { FRANKS_AD_LOGO } from '~/utils/socialAdImages.js'

definePageMeta({ layout: 'default', middleware: 'ops-auth' })
useSeoMeta({ title: 'Social Ads — The Franks Standard', robots: 'noindex, nofollow' })

const SITE = 'https://thefranksstandard.com'

const ads = reactive([
  {
    platform: 'X (Twitter) — profile + pin tweet',
    icon: '𝕏',
    format: 'Profile: 400×400 · Header: 1500×500 · Tweet image: 1200×675',
    image: 'public/franks-pavilion.png (profile photo) + same for tweet attachment',
    imageSrc: FRANKS_AD_LOGO,
    tip: 'Change @handle manually in X settings. Do NOT use old ZFuel name or logo.',
    copied: false,
    text: `DISPLAY NAME: The Franks Standard
@handle: thefranksstandard (change from @zfuel in settings)
BIO: Proof-first collectibles. COA/guarantee · escrow · 4–5% fees · AI store + dropship · eBay import → ${SITE}

PIN TWEET:
The Franks Standard is live — not another flea market.

✓ COA or signed guarantee on EVERY listing
✓ Stripe escrow (buyer confirms delivery)
✓ 4–5% sale fees by plan vs ~13%+ elsewhere
✓ AI Store Builder + full AI dropship setup
✓ Import eBay listings (Seller Hub CSV)
✓ Auctions · Buy It Now · video rooms · seller reviews

Sell free: ${SITE}/sell
Browse: ${SITE}/browse
Founders (10 spots): ${SITE}/join/founders10 code FOUNDERS10

#TheFranksStandard #Collectibles #COA #Dropship`,
  },
  {
    platform: 'Facebook (Feed)',
    icon: '📘',
    format: 'Landscape 1200×628 or Square 1080×1080',
    image: 'franks-pavilion.png on dark background + headline: THE FRANKS STANDARD',
    imageSrc: FRANKS_AD_LOGO,
    tip: 'Update Facebook Page name and profile photo to match (Meta Business Suite → Page settings).',
    copied: false,
    text: `Stop selling authentic collectibles on platforms that treat fakes like a minor inconvenience.

The Franks Standard is the proof-first marketplace:

🔒 No COA or signed guarantee = no listing
❌ Counterfeits = permanent ban (not 3 strikes)
💰 4–5% sale fees by plan · 3% launch for new sellers
🏪 AI Store Builder — bios, SEO, listing templates in minutes
📦 Full AI dropship setup — pick your supplier, optional auto-dispatch
📥 Import from eBay (Seller Hub CSV) — migrate listings fast
🔨 Auctions + Buy It Now + video rooms for live inspections
⭐ Seller reviews & top-seller program
📞 (877) 837-0527 · Founder Charles Franks — Open Door policy

🎁 FOUNDERS10 — first 10 sellers get 3 months Pro free
🎖️ HONOR26 — veterans & first responders: 6 months Pro

👉 ${SITE}/sell
${SITE}`,
  },
  {
    platform: 'Instagram (Feed + Stories)',
    icon: '📸',
    format: 'Square 1080×1080 (feed) · Vertical 1080×1920 (stories)',
    image: 'franks-pavilion.png · gold “AUTHENTICITY GUARANTEED” text overlay',
    imageSrc: FRANKS_AD_LOGO,
    tip: 'Update @handle and bio link to thefranksstandard.com. Link in bio → /sell',
    copied: false,
    text: `THE FRANKS STANDARD 🏛️
If it's listed here, it's real.

What's new on the floor:
✅ COA or signed guarantee required
✅ Escrow checkout
✅ AI Store Builder
✅ AI dropship setup wizard
✅ eBay CSV import for sellers switching platforms
✅ Auctions · video rooms · seller reviews

Fees: 4–5% by plan (not 13%+)
Founder-led · zero tolerance for fakes

🎁 FOUNDERS10 · 🎖️ HONOR26

Link in bio → ${SITE}

#TheFranksStandard #COARequired #SportsCards #Collectibles #Dropship #AuthenticOnly #Marketplace`,
  },
  {
    platform: 'TikTok / Reels (30 sec script)',
    icon: '🎬',
    format: 'Vertical 9:16 · on-screen text + voiceover',
    image: 'Screen record: browse → sell → COA upload → escrow checkout',
    tip: 'Film founder story: “I built this because buyers shouldn’t guess if it’s real.”',
    copied: false,
    text: `[Hook] Tired of “is this real?” comments on every listing?

[Cut] The Franks Standard — every item needs proof before it goes live.

[Points — on screen]
• COA or signed guarantee
• Escrow until buyer confirms
• Half the fees of big marketplaces
• AI builds your store
• Import from eBay CSV
• Dropship with YOUR supplier

[CTA] Link in bio — sell free at thefranksstandard.com

Hashtags: #collectibles #sportscards #reseller #marketplace #authentication`,
  },
  {
    platform: 'Telegram (collector groups)',
    icon: '✈️',
    format: 'Square 1080×1080 + caption',
    image: 'franks-pavilion.png',
    imageSrc: FRANKS_AD_LOGO,
    tip: 'Post in card/crypto/collectible channels — direct tone, no spam.',
    copied: false,
    text: `🏛️ THE FRANKS STANDARD — proof-first marketplace (rebrand live)

For sellers leaving eBay or tired of fakes:
• COA / signed guarantee required
• Escrow · 4–5% fees by plan
• AI store + AI dropship setup
• eBay CSV import
• Auctions · video rooms

Sell: ${SITE}/sell
Founders: FOUNDERS10 (3 mo Pro, 10 spots)
Honor: HONOR26 (military/first responders)

${SITE}`,
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
.lead { font-size: 1rem; margin-bottom: 24px; max-width: 720px; }
.rebrand-card {
  padding: 20px; margin-bottom: 28px; border-radius: var(--radius-lg);
  border: 1px solid rgba(247, 202, 0, 0.4); background: rgba(247, 202, 0, 0.08);
}
.rebrand-card h2 { color: var(--gold); font-size: 1.1rem; margin-bottom: 12px; }
.rebrand-card ol { line-height: 1.7; padding-left: 1.2rem; }
.ads-list { display: flex; flex-direction: column; gap: 24px; }
.ad-card {
  padding: 24px; border: 1px solid var(--stone-800); border-radius: var(--radius-lg);
  background: rgba(255, 255, 255, 0.03);
}
.ad-header { display: flex; align-items: center; gap: 14px; margin-bottom: 16px; flex-wrap: wrap; }
.ad-platform-icon { font-size: 2rem; flex: 0 0 auto; }
.ad-header h2 { font-size: 1.15rem; margin: 0; }
.ad-format { font-size: 0.8rem; margin: 2px 0 0; }
.ad-header .btn { margin-left: auto; }
.ad-body { margin-bottom: 14px; }
.ad-text {
  white-space: pre-wrap; font-family: inherit; font-size: 0.88rem;
  line-height: 1.6; color: var(--stone-200); padding: 16px;
  background: rgba(0, 0, 0, 0.3); border-radius: var(--radius);
  border: 1px solid rgba(255, 255, 255, 0.06); max-height: 420px; overflow-y: auto;
}
.ad-notes { display: flex; flex-direction: column; gap: 4px; }
.ad-preview {
  margin: 0 0 16px;
  padding: 14px;
  border-radius: var(--radius);
  border: 1px solid rgba(247, 202, 0, 0.25);
  background: rgba(0, 0, 0, 0.35);
  text-align: center;
}
.ad-preview__img {
  display: block;
  max-width: min(100%, 420px);
  max-height: 280px;
  margin: 0 auto;
  object-fit: contain;
  border-radius: 8px;
}
.ad-preview__caption { margin: 10px 0 0; line-height: 1.45; }
.ad-preview__note { margin: 0 0 14px; }
.small { font-size: 0.82rem; }
</style>
