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
          <NuxtLink to="/sell/start" class="mkt-btn mkt-btn--ghost">Start selling</NuxtLink>
        </div>
      </div>
    </section>

    <section class="mkt-promo">
      <div class="container mkt-promo__grid">
        <NuxtLink to="/browse?limited=1" class="mkt-promo__tile">
          <span class="mkt-promo__eyebrow">Limited drops</span>
          <h2>Exclusive floor listings</h2>
          <p>Seller-backed proof, escrow checkout, multi-vendor shelves.</p>
          <span class="mkt-promo__cta">View drops →</span>
        </NuxtLink>
        <NuxtLink to="/bc-audio" class="mkt-promo__tile mkt-promo__tile--vendor">
          <span class="mkt-promo__eyebrow">Featured merchant store</span>
          <h2>
            {{ BC_BRAND.full }}
            <span class="mkt-promo__chip">Independent vendor</span>
          </h2>
          <p>{{ hp.featuredStoreDesc }}</p>
          <span class="mkt-promo__cta">Visit merchant store →</span>
        </NuxtLink>
        <NuxtLink to="/join/founders10" class="mkt-promo__tile">
          <span class="mkt-promo__eyebrow">FOUNDERS10</span>
          <h2>3 months Pro free</h2>
          <p>List your store on the floor with lower fees during launch.</p>
          <span class="mkt-promo__cta">Claim offer →</span>
        </NuxtLink>
      </div>
    </section>

    <section class="mkt-rail" aria-label="Browse departments">
      <div class="container mkt-rail__inner">
        <NuxtLink
          v-for="rail in departmentRail"
          :key="rail.label"
          :to="rail.to"
          class="mkt-rail__item"
        >
          <span class="mkt-rail__label">{{ rail.label }}</span>
          <span class="mkt-rail__sub">{{ rail.sub }}</span>
        </NuxtLink>
      </div>
    </section>

    <section class="mkt-shelf section">
      <div class="container">
        <MarketplaceListingGrid
          title="Trending on the floor"
          subtitle="eBay-style multi-vendor shelves — price, seller badge, and one-click listing detail."
          :items="shelfItems"
          empty-message="Browse the marketplace for live listings."
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
})

const hp = computed(() => ({
  ...DEFAULT_HOMEPAGE,
  ...(props.homepage || {}),
}))

const trustBlocks = computed(() => {
  const blocks = hp.value.trustBlocks
  return Array.isArray(blocks) && blocks.length ? blocks : DEFAULT_HOMEPAGE.trustBlocks
})

const departmentRail = [
  { label: 'Performance Car Audio', sub: 'Subwoofers · Amps · DSP', to: '/browse?category=Performance%20Car%20Audio' },
  { label: 'Vintage Restorations', sub: 'Estate · Tube · Hi-Fi', to: '/browse?category=Vintage%20Restorations' },
  { label: 'Workspace Tuning', sub: 'Studio · Monitors · Gear', to: '/browse?category=Workspace%20Tuning' },
  { label: 'Collectibles & COA', sub: 'Cards · Coins · Memorabilia', to: '/browse?category=Collectibles' },
  { label: 'Sporting Goods', sub: 'Hunt · Fish · Outdoor', to: '/browse?category=Sporting%20Goods' },
  { label: 'Top Sellers', sub: 'Trusted shops on the floor', to: '/top-sellers' },
]

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
      marketplaceRows.value = data.map((row) => {
        const sellerName = row.seller?.full_name || 'Marketplace seller'
        const lowered = sellerName.toLowerCase()
        const isBcSeller = lowered.includes('b&c') || lowered.includes('b & c') || lowered.includes('bc performance')
        return {
          id: row.id,
          title: row.title,
          priceLabel: `$${Number(row.price).toLocaleString(undefined, { minimumFractionDigits: 2 })}`,
          image: publicUrlForPath(row.image_paths?.[0]),
          seller: sellerName,
          isBcSeller,
          badge: row.category ? String(row.category).slice(0, 18) : '',
          to: `/listing/${row.id}`,
          fallbackImage: '/logo.svg',
        }
      })
    }
  } catch {
    marketplaceRows.value = []
  }
}

onMounted(() => {
  loadMarketplaceShelf()
})

const shelfItems = computed(() => marketplaceRows.value.slice(0, 16))
</script>

<style scoped>
.marketplace-home { color: #f5f5f7; }
.mkt-hero {
  padding: 2.5rem 0 2rem;
  background:
    radial-gradient(ellipse 80% 60% at 50% 0%, rgba(255, 216, 20, 0.12) 0%, transparent 65%),
    #0a0a0c;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
}
.mkt-hero__ribbon {
  display: inline-block;
  font-size: 0.68rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.16em;
  color: #ffd814;
  border: 1px solid rgba(255, 216, 20, 0.4);
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
.mkt-hero__lede { max-width: 640px; color: #d1d5db; line-height: 1.6; margin: 0 0 20px; }
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
.mkt-btn--ghost {
  border-color: rgba(255, 255, 255, 0.2);
  color: #e5e7eb;
  background: transparent;
}
.mkt-btn--ghost:hover { border-color: rgba(255, 255, 255, 0.45); color: #fff; }

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
.mkt-promo__tile:hover { border-color: rgba(255, 216, 20, 0.4); }
.mkt-promo__tile--vendor {
  border-color: rgba(211, 47, 47, 0.45);
  background: linear-gradient(145deg, rgba(211, 47, 47, 0.12) 0%, #16161c 60%);
}
.mkt-promo__tile--vendor:hover { border-color: rgba(211, 47, 47, 0.7); }
.mkt-promo__eyebrow {
  font-size: 0.65rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  color: #9ca3af;
}
.mkt-promo__tile--vendor .mkt-promo__eyebrow { color: #ff5252; }
.mkt-promo__tile h2 {
  font-size: 1.05rem;
  margin: 0;
  color: #f5f5f7;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}
.mkt-promo__chip {
  font-size: 0.6rem;
  font-weight: 800;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  padding: 3px 7px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.12);
  color: #c5cdd8;
}
.mkt-promo__tile--vendor .mkt-promo__chip {
  color: #ff5252;
  border-color: rgba(211, 47, 47, 0.45);
  background: rgba(211, 47, 47, 0.12);
}
.mkt-promo__tile p { margin: 0; font-size: 0.82rem; color: #9ca3af; line-height: 1.45; flex: 1; }
.mkt-promo__cta { font-size: 0.78rem; font-weight: 800; color: #ffd814; margin-top: 4px; }
.mkt-promo__tile--vendor .mkt-promo__cta { color: #ff5252; }

.mkt-rail {
  background: #0a0a0c;
  border-top: 1px solid rgba(255, 255, 255, 0.06);
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
}
.mkt-rail__inner {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 1px;
  background: rgba(255, 255, 255, 0.06);
}
.mkt-rail__item {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 14px 16px;
  background: #0a0a0c;
  text-decoration: none;
  color: inherit;
  transition: background 0.15s, color 0.15s;
}
.mkt-rail__item:hover { background: #16161c; }
.mkt-rail__label { font-weight: 800; font-size: 0.85rem; color: #f5f5f7; }
.mkt-rail__sub { font-size: 0.7rem; color: #7a8190; letter-spacing: 0.04em; }

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
