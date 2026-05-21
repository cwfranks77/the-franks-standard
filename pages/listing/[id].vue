<template>
  <div class="listing-page">
    <div v-if="loading" class="container" style="padding: 3rem; text-align: center;">
      <p class="text-muted">Loading listing…</p>
    </div>
    <div v-else-if="!listing" class="container" style="padding: 3rem; text-align: center;">
      <h2>Listing not found</h2>
      <p class="text-muted mt-1">It may be unpublished or removed.</p>
      <NuxtLink to="/browse" class="btn btn-outline btn-sm mt-2">Back to browse</NuxtLink>
    </div>
    <div v-else class="container">
      <div class="listing-layout">
        <div class="listing-images">
          <div class="main-image">
            <img :src="listing.images[selectedImage] || '/img/hero-showcase-v2.svg'" :alt="listing.title" />
          </div>
          <div class="image-thumbs" v-if="listing.images.length > 1">
            <button
              v-for="(img, idx) in listing.images"
              :key="idx"
              class="thumb"
              type="button"
              :class="{ active: idx === selectedImage }"
              @click="selectedImage = idx"
            >
              <img :src="img" alt="" />
            </button>
          </div>
        </div>

        <div class="listing-details">
          <span class="badge badge-gold">{{ listing.category }}</span>
          <h1>{{ listing.title }}</h1>

          <div class="listing-coa-box">
            <span class="coa-badge">{{ listing.coaType === 'upload' ? 'COA document on file' : 'Franks Standard guarantee' }}</span>
            <p class="text-muted" style="font-size: 0.8rem; margin-top: 6px;">
              <template v-if="listing.coaType === 'upload'">
                Seller provided a COA. Details may be in photos or the COA file on file with the team.
              </template>
              <template v-else>
                {{ listing.guaranteeName }} is named on the in-platform guarantee for this listing.
              </template>
            </p>
          </div>

          <div class="listing-price-row">
            <span class="listing-price">${{ listing.price.toLocaleString() }}</span>
            <span class="listing-condition badge badge-gold">{{ conditionLabel(listing.condition) }}</span>
          </div>

          <div v-if="listing.donateProceeds && listing.charityName" class="charity-banner" role="status">
            <span class="charity-banner-icon" aria-hidden="true">💚</span>
            <div>
              <strong>Charity sale</strong>
              <p class="text-muted small" style="margin: 4px 0 0;">
                100% of proceeds go to <strong>{{ listing.charityName }}</strong> after this sale completes.
              </p>
            </div>
          </div>

          <p class="checkout-notice text-muted">
            <template v-if="listing.donateProceeds">
              <strong>Secure checkout:</strong>
              Pay <strong>${{ listing.price.toLocaleString() }}</strong> through Stripe. Funds are held in escrow, then disbursed to the charity — not the seller.
            </template>
            <template v-else>
              <strong>Secure checkout:</strong>
              Pay <strong>${{ listing.price.toLocaleString() }}</strong> through Stripe; sales tax (if any) is calculated from your shipping address at checkout.
              Funds stay in escrow until you confirm delivery.
              <NuxtLink to="/how-it-works">How escrow works</NuxtLink>
            </template>
          </p>

          <p v-if="checkoutCancelled" class="checkout-notice-banner" role="status">
            Checkout was cancelled. You can try again when ready.
          </p>

          <p v-if="isOwnListing" class="checkout-notice-banner checkout-own-listing" role="status">
            <strong>This is your listing.</strong> Buyers use Buy now after signing in with another account. Share this page link to sell.
          </p>

          <p v-if="checkoutError" class="checkout-error" role="alert">{{ checkoutError }}</p>

          <div class="listing-actions">
            <button
              type="button"
              class="btn btn-primary btn-lg"
              style="flex: 1;"
              :disabled="checkoutLoading || isOwnListing"
              @click="buyNow"
            >{{ checkoutLoading ? 'Opening checkout…' : `Buy now — $${listing.price.toLocaleString()}` }}</button>
            <a
              :href="messageSellerHref"
              class="btn btn-outline btn-lg"
            >Message seller</a>
            <NuxtLink class="btn btn-outline btn-lg" :to="videoMeetLink">Video call</NuxtLink>
            <button class="btn btn-dark btn-lg" type="button" @click="shareListing" :title="shareTooltip">
              {{ shareCopied ? 'Link copied!' : 'Share' }}
            </button>
          </div>

          <div class="listing-description mt-3">
            <h3>Description</h3>
            <p>{{ listing.description }}</p>
          </div>

          <div class="seller-info mt-3">
            <h3>Seller</h3>
            <div class="seller-card">
              <div class="seller-avatar">{{ displayInitial(listing) }}</div>
              <div>
                <p class="seller-name">{{ displaySellerName(listing) }}</p>
                <p v-if="listing.sellerMemberSince" class="text-muted" style="font-size: 0.8rem;">Member since {{ listing.sellerMemberSince }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { createRoomSlug } from '~/composables/useVideoRoom'

const route = useRoute()
const supabase = useSupabaseClient()
const user = useSupabaseUser()
const { publicUrlForPath } = useListingImageUrl()

const checkoutCancelled = computed(() => route.query.checkout === 'cancelled')
const isOwnListing = computed(() => {
  const uid = user.value?.id
  const sellerId = listing.value?.sellerId
  return !!(uid && sellerId && uid === sellerId)
})

const selectedImage = ref(0)
const loading = ref(true)
const listing = ref(null)
const shareCopied = ref(false)
let shareTimer = null

const shareTooltip = computed(() =>
  listing.value ? `Share "${listing.value.title}"` : 'Share this listing'
)

async function shareListing () {
  const url = window.location.href
  const title = listing.value ? listing.value.title : 'Check out this listing'
  if (navigator.share) {
    try {
      await navigator.share({ title: `${title} — The Franks Standard`, url })
      return
    } catch { /* user cancelled or unsupported — fall through to clipboard */ }
  }
  try {
    await navigator.clipboard.writeText(url)
    shareCopied.value = true
    if (shareTimer) clearTimeout(shareTimer)
    shareTimer = setTimeout(() => { shareCopied.value = false }, 2500)
  } catch { /* clipboard not available */ }
}

const { loading: checkoutLoading, error: checkoutError, startCheckout } = useMarketplaceCheckout()

async function buyNow () {
  const id = (route.params.id || '').toString()
  if (id) await startCheckout(id)
}

const messageSellerHref = computed(() => {
  const title = listing.value ? listing.value.title : 'Listing'
  const id = (route.params.id || '').toString()
  const subject = encodeURIComponent(`Question about: ${title}`)
  const body = encodeURIComponent(
    `Hi,\n\nI have a question about your listing "${title}" (ID: ${id}) on The Franks Standard.\n\n`
  )
  return `mailto:info@thefranksstandard.com?subject=${subject}&body=${body}`
})

const videoRoom = ref(createRoomSlug())
const videoMeetLink = computed(() => {
  const id = (route.params.id || '').toString() || 'listing'
  return { path: `/video/r/${videoRoom.value}`, query: { n: `Listing ${id}` } }
})

function conditionLabel(c) {
  if (!c) {
    return ''
  }
  return c.replace(/-/g, ' ')
}

function displayInitial(row) {
  const n = displaySellerName(row)
  return n ? n.charAt(0).toUpperCase() : 'S'
}

function displaySellerName(row) {
  if (row.coaType === 'guarantee' && row.guaranteeName) {
    return row.guaranteeName
  }
  return row.profileName || 'Seller'
}

function memberSince(createdAt) {
  if (!createdAt) {
    return ''
  }
  const d = new Date(createdAt)
  if (Number.isNaN(d.getTime())) {
    return ''
  }
  return d.toLocaleString('en-US', { month: 'long', year: 'numeric' })
}

async function load() {
  loading.value = true
  listing.value = null
  selectedImage.value = 0
  const id = (route.params.id || '').toString()
  if (!id) {
    loading.value = false
    return
  }

  const { data, error } = await supabase
    .from('listings')
    .select('id, title, description, category, price, condition, coa_type, guarantee_signed, seller_legal_name, image_paths, status, created_at, seller_id, donate_proceeds, charity_key, charity_name, seller:profiles(full_name, created_at)')
    .eq('id', id)
    .eq('status', 'published')
    .maybeSingle()

  if (error || !data) {
    loading.value = false
    return
  }

  const paths = data.image_paths || []
  let images = paths.map((p) => publicUrlForPath(p))
  if (!images.length) {
    images = ['/img/hero-showcase-v2.svg']
  }

  listing.value = {
    id: data.id,
    sellerId: data.seller_id,
    title: data.title,
    description: data.description,
    category: data.category,
    price: Number(data.price),
    condition: data.condition,
    coaType: data.coa_type,
    guaranteeName: data.seller_legal_name,
    images,
    profileName: data.seller && data.seller.full_name,
    sellerMemberSince: data.seller ? memberSince(data.seller.created_at) : '',
    donateProceeds: !!data.donate_proceeds,
    charityName: data.charity_name || '',
  }
  useSeoMeta({ title: `${data.title} — The Franks Standard` })
  loading.value = false
}

onMounted(() => {
  load()
})
watch(
  () => route.params.id,
  () => {
    load()
  },
)
</script>

<style scoped>
.listing-page { padding: 40px 0; }
.listing-layout { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; }

.main-image {
  aspect-ratio: 1;
  background: var(--stone-900);
  border-radius: var(--radius-lg);
  overflow: hidden;
  border: 1px solid var(--stone-800);
}
.main-image img { width: 100%; height: 100%; object-fit: cover; }
.image-thumbs { display: flex; gap: 8px; margin-top: 10px; }
.thumb {
  width: 70px;
  height: 70px;
  border-radius: var(--radius);
  overflow: hidden;
  border: 2px solid var(--stone-700);
  cursor: pointer;
  background: none;
  padding: 0;
}
.thumb.active { border-color: var(--gold); }
.thumb img { width: 100%; height: 100%; object-fit: cover; }

.listing-details h1 { font-size: 1.6rem; margin: 12px 0 16px; }
.listing-coa-box {
  padding: 14px;
  background: rgba(46, 204, 113, 0.06);
  border: 1px solid rgba(46, 204, 113, 0.2);
  border-radius: var(--radius);
  margin-bottom: 20px;
}
.listing-price-row {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
}
.listing-price { font-size: 2rem; font-weight: 700; color: var(--gold); font-family: 'Cinzel', serif; }
.checkout-notice {
  font-size: 0.85rem; line-height: 1.55; margin-bottom: 14px;
  padding: 12px 14px; background: rgba(201, 168, 76, 0.08);
  border: 1px solid rgba(201, 168, 76, 0.25); border-radius: var(--radius);
}
.checkout-notice a { color: var(--gold); font-weight: 600; }
.checkout-error {
  color: #fecaca;
  background: rgba(185, 28, 28, 0.2);
  border: 1px solid rgba(248, 113, 113, 0.45);
  border-radius: 10px;
  padding: 10px 14px;
  font-size: 0.9rem;
  margin-bottom: 12px;
}
.checkout-notice-banner {
  font-size: 0.88rem;
  margin-bottom: 12px;
  padding: 10px 14px;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.1);
}
.checkout-own-listing { border-color: rgba(255, 216, 77, 0.35); }
.charity-banner {
  display: flex;
  gap: 12px;
  align-items: flex-start;
  margin: 12px 0;
  padding: 12px 14px;
  border-radius: 10px;
  background: rgba(0, 245, 160, 0.08);
  border: 1px solid rgba(0, 245, 160, 0.35);
}
.charity-banner-icon { font-size: 1.4rem; line-height: 1; }
.listing-actions { display: flex; flex-wrap: wrap; gap: 12px; }
.listing-description h3, .seller-info h3 {
  font-size: 1rem;
  margin-bottom: 8px;
  color: var(--gold);
}
.listing-description p { color: #374151; font-size: 0.9rem; line-height: 1.7; font-weight: 600; }
.seller-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px;
  background: var(--stone-900);
  border: 1px solid var(--stone-800);
  border-radius: var(--radius);
}
.seller-avatar {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: var(--gold);
  color: var(--stone-950);
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: 'Cinzel', serif;
  font-weight: 700;
  font-size: 1.2rem;
}
.seller-name { font-weight: 600; }

@media (max-width: 768px) {
  .listing-layout { grid-template-columns: 1fr; }
}
</style>
