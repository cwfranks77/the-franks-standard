<template>
  <div class="social-page">
    <section class="social-hero">
      <div class="container">
        <p class="eyebrow">Social</p>
        <h1>Social media promotion</h1>
        <p class="lead text-muted">
          Focus on <strong>Instagram</strong>, <strong>TikTok</strong>, and <strong>LinkedIn</strong> — where collectors and shop owners already spend time.
          Use Reels, Shorts, polls, and UGC to drive traffic to proof-first listings.
        </p>
        <div class="hero-actions">
          <a href="#caption-builder" class="btn btn-primary btn-sm">Caption builder</a>
          <NuxtLink to="/learn" class="btn btn-outline btn-sm">Learn hub</NuxtLink>
          <NuxtLink to="/collections" class="btn btn-outline btn-sm">Collections</NuxtLink>
          <NuxtLink to="/partners/creators" class="btn btn-outline btn-sm">Creator affiliates</NuxtLink>
        </div>
      </div>
    </section>

    <section class="section">
      <div class="container">
        <h2 class="section-title">Your 3-platform focus</h2>
        <p class="text-muted mb-2">Post consistently on fewer platforms instead of spreading thin across every network.</p>
        <div class="platform-grid">
          <article
            v-for="p in SOCIAL_PLATFORM_FOCUS"
            :key="p.id"
            class="platform-card"
            :class="{ primary: p.priority === 'primary' }"
          >
            <span class="plat-icon">{{ p.icon }}</span>
            <h3>{{ p.label }}</h3>
            <p class="audience">{{ p.audience }}</p>
            <p class="cadence"><strong>Cadence:</strong> {{ p.postingCadence }}</p>
            <ul class="format-list">
              <li v-for="f in p.formats" :key="f">{{ f }}</li>
            </ul>
            <div class="plat-links">
              <a v-for="l in p.links" :key="l.url" :href="l.url">{{ l.label }} ↗</a>
            </div>
          </article>
        </div>
      </div>
    </section>

    <section id="caption-builder" class="section section-alt">
      <div class="container">
        <h2 class="section-title">Caption &amp; hashtag builder</h2>
        <p class="text-muted mb-2">Platform-specific copy with trending collectibles hashtags — copy and paste into Reels, Shorts, or LinkedIn.</p>
        <SocialCaptionBuilder />
      </div>
    </section>

    <section class="section">
      <div class="container">
        <h2 class="section-title">Engagement: UGC, polls &amp; contests</h2>
        <div class="engage-grid">
          <article v-for="e in ENGAGEMENT_PLAYBOOK" :key="e.id" class="engage-card">
            <span class="engage-type">{{ e.type }}</span>
            <h3>{{ e.title }}</h3>
            <p>{{ e.description }}</p>
            <p v-if="e.question" class="poll-q"><strong>Poll:</strong> {{ e.question }}</p>
            <ul v-if="e.options" class="small-list">
              <li v-for="o in e.options" :key="o">{{ o }}</li>
            </ul>
            <ul v-if="e.rules" class="small-list">
              <li v-for="r in e.rules" :key="r">{{ r }}</li>
            </ul>
            <p v-if="e.prize" class="prize"><strong>Prize:</strong> {{ e.prize }}</p>
            <p v-if="e.disclaimer" class="disc text-muted small">{{ e.disclaimer }}</p>
          </article>
        </div>
      </div>
    </section>

    <section class="section section-alt">
      <div class="container">
        <h2 class="section-title">Reel &amp; Short script ideas</h2>
        <ul class="script-list">
          <li v-for="(s, i) in REEL_SCRIPT_IDEAS" :key="i">
            <strong>{{ s.hook }}</strong> — {{ s.body }}
            <NuxtLink :to="s.cta" class="script-cta">CTA {{ s.cta }}</NuxtLink>
          </li>
        </ul>
      </div>
    </section>

    <section class="section">
      <div class="container">
        <h2 class="section-title">Hashtag packs</h2>
        <div class="tag-grid">
          <div v-for="(tags, key) in HASHTAG_PACKS" :key="key" class="tag-pack">
            <h4>{{ key }}</h4>
            <p>{{ tags.join(' ') }}</p>
          </div>
        </div>
      </div>
    </section>

    <section class="section">
      <div class="container cta-band">
        <h2>Share tools that earn clicks</h2>
        <p class="text-muted">Link these in bio, Stories, and comments.</p>
        <div class="hero-actions">
          <NuxtLink to="/learn/tools/fee-calculator" class="btn btn-primary btn-sm">Fee calculator</NuxtLink>
          <NuxtLink to="/go/postcard" class="btn btn-outline btn-sm">Tracked /go/postcard</NuxtLink>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import {
  SOCIAL_PLATFORM_FOCUS,
  ENGAGEMENT_PLAYBOOK,
  REEL_SCRIPT_IDEAS,
  HASHTAG_PACKS,
} from '~/utils/socialPromotion.js'

useSeoMeta({
  title: 'Social media promotion — Instagram, TikTok, LinkedIn | The Franks Standard',
  description: 'Platform playbooks, Reels/Shorts captions, UGC contests, polls, and hashtag packs for collectibles sellers.',
})
</script>

<style scoped>
@import '~/assets/css/learn-hub.css';
.social-page { padding-bottom: 64px; }
.social-hero {
  padding: 48px 0 32px;
  background: linear-gradient(180deg, #f8f9fb, #fff);
}
.social-hero h1 {
  font-family: 'Cinzel', Georgia, serif;
  font-size: clamp(1.6rem, 4vw, 2.2rem);
  font-weight: 800;
}
.section { padding: 36px 0; }
.section-alt { background: #f8f9fb; }
.platform-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 20px;
}
.platform-card {
  padding: 20px;
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
}
.platform-card.primary { border-color: rgba(201, 168, 76, 0.5); }
.plat-icon { font-size: 1.5rem; }
.platform-card h3 { font-weight: 800; margin: 8px 0; }
.audience, .cadence { font-size: 0.9rem; font-weight: 600; color: #374151; line-height: 1.5; }
.format-list { margin: 12px 0; padding-left: 1.1rem; font-size: 0.88rem; font-weight: 600; }
.plat-links { display: flex; flex-wrap: wrap; gap: 10px; margin-top: 12px; }
.plat-links a { font-weight: 700; color: #146eb4; font-size: 0.85rem; }
.engage-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 16px;
}
.engage-card {
  padding: 18px;
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
}
.engage-type {
  font-size: 0.7rem;
  font-weight: 800;
  text-transform: uppercase;
  color: #92400e;
}
.engage-card h3 { font-size: 1rem; font-weight: 800; margin: 8px 0; }
.engage-card p { font-size: 0.9rem; font-weight: 600; color: #374151; line-height: 1.5; }
.small-list { padding-left: 1.1rem; font-size: 0.85rem; margin: 8px 0; }
.prize { margin-top: 10px; font-size: 0.88rem; }
.script-list { padding-left: 0; list-style: none; }
.script-list li {
  margin-bottom: 14px;
  padding: 12px;
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  font-weight: 600;
  line-height: 1.5;
}
.script-cta { margin-left: 8px; font-weight: 700; color: #146eb4; }
.tag-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 12px;
}
.tag-pack {
  padding: 12px;
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
}
.tag-pack h4 { text-transform: capitalize; font-size: 0.85rem; margin: 0 0 6px; }
.tag-pack p { font-size: 0.8rem; font-weight: 600; color: #4b5563; margin: 0; }
.cta-band {
  text-align: center;
  padding: 28px;
  background: rgba(201, 168, 76, 0.1);
  border-radius: 12px;
}
</style>
