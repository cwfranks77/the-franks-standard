<template>
  <div class="bc-audio-shell">
    <BcAudioNav />
    <main class="bc-audio-main">
      <slot />
    </main>

    <OperatorUnlockModal
      :open="opModalOpen"
      :phrase="opPhrase"
      :error="opError"
      :submitting="opSubmitting"
      :key-configured="keyConfigured"
      :is-dev="isDev"
      @update:phrase="opPhrase = $event"
      @close="closeOpModal"
      @submit="submitOpModal"
    />

    <BcAiSupportDrawer />
    <BcInstallApp />
    <BcCatalogUpdateToast />

    <footer class="bc-audio-footer">
      <p>
        B&amp;C Performance Audio LLC — a division of
        <a :href="franksParentUrl" target="_blank" rel="noopener noreferrer">The Franks Standard</a>.
        Partner stores: use <strong>Shop Stores</strong> in the menu.
      </p>
    </footer>
  </div>
</template>

<script setup>
import '~/assets/css/bc-premium-theme.css'
import { BC_LEGAL_NAME } from '~/utils/bcSeo.js'
import { franksMarketplacePath } from '~/utils/franksMarketplaceUrl.js'

const config = useRuntimeConfig()
const franksParentUrl = computed(() => franksMarketplacePath(config, '/'))

useBcTheme()

const { refresh: refreshCatalog } = useBcProductCatalog()
onMounted(() => { refreshCatalog() })

useHead({
  titleTemplate: (title) => title || BC_LEGAL_NAME,
})

const {
  isDev,
  opModalOpen,
  opPhrase,
  opError,
  opSubmitting,
  keyConfigured,
  onBrandOrLogoClick,
  closeOpModal,
  submitOpModal,
} = useOpsLogoKnock()

provide('opsLogoKnock', onBrandOrLogoClick)
</script>

<style scoped>
.bc-audio-shell {
  min-height: 100vh;
  background: #0a0a0c;
  color: #f5f5f7;
}
.bc-audio-main {
  min-height: calc(100vh - 64px);
}
.bc-audio-footer {
  padding: 1.25rem 1.5rem 1.75rem;
  border-top: 1px solid rgba(211, 47, 47, 0.2);
  text-align: center;
  font-size: 0.72rem;
  line-height: 1.55;
  color: #6b7280;
}
.bc-audio-footer a {
  color: #9ca3af;
  text-decoration: underline;
  text-underline-offset: 2px;
}
.bc-audio-footer a:hover { color: #ff5252; }
.bc-audio-footer strong { color: #9ca3af; font-weight: 700; }
</style>
