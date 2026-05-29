<template>
  <div class="go-redirect">
    <p class="text-muted">Taking you to {{ label }}…</p>
    <NuxtLink v-if="destination" :to="destination" class="btn btn-primary btn-sm">Continue</NuxtLink>
  </div>
</template>

<script setup>
import { getCampaign, buildTrackedPath } from '~/utils/outreachTracking.js'

const route = useRoute()
const { captureFromRoute } = useOutreachAttribution()

const slug = computed(() => String(route.params.slug || '').toLowerCase())
const campaign = computed(() => getCampaign(slug.value))

const label = computed(() => campaign.value?.label || 'The Franks Standard')
const destination = computed(() => {
  if (!campaign.value) return '/sell'
  return buildTrackedPath(slug.value, {
    ref: route.query.ref,
    promo: route.query.promo,
    utm_source: route.query.utm_source,
    utm_medium: route.query.utm_medium,
    utm_campaign: route.query.utm_campaign,
    utm_content: route.query.utm_content,
  })
})

onMounted(() => {
  captureFromRoute(route)
  navigateTo(destination.value, { replace: true })
})

definePageMeta({ layout: false })

useSeoMeta({
  title: 'Redirect — The Franks Standard',
  robots: 'noindex, nofollow',
})
</script>

<style scoped>
.go-redirect {
  min-height: 40vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  padding: 48px 20px;
}
</style>
