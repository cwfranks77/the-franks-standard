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
          <div class="owner-badge-row">
            <span class="owner-badge">Owner mode active</span>
            <span class="owner-badge owner-badge-green">All fees waived</span>
            <span class="owner-badge owner-badge-green">Full seller access</span>
          </div>
        </div>
        <button type="button" class="btn btn-outline btn-sm" @click="signOut">Sign out</button>
      </header>

      <!-- FREE FULL ACCESS — prominent top section -->
      <section class="free-access-banner">
        <div class="free-access-header">
          <span class="free-access-icon">🔓</span>
          <div>
            <h2>Free Full Access — Active</h2>
            <p>You are the site owner. All fees are waived. You can sell, manage, and operate everything for free.</p>
          </div>
        </div>
        <div class="free-access-actions">
          <NuxtLink to="/sell" class="btn btn-primary btn-lg">Sell an Item (Free)</NuxtLink>
          <NuxtLink to="/sell?mode=dropship" class="btn btn-primary btn-lg">Dropship Setup</NuxtLink>
          <NuxtLink to="/ops/dropship" class="btn btn-primary btn-lg">Dropship Automation</NuxtLink>
          <NuxtLink to="/sell?mode=direct" class="btn btn-outline btn-lg">Direct Sale Setup</NuxtLink>
          <NuxtLink to="/store-builder" class="btn btn-outline btn-lg">AI Store Builder</NuxtLink>
          <NuxtLink to="/sellers" class="btn btn-outline btn-lg">Seller Program</NuxtLink>
          <NuxtLink to="/pricing" class="btn btn-outline btn-lg">Pricing</NuxtLink>
          <NuxtLink to="/pay" class="btn btn-outline btn-lg">Pay &amp; Fees</NuxtLink>
          <NuxtLink to="/video" class="btn btn-outline btn-lg">Video Rooms</NuxtLink>
          <NuxtLink to="/support" class="btn btn-outline btn-lg">Support</NuxtLink>
          <NuxtLink to="/dashboard" class="btn btn-outline btn-lg">My Dashboard</NuxtLink>
          <NuxtLink to="/browse" class="btn btn-dark btn-lg">Browse Floor</NuxtLink>
          <NuxtLink to="/ops/status" class="btn btn-dark btn-lg">Transaction readiness</NuxtLink>
        </div>
        <div class="free-access-perks">
          <div class="perk-item"><span class="perk-check">✓</span> Listing fees waived</div>
          <div class="perk-item"><span class="perk-check">✓</span> Pro seller included</div>
          <div class="perk-item"><span class="perk-check">✓</span> Dispute fees waived</div>
          <div class="perk-item"><span class="perk-check">✓</span> No Supabase login needed</div>
          <div class="perk-item"><span class="perk-check">✓</span> Dropship and direct sell</div>
          <div class="perk-item"><span class="perk-check">✓</span> Priority everything</div>
        </div>
        <p class="free-access-note">This access is your backdoor inside the hidden room. Tap the logo 5 times on the homepage to unlock anytime.</p>
      </section>

      <section class="platform-snapshot">
        <div class="platform-snapshot-head">
          <h2>Platform snapshot</h2>
          <NuxtLink to="/ops/status" class="btn btn-primary btn-sm">Full readiness report</NuxtLink>
        </div>
        <TransactionReadinessBanner :show-owner-link="false" />
        <div class="snapshot-stats">
          <div class="snapshot-stat">
            <span class="snapshot-num">{{ published }}</span>
            <span class="snapshot-label">Published listings</span>
          </div>
          <div class="snapshot-stat">
            <span class="snapshot-num">{{ drafts }}</span>
            <span class="snapshot-label">Drafts</span>
          </div>
          <div class="snapshot-stat">
            <span class="snapshot-num">{{ profiles }}</span>
            <span class="snapshot-label">Profiles</span>
          </div>
          <div class="snapshot-stat">
            <span class="snapshot-num">{{ paymentLinkCount }}/4</span>
            <span class="snapshot-label">Stripe links live</span>
          </div>
        </div>
        <p v-if="statsError" class="small text-muted">{{ statsError }}</p>
        <button type="button" class="btn btn-outline btn-sm" :disabled="statsLoading" @click="refreshStats">
          {{ statsLoading ? 'Refreshing…' : 'Refresh snapshot' }}
        </button>
      </section>

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
            <li><NuxtLink to="/compare">How we compare</NuxtLink></li>
            <li><NuxtLink to="/contact">Contact</NuxtLink></li>
            <li><NuxtLink to="/ops/dropship"><strong>Dropship automation</strong></NuxtLink></li>
            <li><NuxtLink to="/ops/ads"><strong>Social Media Ads</strong></NuxtLink></li>
            <li><NuxtLink to="/ops/marketing"><strong>Marketing &amp; get found</strong></NuxtLink></li>
            <li><NuxtLink to="/ops/status"><strong>Transaction readiness</strong></NuxtLink></li>
          </ul>
        </section>

        <section class="card wide coa-monitor-card">
          <div class="coa-monitor-header">
            <h2>COA Enforcement Monitor</h2>
            <button type="button" class="btn btn-primary btn-sm" @click="runCoaScan" :disabled="coaChecking">
              {{ coaChecking ? 'Scanning...' : 'Scan all listings now' }}
            </button>
          </div>
          <p class="small text-muted">Detects any published listing missing a valid COA or unsigned guarantee. You get alerted the minute something slips through.</p>
          <p v-if="coaLastCheck" class="small text-muted" style="margin-top: 6px;">Last scan: {{ coaLastCheck }}</p>

          <div v-if="coaViolations.length === 0 && coaLastCheck" class="coa-all-clear">
            <span class="coa-clear-icon">✅</span>
            <p><strong>All clear.</strong> Every published listing has a valid COA or signed guarantee.</p>
          </div>

          <div v-if="coaViolations.length > 0" class="coa-violations">
            <p class="coa-alert-count">⚠️ {{ coaViolations.length }} listing{{ coaViolations.length === 1 ? '' : 's' }} with COA issues:</p>
            <div v-for="v in coaViolations" :key="v.id" class="coa-violation-row">
              <div class="coa-v-info">
                <p class="coa-v-title">{{ v.title }}</p>
                <p class="coa-v-meta text-muted">{{ v.category }} — {{ new Date(v.createdAt).toLocaleDateString() }}</p>
              </div>
              <div class="coa-v-problems">
                <span v-for="p in v.problems" :key="p" class="coa-v-tag">{{ p }}</span>
              </div>
              <NuxtLink :to="`/listing/${v.id}`" class="btn btn-outline btn-sm">View</NuxtLink>
            </div>
          </div>
        </section>

        <section class="card wide call-monitor-card">
          <h2>📞 Call Monitoring &amp; Recordings</h2>
          <p class="small text-muted">Monitor customer service calls, listen to recordings, and track how clients are responding. All calls through the AI agent are recorded automatically.</p>

          <div class="call-links">
            <a href="https://console.twilio.com/us1/monitor/logs/calls" target="_blank" rel="noopener noreferrer" class="btn btn-outline btn-sm">Call Logs (Twilio)</a>
            <a href="https://console.twilio.com/us1/monitor/logs/recordings" target="_blank" rel="noopener noreferrer" class="btn btn-outline btn-sm">Recordings</a>
            <a href="https://console.twilio.com/us1/develop/studio/flows" target="_blank" rel="noopener noreferrer" class="btn btn-outline btn-sm">AI Agent Flow</a>
            <a href="https://console.twilio.com/us1/monitor/insights/call-summaries" target="_blank" rel="noopener noreferrer" class="btn btn-outline btn-sm">Call Analytics</a>
          </div>

          <details class="call-setup-guide mt-1">
            <summary>Twilio AI Agent Setup Guide (one-time)</summary>
            <div class="setup-content">
              <h4>Step 1: Create Twilio account</h4>
              <ol>
                <li>Go to <a href="https://www.twilio.com/try-twilio" target="_blank">twilio.com/try-twilio</a> and create a free account</li>
                <li>Verify your phone number</li>
                <li>Get your Account SID and Auth Token from the <a href="https://console.twilio.com" target="_blank">console dashboard</a></li>
              </ol>

              <h4>Step 2: Buy a phone number</h4>
              <ol>
                <li>Go to <a href="https://console.twilio.com/us1/develop/phone-numbers/manage/search" target="_blank">Phone Numbers → Buy a Number</a></li>
                <li>Search for a toll-free number (1-800, 1-888, etc.)</li>
                <li>Buy it (~$2/month for toll-free)</li>
                <li>Update <code>NUXT_PUBLIC_CUSTOMER_SERVICE_PHONE</code> with the new number</li>
              </ol>

              <h4>Step 3: Set up Studio Flow (AI Agent)</h4>
              <ol>
                <li>Go to <a href="https://console.twilio.com/us1/develop/studio/flows" target="_blank">Studio → Flows → Create new Flow</a></li>
                <li>Name it "Franks Standard Customer Service"</li>
                <li>Add a <strong>Say/Play</strong> widget: "Thank you for calling The Franks Standard, the authenticity-first marketplace. I'm your AI assistant. How can I help you today?"</li>
                <li>Add a <strong>Gather Input</strong> widget (speech recognition) to capture what the caller says</li>
                <li>Route based on keywords: orders, refunds, COA, selling, fees → play the relevant recorded answer</li>
                <li>Add a <strong>"Talk to a person"</strong> path that dials your cell phone</li>
              </ol>

              <h4>Step 4: Enable call recording</h4>
              <ol>
                <li>In your Studio Flow, on the incoming call trigger, check <strong>"Record calls"</strong></li>
                <li>Or go to <a href="https://console.twilio.com/us1/develop/voice/settings" target="_blank">Voice → Settings</a> and enable recording globally</li>
                <li>Recordings appear in <a href="https://console.twilio.com/us1/monitor/logs/recordings" target="_blank">Monitor → Recordings</a></li>
              </ol>

              <h4>Step 5: Connect number to flow</h4>
              <ol>
                <li>Go to your phone number's config page</li>
                <li>Under "A call comes in" → select <strong>Studio Flow</strong> → "Franks Standard Customer Service"</li>
                <li>Save — your AI agent is now live</li>
              </ol>

              <h4>Step 6: Live monitoring</h4>
              <p>To listen to live calls: Twilio Console → Monitor → Calls → click any active call → "Listen". You can hear the conversation in real time without the caller knowing.</p>
            </div>
          </details>

          <div class="call-features">
            <div class="call-feat"><span>🤖</span> AI answers common questions (fees, COA, orders, returns)</div>
            <div class="call-feat"><span>📱</span> "Talk to a person" patches through to your phone</div>
            <div class="call-feat"><span>🔴</span> Every call recorded automatically</div>
            <div class="call-feat"><span>👁️</span> Monitor live calls from Twilio dashboard</div>
            <div class="call-feat"><span>📊</span> Call analytics and feedback tracking</div>
          </div>
        </section>

        <section class="card">
          <h2>Market research (not a legal appraisal)</h2>
          <p class="small text-muted">
            Real certified appraisals come from licensed professionals. Use these as <strong>starting research</strong> for comps and education only.
          </p>
          <ul class="link-list external">
            <li><a href="https://www.ebay.com/sch/i.html?_from=R40&_nkw=&_sacat=0&LH_Sold=1&LH_Complete=1" target="_blank" rel="noopener noreferrer">Sold listings research (C2C marketplace)</a></li>
            <li><a href="https://www.psacard.com/" target="_blank" rel="noopener noreferrer">PSA — trading cards grading / pop reports</a></li>
            <li><a href="https://www.pcgs.com/" target="_blank" rel="noopener noreferrer">PCGS — coins</a></li>
            <li><a href="https://www.tcgplayer.com/" target="_blank" rel="noopener noreferrer">TCGplayer — sealed / singles pricing</a></li>
            <li><a href="https://www.discogs.com/" target="_blank" rel="noopener noreferrer">Discogs — music / vinyl</a></li>
            <li><a href="https://stockx.com/" target="_blank" rel="noopener noreferrer">Sneakers / streetwear comps</a></li>
            <li><a href="https://reverb.com/price-guide" target="_blank" rel="noopener noreferrer">Reverb — instrument price guide</a></li>
            <li><a href="https://www.chrono24.com/" target="_blank" rel="noopener noreferrer">Watch listings research</a></li>
            <li><a href="https://www.goat.com/" target="_blank" rel="noopener noreferrer">Sneaker marketplace comps</a></li>
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
const { violations: coaViolations, lastCheck: coaLastCheck, checking: coaChecking, scan: runCoaScan } = useCoaMonitor()
const { published, drafts, profiles, loading: statsLoading, error: statsError, refresh: refreshStats } = useOpsStats()
const { configuredCount: paymentLinkCount } = usePaymentLinks()

onMounted(() => {
  runCoaScan()
  refreshStats()
})

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
  border: 1px solid #d7dde6;
  border-radius: var(--radius-lg, 12px);
  background: #ffffff;
}
.card.wide { grid-column: 1 / -1; }
.card h2 { font-size: 1.05rem; color: #111827; margin: 0 0 12px; }
.link-list { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 8px; }
.link-list a, .link-list :deep(a) { color: #1f2937; font-size: 0.92rem; font-weight: 700; }
.link-list a:hover, .link-list :deep(a:hover) { color: #111827; text-decoration: underline; }
.link-list.external a { word-break: break-word; }
.btn-list { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 8px; align-items: flex-start; }
.checklist { margin: 0; padding-left: 1.1rem; color: #1f2937; font-size: 0.9rem; line-height: 1.5; }
.checklist li { margin-bottom: 6px; }
.small { font-size: 0.85rem; line-height: 1.45; }
.mt-1 { margin-top: 10px; }
.form-grid { display: grid; gap: 10px; max-width: 560px; }
.label { font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.08em; color: var(--stone-500); }
.area { min-height: 72px; resize: vertical; }
.copied { font-size: 0.85rem; color: var(--trust-green, #2ecc71); margin-top: 10px; }
.call-monitor-card { border-color: rgba(34, 232, 255, 0.25); }
.call-links { display: flex; flex-wrap: wrap; gap: 8px; margin: 14px 0; }
.call-setup-guide { margin-top: 14px; }
.call-setup-guide summary { color: var(--gold); cursor: pointer; font-weight: 600; font-size: 0.9rem; }
.setup-content { margin-top: 12px; font-size: 0.85rem; color: #1f2937; line-height: 1.6; }
.setup-content { color: #1f2937; }
.setup-content h4 { font-size: 0.88rem; color: #111827; margin: 16px 0 6px; font-family: 'Inter', sans-serif; }
.setup-content ol { padding-left: 1.2rem; margin: 4px 0 0; }
.setup-content li { margin-bottom: 6px; }
.setup-content a { color: var(--gold); }
.setup-content code { color: var(--gold-light); font-size: 0.82em; }
.call-features { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 8px; margin-top: 14px; }
.call-feat {
  display: flex; align-items: center; gap: 8px; padding: 10px 12px; font-size: 0.85rem; color: #1f2937;
  background: #f8f9fb; border-radius: var(--radius, 8px); border: 1px solid #d7dde6;
}
.call-feat span { font-size: 1.1rem; flex: 0 0 auto; }
.platform-snapshot {
  margin-bottom: 28px; padding: 22px 20px;
  border: 1px solid rgba(201, 168, 76, 0.35);
  border-radius: var(--radius-lg, 12px);
  background: linear-gradient(135deg, rgba(201, 168, 76, 0.06), rgba(0, 245, 160, 0.04));
}
.platform-snapshot-head {
  display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between;
  gap: 12px; margin-bottom: 14px;
}
.platform-snapshot-head h2 { margin: 0; font-size: 1.15rem; color: #111827; }
.snapshot-stats {
  display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 12px; margin: 16px 0 14px;
}
.snapshot-stat {
  padding: 14px; background: #fff; border: 1px solid #d7dde6; border-radius: var(--radius, 8px);
  text-align: center;
}
.snapshot-num { display: block; font-size: 1.5rem; font-weight: 800; color: #111827; }
.snapshot-label { font-size: 0.78rem; color: #6b7280; text-transform: uppercase; letter-spacing: 0.06em; }
.coa-monitor-card { border-color: rgba(255, 77, 142, 0.25); }
.coa-monitor-header { display: flex; align-items: center; justify-content: space-between; gap: 12px; flex-wrap: wrap; margin-bottom: 8px; }
.coa-monitor-header h2 { margin: 0; }
.coa-all-clear {
  display: flex; align-items: center; gap: 10px; margin-top: 14px; padding: 14px;
  background: rgba(16, 255, 176, 0.06); border: 1px solid rgba(16, 255, 176, 0.2); border-radius: var(--radius, 8px);
}
.coa-clear-icon { font-size: 1.4rem; }
.coa-all-clear p { margin: 0; font-size: 0.9rem; color: var(--trust-green); }
.coa-violations { margin-top: 14px; }
.coa-alert-count { font-weight: 700; color: var(--alert-red); font-size: 0.95rem; margin-bottom: 10px; }
.coa-violation-row {
  display: flex; align-items: center; gap: 12px; flex-wrap: wrap;
  padding: 12px; margin-bottom: 8px;
  background: rgba(255, 77, 106, 0.06); border: 1px solid rgba(255, 77, 106, 0.2); border-radius: var(--radius, 8px);
}
.coa-v-info { flex: 1; min-width: 150px; }
.coa-v-title { font-weight: 600; font-size: 0.9rem; color: var(--stone-100); margin: 0; }
.coa-v-title { color: #111827; }
.coa-v-meta { font-size: 0.78rem; margin: 2px 0 0; }
.coa-v-problems { display: flex; flex-wrap: wrap; gap: 4px; }
.coa-v-tag {
  padding: 2px 8px; border-radius: 4px; font-size: 0.7rem; font-weight: 600;
  background: rgba(255, 77, 106, 0.15); color: var(--alert-red); white-space: nowrap;
}
.free-access-banner {
  margin-bottom: 24px; padding: 28px 24px;
  border: 2px solid rgba(0, 245, 160, 0.45);
  border-radius: var(--radius-lg, 12px);
  background: linear-gradient(135deg, rgba(0, 245, 160, 0.08), rgba(201, 168, 76, 0.06), rgba(18, 8, 32, 0.95));
}
.free-access-header { display: flex; align-items: flex-start; gap: 16px; margin-bottom: 20px; }
.free-access-icon { font-size: 2.5rem; flex: 0 0 auto; }
.free-access-header h2 { font-size: 1.4rem; color: var(--trust-green); margin: 0 0 6px; }
.free-access-header p { font-size: 0.95rem; color: #1f2937; margin: 0; line-height: 1.5; }
.free-access-header p { color: #1f2937; }
.free-access-actions { display: flex; flex-wrap: wrap; gap: 12px; margin-bottom: 20px; }
.free-access-perks { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px 16px; margin-bottom: 16px; }
.perk-item { display: flex; align-items: center; gap: 8px; font-size: 0.88rem; color: #1f2937; font-weight: 700; }
.perk-check { color: var(--trust-green); font-weight: 800; font-size: 1rem; }
.free-access-note { font-size: 0.8rem; color: var(--stone-400); font-style: italic; }
@media (max-width: 640px) { .free-access-perks { grid-template-columns: repeat(2, 1fr); } }
.owner-badge-row { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 12px; }
.owner-badge {
  display: inline-flex; align-items: center; gap: 4px;
  padding: 5px 14px; border-radius: 999px;
  font-size: 0.75rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em;
  background: rgba(201, 168, 76, 0.15); color: var(--gold); border: 1px solid rgba(201, 168, 76, 0.35);
}
.owner-badge-green {
  background: rgba(0, 245, 160, 0.1); color: var(--trust-green); border-color: rgba(0, 245, 160, 0.3);
}
.owner-perks-box {
  margin-top: 14px; padding: 12px 14px;
  background: rgba(0, 245, 160, 0.05); border: 1px solid rgba(0, 245, 160, 0.15);
  border-radius: var(--radius, 8px);
}
.owner-perks-list { margin: 6px 0 0 1rem; font-size: 0.85rem; color: #4b5563; line-height: 1.6; }

.card .text-muted,
.card p.text-muted,
.card .small.text-muted {
  color: #4b5563 !important;
}
.owner-perks-list strong { color: var(--trust-green); }
@media (max-width: 800px) {
  .grid { grid-template-columns: 1fr; }
  .card.wide { grid-column: auto; }
}
</style>
