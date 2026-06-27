<template>
  <div class="lookup-page">
    <div class="container lookup-wrap">
      <p class="eyebrow">Owner · desktop</p>
      <h1>eBay seller → Google + links</h1>
      <p class="sub text-muted">
        Paste a store link (<code>/str/</code>), profile (<code>/usr/</code>), or username — then open Google, Maps, and eBay links.
      </p>

      <label class="label" for="seller-paste">Paste seller URL or username</label>
      <textarea
        id="seller-paste"
        ref="pasteRef"
        v-model="rawList"
        class="paste input"
        rows="6"
        placeholder="https://www.ebay.com/str/microbaycoins"
        @keydown.ctrl.enter.prevent="build"
        @keydown.meta.enter.prevent="build"
      />

      <button type="button" class="btn btn-primary btn-lg full" @click="build">
        Build Google + eBay links
      </button>

      <p v-if="status" class="status" :class="statusKind">{{ status }}</p>

      <div v-if="rows.length" class="results">
        <article v-for="r in rows" :key="r.username" class="seller-card card">
          <h2 class="seller-name">{{ r.username }}</h2>
          <a
            :href="r.google_physical_url"
            class="btn-google"
            target="_blank"
            rel="noopener noreferrer"
          >Physical store ↗</a>
          <a
            :href="r.google_maps_url"
            class="btn-google btn-google--muted"
            target="_blank"
            rel="noopener noreferrer"
          >Google Maps ↗</a>
          <a
            :href="r.google_url"
            class="btn-google btn-google--muted"
            target="_blank"
            rel="noopener noreferrer"
          >Contact / IG ↗</a>
          <p class="ebay-links">
            <a :href="r.store_url" target="_blank" rel="noopener noreferrer">
              {{ r.is_ebay_store ? 'eBay store' : 'Listings' }}
            </a>
            ·
            <a :href="r.profile_url" target="_blank" rel="noopener noreferrer">eBay profile</a>
          </p>
        </article>
      </div>

      <p class="foot-nav text-muted">
        <NuxtLink to="/ops/panel">← Operator console</NuxtLink>
        ·
        <NuxtLink to="/ops/sellers-phone">Phone lookup</NuxtLink>
        ·
        <NuxtLink to="/ops/find-sellers">Redirect helper</NuxtLink>
      </p>
    </div>
  </div>
</template>

<script setup>
definePageMeta({ middleware: 'ops-auth' })
useSeoMeta({ title: 'Seller lookup — Google', robots: 'noindex' })

const route = useRoute()
const pasteRef = ref(null)
const { rawList, rows, status, statusKind, buildFromText } = useSellerLinkBuilder()

function build () {
  const text = pasteRef.value?.value ?? rawList.value
  rawList.value = text
  buildFromText(text)
}

onMounted(() => {
  const q = route.query.url || route.query.q
  if (q) {
    rawList.value = String(q)
    buildFromText(rawList.value)
  }
})
</script>

<style scoped>
.lookup-page { padding: 32px 0 64px; }
.lookup-wrap { max-width: 720px; }
.eyebrow {
  font-size: 0.7rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--gold);
  margin: 0 0 8px;
}
.lookup-wrap h1 { font-size: 1.5rem; margin: 0 0 8px; }
.sub { margin-bottom: 20px; line-height: 1.55; }
.sub code { font-size: 0.9em; }
.paste { width: 100%; min-height: 120px; margin-bottom: 12px; font-size: 1rem; }
.full { width: 100%; margin-top: 4px; }
.status {
  margin-top: 14px;
  padding: 12px 14px;
  border-radius: 8px;
  font-weight: 600;
}
.status.ok { background: #ecfdf5; border: 2px solid #22c55e; color: #14532d; }
.status.warn { background: #fffbeb; border: 2px solid #f59e0b; color: #78350f; }
.status.err { background: #fee2e2; border: 2px solid #ef4444; color: #991b1b; }
.results { margin-top: 24px; display: flex; flex-direction: column; gap: 12px; }
.seller-card { padding: 16px; border: 2px solid #22c55e; }
.seller-name {
  font-size: 1.2rem;
  font-weight: 800;
  margin: 0 0 12px;
  word-break: break-all;
}
.btn-google {
  display: block;
  text-align: center;
  padding: 14px;
  margin-bottom: 8px;
  background: linear-gradient(180deg, #ffd814, #f7ca00);
  color: #111;
  font-weight: 800;
  text-decoration: none;
  border-radius: 10px;
}
.btn-google--muted { opacity: 0.9; }
.ebay-links { margin: 8px 0 0; font-size: 0.9rem; }
.ebay-links a { color: #146eb4; font-weight: 700; }
.foot-nav { margin-top: 28px; font-size: 0.9rem; }
.foot-nav a { color: #146eb4; font-weight: 700; }
</style>
