<template>
  <div v-if="article" class="learn-page">
    <div class="article-layout">
      <header class="article-header">
        <p class="eyebrow">
          <NuxtLink to="/learn">Learn</NuxtLink>
          · {{ categoryLabel }}
        </p>
        <h1>{{ article.title }}</h1>
        <p class="article-meta">{{ article.readMinutes }} min read · Updated {{ formatDate(article.published) }}</p>
        <p class="text-muted" style="font-weight: 600; line-height: 1.6;">{{ article.description }}</p>
      </header>

      <ContentArticleBody :blocks="article.blocks" />

      <section v-if="relatedArticles.length" class="article-related">
        <h2>Related guides</h2>
        <ul>
          <li v-for="r in relatedArticles" :key="r.slug">
            <NuxtLink :to="`/learn/${r.slug}`">{{ r.title }}</NuxtLink>
          </li>
        </ul>
      </section>

      <div class="learn-cta-band no-print">
        <h2>List on The Franks Standard</h2>
        <div class="learn-cta-actions">
          <NuxtLink to="/sell/import" class="btn btn-primary btn-sm">Import from eBay</NuxtLink>
          <NuxtLink to="/compare" class="btn btn-outline btn-sm">Compare fees</NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import {
  getArticleBySlug,
  LEARN_ARTICLES,
  LEARN_CATEGORIES,
} from '~/utils/contentHub.js'

const route = useRoute()
const slug = String(route.params.slug || '')
const article = getArticleBySlug(slug)

if (!article) {
  throw createError({ statusCode: 404, statusMessage: 'Article not found' })
}

const categoryLabel = computed(() => {
  const c = LEARN_CATEGORIES.find((x) => x.id === article.category)
  return c?.label || 'Guide'
})

const relatedArticles = computed(() => {
  const ids = article.related || []
  return ids.map((s) => LEARN_ARTICLES.find((a) => a.slug === s)).filter(Boolean)
})

function formatDate (iso) {
  try {
    return new Date(iso).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
  } catch {
    return iso
  }
}

useSeoMeta({
  title: `${article.title} | The Franks Standard`,
  description: article.description,
})
</script>

<style scoped>
@import '~/assets/css/learn-hub.css';
.eyebrow { font-size: 0.85rem; font-weight: 700; }
.eyebrow a { color: #146eb4; }
</style>
