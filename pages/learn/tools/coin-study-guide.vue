<template>
  <div class="learn-page">
    <div class="container print-guide" style="padding: 40px 16px 64px;">
      <p class="eyebrow no-print">
        <NuxtLink to="/learn/tools">Tools</NuxtLink>
        · Trust &amp; education
      </p>
      <div class="guide-actions no-print">
        <button type="button" class="btn btn-primary btn-sm" @click="printPage">Print / Save as PDF</button>
        <NuxtLink to="/learn/tools/authenticity-checklist" class="btn btn-outline btn-sm">Seller checklist</NuxtLink>
      </div>

      <header class="guide-header">
        <h1>{{ meta.title }}</h1>
        <p class="guide-sub">{{ meta.subtitle }}</p>
        <p class="text-muted guide-meta">
          {{ meta.author }} · v{{ meta.version }} (working manual)
        </p>
        <p class="guide-disclaimer">{{ meta.disclaimer }}</p>
      </header>

      <nav class="guide-toc no-print" aria-label="Sections">
        <h2 class="toc-title">Contents</h2>
        <ol>
          <li v-for="item in toc" :key="item.id">
            <a :href="`#${item.anchor}`">{{ item.title }}</a>
          </li>
        </ol>
      </nav>

      <section
        v-for="section in sections"
        :id="`section-${section.id}`"
        :key="section.id"
        class="guide-section"
      >
        <h2 class="section-title">
          <span class="section-num">{{ section.id }}.</span>
          {{ section.title }}
        </h2>

        <div
          v-for="(sub, idx) in section.subsections"
          :key="`${section.id}-${idx}`"
          class="guide-sub"
        >
          <h3>{{ sub.title }}</h3>
          <p v-for="(para, pIdx) in sub.body || []" :key="pIdx">{{ para }}</p>
          <div v-for="(list, lIdx) in sub.lists || []" :key="lIdx" class="guide-list-block">
            <h4 v-if="list.title">{{ list.title }}</h4>
            <ul>
              <li v-for="(item, iIdx) in list.items" :key="iIdx">{{ item }}</li>
            </ul>
          </div>
          <p v-if="sub.tip" class="guide-tip">
            <strong>Tip:</strong> {{ sub.tip }}
          </p>
        </div>
      </section>

      <footer class="guide-footer">
        <p>
          Full text for editors and ops:
          <code>docs/COIN-STUDY-GUIDE-AUTHENTICATION.txt</code>
          in the project repo.
        </p>
        <p class="footer-line">The Franks Standard · thefranksstandard.com · Report fakes on listings in-app</p>
      </footer>
    </div>
  </div>
</template>

<script setup>
import {
  COIN_STUDY_META,
  COIN_STUDY_SECTIONS,
  COIN_STUDY_TOC,
} from '~/utils/coinStudyGuide.js'

const meta = COIN_STUDY_META
const sections = COIN_STUDY_SECTIONS
const toc = COIN_STUDY_TOC

function printPage () {
  if (import.meta.client) window.print()
}

useSeoMeta({
  title: 'Coin authentication study guide (free) | The Franks Standard',
  description:
    'Free guide: struck vs cast coins, Morgan dollar diagnostics, 10-point checklist, and spotting counterfeits on eBay and marketplaces.',
})
</script>

<style scoped>
@import '~/assets/css/learn-hub.css';

h1, h2, h3, h4 {
  font-family: 'Cinzel', Georgia, serif;
  font-weight: 800;
}

.guide-header { margin-bottom: 28px; }
.guide-sub { font-size: 1.15rem; font-weight: 700; color: #374151; margin: 8px 0; }
.guide-meta { font-size: 0.9rem; margin-bottom: 12px; }
.guide-disclaimer {
  font-size: 0.88rem;
  font-weight: 600;
  color: #92400e;
  background: #fffbeb;
  border: 1px solid #fde68a;
  border-radius: 8px;
  padding: 12px 14px;
  line-height: 1.5;
}

.guide-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 20px;
}

.guide-toc {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  padding: 16px 20px;
  margin-bottom: 32px;
}

.toc-title { font-size: 1rem; margin: 0 0 10px; color: #92400e; }
.guide-toc ol { margin: 0; padding-left: 1.25rem; }
.guide-toc li { margin-bottom: 6px; font-weight: 600; }
.guide-toc a { color: #146eb4; text-decoration: none; }
.guide-toc a:hover { text-decoration: underline; }

.guide-section {
  margin-bottom: 36px;
  padding-bottom: 24px;
  border-bottom: 1px solid #e5e7eb;
}

.section-title { font-size: 1.35rem; color: #1e3a5f; margin-bottom: 16px; }
.section-num { color: #92400e; }

.guide-sub { margin-bottom: 20px; }
.guide-sub h3 { font-size: 1.05rem; color: #374151; margin: 0 0 10px; }
.guide-sub p { line-height: 1.65; margin: 0 0 10px; font-weight: 500; color: #1f2937; }

.guide-list-block { margin: 12px 0; }
.guide-list-block h4 { font-size: 0.95rem; margin: 0 0 8px; color: #6b7280; }
.guide-list-block ul { margin: 0; padding-left: 1.2rem; }
.guide-list-block li { margin-bottom: 6px; line-height: 1.55; font-weight: 600; }

.guide-tip {
  background: #eff6ff;
  border-left: 4px solid #146eb4;
  padding: 10px 12px;
  border-radius: 0 8px 8px 0;
  font-size: 0.92rem;
}

.guide-footer {
  margin-top: 24px;
  font-size: 0.85rem;
  color: #6b7280;
}

.guide-footer code { font-size: 0.8rem; }
.footer-line { margin-top: 16px; font-weight: 700; }

.eyebrow a { color: #146eb4; font-weight: 700; }

@media print {
  .no-print { display: none !important; }
  .guide-section { break-inside: avoid; }
}
</style>
