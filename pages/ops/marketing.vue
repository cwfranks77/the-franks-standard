<template>
  <div class="mkt-page">
    <div class="container">
      <p class="eyebrow">Owner toolkit</p>
      <h1>Marketing &amp; get found</h1>
      <p class="text-muted lead">
        Why you are not on Google yet, what to do today, email outreach, paid ads beyond social, and automated postcards/letters.
      </p>

      <section class="mkt-card mkt-alert">
        <h2>Why search engines do not show you yet</h2>
        <ul class="mkt-list">
          <li><strong>Sitemap alone is not enough.</strong> You must verify the site in Google Search Console and Bing Webmaster Tools and request indexing.</li>
          <li><strong>New domain = low trust.</strong> Rankings take weeks; brand name appears before generic keywords.</li>
          <li><strong>Need content + links.</strong> More real listings, backlinks (Facebook page, partners, press), and consistent outreach beat waiting.</li>
        </ul>
        <p class="text-muted small">Full playbook: <code>docs/GET-FOUND-AND-GROW.md</code> in the repo.</p>
      </section>

      <section class="mkt-card">
        <h2>Search engines — do today (30 min)</h2>
        <ol class="mkt-steps">
          <li>
            <a href="https://search.google.com/search-console" target="_blank" rel="noopener noreferrer">Google Search Console</a>
            — add <code>https://thefranksstandard.com</code>, verify, submit sitemap
            <code>https://thefranksstandard.com/sitemap.xml</code>, then URL Inspection → Request indexing for /, /browse, /sell, /sellers.
          </li>
          <li>
            <a href="https://www.bing.com/webmasters" target="_blank" rel="noopener noreferrer">Bing Webmaster Tools</a>
            — import from Google or add site, submit same sitemap.
          </li>
          <li>From repo: <code>npm run seo:ping</code> (pings Bing; optional IndexNow if <code>INDEXNOW_KEY</code> is set).</li>
          <li>Publish 3+ listings with unique titles and photos — Google ranks pages with real content.</li>
        </ol>
      </section>

      <section class="mkt-card mkt-alert">
        <h2>Email permission — required (not optional)</h2>
        <p class="text-muted">You <strong>cannot</strong> blast random emails for advertising. U.S. CAN-SPAM rules (and good practice) require:</p>
        <ul class="mkt-list">
          <li><strong>Permission:</strong> They opted in on your site, replied asking for info, or you have an existing business relationship (e.g. shop you already work with).</li>
          <li><strong>Honest subject line</strong> — no deceptive “Re:” or fake invoices.</li>
          <li><strong>Physical address</strong> in the email (use your LLC mailing address).</li>
          <li><strong>Unsubscribe:</strong> templates include “Reply STOP” — honor it immediately.</li>
        </ul>
        <p class="text-muted small"><strong>Safe list:</strong> card shops you visited, chamber members who agreed, waitlist signups from thefranksstandard.com — not scraped lists from the internet.</p>
      </section>

      <section class="mkt-card mkt-alert">
        <h2>API secrets — you must add these (not in chat)</h2>
        <p class="text-muted">Email and postcard scripts need <strong>your</strong> keys in a local <code>.env</code> file. Never paste API keys into Cursor or git.</p>
        <ol class="mkt-steps">
          <li>Copy <code>.env.example</code> → <code>.env</code> on your PC.</li>
          <li>Add <code>SENDGRID_API_KEY</code> (starts with <code>SG.</code>) from <a href="https://app.sendgrid.com/settings/api_keys" target="_blank" rel="noopener noreferrer">SendGrid</a>.</li>
          <li>Add <code>LOB_API_KEY</code> (<code>test_...</code> free) from <a href="https://dashboard.lob.com/settings/api" target="_blank" rel="noopener noreferrer">Lob</a>.</li>
          <li>Run in repo: <code>npm run secrets:check</code> — shows what is missing without showing values.</li>
        </ol>
        <p class="text-muted small">Full guide: <code>docs/API-SECRETS-SETUP.md</code></p>
      </section>

      <section class="mkt-card">
        <h2>Email marketing (automated)</h2>
        <p class="text-muted">SendGrid free tier (~100 emails/day). Templates in <code>assets/email-campaign/</code>. Always <code>--dry-run</code> first.</p>
        <pre class="mkt-code">npm run email:campaign -- --template seller-outreach --to shop@example.com --name "Joe's Cards"
npm run email:campaign -- --template seller-outreach --list ./recipients.csv --dry-run</pre>
        <p class="text-muted small">Set <code>SENDGRID_API_KEY</code>, <code>SENDGRID_FROM_EMAIL</code> in <code>.env</code>. Sign up: <a href="https://app.sendgrid.com/" target="_blank" rel="noopener noreferrer">SendGrid</a>.</p>
        <div v-for="tpl in emailTemplates" :key="tpl.id" class="mkt-template">
          <div class="mkt-template-head">
            <strong>{{ tpl.name }}</strong>
            <button type="button" class="btn btn-outline btn-sm" @click="copyText(tpl.preview)">{{ tpl.copied ? 'Copied' : 'Copy preview' }}</button>
          </div>
          <pre class="mkt-text">{{ tpl.preview }}</pre>
        </div>
      </section>

      <section class="mkt-card">
        <h2>Paid ads (not social)</h2>
        <div v-for="ad in paidAds" :key="ad.platform" class="mkt-ad">
          <div class="mkt-ad-head">
            <span>{{ ad.icon }}</span>
            <div>
              <h3>{{ ad.platform }}</h3>
              <p class="text-muted small">{{ ad.budget }}</p>
            </div>
            <a v-if="ad.url" :href="ad.url" target="_blank" rel="noopener noreferrer" class="btn btn-outline btn-sm">Open</a>
            <button type="button" class="btn btn-primary btn-sm" @click="copyText(ad.copy)">{{ ad.copied ? 'Copied' : 'Copy ad' }}</button>
          </div>
          <pre class="mkt-text">{{ ad.copy }}</pre>
        </div>
      </section>

      <section class="mkt-card">
        <h2>Automated flyers to mailboxes</h2>
        <p class="text-muted">
          <strong>Real mail is never fully free</strong> — postage and printing always cost money (~$0.55–$1.25+ per postcard).
          You <em>can</em> set up automation at no cost in <strong>test mode</strong>, then pay only when you send live mail.
        </p>
        <ol class="mkt-steps">
          <li>Free Lob account: <a href="https://dashboard.lob.com/register" target="_blank" rel="noopener noreferrer">lob.com/register</a> → copy <strong>test</strong> API key (<code>test_...</code>).</li>
          <li>Upload a 4×6 postcard front in Lob → copy asset URL → <code>LOB_POSTCARD_FRONT_URL</code> in <code>.env</code>.</li>
          <li>Test (no charge, no real mail): <code>npm run mail:lob-sample -- ... --dry-run</code></li>
          <li>Live mail: switch to <code>live_...</code> key and fund Lob wallet (~$20 minimum).</li>
        </ol>
        <p class="text-muted"><strong>Cheapest real outreach:</strong> print 50 flyers at home/office, hand-deliver to local card shops — $0 postage. <strong>ZIP saturation:</strong> USPS Every Door Direct Mail (EDDM) — pays USPS per route, no names needed.</p>
        <pre class="mkt-code">npm run mail:lob-sample -- --to "Shop Name" --address-line1 "100 Main St" --city "Lake Charles" --state LA --zip 70601 --dry-run</pre>
        <p class="text-muted small"><code>LOB_API_KEY=test_...</code> for free API testing. Postcard text: <code>assets/email-campaign/postcard-copy.txt</code>.</p>
        <button type="button" class="btn btn-outline btn-sm" @click="copyText(postcardCopy)">Copy postcard back text</button>
      </section>

      <section class="mkt-card">
        <h2>Physical letter (print or Lob letter)</h2>
        <button type="button" class="btn btn-primary btn-sm mb-2" @click="copyText(shopLetter)">{{ letterCopied ? 'Copied' : 'Copy shop letter' }}</button>
        <pre class="mkt-text">{{ shopLetter }}</pre>
      </section>

      <p class="text-muted small text-center">
        <NuxtLink to="/ops/panel">← Operator console</NuxtLink>
        · <NuxtLink to="/ops/ads">Social ads</NuxtLink>
      </p>
    </div>
  </div>
</template>

<script setup>
definePageMeta({ layout: 'default', middleware: 'ops-auth' })
useSeoMeta({ title: 'Marketing — The Franks Standard', robots: 'noindex, nofollow' })

const postcardCopy = `THE FRANKS STANDARD
Authenticated collectibles & gear — proof before publish.

• COA or signed guarantee on every listing
• 5% seller fees · escrow · video inspect
• List free: thefranksstandard.com/sell

Charles Franks · (877) 837-0527
thefranksstandard.com`

const shopLetter = `Charles Franks
The Franks Standard LLC
Merryville, LA
(877) 837-0527
info@thefranksstandard.com

[Date]

[Shop owner name]
[Store name]
[Address]

Dear [Name],

I built The Franks Standard because collectors and serious sellers deserve a floor where proof comes before profit — not another app where anyone can list anything.

What we offer your shop:
• Required COA or signed in-platform guarantee on every listing
• Seller fees at 5% (3% for new sellers' first 90 days) — not stacked 13%+ fees
• Escrow until the buyer confirms the item
• Built-in video calls so buyers can inspect before they buy
• AI tools to draft listing descriptions and store SEO

You can list your first items free: https://thefranksstandard.com/sell

I would welcome a 10-minute call or visit to show you the seller dashboard. Reply to this letter or call (877) 837-0527.

Respectfully,

Charles Franks
Founder, The Franks Standard LLC
https://thefranksstandard.com`

const letterCopied = ref(false)

const emailTemplates = reactive([
  {
    id: 'seller-outreach',
    name: 'Seller outreach (email)',
    copied: false,
    preview: `Subject: Sell with proof — The Franks Standard

Hi {{name}},

Authenticated marketplace — COA required, 5% fees, escrow, video inspect.
List free: https://thefranksstandard.com/sell
(877) 837-0527`,
  },
])

const paidAds = reactive([
  {
    platform: 'Google Ads (Search)',
    icon: '🔍',
    budget: 'Start $10/day — keywords: authenticated sports cards, sell collectibles online, COA marketplace',
    url: 'https://ads.google.com/',
    copied: false,
    copy: `Headline 1: Authenticated Collectibles Marketplace
Headline 2: COA Required On Every Listing
Headline 3: 5% Seller Fees — List Free

Description: The Franks Standard — proof before publish. Escrow, video calls, zero tolerance for fakes. New sellers: 10 free listings.

Final URL: https://thefranksstandard.com/sell`,
  },
  {
    platform: 'Microsoft Advertising (Bing)',
    icon: '📊',
    budget: 'Start $5/day — import from Google or duplicate copy',
    url: 'https://ads.microsoft.com/',
    copied: false,
    copy: `Title: Sell With Proof — The Franks Standard
Text: COA or signed guarantee required. Lower fees than typical marketplaces. Escrow + video inspect. thefranksstandard.com/sell`,
  },
  {
    platform: 'Reddit Ads',
    icon: '📣',
    budget: 'Start $5/day — target r/sportscards, r/coins, r/Flipping, r/EbaySeller',
    url: 'https://ads.reddit.com/',
    copied: false,
    copy: `Title: Marketplace that requires proof before publish

Body: Built for sellers tired of fakes and fee stacking. COA or signed guarantee on every listing. 5% fees, escrow, video calls. 10 free listings for new sellers.

Link: thefranksstandard.com/auth/register`,
  },
  {
    platform: 'Nextdoor (local)',
    icon: '🏘️',
    budget: 'Start $3/day — zip codes near your shop',
    url: 'https://ads.nextdoor.com/',
    copied: false,
    copy: `Local collectors & sellers: new marketplace in Louisiana — The Franks Standard. Authenticated cards, coins, gear. Every listing needs proof. Free to list. thefranksstandard.com`,
  },
])

async function copyText (text) {
  try {
    await navigator.clipboard.writeText(text)
    for (const t of emailTemplates) {
      if (t.preview === text) t.copied = true
    }
    for (const a of paidAds) {
      if (a.copy === text) a.copied = true
    }
    if (text === shopLetter) letterCopied.value = true
    setTimeout(() => {
      for (const t of emailTemplates) { t.copied = false }
      for (const a of paidAds) { a.copied = false }
      letterCopied.value = false
    }, 2500)
  } catch {}
}
</script>

<style scoped>
.mkt-page { padding: 40px 0 80px; }
.eyebrow { font-size: 0.72rem; letter-spacing: 0.2em; text-transform: uppercase; color: var(--gold); margin-bottom: 8px; }
h1 { font-size: 1.8rem; margin-bottom: 8px; }
.lead { max-width: 720px; margin-bottom: 28px; }
.mkt-card {
  margin-bottom: 24px; padding: 22px 24px;
  border: 1px solid var(--stone-800); border-radius: var(--radius-lg);
  background: rgba(255, 255, 255, 0.03);
}
.mkt-card h2 { font-size: 1.15rem; margin-bottom: 12px; }
.mkt-alert { border-color: rgba(201, 168, 76, 0.35); }
.mkt-list, .mkt-steps { margin: 0; padding-left: 1.2rem; line-height: 1.65; color: var(--stone-200); }
.mkt-steps li { margin-bottom: 10px; }
.mkt-code, .mkt-text {
  white-space: pre-wrap; font-size: 0.82rem; line-height: 1.5;
  padding: 12px; border-radius: 8px; background: rgba(0,0,0,0.35);
  border: 1px solid rgba(255,255,255,0.06); color: var(--stone-200);
}
.mkt-template, .mkt-ad { margin-top: 16px; }
.mkt-template-head, .mkt-ad-head {
  display: flex; flex-wrap: wrap; align-items: center; gap: 10px; margin-bottom: 8px;
}
.mkt-ad-head h3 { margin: 0; font-size: 1rem; flex: 1; }
.mb-2 { margin-bottom: 10px; }
code { font-size: 0.85em; }
</style>
