<!--
  Site root: Franks marketplace (thefranksstandard.com) or B&C storefront (bcpoweraudio.com).
  Build picks the view from NUXT_PUBLIC_SITE_URL — same repo, two isolated home UIs.
-->
<script setup>
import { isBcPowerAudioPrimarySite } from '~/utils/bcPrimarySite.js'

const config = useRuntimeConfig()
const bcPrimary = isBcPowerAudioPrimarySite(config.public.siteUrl)

if (bcPrimary) {
  definePageMeta({ layout: 'bc-audio' })
}
</script>

<template>
  <BcAudioStorefrontHome v-if="bcPrimary" />
  <FranksMarketplaceHome v-else />
</template>
