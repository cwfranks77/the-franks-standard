<template>
  <div class="aff-redirect">
    <p class="text-muted">Opening The Franks Standard…</p>
    <p v-if="creatorLabel" class="creator-line">Via {{ creatorLabel }}</p>
    <NuxtLink :to="destination" class="btn btn-primary btn-sm">Continue</NuxtLink>
  </div>
</template>

<script setup>
import {
  buildAffiliatePath,
  getAffiliatePartner,
  normalizeAffiliateHandle,
} from '~/utils/affiliateProgram.js'

const route = useRoute()
const { captureFromRoute, siteOrigin } = useOutreachAttribution()
const { loadRoster, findPartner } = useAffiliateRoster()

const handle = computed(() => normalizeAffiliateHandle(route.params.handle))
const partner = computed(() => findPartner(handle.value))

const creatorLabel = computed(() => partner.value?.displayName || (handle.value ? `@${handle.value}` : ''))

const destination = computed(() => {
  if (!handle.value) return '/sell'
  return buildAffiliatePath(handle.value, siteOrigin(), {
    partner: partner.value,
    landing: partner.value?.landing,
  })
})

onMounted(() => {
  loadRoster()
  captureFromRoute(route)
  navigateTo(destination.value, { replace: true })
})

definePageMeta({ layout: false })

useSeoMeta({
  title: 'Partner link — The Franks Standard',
  robots: 'noindex, nofollow',
})
</script>

<style scoped>
.aff-redirect {
  min-height: 40vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 48px 20px;
}
.creator-line { font-weight: 700; color: #92400e; }
</style>
