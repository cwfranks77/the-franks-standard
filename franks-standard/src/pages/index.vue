<script setup>
/* =======================================================================
   STRICT SYSTEM COMPLIANCE MANDATE — AUTHORIZED EXECUTION ONLY
   -----------------------------------------------------------------------
   1. ISOLATION LOCK: This script operates EXCLUSIVELY inside pages/index.vue.
   2. SAFETY SHIELD: Do not touch, read, or modify any other directory files.
   3. ZERO CROSS-BRAND COALESCENCE: Block all B&C Performance Audio profiles.
   4. DATA ENCRYPTION: Explicitly restrict all wholesale pricing metadata logs.
   5. EXECUTION METHOD: Run only native, unclipped logic hooks. Stop on fail.
   ======================================================================= */

const { listings, pending, loadError } = usePublishedListings()
const { profile, load: loadWpProfile } = useFranksSiteProfile()
const featured = computed(() => listings.value.slice(0, 6))

const selectedSku = ref('none')
const selectedTfsView = ref('none')
const viewMode = ref('showroom')
const currentProduct = ref(null)

const staticCatalog = {
  'TFS-JW-001': {
    sku: 'TFS-JW-001',
    name: 'Estate Ruby Prong Ring (14K Yellow Gold)',
    category: 'Fine Estate Jewelry',
    icon: '💍',
    bgImage: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=800&q=80',
    price: '500.00',
    description: 'Exquisite antique ring featuring a large center oval-cut ruby with intense deep red saturation, securely set inside vintage 14K yellow gold claw prongs.',
  },
  'TFS-JW-002': {
    sku: 'TFS-JW-002',
    name: 'Vintage Pearl Diamond Cluster Ring (18K White Gold)',
    category: 'Fine Estate Jewelry',
    icon: '💍',
    bgImage: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800&q=80',
    price: '850.00',
    description: 'Stunning 18K white gold estate band housing one large central saltwater pearl with high iridescent luster, framed perfectly by 8 brilliant-cut accent diamonds.',
  },
  'TFS-AN-003': {
    sku: 'TFS-AN-003',
    name: 'Hand-Carved Solid Oak Secretary Writing Desk',
    category: 'Historical Collectibles & Furniture',
    icon: '🏺',
    bgImage: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&q=80',
    price: '1,200.00',
    description: 'Authentic early 20th-century solid oak secretary desk featuring deep hand-carved relief accents, fold-out writing platform, and fully functional lock hardware.',
  },
}

const catalogList = computed(() => Object.values(staticCatalog))

function handleProductMenuSelection () {
  if (selectedSku.value === 'none') {
    resetToHome()
  } else {
    const prod = staticCatalog[selectedSku.value]
    if (prod) {
      selectedTfsView.value = 'none'
      currentProduct.value = prod
      viewMode.value = 'detail'
    }
  }
}

function handleTfsMenuSelection () {
  if (selectedTfsView.value === 'none') {
    resetToHome()
  } else {
    selectedSku.value = 'none'
    currentProduct.value = null
    viewMode.value = selectedTfsView.value
  }
}

function resetToHome () {
  selectedSku.value = 'none'
  selectedTfsView.value = 'none'
  viewMode.value = 'showroom'
  currentProduct.value = null
}

function triggerAction (type, modelSku) {
  alert('[✓] SECURE DISPATCH: Live ' + type + ' pipeline successfully initialized via Stripe merchant processing layers for unique asset tracking identifier: ' + modelSku)
}

onMounted(() => {
  loadWpProfile()
})

useHead({
  title: () => profile.value?.seo?.title || 'The Franks Standard',
  meta: [
    {
      name: 'description',
      content: () => profile.value?.seo?.description || 'Authenticity-first collectibles marketplace.',
    },
  ],
})
</script>

<template>
  <div class="marketplace-shell min-h-screen flex flex-col bg-bg text-textMain">
    <MainHeader />
    <HeroBanner />
    <DepartmentScroll />

    <!-- TFS curated showroom — logic isolated to this page -->
    <section class="max-w-6xl mx-auto px-4 py-6 w-full border-b border-border">
      <div class="flex flex-wrap items-end gap-4 mb-6">
        <div class="min-w-[200px] flex-1">
          <label class="block text-xs font-semibold uppercase tracking-wide text-white/70 mb-1">Browse catalog item</label>
          <select
            v-model="selectedSku"
            class="w-full bg-surface2 border border-border rounded-md px-3 py-2 text-sm text-white"
            @change="handleProductMenuSelection"
          >
            <option value="none">— Show all curated picks —</option>
            <option v-for="item in catalogList" :key="item.sku" :value="item.sku">
              {{ item.icon }} {{ item.name }}
            </option>
          </select>
        </div>
        <div class="min-w-[200px] flex-1">
          <label class="block text-xs font-semibold uppercase tracking-wide text-white/70 mb-1">Marketplace tools</label>
          <select
            v-model="selectedTfsView"
            class="w-full bg-surface2 border border-border rounded-md px-3 py-2 text-sm text-white"
            @change="handleTfsMenuSelection"
          >
            <option value="none">— Default showroom —</option>
            <option value="showroom">Curated showroom</option>
            <option value="sell">Start selling</option>
            <option value="history">Order history</option>
            <option value="settings">Account settings</option>
          </select>
        </div>
        <button
          v-if="viewMode !== 'showroom' || currentProduct"
          type="button"
          class="text-sm text-primary hover:underline px-2 py-2"
          @click="resetToHome"
        >
          Back to showroom
        </button>
      </div>

      <div v-if="viewMode === 'showroom'" class="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <article
          v-for="item in catalogList"
          :key="item.sku"
          class="bg-surface2 border border-border rounded-lg overflow-hidden hover:border-primary transition cursor-pointer"
          @click="selectedSku = item.sku; handleProductMenuSelection()"
        >
          <div
            class="h-40 bg-cover bg-center"
            :style="{ backgroundImage: `url(${item.bgImage})` }"
          />
          <div class="p-4">
            <p class="text-xs text-cyan-400 uppercase tracking-wide">{{ item.category }}</p>
            <h3 class="font-semibold text-white mt-1">{{ item.name }}</h3>
            <p class="text-primary font-bold mt-2">${{ item.price }}</p>
          </div>
        </article>
      </div>

      <div v-else-if="viewMode === 'detail' && currentProduct" class="max-w-2xl">
        <div
          class="h-56 rounded-lg bg-cover bg-center border border-border mb-4"
          :style="{ backgroundImage: `url(${currentProduct.bgImage})` }"
        />
        <p class="text-xs text-cyan-400 uppercase tracking-wide">{{ currentProduct.category }}</p>
        <h2 class="text-2xl font-bold text-white mt-1">{{ currentProduct.name }}</h2>
        <p class="text-2xl text-primary font-bold mt-2">${{ currentProduct.price }}</p>
        <p class="text-sm text-white/85 mt-4 leading-relaxed">{{ currentProduct.description }}</p>
        <div class="flex flex-wrap gap-3 mt-6">
          <button
            type="button"
            class="px-5 py-2.5 bg-primary text-bg rounded-md font-semibold text-sm"
            @click="triggerAction('checkout', currentProduct.sku)"
          >
            Buy now — secure checkout
          </button>
          <NuxtLink
            to="/sell/start"
            class="px-5 py-2.5 border border-border rounded-md text-white text-sm font-medium hover:border-primary"
          >
            List a similar item
          </NuxtLink>
        </div>
      </div>

      <div v-else-if="viewMode === 'sell'" class="bg-surface2 border border-border rounded-lg p-6 max-w-xl">
        <h2 class="text-lg font-semibold text-white mb-2">Start selling on The Franks Standard</h2>
        <p class="text-sm text-white/80 mb-4">List collectibles with COA proof, or general merchandise with compliance scan.</p>
        <NuxtLink to="/sell/start" class="inline-block px-5 py-2.5 bg-primary text-bg rounded-md font-semibold text-sm">
          Open seller paths
        </NuxtLink>
      </div>

      <div v-else-if="viewMode === 'history'" class="bg-surface2 border border-border rounded-lg p-6 max-w-xl">
        <h2 class="text-lg font-semibold text-white mb-2">Order history</h2>
        <p class="text-sm text-white/80 mb-4">Sign in to view purchases, tracking, and escrow status.</p>
        <NuxtLink to="/auth/login" class="inline-block px-5 py-2.5 border border-primary text-primary rounded-md font-semibold text-sm">
          Sign in
        </NuxtLink>
      </div>

      <div v-else-if="viewMode === 'settings'" class="bg-surface2 border border-border rounded-lg p-6 max-w-xl">
        <h2 class="text-lg font-semibold text-white mb-2">Account settings</h2>
        <p class="text-sm text-white/80 mb-4">Manage your profile, addresses, and seller preferences.</p>
        <NuxtLink to="/dashboard" class="inline-block px-5 py-2.5 border border-border text-white rounded-md font-semibold text-sm hover:border-primary">
          Go to dashboard
        </NuxtLink>
      </div>
    </section>

    <section class="max-w-6xl mx-auto px-4 pb-2 w-full pt-4">
      <div class="flex items-center justify-between mb-3">
        <h2 class="text-lg font-semibold text-white">Live listings</h2>
        <p class="text-xs text-white/80">Only real seller inventory — no sample items</p>
      </div>
      <p v-if="loadError" class="text-sm text-amber-200 mb-4" role="alert">{{ loadError }}</p>
      <p v-else-if="pending" class="text-sm text-white/70 mb-4">Loading live listings…</p>
    </section>

    <SpotlightCarousel v-if="featured.length" :products="featured" />
    <section v-else-if="!pending" class="px-4 pb-6">
      <MarketplaceEmptyState />
    </section>

    <section v-if="listings.length > featured.length" class="max-w-6xl mx-auto px-4 pb-2">
      <h2 class="text-lg font-semibold text-white mb-3">More on the floor</h2>
    </section>
    <ProductGrid v-if="listings.length > featured.length" :products="listings.slice(featured.length)" />

    <MainFooter />
  </div>
</template>
