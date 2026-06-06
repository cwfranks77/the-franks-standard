<script setup>
import { BC_BRAND } from '~/utils/bcBrand.js'
import { getBcOpsPanelPath } from '~/utils/bcSupport.js'

definePageMeta({ layout: 'bc-audio', middleware: 'bc-ops-host' })

const router = useRouter()
const { isAuthed } = useOpsSession()
const { phrase, error, submitting, keyConfigured, submit } = useOpsUnlock()

onMounted(() => {
  if (isAuthed.value) {
    router.replace(getBcOpsPanelPath())
  }
})

async function submitAndGo () {
  const ok = await submit()
  if (ok) await router.push(getBcOpsPanelPath())
}

useSeoMeta({
  title: `Owner unlock — ${BC_BRAND.full}`,
  robots: 'noindex, nofollow',
})
</script>

<template>
  <div class="bc-ops-landing">
    <div class="bc-ops-box">
      <p class="bc-ops-eyebrow">{{ BC_BRAND.full }} · Owner only</p>
      <h1>B&amp;C operator area</h1>
      <p class="bc-ops-sub">
        This toolkit only works on <strong>www.bcpoweraudio.com</strong>. Same operator phrase as The Franks Standard.
        Tap the B&amp;C logo five times on the storefront to open this faster.
      </p>

      <form class="bc-ops-form" @submit.prevent="submitAndGo">
        <div v-if="!keyConfigured" class="bc-ops-warn" role="alert">
          Operator key missing on this build. Set <code>NUXT_PUBLIC_OPS_ACCESS_KEY</code> in GitHub Actions and redeploy the B&amp;C site.
        </div>
        <template v-else>
          <label class="label" for="bc-ops-phrase">Operator phrase</label>
          <input
            id="bc-ops-phrase"
            v-model="phrase"
            class="input"
            type="password"
            autocomplete="off"
            placeholder="Same password as Franks owner unlock"
          />
        </template>
        <p v-if="error" class="bc-ops-err" role="alert">{{ error }}</p>
        <div class="bc-ops-actions">
          <NuxtLink to="/bc-audio" class="btn btn-outline btn-sm">Storefront</NuxtLink>
          <button type="submit" class="btn btn-primary btn-sm" :disabled="!keyConfigured || submitting">
            {{ submitting ? 'Checking…' : 'Unlock B&C toolkit' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<style scoped>
.bc-ops-landing { min-height: 50vh; display: flex; align-items: center; justify-content: center; padding: 2rem 1.25rem; }
.bc-ops-box { max-width: 440px; width: 100%; padding: 28px; border-radius: 12px; background: #16161c; border: 1px solid rgba(211,47,47,0.3); }
.bc-ops-eyebrow { font-size: 0.72rem; text-transform: uppercase; letter-spacing: 0.14em; color: #ff5252; margin: 0 0 8px; }
.bc-ops-box h1 { font-size: 1.4rem; margin: 0 0 10px; }
.bc-ops-sub { font-size: 0.9rem; color: #9ca3af; margin-bottom: 20px; line-height: 1.5; }
.bc-ops-warn { font-size: 0.85rem; padding: 10px; border-radius: 8px; background: rgba(211,47,47,0.12); margin-bottom: 12px; }
.bc-ops-err { color: #ff5252; font-size: 0.88rem; }
.bc-ops-actions { display: flex; gap: 10px; justify-content: flex-end; margin-top: 16px; }
</style>
