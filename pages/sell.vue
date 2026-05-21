<template>
  <div class="sell-page">
    <div class="container">
      <div class="sell-wrapper">
        <div class="sell-header text-center">
          <h1>Sell on The Franks Standard</h1>
          <p class="text-muted">List your authentic items. COA or signed guarantee required — that is what makes us different.</p>
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
                <label class="label">Price ($)</label>
                <input class="input" type="number" min="1" step="0.01" v-model="form.price" placeholder="0.00" required />
              </div>
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

          <!-- Dropship details -->
          <div v-if="listingMode === 'dropship'" class="form-section dropship-section">
            <h2>Dropship Details</h2>
            <p class="text-muted mb-2">Provide supplier information. The buyer's address will be shared with your supplier for direct fulfillment.</p>

            <div class="form-group">
              <label class="label">Dropship Provider</label>
              <select class="select" v-model="dropship.providerKey">
                <option value="">Custom / Private Supplier</option>
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

            <div class="form-group">
              <label class="label">Supplier SKU (Doba / automated feeds)</label>
              <input
                class="input"
                v-model="dropship.supplierSku"
                :required="listingMode === 'dropship' && dropship.providerKey === 'doba'"
                placeholder="e.g. DOBA-12345"
              />
              <p v-if="dropship.providerKey === 'doba'" class="text-muted small mt-1">
                Doba automation requires a supplier SKU so order line items can be forwarded automatically.
              </p>
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

const dropshipProviders = [
  {
    key: 'inventory-source',
    name: 'Inventory Source',
    website: 'https://www.inventorysource.com/',
    contactEmail: 'support@inventorysource.com',
    note: 'Supplier directory + inventory/order automation.',
  },
  {
    key: 'spocket',
    name: 'Spocket',
    website: 'https://www.spocket.co/',
    contactEmail: 'support@spocket.co',
    note: 'US/EU suppliers and ecommerce integrations.',
  },
  {
    key: 'syncee',
    name: 'Syncee',
    website: 'https://syncee.com/',
    contactEmail: 'support@syncee.com',
    note: 'Marketplace network with automated product sync.',
  },
  {
    key: 'doba',
    name: 'Doba',
    website: 'https://www.doba.com/',
    contactEmail: 'support@doba.com',
    note: 'Catalog and fulfillment workflows for dropship sellers.',
  },
  {
    key: 'zendrop',
    name: 'Zendrop',
    website: 'https://www.zendrop.com/',
    contactEmail: 'support@zendrop.com',
    note: 'Fast-ship programs and branded package options.',
  },
  {
    key: 'cjdropshipping',
    name: 'CJdropshipping',
    website: 'https://cjdropshipping.com/',
    contactEmail: 'support@cjdropshipping.com',
    note: 'Global sourcing and fulfillment with warehouse options.',
  },
]

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

const dropship = reactive({
  providerKey: '',
  salesChannelKey: 'the-franks-standard',
  supplierName: '',
  supplierEmail: '',
  supplierSku: '',
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

onMounted(() => {
  const mode = String(route.query.mode || '').toLowerCase()
  if (mode === 'dropship') {
    listingMode.value = 'dropship'
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
    ? 'Dropship mode is active. Fill in supplier details below.'
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
  if (listingMode.value === 'dropship' && dropship.providerKey === 'doba' && !String(dropship.supplierSku || '').trim()) {
    alert('Doba dropship listings require Supplier SKU before publishing.')
    return
  }
  submitting.value = true
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      await navigateTo({ path: '/auth/login', query: { redirect: '/sell' } })
      return
    }
    const { data: row, error: insErr } = await supabase
      .from('listings')
      .insert({
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
        listing_mode: listingMode.value,
        dropship_provider_key: listingMode.value === 'dropship' ? (dropship.providerKey || null) : null,
        dropship_provider_name: listingMode.value === 'dropship' ? (selectedDropshipProvider.value?.name || null) : null,
        dropship_sales_channel_key: listingMode.value === 'dropship' ? (dropship.salesChannelKey || 'the-franks-standard') : null,
        dropship_supplier_name: listingMode.value === 'dropship' ? (dropship.supplierName.trim() || null) : null,
        dropship_supplier_email: listingMode.value === 'dropship' ? (dropship.supplierEmail.trim() || null) : null,
        dropship_supplier_sku: listingMode.value === 'dropship' ? (dropship.supplierSku.trim() || null) : null,
        dropship_ship_time: listingMode.value === 'dropship' ? (dropship.shipTime || null) : null,
        dropship_ships_from: listingMode.value === 'dropship' ? (dropship.shipsFrom.trim() || null) : null,
        status: 'published',
      })
      .select('id')
      .single()

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
