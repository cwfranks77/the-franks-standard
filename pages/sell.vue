<template>
  <div class="sell-page">
    <div class="container">
      <div class="sell-wrapper">
        <div class="sell-header text-center">
          <h1>Sell on The Franks Standard</h1>
          <p class="text-muted">List your authentic items. COA or signed guarantee required — that is what makes us different.</p>
        </div>

        <div class="sell-switch-banner card" role="status">
          <p>
            <strong>Coming from eBay or another marketplace?</strong>
            Import your inventory in minutes — skim eBay or upload CSV, then publish here with escrow checkout.
          </p>
          <NuxtLink to="/sell/import" class="btn btn-primary btn-sm">Import inventory</NuxtLink>
          <NuxtLink to="/sellers/switch" class="btn btn-outline btn-sm">Switching guide</NuxtLink>
          <NuxtLink to="/seller-tools" class="btn btn-outline btn-sm">Appraisal &amp; comp tools</NuxtLink>
        </div>

        <div v-if="isOwner" class="sell-owner-banner" role="status">
          <span class="sell-owner-badge">Owner mode</span>
          <p>
            <strong>All listing fees waived.</strong> You have full seller access as the site owner. List freely — COA or signed guarantee still required (your standard).
          </p>
        </div>

        <div v-else class="sell-notice" role="status">
          <p>
            <strong>Sign in required.</strong> You are publishing to the live floor (same rules: COA or signed guarantee). Stores and high volume:
            <NuxtLink to="/sellers">Apply as a store</NuxtLink>
            or
            <a :href="applicationMailto">info@thefranksstandard.com</a>.
          </p>
        </div>

        <!-- Listing type selector -->
        <div class="listing-type-selector">
          <button
            type="button"
            class="listing-type-btn"
            :class="{ active: listingMode === 'direct' }"
            @click="setListingMode('direct')"
          >
            <span class="lt-icon">📦</span>
            <span class="lt-label">Direct Sale</span>
            <span class="lt-desc">You ship the item yourself</span>
          </button>
          <button
            type="button"
            class="listing-type-btn"
            :class="{ active: listingMode === 'dropship' }"
            @click="setListingMode('dropship')"
          >
            <span class="lt-icon">🚚</span>
            <span class="lt-label">Dropship</span>
            <span class="lt-desc">Supplier ships direct to buyer</span>
          </button>
        </div>

        <p v-if="modeNotice" class="mode-notice" role="status">{{ modeNotice }}</p>

        <div v-if="listingMode === 'dropship'" class="dropship-setup-banner" role="status">
          <template v-if="!dropshipSetupComplete">
            <p><strong>First time dropshipping?</strong> You pick your own supplier — we walk you through setup step by step.</p>
            <NuxtLink to="/sell/dropship-setup" class="btn btn-primary btn-sm">Start dropship setup</NuxtLink>
          </template>
          <template v-else>
            <p>
              <strong>Your setup:</strong> {{ sellerDropshipSettings?.preferred_provider_name || 'Your supplier' }}
              · {{ sellerDropshipSettings?.fulfillment_mode === 'integrated' ? 'Auto-dispatch enabled' : 'Manual fulfillment' }}
              <NuxtLink to="/sell/dropship-setup" class="dropship-setup-link">Edit setup</NuxtLink>
            </p>
          </template>
        </div>

        <div class="listing-type-selector sale-format-selector">
          <button
            type="button"
            class="listing-type-btn"
            :class="{ active: saleType === 'fixed' }"
            @click="saleType = 'fixed'"
          >
            <span class="lt-icon">🏷️</span>
            <span class="lt-label">Fixed price</span>
            <span class="lt-desc">Buy now at your list price</span>
          </button>
          <button
            type="button"
            class="listing-type-btn"
            :class="{ active: saleType === 'auction' }"
            @click="saleType = 'auction'"
          >
            <span class="lt-icon">🔨</span>
            <span class="lt-label">Auction</span>
            <span class="lt-desc">Buyers bid until time runs out</span>
          </button>
          <button
            type="button"
            class="listing-type-btn"
            :class="{ active: saleType === 'auction_bin' }"
            @click="saleType = 'auction_bin'"
          >
            <span class="lt-icon">🔨🏷️</span>
            <span class="lt-label">Auction + Buy It Now</span>
            <span class="lt-desc">Bidders compete, or a buyer pays your instant price before the first bid</span>
          </button>
        </div>

        <form class="sell-form" @submit.prevent="submitListing">
          <!-- Item details -->
          <div class="form-section">
            <h2>Item Details</h2>

            <div class="form-group">
              <label class="label">Title</label>
              <input class="input" v-model="form.title" placeholder="e.g. 2023 Topps Chrome Shohei Ohtani PSA 10" required />
            </div>

            <div class="form-row">
              <div class="form-group">
                <label class="label">Category</label>
                <select class="select" v-model="form.category" required>
                  <option value="">Select Category</option>
                  <option v-for="cat in categories" :key="cat" :value="cat">{{ cat }}</option>
                </select>
              </div>
              <div class="form-group">
                <label class="label">{{ isAuctionFormat ? 'Starting bid ($)' : 'Price ($)' }}</label>
                <input class="input" type="number" min="1" step="0.01" v-model="form.price" placeholder="0.00" required />
              </div>
            </div>

            <div v-if="saleType === 'auction_bin'" class="form-group">
              <label class="label">Buy It Now price ($)</label>
              <input class="input" type="number" min="1" step="0.01" v-model="buyNowPrice" placeholder="Instant purchase price" required />
              <p class="text-muted small">Shown while the auction is live and <strong>before the first bid</strong>. Must be higher than your starting bid.</p>
            </div>

            <div v-if="isAuctionFormat" class="form-row">
              <div class="form-group">
                <label class="label">Auction length</label>
                <select class="select" v-model="auctionDays">
                  <option :value="3">3 days</option>
                  <option :value="5">5 days</option>
                  <option :value="7">7 days</option>
                  <option :value="10">10 days</option>
                </select>
              </div>
              <div class="form-group">
                <label class="label">Minimum bid increase ($)</label>
                <input class="input" type="number" min="1" step="0.01" v-model="bidIncrement" placeholder="1.00" required />
              </div>
            </div>

            <div v-if="isAuctionFormat" class="form-group">
              <label class="label">Reserve price ($) — optional</label>
              <input class="input" type="number" min="1" step="0.01" v-model="reservePrice" placeholder="Leave blank for no reserve" />
              <p class="text-muted small">Hidden from buyers. Item only sells if the high bid meets or beats this amount.</p>
            </div>

            <div class="form-group">
              <label class="label">Condition</label>
              <select class="select" v-model="form.condition" required>
                <option value="">Select Condition</option>
                <option value="new">New / Sealed</option>
                <option value="like-new">Like New</option>
                <option value="excellent">Excellent</option>
                <option value="good">Good</option>
                <option value="fair">Fair</option>
              </select>
            </div>

            <div class="form-group ai-desc-group">
              <div class="ai-desc-head">
                <label class="label">Description</label>
                <button
                  type="button"
                  class="btn btn-outline btn-sm ai-desc-btn"
                  :disabled="aiDescGenerating || !canGenerateAiDescription"
                  @click="generateAiDescription"
                >
                  {{ aiDescGenerating ? 'Writing…' : (form.description.trim() ? 'Rewrite with AI' : 'Write with AI') }}
                </button>
              </div>
              <p class="text-muted small ai-desc-hint">
                <template v-if="canGenerateAiDescription">
                  AI drafts condition, authenticity, shipping, and buyer-trust copy — you edit before publishing.
                </template>
                <template v-else>
                  Enter a <strong>title</strong> and <strong>category</strong> above to enable Write with AI.
                </template>
              </p>
              <div class="ai-desc-options">
                <div class="form-group ai-desc-tone">
                  <label class="label">AI tone</label>
                  <select v-model="aiDescTone" class="select">
                    <option value="professional">Professional &amp; trusted</option>
                    <option value="friendly">Friendly &amp; approachable</option>
                    <option value="collector">Collector-focused</option>
                    <option value="luxury">Luxury &amp; curated</option>
                  </select>
                </div>
                <div class="form-group ai-desc-notes">
                  <label class="label">Extra details for AI (optional)</label>
                  <input
                    v-model="aiDescNotes"
                    class="input"
                    placeholder="e.g. PSA 10, includes original box, minor corner wear"
                  />
                </div>
              </div>
              <textarea
                v-model="form.description"
                class="textarea"
                rows="8"
                placeholder="Describe condition, history, and any details a buyer should know — or use Write with AI above."
                required
              />
              <p v-if="aiDescMessage" class="ai-desc-msg" :class="{ 'ai-desc-err': aiDescError }" role="status">{{ aiDescMessage }}</p>
            </div>
          </div>

          <!-- Charity donation -->
          <div class="form-section charity-section">
            <h2>Donate sale proceeds</h2>
            <p class="text-muted mb-2">
              Optional. Donate some or all of your seller proceeds to a registered nonprofit.
              The Franks Standard disburses the charity share after the sale completes; you keep the rest (minus platform fees on your portion).
            </p>
            <label class="charity-toggle">
              <input v-model="charity.enabled" type="checkbox" />
              <span>Donate part of this sale to a charity</span>
            </label>
            <div v-if="charity.enabled" class="charity-pick mt-2">
              <label class="label">Choose a charity</label>
              <select v-model="charity.key" class="select" required>
                <option value="">Select a charity</option>
                <option v-for="c in charities" :key="c.key" :value="c.key">{{ c.name }}</option>
              </select>
              <p v-if="selectedCharity" class="charity-detail text-muted small mt-1">
                {{ selectedCharity.tagline }}
                <a :href="selectedCharity.website" target="_blank" rel="noopener noreferrer">Learn more</a>
              </p>
              <label class="label mt-2">How much of the sale goes to charity?</label>
              <div class="charity-percent-row">
                <button
                  v-for="p in charityPercentPresets"
                  :key="p"
                  type="button"
                  class="charity-pct-btn"
                  :class="{ active: charity.percent === p }"
                  @click="charity.percent = p"
                >{{ p }}%</button>
              </div>
              <div class="form-row mt-1">
                <div class="form-group">
                  <label class="label" for="charity-custom-pct">Or enter % (1–100)</label>
                  <input
                    id="charity-custom-pct"
                    v-model.number="charity.percent"
                    class="input"
                    type="number"
                    min="1"
                    max="100"
                    step="1"
                  />
                </div>
              </div>
              <p v-if="charitySplitPreview" class="charity-split-preview text-muted small mt-2" role="status">
                On a <strong>${{ charitySplitPreview.saleAmount.toLocaleString() }}</strong> sale:
                <strong>${{ charitySplitPreview.charityAmount.toLocaleString() }}</strong> to charity,
                about <strong>${{ charitySplitPreview.sellerPayout.toLocaleString() }}</strong> to you after fees
                <span v-if="charitySplitPreview.platformFee > 0"> (platform fee ~${{ charitySplitPreview.platformFee.toLocaleString() }} on your share)</span>.
              </p>
            </div>
          </div>

          <!-- Dropship details -->
          <div v-if="listingMode === 'dropship'" class="form-section dropship-section">
            <h2>Dropship Details</h2>
            <p class="text-muted mb-2">
              Use your own supplier (whoever you chose in setup). Per listing, add supplier contact and SKU so we can pass order details when someone buys.
            </p>

            <div class="form-group">
              <label class="label">Dropship Provider</label>
              <select class="select" v-model="dropship.providerKey">
                <option value="">My own supplier (any company)</option>
                <option v-for="provider in dropshipProviders" :key="provider.key" :value="provider.key">
                  {{ provider.name }}
                </option>
              </select>
            </div>

            <div class="form-group">
              <label class="label">Sales Channel</label>
              <select class="select" v-model="dropship.salesChannelKey">
                <option v-for="channel in dropshipChannels" :key="channel.key" :value="channel.key">
                  {{ channel.name }}
                </option>
              </select>
            </div>

            <div v-if="selectedDropshipProvider" class="dropship-provider-card">
              <p class="dropship-provider-name">{{ selectedDropshipProvider.name }}</p>
              <p class="text-muted">{{ selectedDropshipProvider.note }}</p>
              <a
                class="dropship-provider-link"
                :href="selectedDropshipProvider.website"
                target="_blank"
                rel="noopener noreferrer"
              >
                Open provider website
              </a>
              <p v-if="selectedDropshipChannel" class="dropship-provider-channel">
                Channel for this listing: <strong>{{ selectedDropshipChannel.name }}</strong>
              </p>
            </div>

            <div class="form-group">
              <label class="label">Supplier Name</label>
              <input class="input" v-model="dropship.supplierName" placeholder="e.g. AuthentiCards Supply Co." required />
            </div>

            <div class="form-group">
              <label class="label">Supplier Contact Email</label>
              <input class="input" type="email" v-model="dropship.supplierEmail" placeholder="supplier@example.com" />
            </div>

            <div class="form-row">
              <div class="form-group">
                <label class="label">Your wholesale cost ($)</label>
                <input
                  class="input"
                  type="number"
                  min="0.01"
                  step="0.01"
                  v-model="dropship.wholesaleCost"
                  required
                  placeholder="What you pay your supplier"
                />
                <p class="text-muted small mt-1">
                  Stripe splits payment: platform fee, this supplier cost (released when you ship), and your margin (on buyer confirm).
                </p>
              </div>
              <div class="form-group">
                <label class="label">Supplier SKU / product code</label>
              <input
                class="input"
                v-model="dropship.supplierSku"
                :required="listingMode === 'dropship' && dropshipNeedsSku"
                placeholder="e.g. DOBA-12345 or your supplier's item code"
              />
              <p v-if="dropshipNeedsSku" class="text-muted small mt-1">
                Required for auto-dispatch with your Doba account. Otherwise optional but helps you fulfill faster.
              </p>
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label class="label">Estimated Ship Time</label>
                <select class="select" v-model="dropship.shipTime" required>
                  <option value="">Select timeframe</option>
                  <option value="1-3 days">1-3 business days</option>
                  <option value="3-5 days">3-5 business days</option>
                  <option value="5-10 days">5-10 business days</option>
                  <option value="10-14 days">10-14 business days</option>
                  <option value="14+ days">14+ business days</option>
                </select>
              </div>
              <div class="form-group">
                <label class="label">Ships From</label>
                <input class="input" v-model="dropship.shipsFrom" placeholder="e.g. Dallas, TX" />
              </div>
            </div>

            <div class="dropship-notice">
              <p><strong>Dropship policy:</strong> You are responsible for the authenticity and condition of items shipped by your supplier. COA or guarantee still required. Buyer disputes are resolved under the same Standard.</p>
            </div>
          </div>

          <!-- Photos -->
          <div class="form-section">
            <h2>Photos</h2>
            <p class="text-muted mb-2">Upload clear photos of the item. First photo becomes the listing thumbnail.</p>
            <div class="photo-upload">
              <label class="photo-add">
                <input type="file" accept="image/*" multiple @change="handlePhotos" hidden />
                <span class="photo-add-icon">+</span>
                <span>Add Photos</span>
              </label>
              <div v-for="(photo, idx) in photoPreviews" :key="idx" class="photo-preview">
                <img :src="photo" alt="Preview" />
                <button type="button" class="photo-remove" @click="removePhoto(idx)">&times;</button>
              </div>
            </div>
          </div>

          <!-- COA Section -->
          <div class="form-section coa-section">
            <h2>Certificate of Authenticity</h2>
            <p class="text-muted mb-2">This is what sets The Franks Standard apart. Choose one:</p>

            <div class="coa-options">
              <label class="coa-option" :class="{ active: form.coaType === 'upload' }">
                <input type="radio" v-model="form.coaType" value="upload" name="coaType" />
                <div class="coa-option-content">
                  <h4>Upload a COA</h4>
                  <p>You have a physical or digital Certificate of Authenticity. Upload a photo or scan.</p>
                </div>
              </label>

              <label class="coa-option" :class="{ active: form.coaType === 'guarantee' }">
                <input type="radio" v-model="form.coaType" value="guarantee" name="coaType" />
                <div class="coa-option-content">
                  <h4>Sign The Franks Standard Guarantee</h4>
                  <p>You personally vouch for this item's authenticity. Your name, reputation, and account are on the line.</p>
                </div>
              </label>
            </div>

            <!-- Upload COA -->
            <div v-if="form.coaType === 'upload'" class="mt-3">
              <label class="label">Upload COA Document</label>
              <label class="photo-add" style="width: 100%; justify-content: center;">
                <input type="file" accept="image/*,.pdf" @change="handleCOA" hidden />
                <span class="photo-add-icon">📄</span>
                <span>{{ coaFileName || 'Choose COA file' }}</span>
              </label>
            </div>

            <!-- Sign Guarantee -->
            <div v-if="form.coaType === 'guarantee'" class="guarantee-box mt-3">
              <div class="guarantee-text">
                <p><strong>The Franks Standard Guarantee</strong></p>
                <p>I, <strong>{{ form.sellerName || '[Your Name]' }}</strong>, hereby certify that the item listed above is authentic, genuine, and accurately described. I understand that if this item is proven to be counterfeit or misrepresented, my account will be permanently banned from The Franks Standard and the buyer will receive a full refund.</p>
                <p>I am staking my name and reputation on this listing.</p>
              </div>
              <div class="form-group mt-2">
                <label class="label">Your Full Legal Name</label>
                <input class="input" v-model="form.sellerName" placeholder="Type your full name to sign" required />
              </div>
              <label class="guarantee-check">
                <input type="checkbox" v-model="form.guaranteeSigned" required />
                <span>I have read and agree to The Franks Standard Guarantee above. I understand this is legally binding.</span>
              </label>
            </div>
          </div>

          <button type="submit" class="btn btn-primary btn-lg" style="width: 100%;" :disabled="submitting">
            {{ submitting ? 'Publishing…' : 'Publish to marketplace' }}
          </button>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { LISTING_CATEGORIES } from '~/utils/marketplaceCategories'
import { CHARITY_OPTIONS, charityByKey } from '~/utils/charities.js'
import { calcCharitySplit, CHARITY_PERCENT_PRESETS } from '~/utils/charitySplit.js'
import { auctionEndsAtFromDays } from '~/utils/auctionHelpers.js'
import { DROPSHIP_PROVIDER_CATALOG, useSellerDropship } from '~/composables/useSellerDropship.js'

const charities = CHARITY_OPTIONS

definePageMeta({ middleware: 'requires-auth' })

useSeoMeta({
  title: 'Sell — The Franks Standard',
  description:
    'Sell with COA or a signed guarantee. Onboarding for stores: apply to list on the authenticity-first marketplace.',
})

const { isOwner } = useOwnerMode()
const applicationMailto = buildSellerApplicationMailto()
const supabase = useSupabaseClient()
const route = useRoute()
const submitting = ref(false)
const listingMode = ref('direct')
const modeNotice = ref('')

const categories = LISTING_CATEGORIES

const dropshipProviders = DROPSHIP_PROVIDER_CATALOG.filter((p) => p.key !== 'custom')

const {
  setupComplete: dropshipSetupComplete,
  settings: sellerDropshipSettings,
  load: loadSellerDropship,
} = useSellerDropship()

const dropshipNeedsSku = computed(() => {
  return dropship.providerKey === 'doba'
    && sellerDropshipSettings.value?.fulfillment_mode === 'integrated'
})

const dropshipChannels = [
  {
    key: 'the-franks-standard',
    name: 'The Franks Standard (Custom)',
  },
  {
    key: 'custom-api-csv',
    name: 'Custom API / CSV Feed',
  },
]

const form = reactive({
  title: '',
  description: '',
  category: '',
  price: null,
  condition: '',
  coaType: '',
  sellerName: '',
  guaranteeSigned: false,
})

const saleType = ref('fixed')
const auctionDays = ref(7)
const bidIncrement = ref(1)
const reservePrice = ref('')
const buyNowPrice = ref('')

const isAuctionFormat = computed(() => saleType.value === 'auction' || saleType.value === 'auction_bin')

const charity = reactive({
  enabled: false,
  key: '',
  percent: 25,
})

const charityPercentPresets = CHARITY_PERCENT_PRESETS
const selectedCharity = computed(() => charityByKey(charity.key))

const charitySplitPreview = computed(() => {
  if (!charity.enabled || !charity.key) return null
  const saleAmount = Number(form.price)
  if (!Number.isFinite(saleAmount) || saleAmount <= 0) return null
  const pct = Math.min(100, Math.max(1, Math.round(Number(charity.percent) || 0)))
  const split = calcCharitySplit(saleAmount, pct)
  return { saleAmount, ...split }
})

const dropship = reactive({
  providerKey: '',
  salesChannelKey: 'the-franks-standard',
  supplierName: '',
  supplierEmail: '',
  supplierSku: '',
  wholesaleCost: '',
  shipTime: '',
  shipsFrom: '',
})

const selectedDropshipProvider = computed(() => {
  return dropshipProviders.find((p) => p.key === dropship.providerKey) || null
})

const selectedDropshipChannel = computed(() => {
  return dropshipChannels.find((c) => c.key === dropship.salesChannelKey) || null
})

const photoPreviews = ref([])
const photoFiles = ref([])
const coaFile = ref(null)
const coaFileName = ref('')

const aiDescTone = ref('professional')
const aiDescNotes = ref('')
const aiDescGenerating = ref(false)
const aiDescMessage = ref('')
const aiDescError = ref(false)

const canGenerateAiDescription = computed(() => {
  return !!form.title.trim() && !!form.category
})

/** Inlined — OneDrive was corrupting utils/listingDescriptionAi.js (UTF-16). */
function buildListingDescription (input) {
  const title = (input.title || '').trim() || 'Item'
  const category = (input.category || '').trim() || 'collectibles'
  const condition = input.condition || ''
  const tone = input.tone || 'professional'
  const notes = (input.sellerNotes || '').trim()
  const coaType = input.coaType || ''
  const listingMode = input.listingMode || 'direct'
  const CONDITION = { new: 'New / Sealed', 'like-new': 'Like New', excellent: 'Excellent', good: 'Good', fair: 'Fair' }
  const TONE_OPENER = {
    professional: 'Offered with full transparency on The Franks Standard.',
    friendly: 'Happy to answer questions — message or start a Video Call from this listing.',
    collector: 'Built for serious collectors who want proof before they buy.',
    luxury: 'Presented with careful attention to condition, provenance, and presentation.',
  }
  let priceStr = null
  if (input.price != null && input.price !== '') {
    const n = typeof input.price === 'number' ? input.price : parseFloat(String(input.price))
    if (Number.isFinite(n) && n > 0) {
      priceStr = n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 2 })
    }
  }
  const hook = category.toLowerCase()
  const conditionLabel = CONDITION[condition] || condition || 'As described'
  let auth = 'Authenticity: COA uploaded or signed Franks Standard guarantee required — add proof in the COA section below.'
  if (coaType === 'upload') auth = 'Authenticity: Certificate of Authenticity (COA) on file with this listing.'
  if (coaType === 'guarantee') auth = 'Authenticity: Backed by The Franks Standard in-platform seller guarantee.'
  let ship = 'Shipping: Ships within 2 business days after escrow — insured and tracked when applicable.'
  if (listingMode === 'dropship') {
    ship = 'Shipping: Dropship — supplier ships direct to buyer.'
    if (input.shipTime) ship += ` Estimated handling: ${input.shipTime}.`
    if (input.shipsFrom) ship += ` Ships from: ${input.shipsFrom}.`
  }
  const lines = [
    title,
    '',
    `Category: ${category}. This listing is for ${hook}. ${TONE_OPENER[tone] || TONE_OPENER.professional}`,
  ]
  if (priceStr) lines.push(`Price: ${priceStr} — message the seller for bundle offers.`)
  lines.push('', 'Condition & details', `• Condition: ${conditionLabel}.`, '• Includes: Everything shown in photos unless noted.', '• Packaging: See photos for wear and completeness.')
  if (notes) {
    lines.push('', 'Seller notes')
    for (const line of notes.split(/\n+/)) {
      const t = line.trim()
      if (t) lines.push(`• ${t}`)
    }
  }
  lines.push('', auth, '', ship, '', 'Buyer protection: Escrow until you confirm the item matches this listing.', 'Listed on The Franks Standard — proof-first marketplace.')
  return lines.join('\n')
}

function generateListingDescriptionAsync (input, delayMs = 700) {
  return new Promise((resolve) => {
    setTimeout(() => resolve(buildListingDescription(input)), delayMs)
  })
}

async function generateAiDescription () {
  if (!form.title.trim()) {
    aiDescError.value = true
    aiDescMessage.value = 'Enter a title first.'
    return
  }
  if (!form.category) {
    aiDescError.value = true
    aiDescMessage.value = 'Select a category first (above the description).'
    return
  }
  aiDescGenerating.value = true
  aiDescMessage.value = ''
  aiDescError.value = false
  try {
    const draft = await generateListingDescriptionAsync({
      title: form.title,
      category: form.category,
      condition: form.condition,
      price: form.price,
      coaType: form.coaType,
      listingMode: listingMode.value,
      sellerNotes: aiDescNotes.value,
      tone: aiDescTone.value,
      shipTime: dropship.shipTime,
      shipsFrom: dropship.shipsFrom,
    })
    if (!draft || !String(draft).trim()) {
      throw new Error('Empty draft')
    }
    form.description = draft
    aiDescMessage.value = 'Description drafted — review and edit before you publish.'
  } catch (e) {
    aiDescError.value = true
    aiDescMessage.value = 'Could not generate description. Refresh the page and try again.'
    console.error('[AI description]', e)
  } finally {
    aiDescGenerating.value = false
  }
}

onMounted(async () => {
  await loadSellerDropship()
  const mode = String(route.query.mode || '').toLowerCase()
  if (mode === 'dropship') {
    listingMode.value = 'dropship'
    if (!dropshipSetupComplete.value) {
      modeNotice.value = 'Complete dropship setup to choose your supplier, or fill in supplier details below.'
    }
    if (sellerDropshipSettings.value?.preferred_provider_key && !dropship.providerKey) {
      const key = sellerDropshipSettings.value.preferred_provider_key
      dropship.providerKey = key === 'custom' ? '' : key
    }
  } else if (mode === 'direct') {
    listingMode.value = 'direct'
  }
})

watch(() => dropship.providerKey, (providerKey) => {
  if (!providerKey) return
  const provider = dropshipProviders.find((p) => p.key === providerKey)
  if (!provider) return

  // Prefill only when fields are empty, so owner can override.
  if (!dropship.supplierName) {
    dropship.supplierName = provider.name
  }
  if (!dropship.supplierEmail && provider.contactEmail) {
    dropship.supplierEmail = provider.contactEmail
  }

  // Keep Franks as the default listing channel for provider-connected dropship flows.
  if (!dropship.salesChannelKey) {
    dropship.salesChannelKey = 'the-franks-standard'
  }
})

async function setListingMode(mode) {
  listingMode.value = mode
  modeNotice.value = mode === 'dropship'
    ? (dropshipSetupComplete.value
      ? 'Dropship mode — your supplier fulfills. Add per-item supplier details below.'
      : 'Dropship mode — start setup to pick your supplier, then add listing details.')
    : 'Direct sale mode is active. You will ship this item yourself.'

  if (mode === 'dropship') {
    await nextTick()
    const section = document.querySelector('.dropship-section')
    if (section) {
      section.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }
}

function handlePhotos(e) {
  const files = Array.from(e.target.files)
  files.forEach((file) => {
    photoFiles.value.push(file)
    const reader = new FileReader()
    reader.onload = (ev) => photoPreviews.value.push(ev.target.result)
    reader.readAsDataURL(file)
  })
}

function removePhoto(idx) {
  photoPreviews.value.splice(idx, 1)
  photoFiles.value.splice(idx, 1)
}

function handleCOA(e) {
  coaFile.value = e.target.files[0]
  coaFileName.value = coaFile.value?.name || ''
}

async function submitListing() {
  if (!form.coaType) {
    alert('You must provide a Certificate of Authenticity or sign The Franks Standard Guarantee.')
    return
  }
  if (form.coaType === 'guarantee' && !form.guaranteeSigned) {
    alert('You must sign The Franks Standard Guarantee to list this item.')
    return
  }
  if (form.coaType === 'upload' && !coaFile.value) {
    alert('Please upload a COA document, or pick the in-platform guarantee instead.')
    return
  }
  if (photoFiles.value.length < 1) {
    alert('Add at least one item photo (first image is the cover).')
    return
  }
  if (listingMode.value === 'dropship' && dropshipNeedsSku.value && !String(dropship.supplierSku || '').trim()) {
    alert('Integrated Doba listings require a Supplier SKU before publishing.')
    return
  }
  if (listingMode.value === 'dropship') {
    const wholesale = Number(dropship.wholesaleCost)
    const price = Number(form.price)
    if (!Number.isFinite(wholesale) || wholesale <= 0) {
      alert('Enter your wholesale cost (what you pay the supplier).')
      return
    }
    if (Number.isFinite(price) && wholesale >= price) {
      alert('Wholesale cost must be less than your list price so you have margin after fees.')
      return
    }
  }
  if (charity.enabled && !charity.key) {
    alert('Choose a charity or turn off "Donate part of this sale".')
    return
  }
  if (charity.enabled) {
    const pct = Math.round(Number(charity.percent) || 0)
    if (pct < 1 || pct > 100) {
      alert('Charity percentage must be between 1 and 100.')
      return
    }
  }
  submitting.value = true
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      await navigateTo({ path: '/auth/login', query: { redirect: '/sell' } })
      return
    }
    const listingPayload = {
      seller_id: user.id,
      title: form.title.trim(),
      description: form.description.trim(),
      category: form.category,
      price: Number(form.price),
      condition: form.condition,
      coa_type: form.coaType,
      guarantee_signed: !!form.guaranteeSigned,
      seller_legal_name: form.coaType === 'guarantee' ? form.sellerName.trim() : null,
      coa_storage_path: null,
      image_paths: [],
      status: 'published',
    }
    const pickedCharity = charity.enabled ? charityByKey(charity.key) : null
    if (pickedCharity) {
      const pct = Math.min(100, Math.max(1, Math.round(Number(charity.percent) || 0)))
      Object.assign(listingPayload, {
        donate_proceeds: true,
        charity_key: pickedCharity.key,
        charity_name: pickedCharity.name,
        charity_percent: pct,
      })
    }

    if (isAuctionFormat.value) {
      const start = Number(form.price)
      const increment = Number(bidIncrement.value)
      if (!Number.isFinite(start) || start <= 0) {
        alert('Enter a valid starting bid.')
        submitting.value = false
        return
      }
      if (!Number.isFinite(increment) || increment <= 0) {
        alert('Enter a valid minimum bid increase.')
        submitting.value = false
        return
      }
      let bin = null
      if (saleType.value === 'auction_bin') {
        bin = Number(buyNowPrice.value)
        if (!Number.isFinite(bin) || bin <= 0) {
          alert('Enter a valid Buy It Now price.')
          submitting.value = false
          return
        }
        if (bin <= start) {
          alert('Buy It Now price must be higher than the starting bid.')
          submitting.value = false
          return
        }
      }
      Object.assign(listingPayload, {
        sale_type: 'auction',
        starting_bid: start,
        bid_increment: increment,
        auction_ends_at: auctionEndsAtFromDays(auctionDays.value),
        current_bid: null,
        current_bidder_id: null,
        bid_count: 0,
        price: start,
        buy_now_price: bin,
      })
      const reserve = String(reservePrice.value ?? '').trim()
      if (reserve) {
        const r = Number(reserve)
        if (Number.isFinite(r) && r > 0) {
          listingPayload.reserve_price = r
        }
      }
    } else {
      listingPayload.sale_type = 'fixed'
    }

    // Dropship columns only exist after migration 002 — do not send them for direct sale.
    if (listingMode.value === 'dropship') {
      Object.assign(listingPayload, {
        listing_mode: 'dropship',
        dropship_provider_key: dropship.providerKey || null,
        dropship_provider_name: selectedDropshipProvider.value?.name || null,
        dropship_sales_channel_key: dropship.salesChannelKey || 'the-franks-standard',
        dropship_supplier_name: dropship.supplierName.trim() || null,
        dropship_supplier_email: dropship.supplierEmail.trim() || null,
        dropship_supplier_sku: dropship.supplierSku.trim() || null,
        dropship_wholesale_cost: Number(dropship.wholesaleCost) || null,
        dropship_ship_time: dropship.shipTime || null,
        dropship_ships_from: dropship.shipsFrom.trim() || null,
      })
    }

    let { data: row, error: insErr } = await supabase
      .from('listings')
      .insert(listingPayload)
      .select('id')
      .single()

    if (insErr && /charity_percent/i.test(insErr.message || '')) {
      const fallback = { ...listingPayload }
      delete fallback.charity_percent
      ;({ data: row, error: insErr } = await supabase
        .from('listings')
        .insert(fallback)
        .select('id')
        .single())
      if (!insErr) {
        alert('Listing saved, but charity % needs migration 016_charity_percent.sql in Supabase. Run migrations, then edit the listing.')
      }
    }

    if (insErr && /buy_now_price/i.test(insErr.message || '')) {
      const fallback = { ...listingPayload }
      delete fallback.buy_now_price
      ;({ data: row, error: insErr } = await supabase
        .from('listings')
        .insert(fallback)
        .select('id')
        .single())
      if (!insErr) {
        alert('Listing saved, but Buy It Now needs migration 015_auction_buy_now.sql in Supabase. Run migrations, then edit the listing.')
      }
    }

    if (insErr || !row) {
      throw new Error(insErr?.message || 'Could not create listing. Did you run the SQL migration in Supabase?')
    }

    const listingId = row.id
    const base = `${user.id}/${listingId}`

    const imagePaths = []
    for (let i = 0; i < photoFiles.value.length; i++) {
      const file = photoFiles.value[i]
      const ext = (file.name.split('.').pop() || 'jpg').replace(/[^a-z0-9]/gi, '') || 'jpg'
      const path = `${base}/item-${i}.${ext}`
      const { error: upErr } = await supabase.storage.from('listings').upload(path, file, {
        upsert: true,
        contentType: file.type || undefined,
      })
      if (upErr) {
        throw new Error(upErr.message)
      }
      imagePaths.push(path)
    }

    let coaPath = null
    if (form.coaType === 'upload' && coaFile.value) {
      const cf = coaFile.value
      const cext = (cf.name.split('.').pop() || 'pdf').replace(/[^a-z0-9]/gi, '') || 'pdf'
      coaPath = `${base}/coa/coa.${cext}`
      const { error: cErr } = await supabase.storage.from('listings').upload(coaPath, cf, { upsert: true })
      if (cErr) {
        throw new Error(cErr.message)
      }
    }

    const { error: updErr } = await supabase
      .from('listings')
      .update({
        image_paths: imagePaths,
        coa_storage_path: coaPath,
      })
      .eq('id', listingId)

    if (updErr) {
      throw new Error(updErr.message)
    }

    await navigateTo(`/listing/${listingId}`)
  } catch (e) {
    const msg = e && typeof e === 'object' && 'message' in e ? e.message : String(e)
    alert(`Could not publish: ${msg}`)
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped>
.sell-page { padding: 40px 0; }
.sell-wrapper { max-width: 720px; margin: 0 auto; }
.sell-header { margin-bottom: 30px; }
.sell-header h1 { font-size: 2rem; }
.sell-switch-banner {
  margin-bottom: 24px;
  padding: 1rem 1.25rem;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 12px;
  justify-content: space-between;
  border: 1px solid rgba(201, 168, 76, 0.35);
}
.sell-switch-banner p { margin: 0; flex: 1 1 240px; }

.form-section {
  margin-bottom: 32px;
  padding: 28px;
  border: 1px solid #d7dde6;
  border-radius: var(--radius-lg);
  background: #ffffff;
}
.form-section h2 {
  font-size: 1.2rem;
  margin-bottom: 16px;
  color: #111827;
}
.form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
@media (max-width: 500px) { .form-row { grid-template-columns: 1fr; } }

.ai-desc-head {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  margin-bottom: 6px;
}
.ai-desc-head .label { margin-bottom: 0; }
.ai-desc-hint { margin: 0 0 12px; }
.ai-desc-options {
  display: grid;
  grid-template-columns: 1fr 1.4fr;
  gap: 12px;
  margin-bottom: 12px;
}
@media (max-width: 600px) {
  .ai-desc-options { grid-template-columns: 1fr; }
}
.ai-desc-options .form-group { margin-bottom: 0; }
.ai-desc-msg {
  margin-top: 10px;
  font-size: 0.85rem;
  font-weight: 600;
  color: #047857;
}
.ai-desc-msg.ai-desc-err { color: #b45309; }

.charity-section { border-color: rgba(0, 245, 160, 0.25); }
.charity-toggle {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  font-weight: 600;
  cursor: pointer;
}
.charity-toggle input { margin-top: 4px; accent-color: var(--gold); }
.charity-detail a { color: var(--gold); font-weight: 600; }
.charity-pick .select { max-width: 100%; }
.charity-percent-row {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 8px;
}
.charity-pct-btn {
  padding: 8px 14px;
  border: 2px solid #d7dde6;
  border-radius: 8px;
  background: #fff;
  cursor: pointer;
  font-weight: 600;
  color: #1f2937;
}
.charity-pct-btn.active {
  border-color: #047857;
  background: #ecfdf5;
  color: #047857;
}
.charity-split-preview { line-height: 1.5; color: #047857; }
.ai-desc-group .textarea {
  font-size: 0.92rem;
  line-height: 1.55;
}

.photo-upload {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}
.photo-add {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
  width: 120px;
  height: 120px;
  border: 2px dashed var(--stone-600);
  border-radius: var(--radius);
  cursor: pointer;
  color: #6b7280;
  font-size: 0.85rem;
  transition: border-color 0.2s;
}
.photo-add:hover { border-color: var(--gold); color: var(--gold); }
.photo-add-icon { font-size: 2rem; }
.photo-preview {
  position: relative;
  width: 120px;
  height: 120px;
  border-radius: var(--radius);
  overflow: hidden;
}
.photo-preview img { width: 100%; height: 100%; object-fit: cover; }
.photo-remove {
  position: absolute;
  top: 4px;
  right: 4px;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  border: none;
  cursor: pointer;
  font-size: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.coa-section { border-color: var(--gold); border-width: 2px; }

.coa-options { display: flex; flex-direction: column; gap: 12px; }
.coa-option {
  display: flex;
  gap: 14px;
  padding: 18px;
  border: 2px solid #d7dde6;
  border-radius: var(--radius);
  cursor: pointer;
  transition: border-color 0.2s, background 0.2s;
}
.coa-option.active {
  border-color: #f7ca00;
  background: #fff8d9;
}
.coa-option input { margin-top: 3px; accent-color: var(--gold); }
.coa-option h4 { font-family: 'Inter', sans-serif; font-size: 1rem; margin-bottom: 4px; }
.coa-option p { font-size: 0.85rem; color: #374151; }

.guarantee-box {
  padding: 20px;
  background: rgba(201, 168, 76, 0.06);
  border: 1px solid rgba(201, 168, 76, 0.2);
  border-radius: var(--radius);
}
.sell-notice {
  margin-bottom: 24px;
  padding: 18px 20px;
  border-radius: var(--radius-lg);
  border: 1px solid #f7ca00;
  background: #fff8d9;
  font-size: 0.92rem;
  line-height: 1.6;
  color: #1f2937;
  text-align: left;
}
.sell-notice a { color: var(--gold); text-decoration: underline; text-underline-offset: 3px; }
.guarantee-text {
  font-size: 0.9rem;
  color: #1f2937;
  line-height: 1.7;
}
.guarantee-text p { margin-bottom: 10px; }
.guarantee-check {
  display: flex;
  gap: 10px;
  align-items: flex-start;
  font-size: 0.85rem;
  color: #1f2937;
  cursor: pointer;
}
.guarantee-check input { margin-top: 3px; accent-color: var(--gold); }
.listing-type-selector {
  display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 24px;
}
.sale-format-selector {
  grid-template-columns: repeat(3, 1fr);
}
@media (max-width: 720px) {
  .sale-format-selector { grid-template-columns: 1fr; }
}
.listing-type-btn {
  display: flex; flex-direction: column; align-items: center; gap: 4px;
  padding: 20px 16px; border: 2px solid #d7dde6;
  border-radius: var(--radius-lg); background: #ffffff;
  cursor: pointer; transition: border-color 0.2s, background 0.2s; text-align: center;
  color: #1f2937; font-family: inherit;
}
.listing-type-btn:hover { border-color: #f7ca00; }
.listing-type-btn.active {
  border-color: #f7ca00; background: #fff8d9;
}
.mode-notice {
  margin: -6px 0 18px;
  padding: 10px 12px;
  border-radius: var(--radius);
  border: 1px solid #f7ca00;
  background: #fff8d9;
  color: #1f2937;
  font-weight: 700;
  font-size: 0.88rem;
}
.dropship-setup-banner {
  margin: 0 0 20px;
  padding: 16px 18px;
  border-radius: var(--radius-lg);
  border: 1px solid #9fd9ff;
  background: #effbff;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  font-size: 0.92rem;
  line-height: 1.5;
}
.dropship-setup-link { margin-left: 8px; font-weight: 600; }
.lt-icon { font-size: 1.8rem; }
.lt-label { font-weight: 700; font-size: 1rem; color: #111827; }
.lt-desc { font-size: 0.78rem; color: #4b5563; }
.dropship-section { border-color: var(--cyan); border-width: 2px; }
.dropship-notice {
  margin-top: 12px; padding: 12px 14px;
  background: #effbff; border: 1px solid #9fd9ff;
  border-radius: var(--radius); font-size: 0.85rem; color: #1f2937; line-height: 1.6;
}
.dropship-provider-card {
  margin-bottom: 14px;
  padding: 12px 14px;
  background: rgba(201, 168, 76, 0.08);
  border: 1px solid rgba(201, 168, 76, 0.25);
  border-radius: var(--radius);
}
.dropship-provider-name {
  margin: 0 0 4px;
  font-weight: 700;
  color: var(--gold);
}
.dropship-provider-link {
  display: inline-flex;
  margin-top: 6px;
  color: var(--gold-light);
  text-decoration: underline;
  text-underline-offset: 2px;
}
.dropship-provider-link:hover { color: var(--gold); }
.dropship-provider-channel {
  margin-top: 8px;
  font-size: 0.82rem;
  color: #1f2937;
}
.sell-owner-banner {
  display: flex; flex-wrap: wrap; align-items: center; gap: 10px;
  margin-bottom: 24px; padding: 18px 20px;
  border-radius: var(--radius-lg);
  border: 2px solid rgba(0, 245, 160, 0.35);
  background: linear-gradient(135deg, rgba(0, 245, 160, 0.08), rgba(201, 168, 76, 0.06));
  font-size: 0.92rem; line-height: 1.6; color: #111827;
}
.sell-owner-badge {
  display: inline-flex; align-items: center; gap: 4px;
  padding: 4px 12px; border-radius: 999px;
  font-size: 0.72rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.1em;
  background: rgba(201, 168, 76, 0.18); color: var(--gold); border: 1px solid rgba(201, 168, 76, 0.4);
}
</style>
