<template>
  <div class="community-page">
    <section class="community-hero">
      <div class="container">
        <p class="eyebrow">Community outreach</p>
        <h1>Reddit, forums &amp; blogging</h1>
        <p class="lead text-muted">
          Get on Reddit and blogging sites with <strong>value-first</strong> posts — not drive-by links.
          Lead with security differentiators (COA office, escrow, enforcement), then link when asked.
        </p>
        <div class="hero-actions">
          <NuxtLink to="/social" class="btn btn-outline btn-sm">← Social hub</NuxtLink>
          <NuxtLink to="/protection" class="btn btn-primary btn-sm">Protection overview</NuxtLink>
          <NuxtLink to="/marketplace-policy" class="btn btn-outline btn-sm">Full policies</NuxtLink>
        </div>
      </div>
    </section>

    <section class="section">
      <div class="container">
        <h2 class="section-title">Security stack — what to lead with</h2>
        <p class="text-muted mb-2">{{ securityStackOneLiner() }}</p>
        <div class="sec-grid">
          <article v-for="f in SECURITY_DIFFERENTIATORS" :key="f.id" class="sec-card">
            <span class="sec-icon">{{ f.icon }}</span>
            <h3>{{ f.title }}</h3>
            <p>{{ f.short }}</p>
            <p class="hook"><em>{{ f.socialHook }}</em></p>
            <NuxtLink v-if="f.link.startsWith('/')" :to="f.link" class="sec-link">Learn more</NuxtLink>
            <a v-else :href="f.link" class="sec-link">{{ f.link }}</a>
          </article>
        </div>
      </div>
    </section>

    <section class="section section-alt">
      <div class="container">
        <h2 class="section-title">Reddit — where to post</h2>
        <p class="text-muted mb-2">
          Read each sub’s rules. Many ban self-promo in titles — put links in comments only when relevant.
          Build karma with helpful replies for 1–2 weeks before your first value post.
        </p>
        <div class="reddit-grid">
          <article v-for="r in REDDIT_COMMUNITY_TARGETS" :key="r.subreddit" class="reddit-card">
            <h3>r/{{ r.subreddit }}</h3>
            <p class="meta">{{ r.members }} · {{ r.fit }}</p>
            <p class="rules">{{ r.rulesNote }}</p>
            <ul class="angles">
              <li v-for="a in r.postAngles" :key="a">{{ a }}</li>
            </ul>
            <p class="utm small text-muted">Tracked: <code>{{ r.utm }}</code></p>
          </article>
        </div>
      </div>
    </section>

    <section class="section">
      <div class="container">
        <h2 class="section-title">Copy-paste Reddit posts</h2>
        <p class="text-muted mb-2">Pick a variant, edit for the sub, post as text (not link-only).</p>
        <div class="post-tabs">
          <button
            v-for="v in redditVariants"
            :key="v.id"
            type="button"
            class="tab"
            :class="{ active: redditVariant === v.id }"
            @click="redditVariant = v.id"
          >
            {{ v.label }}
          </button>
        </div>
        <pre class="copy-block">{{ redditPostText }}</pre>
        <button type="button" class="btn btn-primary btn-sm" @click="copyText(redditPostText)">
          {{ copiedReddit ? 'Copied' : 'Copy Reddit post' }}
        </button>
      </div>
    </section>

    <section class="section section-alt">
      <div class="container">
        <h2 class="section-title">Blogging &amp; launch sites</h2>
        <div class="blog-grid">
          <article v-for="b in BLOG_OUTREACH_TARGETS" :key="b.id" class="blog-card">
            <h3>{{ b.name }}</h3>
            <span class="blog-type">{{ b.type }}</span>
            <p>{{ b.angle }}</p>
            <p class="cadence"><strong>Cadence:</strong> {{ b.cadence }}</p>
            <a :href="b.url" target="_blank" rel="noopener noreferrer" class="ext">Open {{ b.name }} ↗</a>
          </article>
        </div>
      </div>
    </section>

    <section class="section">
      <div class="container">
        <h2 class="section-title">Blog article outlines</h2>
        <div class="outline-row">
          <button
            v-for="t in blogTopics"
            :key="t.id"
            type="button"
            class="btn btn-outline btn-sm"
            :class="{ 'btn-primary': blogTopic === t.id }"
            @click="blogTopic = t.id"
          >
            {{ t.label }}
          </button>
        </div>
        <div v-if="blogOutline" class="outline-card">
          <h3>{{ blogOutline.title }}</h3>
          <ol>
            <li v-for="(s, i) in blogOutline.sections" :key="i">{{ s }}</li>
          </ol>
          <p>
            CTA:
            <a v-if="blogOutline.cta.startsWith('http')" :href="blogOutline.cta">{{ blogOutline.cta }}</a>
            <NuxtLink v-else :to="blogOutline.cta">{{ blogOutline.cta }}</NuxtLink>
          </p>
        </div>
      </div>
    </section>

    <section class="section section-alt">
      <div class="container checklist">
        <h2 class="section-title">Weekly outreach checklist</h2>
        <ul>
          <li>5+ helpful Reddit comments (no links unless asked)</li>
          <li>1 Reel/TikTok using a security hook from above</li>
          <li>1 LinkedIn post — enforcement transparency or fee math</li>
          <li>1 blog draft (Medium or Substack) from an outline</li>
          <li>Track signups: <code>utm_source=reddit</code> / <code>utm_medium=community</code></li>
        </ul>
        <p class="text-muted small">
          Full playbook: <code>docs/REDDIT-AND-BLOG-OUTREACH.md</code> · Ops:
          <NuxtLink to="/ops/social-promo">Social promotion</NuxtLink>
        </p>
      </div>
    </section>
  </div>
</template>

<script setup>
import {
  SECURITY_DIFFERENTIATORS,
  REDDIT_COMMUNITY_TARGETS,
  BLOG_OUTREACH_TARGETS,
  buildRedditValuePost,
  buildBlogArticleOutline,
  securityStackOneLiner,
  SITE_URL,
} from '~/utils/securityDifferentiators.js'

useSeoMeta({
  title: 'Reddit & blog outreach — security-first messaging | The Franks Standard',
  description: 'Subreddit targets, value-first post templates, blog outlines, and security differentiators for community marketing.',
})

const redditVariant = ref('education')
const blogTopic = ref('security')
const copiedReddit = ref(false)

const redditVariants = [
  { id: 'education', label: 'Educational' },
  { id: 'founder', label: 'Founder story' },
  { id: 'ama', label: 'AMA' },
]

const blogTopics = [
  { id: 'security', label: '10 security features' },
  { id: 'coa', label: 'Floor office COA' },
  { id: 'enforcement', label: 'Forced refund policy' },
]

const redditPostText = computed(() => buildRedditValuePost({ variant: redditVariant.value }))
const blogOutline = computed(() => buildBlogArticleOutline({ topic: blogTopic.value }))

async function copyText (text) {
  try {
    await navigator.clipboard.writeText(text)
    copiedReddit.value = true
    setTimeout(() => { copiedReddit.value = false }, 2500)
  } catch {}
}
</script>

<style scoped>
@import '~/assets/css/learn-hub.css';
.community-page { padding-bottom: 64px; }
.community-hero {
  padding: 48px 0 32px;
  background: linear-gradient(180deg, #f8f9fb, #fff);
}
.community-hero h1 {
  font-family: 'Cinzel', Georgia, serif;
  font-size: clamp(1.5rem, 4vw, 2rem);
  font-weight: 800;
}
.section { padding: 36px 0; }
.section-alt { background: #f8f9fb; }
.sec-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 16px;
}
.sec-card {
  padding: 16px;
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
}
.sec-icon { font-size: 1.4rem; }
.sec-card h3 { font-size: 1rem; font-weight: 800; margin: 8px 0; }
.sec-card p { font-size: 0.88rem; font-weight: 600; color: #374151; line-height: 1.5; margin: 0 0 8px; }
.hook { font-size: 0.82rem !important; color: #6b7280 !important; }
.sec-link { font-weight: 700; color: #146eb4; font-size: 0.85rem; }
.reddit-grid, .blog-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
}
.reddit-card, .blog-card {
  padding: 18px;
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
}
.reddit-card h3, .blog-card h3 { font-weight: 800; margin: 0 0 6px; }
.meta, .rules { font-size: 0.85rem; font-weight: 600; color: #4b5563; }
.angles { padding-left: 1.1rem; font-size: 0.85rem; margin: 10px 0; }
.blog-type {
  font-size: 0.7rem;
  font-weight: 800;
  text-transform: uppercase;
  color: #92400e;
}
.cadence { font-size: 0.85rem; margin-top: 8px; }
.ext { font-weight: 700; color: #146eb4; font-size: 0.88rem; }
.post-tabs { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 12px; }
.tab {
  padding: 8px 14px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  background: #fff;
  font-weight: 700;
  font-size: 0.85rem;
  cursor: pointer;
}
.tab.active { border-color: #c9a84c; background: rgba(201, 168, 76, 0.12); }
.copy-block {
  padding: 16px;
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  white-space: pre-wrap;
  font-size: 0.88rem;
  line-height: 1.55;
  margin-bottom: 12px;
}
.outline-row { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 16px; }
.outline-card {
  padding: 20px;
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
}
.checklist ul { line-height: 1.8; font-weight: 600; }
</style>
