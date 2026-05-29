<template>
  <div class="soc-ops-page">
    <div class="container">
      <p class="eyebrow">Owner toolkit</p>
      <h1>Social promotion</h1>
      <p class="lead text-muted">
        3-platform focus (Instagram, TikTok, LinkedIn), caption builder, engagement templates, and automated posting commands.
      </p>

      <section class="card panel">
        <h2>Strategy (2–3 platforms only)</h2>
        <ul class="ops-list">
          <li v-for="p in SOCIAL_PLATFORM_FOCUS" :key="p.id">
            <strong>{{ p.label }}</strong> — {{ p.postingCadence }}
          </li>
        </ul>
        <p class="text-muted small">Public playbook: <NuxtLink to="/social">/social</NuxtLink> · <code>docs/SOCIAL-PROMOTION.md</code></p>
      </section>

      <section class="card panel">
        <h2>Caption builder</h2>
        <SocialCaptionBuilder />
      </section>

      <section class="card panel">
        <h2>Engagement — copy for posts</h2>
        <div v-for="e in ENGAGEMENT_PLAYBOOK" :key="e.id" class="engage-block">
          <div class="engage-head">
            <strong>{{ e.type }}: {{ e.title }}</strong>
            <button type="button" class="btn btn-outline btn-sm" @click="copyEngage(e)">{{ copyState[e.id] ? 'Copied' : 'Copy' }}</button>
          </div>
          <pre class="kit-pre">{{ engageText(e) }}</pre>
        </div>
      </section>

      <section class="card panel">
        <h2>Automated posting (repo)</h2>
        <table class="cmd-table">
          <tr v-for="c in AUTOMATION_COMMANDS" :key="c.cmd">
            <td><code>{{ c.cmd }}</code></td>
            <td>{{ c.desc }}</td>
          </tr>
        </table>
        <p class="text-muted small mt-1">
          <NuxtLink to="/ops/ads">Ops → Social ads</NuxtLink> ·
          <code>assets/SOCIAL_MEDIA_ADS.md</code> ·
          <code>docs/META-FACEBOOK-SETUP.md</code>
        </p>
      </section>

      <section class="card panel">
        <h2>Weekly rhythm (suggested)</h2>
        <ol class="ops-list">
          <li><strong>Mon</strong> — LinkedIn fee math post → /compare</li>
          <li><strong>Tue/Wed</strong> — TikTok Short + Instagram Reel (same edit)</li>
          <li><strong>Thu</strong> — Story poll + link to fee calculator</li>
          <li><strong>Fri</strong> — UGC reshare or FOUNDERS10 spot check</li>
        </ol>
      </section>

      <p class="back-link">
        <NuxtLink to="/ops/marketing">← Marketing</NuxtLink>
        · <NuxtLink to="/ops/ads">Social ads</NuxtLink>
        · <NuxtLink to="/social" target="_blank">Public /social ↗</NuxtLink>
      </p>
    </div>
  </div>
</template>

<script setup>
import {
  SOCIAL_PLATFORM_FOCUS,
  ENGAGEMENT_PLAYBOOK,
  AUTOMATION_COMMANDS,
} from '~/utils/socialPromotion.js'

definePageMeta({ middleware: 'ops-auth' })
useSeoMeta({ title: 'Social promotion — Ops', robots: 'noindex, nofollow' })

const copyState = reactive({})

function engageText (e) {
  const lines = [
    e.title,
    e.description || '',
    e.question ? `Poll: ${e.question}` : '',
    ...(e.options || []).map((o) => `• ${o}`),
    ...(e.rules || []).map((r) => `• ${r}`),
    e.prize ? `Prize: ${e.prize}` : '',
    e.disclaimer || '',
    e.followUp ? `Follow-up: ${e.followUp}` : '',
    e.cta ? `CTA: ${e.cta}` : '',
  ].filter(Boolean)
  return lines.join('\n')
}

async function copyEngage (e) {
  try {
    await navigator.clipboard.writeText(engageText(e))
    copyState[e.id] = true
    setTimeout(() => { copyState[e.id] = false }, 2000)
  } catch {}
}
</script>

<style scoped>
.soc-ops-page { padding: 40px 16px 80px; }
.eyebrow { font-size: 0.72rem; letter-spacing: 0.12em; text-transform: uppercase; color: var(--gold); }
.card.panel { padding: 1.25rem; margin-bottom: 1rem; }
.card.panel h2 { color: var(--gold); font-size: 1.05rem; margin-bottom: 12px; }
.ops-list { padding-left: 1.2rem; line-height: 1.55; color: #d1d5db; }
.engage-block { margin-bottom: 16px; }
.engage-head { display: flex; justify-content: space-between; align-items: center; gap: 8px; margin-bottom: 8px; }
.kit-pre {
  padding: 12px; background: #0f172a; border-radius: 8px; font-size: 0.8rem;
  color: #e2e8f0; white-space: pre-wrap;
}
.cmd-table { width: 100%; font-size: 0.85rem; }
.cmd-table td { padding: 8px; border-bottom: 1px solid #374151; vertical-align: top; }
.back-link { margin-top: 1.5rem; }
</style>
