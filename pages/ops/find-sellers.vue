<template>
  <div class="find-page">
    <div class="container">
      <p class="eyebrow">Owner toolkit</p>
      <h1>Find eBay sellers — Google links</h1>
      <p class="lead text-muted">
        Paste a store link, profile link, or username — then tap the button. Each seller gets a <strong>Google ↗</strong> link.
      </p>
      <p class="version-stamp text-muted small">Tool version: {{ buildStamp }}</p>
      <p class="phone-link">
        <NuxtLink to="/ops/sellers-phone" class="btn btn-primary btn-sm">Use phone-optimized page instead →</NuxtLink>
      </p>

      <section class="card panel hero">
        <h2>Paste usernames or eBay link</h2>
        <textarea
          ref="pasteRef"
          v-model="rawList"
          class="input paste-area"
          rows="10"
          placeholder="https://www.ebay.com/str/microbaycoins&#10;or paste username: microbaycoins"
          @keydown.enter.ctrl="onBuild"
        />
        <button
          type="button"
          class="btn btn-primary btn-lg mt-1"
          @click="onBuild"
        >
          Build Google + eBay links
        </button>
        <p
          v-if="status"
          class="status-banner"
          :class="'status-banner--' + statusKind"
          role="status"
          aria-live="polite"
        >
          {{ status }}
        </p>
        <p class="text-muted small mt-1">
          Works with <code>ebay.com/str/…</code> store links, <code>ebay.com/usr/…</code> profiles, or plain usernames.
        </p>
      </section>

      <section v-if="lastClickAt && rows.length" ref="resultsRef" class="card panel results-panel">
        <div class="panel-head">
          <h2>{{ rows.length }} sellers</h2>
          <button type="button" class="btn btn-outline btn-sm" @click="copyAllGoogle">Copy all Google URLs</button>
        </div>
        <div class="mobile-cards">
          <article v-for="r in rows" :key="r.username" class="m-card">
            <div class="m-name">{{ r.username }}</div>
            <a :href="r.google_url" class="btn-google block" target="_blank" rel="noopener noreferrer">Google ↗</a>
            <div class="m-links">
              <a :href="r.profile_url" target="_blank" rel="noopener noreferrer">eBay profile</a>
              <a :href="r.store_url" target="_blank" rel="noopener noreferrer">{{ r.is_ebay_store ? 'eBay store' : 'Listings' }}</a>
            </div>
          </article>
        </div>
        <div class="table-wrap desktop-only">
          <table>
            <thead>
              <tr>
                <th>Username</th>
                <th>Find contact</th>
                <th>eBay</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="r in rows" :key="'t-' + r.username">
                <td>{{ r.username }}</td>
                <td>
                  <a :href="r.google_url" class="btn-google" target="_blank" rel="noopener noreferrer">Google ↗</a>
                </td>
                <td>
                  <a :href="r.profile_url" class="link-sm" target="_blank" rel="noopener noreferrer">Profile</a>
                  ·
                  <a :href="r.store_url" class="link-sm" target="_blank" rel="noopener noreferrer">{{ r.is_ebay_store ? 'eBay store' : 'Listings' }}</a>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section class="card panel alt">
        <h2>Other ways</h2>
        <ul>
          <li><NuxtLink to="/ops/ebay-prospects"><strong>Upload saved eBay search page</strong></NuxtLink> — pulls many usernames from one HTML file.</li>
          <li><NuxtLink to="/sell/import"><strong>Import your own eBay listings</strong></NuxtLink> — use <strong>CSV tab</strong> (Seller Hub export) if HTML fails.</li>
        </ul>
      </section>

      <p class="back-link">
        <NuxtLink to="/ops/panel">← Operator console</NuxtLink>
      </p>
    </div>
  </div>
</template>

<script setup>
definePageMeta({ middleware: 'ops-auth' })
useSeoMeta({ title: 'Find sellers — Google', robots: 'noindex' })

const pasteRef = ref(null)
const resultsRef = ref(null)
const {
  BUILD_STAMP: buildStamp,
  rawList,
  rows,
  status,
  statusKind,
  lastClickAt,
  buildFromText,
} = useSellerLinkBuilder()

function pasteTextNow () {
  const el = pasteRef.value
  if (el && typeof el.value === 'string') return el.value
  return rawList.value
}

function onBuild () {
  const text = pasteTextNow()
  rawList.value = text
  buildFromText(text)
  if (rows.value.length) {
    nextTick(() => {
      resultsRef.value?.scrollIntoView?.({ behavior: 'smooth', block: 'start' })
    })
  }
}

async function copyAllGoogle () {
  const text = rows.value.map((r) => r.google_url).join('\n')
  try {
    await navigator.clipboard.writeText(text)
    statusKind.value = 'ok'
    status.value = 'Copied all Google URLs to clipboard.'
  } catch {
    statusKind.value = 'warn'
    status.value = 'Could not copy — select the links manually.'
  }
}
</script>

<style scoped>
.find-page { padding: 40px 16px 80px; }
.eyebrow { font-size: 0.72rem; letter-spacing: 0.12em; text-transform: uppercase; color: var(--gold); }
.lead { max-width: 720px; line-height: 1.6; }
.version-stamp { margin-bottom: 8px; }
.card.panel { padding: 1.25rem; margin-bottom: 1rem; }
.hero { border-color: rgba(247, 202, 0, 0.4); }
.hero h2 { color: var(--gold); }
.paste-area { width: 100%; min-height: 160px; font-family: inherit; font-size: 16px; }
.mt-1 { margin-top: 12px; }
.panel-head { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px; }
.results-panel { border: 2px solid rgba(34, 197, 94, 0.5); background: rgba(34, 197, 94, 0.06); }
.table-wrap { overflow-x: auto; }
table { width: 100%; border-collapse: collapse; font-size: 0.9rem; }
th, td { padding: 10px; border-bottom: 1px solid #d1d5db; text-align: left; color: #1f2937; }
.btn-google {
  display: inline-block;
  padding: 6px 14px;
  background: var(--gold);
  color: #111;
  font-weight: 700;
  border-radius: 6px;
  text-decoration: none;
}
.link-sm { color: #146eb4; font-weight: 600; }
.alt ul { line-height: 1.8; padding-left: 1.2rem; }
.phone-link { margin-bottom: 1rem; }
.mobile-cards { display: none; }
.m-card {
  border: 1px solid #d1d5db;
  border-radius: 12px;
  padding: 14px;
  margin-bottom: 10px;
  background: #fff;
}
.m-name { font-weight: 700; margin-bottom: 10px; word-break: break-all; color: #111; }
.btn-google.block { display: block; text-align: center; margin-bottom: 8px; padding: 12px; }
.m-links { display: flex; gap: 12px; font-size: 0.88rem; }
.m-links a { color: #146eb4; }
@media (max-width: 768px) {
  .mobile-cards { display: block; }
  .desktop-only { display: none; }
  .btn-primary.btn-lg { width: 100%; padding: 14px; }
}
.back-link { margin-top: 1.5rem; }
.status-banner {
  margin-top: 12px;
  padding: 14px 16px;
  border-radius: 8px;
  font-size: 0.95rem;
  line-height: 1.5;
  font-weight: 600;
}
.status-banner--ok {
  background: #ecfdf5;
  border: 2px solid #22c55e;
  color: #14532d;
}
.status-banner--warn {
  background: #fffbeb;
  border: 2px solid #f59e0b;
  color: #78350f;
}
.status-banner--err {
  background: #fef2f2;
  border: 2px solid #ef4444;
  color: #7f1d1d;
}
</style>
