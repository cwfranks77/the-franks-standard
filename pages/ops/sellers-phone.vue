<template>
  <div class="phone-page">
    <header class="phone-head">
      <p class="eyebrow">Owner · phone</p>
      <h1>eBay sellers on your phone</h1>
      <p class="sub">Paste names → tap gold <strong>Google</strong> → DM on Instagram or website. No file upload needed.</p>
    </header>

    <section class="phone-card">
      <h2>1. Copy usernames on eBay app</h2>
      <ol class="steps">
        <li>Open eBay app → search your niche (e.g. sports cards PSA).</li>
        <li>Tap a listing → tap <strong>seller name</strong>.</li>
        <li>On profile, copy username from the top or from the URL.</li>
        <li>Paste each name below (one per line).</li>
      </ol>
    </section>

    <section class="phone-card">
      <h2>2. Paste here</h2>
      <textarea
        ref="pasteRef"
        v-model="rawList"
        class="paste"
        rows="8"
        placeholder="seller_one&#10;seller_two&#10;seller_three"
        enterkeyhint="done"
      />
      <button type="button" class="btn-build" @click="buildList">
        Build {{ rows.length ? rows.length : '' }} seller links
      </button>
      <p v-if="status" class="status">{{ status }}</p>
    </section>

    <section v-if="rows.length" class="phone-results">
      <p class="results-title">{{ rows.length }} sellers — tap Google on each</p>
      <article v-for="r in rows" :key="r.username" class="seller-card">
        <div class="seller-name">{{ r.username }}</div>
        <div class="seller-actions">
          <a :href="r.google_url" class="btn-google" target="_blank" rel="noopener noreferrer">Google ↗</a>
          <a :href="r.store_url" class="btn-secondary" target="_blank" rel="noopener noreferrer">{{ r.is_ebay_store ? 'Store' : 'eBay' }}</a>
        </div>
        <button type="button" class="btn-copy-msg" @click="copyPitch(r)">Copy invite text</button>
      </article>
    </section>

    <section class="phone-card muted">
      <h2>Message to send (not CSV)</h2>
      <p class="pitch">{{ defaultPitch }}</p>
      <button type="button" class="btn-secondary full" @click="copyPitch()">Copy pitch</button>
    </section>

    <nav class="phone-nav">
      <NuxtLink to="/ops/panel">← Console</NuxtLink>
      <NuxtLink to="/ops/find-sellers">Desktop view</NuxtLink>
    </nav>
  </div>
</template>

<script setup>
definePageMeta({ middleware: 'ops-auth', layout: 'default' })
useSeoMeta({ title: 'Sellers (phone)', robots: 'noindex' })

const pasteRef = ref(null)
const { rawList, rows, status, buildFromText } = useSellerLinkBuilder()

const defaultPitch =
  'Hi — I run The Franks Standard, a collectibles marketplace with escrow checkout and lower seller fees. ' +
  'If you want a second place to list: thefranksstandard.com/sell — happy to help. — Charles'

function buildList () {
  const text = pasteRef.value?.value ?? rawList.value
  rawList.value = text
  buildFromText(text)
}

async function copyPitch (row) {
  const text = row
    ? `Hi ${row.username} — I run The Franks Standard (collectibles, escrow, lower fees). List free: thefranksstandard.com/sell`
    : defaultPitch
  try {
    await navigator.clipboard.writeText(text)
    status.value = 'Copied to clipboard.'
  } catch {
    status.value = 'Copy failed — select text manually.'
  }
}
</script>

<style scoped>
.phone-page {
  max-width: 480px;
  margin: 0 auto;
  padding: 16px 16px 100px;
  min-height: 100dvh;
}
.phone-head { margin-bottom: 20px; }
.eyebrow { font-size: 0.7rem; letter-spacing: 0.1em; text-transform: uppercase; color: var(--gold); }
.phone-head h1 { font-size: 1.45rem; margin: 6px 0; }
.sub { color: #9ca3af; font-size: 0.95rem; line-height: 1.5; }
.phone-card {
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 14px;
  padding: 16px;
  margin-bottom: 14px;
}
.phone-card h2 { font-size: 1rem; color: var(--gold); margin-bottom: 10px; }
.steps { padding-left: 1.1rem; line-height: 1.65; font-size: 0.92rem; color: #d1d5db; }
.steps li { margin-bottom: 8px; }
.paste {
  width: 100%;
  font-size: 16px;
  padding: 12px;
  border-radius: 10px;
  border: 1px solid #4b5563;
  background: #111;
  color: #f9fafb;
  min-height: 140px;
}
.btn-build {
  width: 100%;
  margin-top: 12px;
  padding: 16px;
  font-size: 1.05rem;
  font-weight: 700;
  border: none;
  border-radius: 12px;
  background: var(--gold);
  color: #111;
  cursor: pointer;
}
.btn-build:disabled { opacity: 0.45; }
.status { margin-top: 10px; font-size: 0.9rem; color: #fef3c7; }
.results-title { font-weight: 600; margin-bottom: 12px; color: #86efac; }
.seller-card {
  background: #0f0f14;
  border: 1px solid #374151;
  border-radius: 12px;
  padding: 14px;
  margin-bottom: 10px;
}
.seller-name { font-weight: 700; font-size: 1.05rem; margin-bottom: 10px; word-break: break-all; }
.seller-actions { display: flex; gap: 10px; margin-bottom: 8px; }
.btn-google {
  flex: 1;
  text-align: center;
  padding: 14px 10px;
  background: var(--gold);
  color: #111;
  font-weight: 700;
  border-radius: 10px;
  text-decoration: none;
  font-size: 1rem;
}
.btn-secondary {
  flex: 1;
  text-align: center;
  padding: 14px 10px;
  border: 1px solid #6b7280;
  color: #e5e7eb;
  border-radius: 10px;
  text-decoration: none;
  background: transparent;
  font-size: 1rem;
  cursor: pointer;
}
.btn-copy-msg {
  width: 100%;
  padding: 10px;
  background: transparent;
  border: 1px solid #4b5563;
  color: #93c5fd;
  border-radius: 8px;
  font-size: 0.88rem;
}
.pitch { font-size: 0.9rem; line-height: 1.55; color: #d1d5db; }
.full { width: 100%; margin-top: 10px; }
.muted { opacity: 0.95; }
.phone-nav {
  display: flex;
  justify-content: space-between;
  margin-top: 20px;
  font-size: 0.9rem;
}
.phone-nav a { color: #93c5fd; }
</style>
