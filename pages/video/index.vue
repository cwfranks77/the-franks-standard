<template>
  <div class="container video-hub">
    <h1>Video call</h1>
    <p class="lede text-muted">
      Start a private room, share the link (or the room code) with the buyer or seller. You both use the same room
      in your browsers; camera and mic run through Jitsi&rsquo;s public meet service&mdash;no app install required.
    </p>

    <div class="card-panel">
      <h2>Start a new call</h2>
      <p class="text-muted sm">Creates a random room that only people with the link can find.</p>
      <div class="row">
        <label class="label" for="vname">Display name in the call (optional)</label>
        <input
          id="vname"
          v-model="displayName"
          class="input"
          type="text"
          maxlength="50"
          placeholder="e.g. Alex, buyer for card #12"
        />
        <button type="button" class="btn btn-primary" @click="startNew">Start video room</button>
      </div>
    </div>

    <div class="card-panel">
      <h2>Join with a code</h2>
      <p class="text-muted sm">If someone sent you a room name that starts with <code>FranksStd</code>, paste it here.</p>
      <div class="row">
        <input
          v-model="joinCode"
          class="input"
          type="text"
          autocomplete="off"
          placeholder="FranksStd..."
        />
        <button type="button" class="btn btn-outline" :disabled="!canJoin" @click="goJoin">Join</button>
      </div>
    </div>

    <p class="fine-print text-muted">
      Video uses <a href="https://jitsi.org" target="_blank" rel="noopener">Jitsi Meet</a> (open source). Do not
      use it to sidestep the marketplace&rsquo;s safety rules; for serious issues, use escrow and in-app messaging
      on record as well.
    </p>
  </div>
</template>

<script setup>
import { createRoomSlug, isValidRoomSlug } from '~/composables/useVideoRoom'

definePageMeta({ layout: 'default' })
useSeoMeta({
  title: 'Video call — The Franks Standard',
  description: 'Meet buyers and sellers in a private browser video room.',
})

const displayName = ref('')
const joinCode = ref('')

const canJoin = computed(() => {
  const s = joinCode.value?.trim() || ''
  if (!s.length) { return false }
  return isValidRoomSlug(s)
})

function startNew () {
  const code = createRoomSlug()
  const name = displayName.value.trim()
  navigateTo({
    path: `/video/r/${code}`,
    query: name ? { n: name } : {},
  })
}

function goJoin () {
  const s = (joinCode.value || '').trim()
  if (!isValidRoomSlug(s)) { return }
  navigateTo({
    path: `/video/r/${s}`,
  })
}
</script>

<style scoped>
.video-hub { padding: 2.5rem 0 4rem; max-width: 640px; }
.video-hub h1 { font-size: 1.75rem; margin-bottom: 0.5rem; }
.lede { font-size: 1rem; line-height: 1.65; margin-bottom: 2rem; }
.card-panel {
  padding: 1.5rem 1.25rem;
  margin-bottom: 1.25rem;
  border: 1px solid var(--stone-800);
  border-radius: var(--radius-lg);
  background: var(--stone-900);
}
.card-panel h2 { font-size: 1.1rem; margin-bottom: 0.35rem; }
.sm { font-size: 0.88rem; margin-bottom: 1rem; }
.row { display: flex; flex-direction: column; gap: 10px; }
.fine-print { font-size: 0.8rem; margin-top: 1.5rem; line-height: 1.5; }
</style>
