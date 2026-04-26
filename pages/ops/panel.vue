<template>
  <div class="panel">
    <div class="container">
      <header class="panel-head">
        <div>
          <p class="eyebrow">Owner toolkit</p>
          <h1>Operator console</h1>
          <p class="text-muted">
            Quick links, honest appraisal research, and copy-paste runbooks. Nothing here runs hidden code against visitors:
            this page is only for you after you unlock from the home page.
          </p>
        </div>
        <button type="button" class="btn btn-outline btn-sm" @click="signOut">Sign out</button>
      </header>

      <div class="grid">
        <section class="card">
          <h2>Site shortcuts</h2>
          <ul class="link-list">
            <li><NuxtLink to="/">Homepage</NuxtLink></li>
            <li><NuxtLink to="/dashboard">Dashboard</NuxtLink></li>
            <li><NuxtLink to="/sell">Sell</NuxtLink></li>
            <li><NuxtLink to="/browse">Browse</NuxtLink></li>
            <li><NuxtLink to="/pay">Pay and fees</NuxtLink></li>
            <li><NuxtLink to="/video">Video (Jitsi)</NuxtLink></li>
            <li><NuxtLink to="/support">Support</NuxtLink></li>
            <li><NuxtLink to="/compare">Compare to eBay / Amazon</NuxtLink></li>
            <li><NuxtLink to="/contact">Contact</NuxtLink></li>
          </ul>
        </section>

        <section class="card">
          <h2>Market research (not a legal appraisal)</h2>
          <p class="small text-muted">
            Real certified appraisals come from licensed professionals. Use these as <strong>starting research</strong> for comps and education only.
          </p>
          <ul class="link-list external">
            <li><a href="https://www.ebay.com/sch/i.html?_from=R40&_nkw=&_sacat=0&LH_Sold=1&LH_Complete=1" target="_blank" rel="noopener noreferrer">eBay — sold listings (add your keyword in eBay search)</a></li>
            <li><a href="https://www.psacard.com/" target="_blank" rel="noopener noreferrer">PSA — trading cards grading / pop reports</a></li>
            <li><a href="https://www.pcgs.com/" target="_blank" rel="noopener noreferrer">PCGS — coins</a></li>
            <li><a href="https://www.tcgplayer.com/" target="_blank" rel="noopener noreferrer">TCGplayer — sealed / singles pricing</a></li>
            <li><a href="https://www.discogs.com/" target="_blank" rel="noopener noreferrer">Discogs — music / vinyl</a></li>
            <li><a href="https://stockx.com/" target="_blank" rel="noopener noreferrer">StockX — sneakers / streetwear comps</a></li>
            <li><a href="https://reverb.com/price-guide" target="_blank" rel="noopener noreferrer">Reverb — instrument price guide</a></li>
            <li><a href="https://www.chrono24.com/" target="_blank" rel="noopener noreferrer">Chrono24 — watch listings</a></li>
            <li><a href="https://www.goat.com/" target="_blank" rel="noopener noreferrer">GOAT — sneaker marketplace</a></li>
            <li><a href="https://www.worthpoint.com/" target="_blank" rel="noopener noreferrer">WorthPoint — sold archive (often paid)</a></li>
            <li><a href="https://ha.com/" target="_blank" rel="noopener noreferrer">Heritage Auctions — realized prices</a></li>
          </ul>
        </section>

        <section class="card wide">
          <h2>Email a professional appraiser (template)</h2>
          <p class="small text-muted">
            Fill in the basics, then copy. Send from your own mailbox to a licensed appraiser or auction house — this site does not send email for you.
          </p>
          <div class="form-grid">
            <label class="label">Category</label>
            <select v-model="appr.category" class="input">
              <option value="Trading cards / sealed">Trading cards / sealed</option>
              <option value="Coins / currency">Coins / currency</option>
              <option value="Sneakers / streetwear">Sneakers / streetwear</option>
              <option value="Watches">Watches</option>
              <option value="Musical instruments">Musical instruments</option>
              <option value="Art / antiques">Art / antiques</option>
              <option value="Other">Other</option>
            </select>
            <label class="label">Short description</label>
            <input v-model="appr.title" class="input" type="text" placeholder="e.g. 1986 Fleer Jordan PSA 8" />
            <label class="label">Condition / notes</label>
            <textarea v-model="appr.condition" class="input area" rows="3" placeholder="Wear, repairs, provenance you know" />
            <label class="label">What you need</label>
            <input v-model="appr.need" class="input" type="text" placeholder="e.g. insurance replacement value letter" />
          </div>
          <button type="button" class="btn btn-primary btn-sm mt-1" @click="copyAppraisalDraft">Copy draft to clipboard</button>
        </section>

        <section class="card">
          <h2>Clipboard snippets</h2>
          <p class="small text-muted">Polite, neutral copy for common marketplace messages.</p>
          <ul class="btn-list">
            <li><button type="button" class="btn btn-outline btn-sm" @click="copy(snips.ship)">Shipping update request</button></li>
            <li><button type="button" class="btn btn-outline btn-sm" @click="copy(snips.coa)">COA / proof reminder</button></li>
            <li><button type="button" class="btn btn-outline btn-sm" @click="copy(snips.dispute)">Dispute — ask for photos</button></li>
            <li><button type="button" class="btn btn-outline btn-sm" @click="copy(snips.thanks)">Short thank-you</button></li>
          </ul>
          <p v-if="copied" class="copied" role="status">Copied.</p>
        </section>

        <section class="card">
          <h2>Deploy and repo</h2>
          <ul class="link-list external">
            <li><a href="https://github.com/cwfranks77/the-franks-standard" target="_blank" rel="noopener noreferrer">GitHub repository</a></li>
            <li><a href="https://github.com/cwfranks77/the-franks-standard/actions" target="_blank" rel="noopener noreferrer">GitHub Actions</a></li>
            <li><a href="https://dashboard.stripe.com/" target="_blank" rel="noopener noreferrer">Stripe Dashboard</a></li>
          </ul>
          <p class="small text-muted mt-1">
            Local publish: <code>npm run verify</code> then <code>npm run deploy:gh-pages</code> from the site folder. Pages source should be <strong>GitHub Actions</strong> in repo Settings → Pages.
          </p>
        </section>

        <section class="card">
          <h2>Perks checklist (staged)</h2>
          <p class="small text-muted">Until Supabase / Stripe links are fully wired, track these manually.</p>
          <ul class="checklist">
            <li>Featured listing queue</li>
            <li>COA review fast-track</li>
            <li>Early seller fee tier in Stripe metadata</li>
            <li>Priority dispute review inbox</li>
          </ul>
        </section>

        <section class="card">
          <h2>Integrity</h2>
          <ul class="checklist">
            <li>Namecheap / Cloudflare email in <code>EMAIL_INFO_FORWARDING.txt</code></li>
            <li>Rotate <code>NUXT_PUBLIC_OPS_ACCESS_KEY</code> if anyone else saw the phrase</li>
            <li>Never store buyer payment data outside Stripe</li>
          </ul>
        </section>
      </div>
    </div>
  </div>
</template>

<script setup>
definePageMeta({ layout: 'default', middleware: 'ops-auth' })

const router = useRouter()
const { revoke } = useOpsSession()

const copied = ref(false)
let copiedTimer = null

const appr = reactive({
  category: 'Trading cards / sealed',
  title: '',
  condition: '',
  need: 'Written fair-market opinion for insurance',
})

const snips = {
  ship: 'Hello — checking in for a tracking number or carrier ETA for my order when you have a moment. Thank you.',
  coa: 'Hello — could you upload or send photos of the COA / proof of authenticity referenced in the listing? I would like to review before we finalize. Thank you.',
  dispute: 'Hello — the item does not match the listing in the following way: (describe). I attached photos. Can we align on a return or partial adjustment? Thank you.',
  thanks: 'Thank you for the fast communication and careful packing. I appreciate it.',
}

useSeoMeta({
  title: 'Operator toolkit — The Franks Standard',
  robots: 'noindex, nofollow',
})

function signOut () {
  revoke()
  router.push('/')
}

async function copy (text) {
  if (!import.meta.client) { return }
  try {
    await navigator.clipboard.writeText(text)
    flashCopied()
  } catch {
    flashCopied()
  }
}

function copyAppraisalDraft () {
  const body = [
    'Subject: Appraisal / valuation request — The Franks Standard marketplace',
    '',
    `Category: ${appr.category}`,
    `Item: ${appr.title || '(please describe)'}`,
    `Condition / notes: ${appr.condition || '(details)'}`,
    `Requested deliverable: ${appr.need}`,
    '',
    'I understand a formal appraisal may require inspection and may incur a fee. Please advise next steps.',
    '',
    'Thank you,',
    '(your name)',
  ].join('\n')
  copy(body)
}

function flashCopied () {
  copied.value = true
  if (copiedTimer) { clearTimeout(copiedTimer) }
  copiedTimer = setTimeout(() => { copied.value = false }, 2000)
}
</script>

<style scoped>
.panel { padding: 48px 16px 80px; }
.panel-head {
  display: flex; flex-wrap: wrap; align-items: flex-start; justify-content: space-between;
  gap: 16px; margin-bottom: 28px;
}
.eyebrow {
  font-size: 0.72rem; font-weight: 800; letter-spacing: 0.14em; text-transform: uppercase;
  color: var(--gold); margin: 0 0 8px;
}
.panel-head h1 { font-size: 1.65rem; margin: 0 0 10px; }
.grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 18px;
}
.card {
  padding: 20px 18px;
  border: 1px solid var(--stone-800);
  border-radius: var(--radius-lg, 12px);
  background: rgba(0, 0, 0, 0.2);
}
.card.wide { grid-column: 1 / -1; }
.card h2 { font-size: 1.05rem; color: var(--gold); margin: 0 0 12px; }
.link-list { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 8px; }
.link-list a, .link-list :deep(a) { color: var(--stone-200); font-size: 0.92rem; }
.link-list a:hover, .link-list :deep(a:hover) { color: var(--gold); }
.link-list.external a { word-break: break-word; }
.btn-list { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 8px; align-items: flex-start; }
.checklist { margin: 0; padding-left: 1.1rem; color: var(--stone-300); font-size: 0.9rem; line-height: 1.5; }
.checklist li { margin-bottom: 6px; }
.small { font-size: 0.85rem; line-height: 1.45; }
.mt-1 { margin-top: 10px; }
.form-grid { display: grid; gap: 10px; max-width: 560px; }
.label { font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.08em; color: var(--stone-500); }
.area { min-height: 72px; resize: vertical; }
.copied { font-size: 0.85rem; color: var(--trust-green, #2ecc71); margin-top: 10px; }
@media (max-width: 800px) {
  .grid { grid-template-columns: 1fr; }
  .card.wide { grid-column: auto; }
}
</style>
