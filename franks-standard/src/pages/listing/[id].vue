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
          <div v-if="mayViewCoaDocument" class="coa-compare-panel" aria-label="Compare listing photo to COA">
            <p class="coa-compare-title">Compare item to COA close-up</p>
            <div class="coa-compare-grid">
              <figure>
                <img :src="listing.images[0]" alt="Listing cover photo" />
                <figcaption>Listing photo 1</figcaption>
              </figure>
              <figure>
                <img :src="listing.coaImageUrl" alt="Certificate of authenticity close-up" />
                <figcaption>COA close-up</figcaption>
              </figure>
            </div>
          </div>
        </div>

        <div class="listing-details">
          <span class="badge badge-gold">{{ listing.category }}</span>
          <span v-if="listing.saleType === 'auction'" class="badge badge-auction">
            {{ canBuyNow ? 'Auction + Buy It Now' : 'Live auction' }}
          </span>
          <h1>{{ listing.title }}</h1>

          <CoaFloorBond
            v-if="listing.coaType === 'franks_issued' && coaBond"
            :bond="coaBond"
            :floor-slot="listing.floorSlot || listing.coaSerial"
            :listing-id="listing.id"
            :serial="listing.coaSerial"
          />

          <FranksAuthenticitySeal
            v-if="showAuthenticitySeal"
            class="listing-seal-wrap"
            size="sm"
            :show-details="false"
            :lead="SEAL_LISTING_LEAD"
          />

          <div v-if="listing.coaType !== 'none'" class="listing-coa-box">
            <span class="coa-badge">{{ coaBadgeLabel }}</span>
            <p class="text-muted" style="font-size: 0.8rem; margin-top: 6px;">
              <template v-if="listing.coaType === 'franks_issued'">
                Franks COA with Seller Written Guarantee (serial
                <template v-if="listing.coaSerial">
                  <NuxtLink :to="`/verify/coa/${listing.coaSerial}`">{{ listing.coaSerial }}</NuxtLink>
                </template>
                <template v-else>pending</template>
                ) — digitally attached to this listing. <strong>The seller backs this item</strong>, not the Platform.
              </template>
              <template v-else-if="listing.coaType === 'upload'">
                Seller-uploaded COA on file. The seller backs this item; the Platform does not guarantee third-party COA content.
              </template>
              <template v-else>
                <strong>{{ listing.guaranteeName }}</strong> — legacy standalone guarantee (retired for new listings). The seller backs this item, not the Platform.
              </template>
            </p>
            <CoaSellerDisclosure v-if="listing.coaType === 'franks_issued' || listing.coaType === 'guarantee'" />
            <CoaBuyerAccess
              :coa-type="listing.coaType"
              :serial="listing.coaSerial"
              :listing-id="listing.id"
              :third-party-serial="listing.thirdPartyCoaSerial"
              :auth-status="listing.coaAuthStatus"
              :buyer-access-enabled="listing.coaBuyerAccessEnabled"
              :is-seller="isOwnListing"
              :is-buyer="isBuyerWithPaidOrder"
              :image-paths="listing.imagePaths"
              :description="listing.description"
              :cert-primary-image-path="listing.certPrimaryImagePath"
            />
          </div>
          <div v-else class="listing-coa-box listing-coa-box--general">
            <span class="coa-badge">General merchandise</span>
            <p class="text-muted" style="font-size: 0.8rem; margin-top: 6px;">
              Sold as described — accurate photos and condition notes. COA not required for this category.
            </p>
          </div>

          <p v-if="listing.integrityStatus === 'review'" class="integrity-warning" role="alert">
            This listing is under {{ SCREENING_LABEL }} review. Checkout is paused until cleared. Screening is not laboratory authentication.
          </p>

          <div class="listing-price-row">
            <template v-if="listing.saleType === 'auction'">
              <div class="auction-price-block">
                <span class="auction-price-label">{{ listing.currentBid != null ? 'Current bid' : 'Starting bid' }}</span>
                <span class="listing-price">${{ displayBid.toLocaleString() }}</span>
                <span v-if="auctionOpen" class="auction-time">{{ timeLeftLabel }}</span>
                <span v-else class="auction-time ended">Auction ended</span>
                <p v-if="listing.bidCount" class="text-muted small">{{ listing.bidCount }} bid{{ listing.bidCount === 1 ? '' : 's' }}</p>
                <p v-if="canBuyNow" class="buy-now-hint text-muted small">
                  Buy It Now: <strong>${{ listing.buyNowPrice.toLocaleString() }}</strong> (until first bid)
                </p>
              </div>
            </template>
            <template v-else>
              <span class="listing-price">${{ listing.price.toLocaleString() }}</span>
            </template>
            <span class="listing-condition badge badge-gold">{{ conditionLabel(listing.condition) }}</span>
          </div>

          <div v-if="listing.donateProceeds && listing.charityName" class="charity-banner" role="status">
            <span class="charity-banner-icon" aria-hidden="true">💚</span>
            <div>
              <strong>Charity sale</strong>
              <p class="text-muted small" style="margin: 4px 0 0;">
                <template v-if="listing.charityPercent >= 100">
                  100% of proceeds go to <strong>{{ listing.charityName }}</strong> after this sale completes.
                </template>
                <template v-else>
                  <strong>{{ listing.charityPercent }}%</strong> of proceeds go to <strong>{{ listing.charityName }}</strong>;
                  you keep the remainder (minus platform fees on your share).
                </template>
              </p>
            </div>
          </div>

          <p class="checkout-notice text-muted">
            <template v-if="listing.saleType === 'auction' && auctionOpen">
              <strong>Auction:</strong>
              Place a bid at or above the minimum shown below.
              <template v-if="canBuyNow">
                Or use <strong>Buy It Now</strong> for ${{ listing.buyNowPrice.toLocaleString() }} before anyone bids (escrow checkout).
              </template>
              Sales tax applies at checkout.
            </template>
            <template v-else-if="listing.saleType === 'auction' && !auctionOpen && isWinningBidder && reserveOk">
              <strong>You won this auction.</strong>
              Pay your winning bid through Stripe. Sales tax is added from your billing address.
            </template>
            <template v-else-if="listing.saleType === 'auction' && !auctionOpen">
              <strong>Auction closed.</strong>
              {{ auctionClosedMessage }}
            </template>
            <template v-else-if="listing.donateProceeds && listing.charityPercent >= 100">
              <strong>Secure checkout:</strong>
              Pay <strong>${{ listing.price.toLocaleString() }}</strong> through Stripe. Funds are held in escrow, then disbursed to the charity — not the seller.
            </template>
            <template v-else-if="listing.donateProceeds">
              <strong>Secure checkout:</strong>
              Pay <strong>${{ listing.price.toLocaleString() }}</strong> through Stripe.
              <strong>{{ listing.charityPercent }}%</strong> is earmarked for <strong>{{ listing.charityName }}</strong>; the seller receives the rest after fees.
            </template>
            <template v-else>
              <strong>Secure checkout:</strong>
              Listed price <strong>${{ listing.price.toLocaleString() }}</strong> is the item subtotal only.
              <strong>Sales tax is added at checkout</strong> from your billing address — your total may be higher than the list price.
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

          <p v-if="bidError" class="checkout-error" role="alert">{{ bidError }}</p>

          <div v-if="listing.saleType === 'auction' && auctionOpen && !isOwnListing" class="bid-box">
            <label class="label" for="bid-amount">Your bid (USD)</label>
            <div class="bid-row">
              <input
                id="bid-amount"
                v-model="bidAmount"
                class="input"
                type="number"
                :min="minBid"
                step="0.01"
                :placeholder="minBid.toFixed(2)"
              />
              <button
                type="button"
                class="btn btn-primary btn-lg"
                :disabled="bidLoading"
                @click="submitBid"
              >{{ bidLoading ? 'Placing bid…' : 'Place bid' }}</button>
            </div>
            <p class="text-muted small">Minimum bid: <strong>${{ minBid.toLocaleString() }}</strong></p>
          </div>

          <CheckoutOrderAcknowledgment
            v-if="showCheckoutAck"
            v-model:agreed="checkoutAckAgreed"
            v-model:serialized-agreed="checkoutSerializedAgreed"
            :has-serialized-coa="hasSerializedCoa"
          />

          <div class="listing-actions">
            <button
              v-if="listing.saleType !== 'auction'"
              type="button"
              class="btn btn-primary btn-lg"
              style="flex: 1;"
              :disabled="checkoutLoading || isOwnListing || listing.integrityStatus === 'review' || (coaBond && !coaBond.paired) || !checkoutReady"
              @click="buyNow"
            >{{ checkoutLoading ? 'Opening checkout…' : `Buy now — $${listing.price.toLocaleString()} + tax at checkout` }}</button>
            <button
              v-else-if="canBuyNow && !isOwnListing"
              type="button"
              class="btn btn-primary btn-lg"
              style="flex: 1;"
              :disabled="checkoutLoading || !checkoutReady"
              @click="buyNow"
            >{{ checkoutLoading ? 'Opening checkout…' : `Buy It Now — $${listing.buyNowPrice.toLocaleString()} + tax` }}</button>
            <button
              v-else-if="!auctionOpen && isWinningBidder && reserveOk"
              type="button"
              class="btn btn-primary btn-lg"
              style="flex: 1;"
              :disabled="checkoutLoading || !checkoutReady"
              @click="buyNow"
            >{{ checkoutLoading ? 'Opening checkout…' : `Pay winning bid — $${displayBid.toLocaleString()} + tax` }}</button>
            <button
              v-if="!isOwnListing"
              type="button"
              class="btn btn-outline btn-sm"
              @click="showReportModal = true"
            >Report authenticity concern</button>
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

    <ReportAuthenticityModal
      v-if="listing"
      :open="showReportModal"
      :listing-id="listing.id"
      @close="showReportModal = false"
    />

    <div v-if="showBuyerPolicyModal" class="buyer-policy-modal-backdrop" role="dialog" aria-modal="true">
      <div class="buyer-policy-modal">
        <BuyerPolicyAgreement @accepted="onBuyerPolicyAccepted" />
        <button type="button" class="btn btn-outline btn-sm modal-close" @click="showBuyerPolicyModal = false">Cancel</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { createRoomSlug } from '~/composables/useVideoRoom'
import {
  isAuctionOpen,
  minNextBid,
  formatAuctionTimeLeft,
  reserveMet,
  buyNowAvailable,
} from '~/utils/auctionHelpers.js'
import { listingShowsAuthenticitySeal, SCREENING_LABEL, SEAL_LISTING_LEAD } from '~/utils/authenticitySeal.js'
import {
  CHECKOUT_ACK_VERSION,
  checkoutAckTextForHash,
} from '~/utils/buyerCheckoutAcknowledgment.js'
import { sha256HexUtf8 } from '~/utils/sha256Browser.js'

const showAuthenticitySeal = computed(() => listingShowsAuthenticitySeal(listing.value))

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
const coaBond = ref(null)
const isBuyerWithPaidOrder = ref(false)
const showReportModal = ref(false)

const mayViewCoaDocument = computed(() => {
  if (!listing.value?.coaImageUrl) return false
  if (isOwnListing.value) return true
  return isBuyerWithPaidOrder.value && listing.value.coaBuyerAccessEnabled
})

const coaBadgeLabel = computed(() => {
  if (!listing.value) return ''
  if (listing.value.coaType === 'none') return 'General merchandise'
  if (listing.value.coaType === 'franks_issued') return 'Franks COA template'
  if (listing.value.coaType === 'upload') return 'Seller COA on file'
  return 'Seller Authenticity Guarantee'
})
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
const { loading: bidLoading, error: bidError, placeBid } = usePlaceBid()
const { needsAcceptance, loadStatus: loadBuyerPolicyStatus } = useBuyerPolicyAcceptance()

const checkoutAckAgreed = ref(false)
const checkoutSerializedAgreed = ref(false)
const showBuyerPolicyModal = ref(false)

const hasSerializedCoa = computed(() => listing.value?.coaType === 'franks_issued')
const showCheckoutAck = computed(() => !!user.value?.id && !isOwnListing.value && !!listing.value)
const checkoutReady = computed(() => {
  if (!showCheckoutAck.value) return true
  if (!checkoutAckAgreed.value) return false
  if (hasSerializedCoa.value && !checkoutSerializedAgreed.value) return false
  return true
})

const bidAmount = ref('')
const timeLeftLabel = ref('')
let auctionTimer = null

const auctionOpen = computed(() => isAuctionOpen(listing.value))
const canBuyNow = computed(() => buyNowAvailable(listing.value))
const minBid = computed(() => (listing.value ? minNextBid(listing.value) : 0))
const displayBid = computed(() => {
  if (!listing.value) return 0
  return listing.value.currentBid != null ? listing.value.currentBid : listing.value.startingBid ?? listing.value.price
})
const reserveOk = computed(() => reserveMet(listing.value))
const isWinningBidder = computed(() => {
  const uid = user.value?.id
  return !!(uid && listing.value?.currentBidderId && uid === listing.value.currentBidderId)
})
const auctionClosedMessage = computed(() => {
  if (!listing.value || listing.value.saleType !== 'auction') return ''
  if (!listing.value.bidCount) return 'No bids were placed.'
  if (!reserveOk.value) return 'Reserve was not met — seller may relist; winning bidders must checkout on-platform only.'
  if (isWinningBidder.value) return 'You have the winning bid — pay above to complete checkout.'
  return 'Another bidder won this auction.'
})

function refreshAuctionClock () {
  if (!listing.value?.auctionEndsAt) {
    timeLeftLabel.value = ''
    return
  }
  timeLeftLabel.value = formatAuctionTimeLeft(listing.value.auctionEndsAt)
}

async function submitBid () {
  const id = (route.params.id || '').toString()
  if (!id || !listing.value) return
  const amount = Number(bidAmount.value || minBid.value)
  const result = await placeBid(id, amount)
  if (result?.current_bid != null) {
    listing.value.currentBid = Number(result.current_bid)
    listing.value.bidCount = result.bid_count ?? listing.value.bidCount
    listing.value.currentBidderId = result.current_bidder_id
    bidAmount.value = String(result.minimum_next_bid ?? minNextBid(listing.value))
  }
}

async function buyNow () {
  const id = (route.params.id || '').toString()
  if (!id) return

  const { data: { session } } = await supabase.auth.getSession()
  if (!session) {
    await startCheckout(id)
    return
  }

  await loadBuyerPolicyStatus()
  if (needsAcceptance.value) {
    showBuyerPolicyModal.value = true
    return
  }

  if (!checkoutReady.value) {
    checkoutError.value = hasSerializedCoa.value
      ? 'Check both checkout acknowledgment boxes before paying.'
      : 'Check the checkout acknowledgment box before paying.'
    return
  }

  const ackHash = sha256HexUtf8(checkoutAckTextForHash({ hasSerializedCoa: hasSerializedCoa.value }))
  await startCheckout(id, {
    ackVersion: CHECKOUT_ACK_VERSION,
    ackHash,
    serializedCoaSerial: hasSerializedCoa.value ? (listing.value?.coaSerial || null) : null,
  })
}

function onBuyerPolicyAccepted () {
  showBuyerPolicyModal.value = false
  buyNow()
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
    .select('id, title, description, category, price, condition, coa_type, coa_storage_path, coa_serial_number, coa_document_serial, floor_slot_code, coa_certificate_id, coa_auth_status, coa_buyer_access_enabled, third_party_coa_serial, guarantee_signed, seller_legal_name, image_paths, status, integrity_status, created_at, seller_id, donate_proceeds, charity_key, charity_name, charity_percent, sale_type, starting_bid, current_bid, current_bidder_id, bid_increment, bid_count, reserve_price, auction_ends_at, buy_now_price, seller:profiles!listings_seller_id_fkey(full_name, created_at)')
    .eq('id', id)
    .eq('status', 'published')
    .maybeSingle()

  if (error || !data) {
    loading.value = false
    return
  }

  const integrity = data.integrity_status || 'clear'
  if (integrity === 'suspended' || integrity === 'counterfeit_confirmed') {
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
    coaImageUrl: data.coa_storage_path ? publicUrlForPath(data.coa_storage_path) : null,
    coaSerial: data.coa_serial_number || data.coa_document_serial || '',
    floorSlot: data.floor_slot_code || data.coa_serial_number || '',
    coaCertificateId: data.coa_certificate_id || null,
    coaAuthStatus: data.coa_auth_status || 'none',
    coaBuyerAccessEnabled: !!data.coa_buyer_access_enabled,
    thirdPartyCoaSerial: data.third_party_coa_serial || '',
    imagePaths: paths,
    certPrimaryImagePath: '',
    integrityStatus: integrity,
    guaranteeName: data.seller_legal_name,
    images,
    profileName: data.seller && data.seller.full_name,
    sellerMemberSince: data.seller ? memberSince(data.seller.created_at) : '',
    donateProceeds: !!data.donate_proceeds,
    charityName: data.charity_name || '',
    charityPercent: data.donate_proceeds
      ? Math.min(100, Math.max(1, Number(data.charity_percent ?? 100)))
      : 0,
    saleType: data.sale_type || 'fixed',
    startingBid: data.starting_bid != null ? Number(data.starting_bid) : null,
    currentBid: data.current_bid != null ? Number(data.current_bid) : null,
    currentBidderId: data.current_bidder_id,
    bidIncrement: data.bid_increment != null ? Number(data.bid_increment) : 1,
    bidCount: data.bid_count ?? 0,
    reservePrice: data.reserve_price != null ? Number(data.reserve_price) : null,
    auctionEndsAt: data.auction_ends_at,
    buyNowPrice: data.buy_now_price != null ? Number(data.buy_now_price) : null,
  }
  bidAmount.value = String(minNextBid(listing.value))
  if (data.coa_type === 'upload' && data.coa_certificate_id) {
    const { data: cert } = await supabase
      .from('coa_certificates')
      .select('primary_image_path')
      .eq('id', data.coa_certificate_id)
      .maybeSingle()
    if (cert && listing.value) {
      listing.value.certPrimaryImagePath = cert.primary_image_path || ''
    }
  }
  coaBond.value = null
  if (data.coa_type === 'franks_issued' && data.coa_certificate_id) {
    const { evaluateCoaListingBond } = await import('~/utils/coaListingBond.js')
    const { data: cert } = await supabase
      .from('coa_certificates')
      .select('id, serial_number, listing_id, status, image_fingerprint, description_excerpt, primary_image_path')
      .eq('id', data.coa_certificate_id)
      .maybeSingle()
    if (cert) {
      if (listing.value) {
        listing.value.certPrimaryImagePath = cert.primary_image_path || ''
      }
      coaBond.value = evaluateCoaListingBond(
        { ...data, image_paths: paths },
        cert,
      )
    }
  }
  refreshAuctionClock()
  if (auctionTimer) clearInterval(auctionTimer)
  auctionTimer = setInterval(refreshAuctionClock, 30000)
  isBuyerWithPaidOrder.value = false
  const uid = user.value?.id
  if (uid && uid !== data.seller_id) {
    const { data: paidOrder } = await supabase
      .from('orders')
      .select('id')
      .eq('listing_id', data.id)
      .eq('buyer_id', uid)
      .eq('status', 'paid')
      .limit(1)
      .maybeSingle()
    isBuyerWithPaidOrder.value = !!paidOrder?.id
  }
  useSeoMeta({ title: `${data.title} — The Franks Standard` })
  loading.value = false
}

onMounted(() => {
  load()
  if (user.value?.id) loadBuyerPolicyStatus()
})
watch(user, (u) => {
  if (u?.id) loadBuyerPolicyStatus()
})
onUnmounted(() => {
  if (auctionTimer) clearInterval(auctionTimer)
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
.integrity-warning {
  padding: 10px 14px;
  background: #fef3c7;
  border: 1px solid #d97706;
  border-radius: 8px;
  font-size: 0.88rem;
  font-weight: 600;
  margin-bottom: 12px;
}
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
.badge-auction {
  margin-left: 8px;
  background: rgba(255, 120, 0, 0.15);
  color: #ea580c;
  border: 1px solid rgba(234, 88, 12, 0.35);
}
.auction-price-block { display: flex; flex-direction: column; gap: 4px; }
.auction-price-label { font-size: 0.78rem; text-transform: uppercase; letter-spacing: 0.08em; color: #6b7280; font-weight: 700; }
.auction-time { font-size: 0.88rem; font-weight: 700; color: #047857; }
.auction-time.ended { color: #b45309; }
.buy-now-hint { margin-top: 4px; color: #047857; }
.listing-actions { display: flex; flex-wrap: wrap; gap: 10px; }
.bid-box {
  margin-bottom: 14px;
  padding: 14px;
  border-radius: 10px;
  border: 1px solid rgba(201, 168, 76, 0.35);
  background: rgba(201, 168, 76, 0.06);
}
.bid-row { display: flex; gap: 10px; flex-wrap: wrap; align-items: stretch; }
.bid-row .input { flex: 1; min-width: 120px; }
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
.listing-seal-wrap { margin-bottom: 12px; }
.coa-compare-panel {
  margin-top: 14px;
  padding: 12px;
  border-radius: var(--radius);
  border: 1px solid rgba(201, 168, 76, 0.35);
  background: rgba(201, 168, 76, 0.08);
}
.coa-compare-title {
  font-size: 0.82rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--gold);
  margin: 0 0 10px;
}
.coa-compare-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}
.coa-compare-grid figure { margin: 0; }
.coa-compare-grid img {
  width: 100%;
  aspect-ratio: 1;
  object-fit: cover;
  border-radius: 8px;
  border: 1px solid var(--stone-700);
}
.coa-compare-grid figcaption {
  font-size: 0.72rem;
  color: var(--stone-300);
  margin-top: 4px;
  text-align: center;
}

.buyer-policy-modal-backdrop {
  position: fixed;
  inset: 0;
  z-index: 2000;
  background: rgba(0, 0, 0, 0.65);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}
.buyer-policy-modal {
  max-width: 640px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  background: var(--stone-950, #0f0f0f);
  border-radius: var(--radius-lg);
  padding: 8px 8px 16px;
}
.buyer-policy-modal .modal-close { margin: 8px 12px 0; }

@media (max-width: 768px) {
  .listing-layout { grid-template-columns: 1fr; }
}
</style>
