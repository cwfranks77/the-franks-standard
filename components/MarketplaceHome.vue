<template>
  <div class="marketplace-home">
    <section class="mkt-hero">
      <div class="container mkt-hero__inner">
        <p class="mkt-hero__ribbon">{{ hp.heroRibbon }}</p>
        <h1 class="mkt-hero__title">
          {{ hp.heroTitleLine1 }}
          <span class="mkt-hero__accent">{{ hp.heroTitleLine2 }}</span>
        </h1>
        <p class="mkt-hero__sub">{{ hp.heroTitleSub }}</p>
        <p class="mkt-hero__lede">{{ hp.heroLede }}</p>
        <div class="mkt-hero__actions">
          <NuxtLink to="/browse" class="mkt-btn mkt-btn--primary">Browse all listings</NuxtLink>
          <NuxtLink to="/shop" class="mkt-btn mkt-btn--bc">
            {{ BC_BRAND.full }} dropship →
          </NuxtLink>
          <NuxtLink to="/sell/start" class="mkt-btn mkt-btn--ghost">Start selling</NuxtLink>
        </div>
      </div>
    </section>

    <section class="mkt-promo">
      <div class="container mkt-promo__grid">
        <NuxtLink to="/shop" class="mkt-promo__tile mkt-promo__tile--bc">
          <span class="mkt-promo__eyebrow">Partner store · Live Stripe checkout</span>
          <h2>{{ BC_BRAND.full }}</h2>
          <p>{{ hp.featuredStoreDesc }}</p>
          <span class="mkt-promo__cta">Shop competition audio →</span>
        </NuxtLink>
        <NuxtLink to="/browse?limited=1" class="mkt-promo__tile">
          <span class="mkt-promo__eyebrow">Limited drops</span>
          <h2>Exclusive floor listings</h2>
          <p>Seller-backed proof, escrow checkout, multi-vendor shelves.</p>
          <span class="mkt-promo__cta">View drops →</span>
        </NuxtLink>
        <NuxtLink to="/join/founders10" class="mkt-promo__tile">
          <span class="mkt-promo__eyebrow">FOUNDERS10</span>
          <h2>3 months Pro free</h2>
          <p>List your store on the floor with lower fees during launch.</p>
          <span class="mkt-promo__cta">Claim offer →</span>
        </NuxtLink>
      </div>
    </section>

    <section class="mkt-bc-strip">
      <div class="container mkt-bc-strip__inner">
        <div class="mkt-bc-strip__copy">
          <p class="mkt-bc-strip__label">Dropship portal</p>
          <h2>{{ BC_BRAND.full }} — warehouse pull &amp; split payout</h2>
          <p>Secure Stripe Connect checkout · 4.45% LA tax · wholesale routed to distributor instantly.</p>
        </div>
        <div class="mkt-bc-strip__links">
          <NuxtLink to="/shop" class="mkt-bc-strip__link mkt-bc-strip__link--primary">Enter dropship store</NuxtLink>
          <NuxtLink to="/stores" class="mkt-bc-strip__link">All partner stores</NuxtLink>
          <NuxtLink to="/sell/dropship-setup" class="mkt-bc-strip__link">Set up your dropship channel</NuxtLink>
        </div>
      </div>
    </section>

    <section class="mkt-shelf section">
      <div class="container">
        <MarketplaceListingGrid
          title="Trending on the floor"
          subtitle="eBay-style multi-vendor shelves — price, seller badge, and one-click listing detail."
          :items="shelfItems"
          empty-message="Browse the marketplace for live listings, or open the B&amp;C dropship store."
        />
        <div class="mkt-shelf__foot">
          <NuxtLink to="/browse" class="mkt-btn mkt-btn--ghost">View all marketplace listings →</NuxtLink>
        </div>
      </div>
    </section>

    <section class="mkt-trust section">
      <div class="container mkt-trust__grid">
        <article v-for="(block, i) in trustBlocks" :key="i" class="mkt-trust__card">
          <h3>{{ block.title }}</h3>
          <p>{{ block.desc }}</p>
        </article>
      </div>
    </section>
  </div>
</template>

<script setup>
import { DEFAULT_HOMEPAGE } from '~/utils/ownerConfigDefaults'
import { BC_BRAND } from '~/utils/bcBrand.js'

const props = defineProps({
  homepage: { type: Object, default: () => ({}) },
  bcCatalogItems: { type: Array, default: () => [] },
})

const hp = computed(() => ({
  ...DEFAULT_HOMEPAGE,
  ...(props.homepage || {}),
}))

const trustBlocks = computed(() => {
  const blocks = hp.value.trustBlocks
  return Array.isArray(blocks) && blocks.length ? blocks : DEFAULT_HOMEPAGE.trustBlocks
})

const marketplaceRows = ref([])

const LISTING_SELECT =
  'id, title, price, image_paths, category, seller:profiles!listings_seller_id_fkey(full_name)'

async function loadMarketplaceShelf () {
  if (!import.meta.client) return
  try {
    const supabase = useSupabaseClient()
    const { publicUrlForPath } = useListingImageUrl()
    const { data, error } = await supabase
      .from('listings')
      .select(LISTING_SELECT)
      .eq('status', 'published')
      .order('created_at', { ascending: false })
      .limit(12)

    if (!error && data?.length) {
      marketplaceRows.value = data.map((row) => ({
        id: row.id,
        title: row.title,
        priceLabel: `$${Number(row.price).toLocaleString(undefined, { minimumFractionDigits: 2 })}`,
        image: publicUrlForPath(row.image_paths?.[0]),
        seller: row.seller?.full_name || 'Marketplace seller',
        isBcSeller: false,
        badge: row.category ? String(row.category).slice(0, 18) : '',
        to: `/listing/${row.id}`,
        fallbackImage: '/logo.svg',
      }))
    }
  } catch {
    marketplaceRows.value = []
  }
}

onMounted(() => {
  loadMarketplaceShelf()
})

const shelfItems = computed(() => {
  const bcItems = (props.bcCatalogItems || []).slice(0, 4).map((item) => ({
    id: `bc-${item.id}`,
    title: `${item.brand || BC_BRAND.short} — ${item.name}`,
    priceLabel: item.formattedPrice || `$${Number(item.retailPrice || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}`,
    image: item.image || '/logo.svg',
    seller: BC_BRAND.full,
    isBcSeller: true,
    badge: 'Dropship',
    to: '/shop',
    fallbackImage: '/logo.svg',
  }))

  return [...bcItems, ...marketplaceRows.value].slice(0, 16)
})
</script>

<style scoped>
.marketplace-home { color: #f5f5f7; }
.mkt-hero {
  padding: 2.5rem 0 2rem;
  background:
    radial-gradient(ellipse 80% 60% at 50% 0%, rgba(211, 47, 47, 0.22) 0%, transparent 65%),
    #0a0a0c;
  border-bottom: 1px solid rgba(211, 47, 47, 0.2);
}
.mkt-hero__ribbon {
  display: inline-block;
  font-size: 0.68rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.16em;
  color: #ff5252;
  border: 1px solid rgba(211, 47, 47, 0.4);
  border-radius: 999px;
  padding: 6px 12px;
  margin-bottom: 14px;
}
.mkt-hero__title {
  font-size: clamp(2rem, 4.5vw, 3.2rem);
  font-weight: 900;
  line-height: 1.05;
  margin: 0 0 10px;
  max-width: 720px;
}
.mkt-hero__accent {
  display: block;
  color: #ffd814;
  text-shadow: 0 0 24px rgba(255, 216, 20, 0.25);
}
.mkt-hero__sub { font-weight: 700; color: #c5cdd8; margin: 0 0 10px; }
.mkt-hero__lede { max-width: 640px; color: #9ca3af; line-height: 1.6; margin: 0 0 20px; }
.mkt-hero__actions { display: flex; flex-wrap: wrap; gap: 10px; }

.mkt-btn {
  display: inline-flex;
  align-items: center;
  padding: 11px 18px;
  border-radius: 8px;
  font-size: 0.85rem;
  font-weight: 800;
  text-decoration: none;
  border: 1px solid transparent;
}
.mkt-btn--primary { background: #ffd814; color: #0a0a0c; }
.mkt-btn--primary:hover { background: #f7ca00; color: #0a0a0c; }
.mkt-btn--bc {
  background: #d32f2f;
  color: #fff;
  box-shadow: 0 4px 20px rgba(211, 47, 47, 0.4);
}
.mkt-btn--bc:hover { background: #ff5252; color: #fff; }
.mkt-btn--ghost {
  border-color: rgba(255, 255, 255, 0.2);
  color: #e5e7eb;
  background: transparent;
}
.mkt-btn--ghost:hover { border-color: #d32f2f; color: #ff5252; }

.mkt-promo { padding: 1.75rem 0; background: #121216; }
.mkt-promo__grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 14px;
}
.mkt-promo__tile {
  padding: 1.25rem;
  border-radius: 12px;
  background: #16161c;
  border: 1px solid rgba(255, 255, 255, 0.08);
  text-decoration: none;
  color: inherit;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.mkt-promo__tile:hover { border-color: rgba(211, 47, 47, 0.4); }
.mkt-promo__tile--bc {
  border-color: rgba(211, 47, 47, 0.45);
  background: linear-gradient(145deg, rgba(211, 47, 47, 0.15) 0%, #16161c 55%);
  box-shadow: inset 0 0 40px rgba(211, 47, 47, 0.08);
}
.mkt-promo__eyebrow {
  font-size: 0.65rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  color: #ff5252;
}
.mkt-promo__tile h2 { font-size: 1.05rem; margin: 0; color: #f5f5f7; }
.mkt-promo__tile p { margin: 0; font-size: 0.82rem; color: #9ca3af; line-height: 1.45; flex: 1; }
.mkt-promo__cta { font-size: 0.78rem; font-weight: 800; color: #ffd814; margin-top: 4px; }
.mkt-promo__tile--bc .mkt-promo__cta { color: #ff5252; }

.mkt-bc-strip {
  padding: 1.25rem 0;
  background: linear-gradient(90deg, rgba(211, 47, 47, 0.2) 0%, #0a0a0c 50%);
  border-top: 1px solid rgba(211, 47, 47, 0.35);
  border-bottom: 1px solid rgba(211, 47, 47, 0.35);
}
.mkt-bc-strip__inner {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}
.mkt-bc-strip__label {
  font-size: 0.65rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.14em;
  color: #ff5252;
  margin: 0 0 4px;
}
.mkt-bc-strip__copy h2 {
  font-size: 1.1rem;
  margin: 0 0 6px;
  color: #f5f5f7;
}
.mkt-bc-strip__copy p { margin: 0; font-size: 0.82rem; color: #9ca3af; max-width: 520px; }
.mkt-bc-strip__links { display: flex; flex-wrap: wrap; gap: 8px; }
.mkt-bc-strip__link {
  padding: 8px 14px;
  border-radius: 8px;
  font-size: 0.78rem;
  font-weight: 800;
  text-decoration: none;
  color: #e5e7eb;
  border: 1px solid rgba(255, 255, 255, 0.15);
}
.mkt-bc-strip__link:hover { border-color: #d32f2f; color: #ff5252; }
.mkt-bc-strip__link--primary {
  background: #d32f2f;
  border-color: #d32f2f;
  color: #fff;
  box-shadow: 0 0 20px rgba(211, 47, 47, 0.35);
}
.mkt-bc-strip__link--primary:hover { background: #ff5252; color: #fff; }

.mkt-shelf { padding: 2rem 0 2.5rem; background: #0a0a0c; }
.mkt-shelf__foot { margin-top: 1.25rem; text-align: center; }

.mkt-trust { padding-bottom: 3rem; background: #121216; }
.mkt-trust__grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 14px;
}
.mkt-trust__card {
  padding: 1.25rem;
  border-radius: 12px;
  background: #16161c;
  border: 1px solid rgba(255, 255, 255, 0.08);
}
.mkt-trust__card h3 { font-size: 0.95rem; margin: 0 0 8px; color: #f5f5f7; }
.mkt-trust__card p { margin: 0; font-size: 0.82rem; color: #9ca3af; line-height: 1.45; }
</style>
