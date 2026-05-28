<template>
  <div class="find-page">
    <div class="container">
      <p class="eyebrow">Owner toolkit</p>
      <h1>Find eBay sellers — Google links</h1>
      <p class="lead text-muted">
        No HTML upload. Paste seller usernames (one per line) — each row gets a <strong>Google ↗</strong> link.
      </p>
      <p class="phone-link">
        <NuxtLink to="/ops/sellers-phone" class="btn btn-primary btn-sm">Use phone-optimized page instead →</NuxtLink>
      </p>

      <section class="card panel hero">
        <h2>Paste usernames</h2>
        <textarea
          v-model="rawList"
          class="input paste-area"
          rows="10"
          placeholder="cardshop99&#10;breaks_n_cards&#10;psa_seller_ohio"
        />
        <button type="button" class="btn btn-primary btn-lg mt-1" @click="buildList">
          Build Google + eBay links
        </button>
        <p class="text-muted small mt-1">
          Tip: On eBay search results, click a listing → seller name → copy username from the profile URL.
        </p>
      </section>

      <section v-if="rows.length" class="card panel">
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
              <a :href="r.store_url" target="_blank" rel="noopener noreferrer">Store</a>
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
                  <a :href="r.store_url" class="link-sm" target="_blank" rel="noopener noreferrer">Store</a>
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
import { parseSellerUsernameList } from '~/utils/parseSellerUsernames.js'

definePageMeta({ middleware: 'ops-auth' })
useSeoMeta({ title: 'Find sellers — Google', robots: 'noindex' })

const rawList = ref('')
const rows = ref([])

function buildList () {
  rows.value = parseSellerUsernameList(rawList.value)
}

async function copyAllGoogle () {
  const text = rows.value.map((r) => r.google_url).join('\n')
  try {
    await navigator.clipboard.writeText(text)
  } catch {}
}
</script>

<style scoped>
.find-page { padding: 40px 16px 80px; }
.eyebrow { font-size: 0.72rem; letter-spacing: 0.12em; text-transform: uppercase; color: var(--gold); }
.lead { max-width: 720px; line-height: 1.6; }
.card.panel { padding: 1.25rem; margin-bottom: 1rem; }
.hero { border-color: rgba(247, 202, 0, 0.4); }
.hero h2 { color: var(--gold); }
.paste-area { width: 100%; min-height: 160px; font-family: inherit; }
.mt-1 { margin-top: 12px; }
.panel-head { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px; }
.table-wrap { overflow-x: auto; }
table { width: 100%; border-collapse: collapse; font-size: 0.9rem; }
th, td { padding: 10px; border-bottom: 1px solid #374151; text-align: left; }
.btn-google {
  display: inline-block;
  padding: 6px 14px;
  background: var(--gold);
  color: #111;
  font-weight: 700;
  border-radius: 6px;
  text-decoration: none;
}
.link-sm { color: #93c5fd; }
.alt ul { line-height: 1.8; padding-left: 1.2rem; }
.phone-link { margin-bottom: 1rem; }
.mobile-cards { display: none; }
.m-card {
  border: 1px solid #374151;
  border-radius: 12px;
  padding: 14px;
  margin-bottom: 10px;
}
.m-name { font-weight: 700; margin-bottom: 10px; word-break: break-all; }
.btn-google.block { display: block; text-align: center; margin-bottom: 8px; padding: 12px; }
.m-links { display: flex; gap: 12px; font-size: 0.88rem; }
.m-links a { color: #93c5fd; }
@media (max-width: 768px) {
  .mobile-cards { display: block; }
  .desktop-only { display: none; }
  .paste-area { font-size: 16px; min-height: 140px; }
  .btn-primary.btn-lg { width: 100%; padding: 14px; }
}
.back-link { margin-top: 1.5rem; }
</style>
