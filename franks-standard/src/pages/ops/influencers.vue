<template>
  <div class="inf-ops-page">
    <div class="container">
      <p class="eyebrow">Owner toolkit</p>
      <h1>Influencers &amp; affiliates</h1>
      <p class="lead text-muted">
        Generate tracked links (<code>/r/handle</code>), manage roster, copy media kit, and measure signups in Supabase.
      </p>

      <section class="card panel">
        <h2>1 — Create tracking link</h2>
        <div class="form-grid">
          <label>
            Creator handle
            <input v-model="draft.handle" class="input" placeholder="card-break-joe" @input="sanitizeHandle" />
          </label>
          <label>
            Display name
            <input v-model="draft.displayName" class="input" placeholder="Joe's Card Breaks" />
          </label>
          <label>
            Tier
            <select v-model="draft.tier" class="select">
              <option value="nano">Nano (1K–10K)</option>
              <option value="micro">Micro (10K–100K)</option>
              <option value="macro">Macro (100K+)</option>
            </select>
          </label>
          <label>
            Platform
            <input v-model="draft.platform" class="input" placeholder="youtube, tiktok, instagram" />
          </label>
          <label>
            Landing
            <select v-model="draft.landing" class="select">
              <option v-for="(path, key) in landings" :key="key" :value="key">{{ key }} → {{ path }}</option>
            </select>
          </label>
        </div>
        <p v-if="shortUrl" class="url-preview">
          Short link: <a :href="shortUrl" target="_blank" rel="noopener noreferrer">{{ shortUrl }}</a>
        </p>
        <div class="btn-row">
          <button type="button" class="btn btn-primary btn-sm" @click="copyShort">Copy short link</button>
          <button type="button" class="btn btn-outline btn-sm" @click="copyLong">Copy full URL with UTM</button>
          <button type="button" class="btn btn-outline btn-sm" @click="saveToRoster">Save to local roster</button>
        </div>
        <p v-if="copyMsg" class="copy-msg">{{ copyMsg }}</p>
      </section>

      <section class="card panel">
        <h2>2 — Media kit (paste to creators)</h2>
        <pre class="kit-pre">{{ mediaKitText }}</pre>
        <button type="button" class="btn btn-outline btn-sm" @click="copyKit">Copy media kit</button>
      </section>

      <section class="card panel">
        <h2>3 — Local roster</h2>
        <p class="text-muted small">Stored in this browser. For production, also add rows to Supabase <code>affiliate_partners</code> (migration 019).</p>
        <table v-if="roster.length" class="roster-table">
          <thead>
            <tr>
              <th>Handle</th>
              <th>Name</th>
              <th>Tier</th>
              <th>Link</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="p in roster" :key="p.handle">
              <td><code>{{ p.handle }}</code></td>
              <td>{{ p.displayName }}</td>
              <td>{{ p.tier }}</td>
              <td><a :href="linkFor(p.handle)" target="_blank" rel="noopener noreferrer">/r/{{ p.handle }}</a></td>
              <td><button type="button" class="btn-link" @click="removePartner(p.handle)">Remove</button></td>
            </tr>
          </tbody>
        </table>
        <p v-else class="text-muted">No custom partners yet — seed list is in <code>affiliateProgram.js</code>.</p>
      </section>

      <section class="card panel">
        <h2>4 — Measure signups (Supabase SQL)</h2>
        <pre class="kit-pre">{{ statsSql }}</pre>
        <button type="button" class="btn btn-outline btn-sm" @click="copySql">Copy SQL</button>
      </section>

      <section class="card panel">
        <h2>5 — Payout rules (launch)</h2>
        <ul class="ops-list">
          <li><strong>Nano:</strong> 1 month Pro per 3 referred sellers with ≥1 published listing (verify manually).</li>
          <li><strong>Micro:</strong> agree flat fee + per-signup bonus in email before posting.</li>
          <li>Require FTC disclosure in every post — see <NuxtLink to="/partners/creators">/partners/creators</NuxtLink>.</li>
          <li>Do not pay for fake signups or incentive-only accounts.</li>
        </ul>
      </section>

      <p class="back-link">
        <NuxtLink to="/ops/panel">← Operator console</NuxtLink>
        · <NuxtLink to="/ops/marketing">Marketing</NuxtLink>
        · <NuxtLink to="/partners">Public partners page ↗</NuxtLink>
      </p>
    </div>
  </div>
</template>

<script setup>
import {
  AFFILIATE_LANDINGS,
  AFFILIATE_MEDIA_KIT,
  AFFILIATE_FTC_DISCLOSURE,
  buildAffiliateShortUrl,
  buildAffiliatePath,
  normalizeAffiliateHandle,
} from '~/utils/affiliateProgram.js'

definePageMeta({ middleware: 'ops-auth' })
useSeoMeta({ title: 'Influencers — Ops', robots: 'noindex, nofollow' })

const { siteOrigin } = useOutreachAttribution()
const { loadRoster, allPartners, upsertPartner, removePartner: removeFromRoster } = useAffiliateRoster()

const landings = AFFILIATE_LANDINGS
const draft = reactive({
  handle: '',
  displayName: '',
  tier: 'nano',
  platform: 'youtube',
  landing: 'sell',
})
const copyMsg = ref('')

const roster = computed(() => allPartners())

const shortUrl = computed(() => {
  const h = normalizeAffiliateHandle(draft.handle)
  return h ? buildAffiliateShortUrl(siteOrigin(), h) : ''
})

const mediaKitText = computed(() => {
  const k = AFFILIATE_MEDIA_KIT
  return [
    k.tagline,
    '',
    ...k.bullets.map((b) => `• ${b}`),
    '',
    `Hashtags: ${k.hashtags.join(' ')}`,
    '',
    `Disclosure: ${AFFILIATE_FTC_DISCLOSURE}`,
    '',
    shortUrl.value ? `Your link: ${shortUrl.value}` : 'Your link: https://thefranksstandard.com/r/your-handle',
  ].join('\n')
})

const statsSql = `select signup_affiliate_handle, signup_affiliate_tier, count(*) as signups
from profiles
where signup_affiliate_handle is not null
group by 1, 2
order by signups desc;`

function sanitizeHandle () {
  draft.handle = normalizeAffiliateHandle(draft.handle)
}

function linkFor (handle) {
  return buildAffiliateShortUrl(siteOrigin(), handle)
}

async function copyText (text, label) {
  try {
    await navigator.clipboard.writeText(text)
    copyMsg.value = `Copied ${label}.`
    setTimeout(() => { copyMsg.value = '' }, 2500)
  } catch {
    copyMsg.value = 'Copy failed.'
  }
}

function copyShort () {
  if (shortUrl.value) copyText(shortUrl.value, 'short link')
}

function copyLong () {
  const h = normalizeAffiliateHandle(draft.handle)
  if (!h) return
  copyText(siteOrigin() + buildAffiliatePath(h, siteOrigin(), { landing: draft.landing }), 'full URL')
}

function copyKit () {
  copyText(mediaKitText.value, 'media kit')
}

function copySql () {
  copyText(statsSql, 'SQL')
}

function saveToRoster () {
  const ok = upsertPartner({
    handle: draft.handle,
    displayName: draft.displayName || draft.handle,
    tier: draft.tier,
    platform: draft.platform,
    landing: draft.landing,
    active: true,
  })
  copyMsg.value = ok ? 'Saved to local roster.' : 'Enter a valid handle.'
}

function removePartner (handle) {
  removeFromRoster(handle)
}

onMounted(() => loadRoster())
</script>

<style scoped>
.inf-ops-page { padding: 40px 16px 80px; }
.eyebrow { font-size: 0.72rem; letter-spacing: 0.12em; text-transform: uppercase; color: var(--gold); }
.lead { max-width: 720px; line-height: 1.6; }
.card.panel { padding: 1.25rem; margin-bottom: 1rem; }
.card.panel h2 { color: var(--gold); font-size: 1.05rem; margin-bottom: 12px; }
.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 12px;
  margin-bottom: 12px;
}
.form-grid label { display: flex; flex-direction: column; gap: 6px; font-size: 0.82rem; font-weight: 700; }
.form-grid .input, .form-grid .select {
  padding: 8px 10px; background: #111827; border: 1px solid #374151; border-radius: 8px; color: #f3f4f6;
}
.url-preview { word-break: break-all; font-size: 0.88rem; margin: 12px 0; }
.url-preview a { color: var(--gold); font-weight: 700; }
.btn-row { display: flex; flex-wrap: wrap; gap: 8px; }
.copy-msg { color: #86efac; font-size: 0.85rem; margin-top: 8px; }
.kit-pre {
  padding: 12px; background: #0f172a; border-radius: 8px; font-size: 0.8rem;
  color: #e2e8f0; overflow-x: auto; white-space: pre-wrap; margin-bottom: 10px;
}
.roster-table { width: 100%; font-size: 0.82rem; border-collapse: collapse; margin-top: 12px; }
.roster-table th, .roster-table td { padding: 8px; border-bottom: 1px solid #374151; text-align: left; }
.btn-link { background: none; border: none; color: #f87171; cursor: pointer; font-weight: 700; }
.ops-list { padding-left: 1.2rem; line-height: 1.55; color: #d1d5db; }
.back-link { margin-top: 1.5rem; }
</style>
