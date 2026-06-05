<template>
  <div class="marketplace-landing marketplace-dark">
    <div class="site-ribbon" role="status" aria-label="Site highlights">
      <div class="container site-ribbon-inner">
        <span class="ribbon-txt">{{ RIBBON_LINE_PROOF }}</span>
        <span class="ribbon-dot" aria-hidden="true" />
        <NuxtLink :to="AUTH_EDUCATION_HUB_PATH" class="ribbon-txt ribbon-txt--link">
          {{ RIBBON_LINE_EDUCATION }} →
        </NuxtLink>
        <span class="ribbon-dot" aria-hidden="true" />
        <span class="ribbon-txt">{{ RIBBON_LINE_ESCROW }}</span>
        <span class="ribbon-dot" aria-hidden="true" />
        <span class="ribbon-txt">4–5% seller fees · FOUNDERS10: 3 mo Pro free</span>
      </div>
    </div>

    <EbayMarketHeader
      :on-home="true"
      :is-owner="isOwner"
      @brand-click="onBrandOrLogoClick"
    />

    <div class="site-trust" aria-label="Why buyers and sellers use this marketplace">
      <div class="container trust-chip-row">
        <NuxtLink to="/how-it-works" class="trust-chip">Escrow · buyer confirms delivery</NuxtLink>
        <NuxtLink to="/learn/tools" class="trust-chip">Coin &amp; authenticity tools</NuxtLink>
        <NuxtLink to="/sell/import" class="trust-chip">Import from eBay</NuxtLink>
        <NuxtLink to="/store-builder" class="trust-chip">AI Store Builder</NuxtLink>
        <NuxtLink to="/video" class="trust-chip">Video inspect</NuxtLink>
        <NuxtLink to="/join/founders10" class="trust-chip">FOUNDERS10 · 3 mo Pro</NuxtLink>
      </div>
    </div>

    <main class="marketplace-landing__main">
      <MarketplaceHome :homepage="homepagePayload" />
    </main>

    <MarketplaceLandingFooter />

    <Teleport to="body">
      <div
        v-if="opModalOpen"
        class="op-modal-backdrop"
        @click.self="closeOpModal"
      >
        <div
          class="op-modal"
          role="dialog"
          aria-modal="true"
          aria-label="Operator unlock"
        >
          <h2 class="op-modal-h">Operator access</h2>
          <p class="op-modal-sub text-muted">
            Enter the value of <code>NUXT_PUBLIC_OPS_ACCESS_KEY</code> from your <code>.env</code> (build) or the matching GitHub Actions secret.
          </p>
          <p v-if="isDev" class="op-hint text-muted">
            Dev: open the modal with <code>?ops=unlock</code> on any URL, then set a key in <code>.env</code> and restart.
          </p>
          <form @submit.prevent="submitOpModal">
            <div v-if="!keyConfigured" class="op-warn" role="alert">
              Add <code>NUXT_PUBLIC_OPS_ACCESS_KEY</code> in <code>.env</code> and in GitHub Actions secrets, then rebuild.
            </div>
            <template v-else>
              <div class="form-group">
                <label class="label" for="op-phrase">Your phrase (access key)</label>
                <input
                  id="op-phrase"
                  v-model="opPhrase"
                  class="input"
                  type="password"
                  autocomplete="off"
                  placeholder="Type the same value as in NUXT_PUBLIC_OPS_ACCESS_KEY"
                />
              </div>
            </template>
            <p v-if="opError" class="op-err" role="alert">{{ opError }}</p>
            <div class="op-modal-actions">
              <button type="button" class="btn btn-outline btn-sm" @click="closeOpModal">Cancel</button>
              <button
                type="submit"
                class="btn btn-primary btn-sm"
                :disabled="!keyConfigured || opSubmitting"
              >{{ opSubmitting ? 'Checking' : 'Unlock' }}</button>
            </div>
          </form>
        </div>
      </div>
    </Teleport>

    <NuxtLink v-if="isOwner" to="/sell/start" class="owner-sell-fab" title="Create a listing (free)">
      <span class="fab-plus">+</span>
      <span class="fab-label">Sell</span>
    </NuxtLink>
  </div>
</template>

<script setup>
import { DEFAULT_HOMEPAGE } from '~/utils/ownerConfigDefaults'
import { BC_BRAND } from '~/utils/bcBrand.js'
import {
  AUTH_EDUCATION_HUB_PATH,
  RIBBON_LINE_EDUCATION,
  RIBBON_LINE_ESCROW,
  RIBBON_LINE_PROOF,
} from '~/utils/authenticityEducation.js'

async function fetchHomepageContent () {
  try {
    return await $fetch('/api/public/site-content', { query: { keys: 'homepage' } })
  } catch {
    return { homepage: DEFAULT_HOMEPAGE }
  }
}

const { data: siteContent } = await useAsyncData('homepage-content', fetchHomepageContent, {
  default: () => ({ homepage: DEFAULT_HOMEPAGE }),
})

const homepagePayload = computed(() => ({
  ...DEFAULT_HOMEPAGE,
  ...(siteContent.value?.homepage || {}),
}))

useSeoMeta({
  title: 'The Franks Standard — Marketplace for Collectibles & Partner Stores',
  description: `Browse authenticated listings and partner dropship stores including ${BC_BRAND.full} on The Franks Standard.`,
})

const route = useRoute()
const router = useRouter()
const { isOwner } = useOwnerMode()
const isDev = computed(() => import.meta.dev)

const opModalOpen = ref(false)
const {
  phrase: opPhrase,
  error: opError,
  submitting: opSubmitting,
  keyConfigured,
  submit: submitOpsPhrase,
} = useOpsUnlock()
let opKnockClicks = 0
let opKnockTimer = null

function tryOpenOpsFromQuery () {
  if (!import.meta.client || !import.meta.dev) return
  const q = route.query
  if (String(q.ops) === 'unlock') {
    opModalOpen.value = true
    opError.value = ''
    const { ops: _drop, ...rest } = q
    router.replace({ path: route.path, query: rest })
  }
}
onMounted(tryOpenOpsFromQuery)
watch(() => [route.path, route.query], tryOpenOpsFromQuery, { deep: true })

function onBrandOrLogoClick (e) {
  e.preventDefault()
  if (opKnockTimer) clearTimeout(opKnockTimer)
  opKnockClicks += 1
  opKnockTimer = setTimeout(() => { opKnockClicks = 0 }, 2800)
  if (opKnockClicks >= 5) {
    opKnockClicks = 0
    if (opKnockTimer) clearTimeout(opKnockTimer)
    opModalOpen.value = true
    opError.value = ''
  }
}

function closeOpModal () {
  opModalOpen.value = false
  opPhrase.value = ''
  opError.value = ''
}

async function submitOpModal () {
  const ok = await submitOpsPhrase()
  if (ok) {
    closeOpModal()
    await router.push('/ops/panel')
  }
}
</script>

<style scoped>
.marketplace-landing {
  min-height: 100vh;
  background: #0a0a0c;
  color: #f5f5f7;
}
.marketplace-landing__main {
  display: block;
}
.site-trust {
  background: rgba(0, 0, 0, 0.25);
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
}
.op-modal-backdrop {
  position: fixed;
  inset: 0;
  z-index: 10000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(4px);
}
.op-modal {
  max-width: 400px;
  width: 100%;
  padding: 28px 24px;
  background: #16161c;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  box-shadow: 0 24px 50px rgba(0, 0, 0, 0.5);
}
.op-modal-h { font-size: 1.25rem; margin-bottom: 6px; color: #f5f5f7; }
.op-modal-sub { font-size: 0.9rem; margin-bottom: 16px; }
.op-warn {
  font-size: 0.85rem;
  color: #e5e7eb;
  background: rgba(211, 47, 47, 0.12);
  border: 1px solid rgba(211, 47, 47, 0.35);
  border-radius: 8px;
  padding: 10px;
  margin-bottom: 12px;
}
.op-err { color: #ff5252; font-size: 0.88rem; margin-top: 6px; }
.op-modal-actions { display: flex; justify-content: flex-end; gap: 10px; margin-top: 16px; }
.op-hint { font-size: 0.8rem; margin: 0 0 8px; }
.owner-sell-fab {
  position: fixed;
  bottom: 90px;
  right: 24px;
  z-index: 9000;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 14px 22px;
  border-radius: 999px;
  background: linear-gradient(135deg, #ffd814 0%, #ffb020 100%);
  color: #0a0a0c;
  font-weight: 700;
  font-size: 0.95rem;
  box-shadow: 0 4px 24px rgba(255, 216, 20, 0.35);
  text-decoration: none;
}
.owner-sell-fab:hover {
  transform: translateY(-2px);
  color: #0a0a0c;
}
.fab-plus { font-size: 1.3rem; font-weight: 900; line-height: 1; }
</style>
