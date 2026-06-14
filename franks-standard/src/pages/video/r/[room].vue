<template>
  <div v-if="valid" class="container video-room">
    <div class="room-bar">
      <NuxtLink to="/video" class="back">&larr; Video home</NuxtLink>
      <p class="room-hint text-muted">Share this page&rsquo;s address or the code: <code>{{ room }}</code></p>
      <button type="button" class="btn btn-outline btn-sm" @click="copyLink">Copy link</button>
    </div>
    <VideoMeetFrame :room="room" :display-name="displayName" />
  </div>
  <div v-else class="container video-room-bad">
    <p>That is not a valid room code. Use the link from your counterparty or <NuxtLink to="/video">start a new call</NuxtLink>.</p>
  </div>
</template>

<script setup>
import { isValidRoomSlug } from '~/composables/useVideoRoom'

definePageMeta({ layout: 'default' })
useSeoMeta({ title: 'Video call room — The Franks Standard' })

const route = useRoute()
const room = computed(() => (route.params.room || '').toString().trim())
const displayName = computed(() => (route.query.n || '').toString().trim())

const valid = computed(() => isValidRoomSlug(room.value))

async function copyLink () {
  if (!import.meta.client) { return }
  try {
    await navigator.clipboard.writeText(window.location.href)
  } catch {
    /* no-op */
  }
}
</script>

<style scoped>
.video-room { padding: 0 0 2.5rem; }
.room-bar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 10px 16px;
  margin: 0.5rem 0 1rem;
  font-size: 0.88rem;
}
.back { color: var(--gold); }
.room-hint { margin: 0; flex: 1; min-width: 200px; }
.room-hint code { color: var(--stone-200); font-size: 0.8rem; }
.video-room-bad { padding: 3rem 0; }
</style>
