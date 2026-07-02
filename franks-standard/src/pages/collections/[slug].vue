<template>
  <div class="marketplace-shell min-h-screen flex flex-col bg-bg text-textMain">
    <MainHeader />
    <div v-if="page" class="collection-detail light-content flex-1">
    <section class="detail-hero">
      <div class="container">
        <p class="eyebrow">
          <NuxtLink to="/collections">Collections</NuxtLink>
          · {{ page.kind === 'drop' ? 'Limited drop' : 'Niche focus' }}
        </p>
        <h1>{{ page.title }}</h1>
        <p class="lead text-muted">{{ page.subtitle }}</p>
        <p v-if="page.ebayAngle" class="ebay-angle"><strong>Not eBay:</strong> {{ page.ebayAngle }}</p>
        <div class="hero-actions">
          <NuxtLink :to="browseLink" class="btn btn-primary btn-sm">Browse {{ liveCount }} listing{{ liveCount === 1 ? '' : 's' }}</NuxtLink>
          <NuxtLink :to="page.ctaPath || '/sell/start'" class="btn btn-outline btn-sm">List in this niche</NuxtLink>
        </div>
      </div>
    </section>

    <section class="section">
      <div class="container">
        <div v-if="loading" class="text-muted">Loading floor…</div>
        <div v-else-if="items.length" class="listing-grid">
          <NuxtLink
            v-for="item in items"
            :key="item.id"
            :to="`/listing/${item.id}`"
            class="listing-card"
          >
            <div class="listing-img">
              <img
                :src="item.image"
                :alt="item.title"
                :data-category="item.category"
                loading="lazy"
                @error="onListingImageError"
              />
              <span v-if="item.limitedLabel" class="limited-badge">{{ item.limitedLabel }}</span>
              <span class="coa-badge">COA / Guarantee</span>
            </div>
            <div class="listing-body">
              <p class="cat text-muted">{{ item.category }}</p>
              <h3>{{ item.title }}</h3>
              <p class="price">${{ item.price.toLocaleString() }}</p>
            </div>
          </NuxtLink>
        </div>
        <div v-else class="empty">
          <p>No live listings in this collection yet — be the first seller in this niche.</p>
          <NuxtLink :to="page.ctaPath || '/sell/start'" class="btn btn-primary btn-sm">Create listing</NuxtLink>
        </div>
      </div>
    </section>

    <section class="section section-alt">
      <div class="container promo-box">
        <h2>Promote this collection</h2>
        <pre class="promo-pre">{{ promoCopy }}</pre>
        <button type="button" class="btn btn-outline btn-sm" @click="copyPromo">{{ copied ? 'Copied' : 'Copy campaign text' }}</button>
      </div>
    </section>
    </div>
    <MainFooter />
  </div>
</template>

<script setup>
import {
  getNicheBySlug,
  getLimitedDropBySlug,
  promoCampaignCopy,
  isLimitedEditionListing,
  limitedBadgeLabel,
} from '~/utils/nicheCollections.js'
import { onListingImageError } from '~/utils/marketplaceShowcaseImages.js'

const route = useRoute()
const slug = String(route.params.slug || '')
const { publicUrlForPath } = useListingImageUrl()
const supabase = useSupabaseClient()

const niche = getNicheBySlug(slug)
const drop = getLimitedDropBySlug(slug)

if (!niche && !drop) {
  throw createError({ statusCode: 404, statusMessage: 'Collection not found' })
}

const page = computed(() => {
  if (niche) {
    return {
      kind: 'niche',
      title: niche.name,
      subtitle: niche.tagline,
      ebayAngle: niche.ebayAngle,
      buyerHook: niche.buyerHook,
      category: niche.category,
      ctaPath: '/sell/start',
    }
  }
  return {
    kind: 'drop',
    title: drop.label,
    subtitle: drop.subtitle,
    ebayAngle: 'Limited drops with proof and escrow — not an unverified auction feed.',
    categories: drop.categories,
    ctaPath: drop.ctaPath,
  }
})

const browseLink = computed(() => {
  if (niche) {
    return { path: '/browse', query: { category: niche.category } }
  }
  return { path: '/browse', query: { collection: slug, limited: '1' } }
})

const items = ref([])
const loading = ref(true)
const copied = ref(false)

const liveCount = computed(() => items.value.length)

const promoCopy = computed(() => {
  if (niche) return promoCampaignCopy(niche)
  return [
    drop.label,
    drop.subtitle,
    drop.promoLine,
    '',
    `Browse: https://thefranksstandard.com/collections/${slug}`,
  ].join('\n')
})

async function loadListings () {
  loading.value = true
  let q = supabase
    .from('listings')
    .select('id, title, description, category, price, image_paths, is_limited_edition, collection_slug, collection_label, created_at')
    .eq('status', 'published')
    .order('created_at', { ascending: false })
    .limit(48)

  if (niche) {
    q = q.eq('category', niche.category)
  } else if (drop?.categories?.length) {
    q = q.in('category', drop.categories)
  }

  const { data, error } = await q
  loading.value = false
  if (error) {
    items.value = []
    return
  }
  let rows = data || []
  if (drop) {
    rows = rows.filter((r) =>
      r.collection_slug === slug
      || isLimitedEditionListing(r)
      || drop.categories.includes(r.category),
    )
  }
  items.value = rows.map((r) => ({
    id: r.id,
    title: r.title,
    category: r.category,
    price: Number(r.price),
    image: publicUrlForPath(r.image_paths?.[0]),
    limitedLabel: limitedBadgeLabel(r),
  }))
}

async function copyPromo () {
  try {
    await navigator.clipboard.writeText(promoCopy.value)
    copied.value = true
    setTimeout(() => { copied.value = false }, 2500)
  } catch {}
}

onMounted(loadListings)

useSeoMeta({
  title: () => `${page.value.title} | The Franks Standard`,
  description: () => page.value.subtitle,
})
</script>

<style scoped>
.collection-detail { padding-bottom: 48px; }
.detail-hero { padding: 40px 0 24px; background: #f8f9fb; }
.detail-hero h1 { font-family: 'Cinzel', Georgia, serif; font-weight: 800; font-size: clamp(1.5rem, 3.5vw, 2rem); color: #111827; }
.lead { max-width: 40rem; line-height: 1.6; font-weight: 600; color: #374151; }
.eyebrow { color: #92400e; }
.eyebrow a { color: #146eb4; font-weight: 700; }
.ebay-angle { margin-top: 12px; font-weight: 600; max-width: 40rem; color: #111827; }
.section-alt h2 { color: #111827; font-size: 1.15rem; margin-bottom: 12px; }
.hero-actions { display: flex; flex-wrap: wrap; gap: 10px; margin-top: 16px; }
.section { padding: 32px 0; }
.section-alt { background: #f8fafc; }
.listing-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 16px;
}
.listing-card {
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  overflow: hidden;
  text-decoration: none;
  color: inherit;
  background: #fff;
}
.listing-img { position: relative; aspect-ratio: 1; background: #f3f4f6; }
.listing-img img { width: 100%; height: 100%; object-fit: cover; }
.limited-badge {
  position: absolute; top: 8px; left: 8px;
  background: #92400e; color: #fff; font-size: 0.65rem; font-weight: 800;
  padding: 4px 8px; border-radius: 4px;
}
.coa-badge {
  position: absolute; bottom: 8px; right: 8px;
  background: rgba(4, 120, 87, 0.9); color: #fff; font-size: 0.62rem; font-weight: 700;
  padding: 3px 6px; border-radius: 4px;
}
.listing-body { padding: 12px; }
.cat { font-size: 0.75rem; margin: 0 0 4px; }
.listing-body h3 { font-size: 0.92rem; font-weight: 800; margin: 0 0 6px; line-height: 1.3; }
.price { font-weight: 800; color: #047857; margin: 0; }
.empty { text-align: center; padding: 40px 20px; }
.promo-box { max-width: 42rem; }
.promo-pre {
  padding: 14px; background: #0f172a; color: #e2e8f0; border-radius: 8px;
  font-size: 0.85rem; white-space: pre-wrap; margin-bottom: 12px;
}
</style>
