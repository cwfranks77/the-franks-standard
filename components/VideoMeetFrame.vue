<template>
  <div class="video-wrap">
    <iframe
      :title="`Video call: ${props.room}`"
      :src="src"
      class="video-iframe"
      allow="camera; microphone; fullscreen; display-capture; autoplay; clipboard-read; clipboard-write"
      allowfullscreen
    />
  </div>
</template>

<script setup lang="ts">
import { jitsiRoomUrl } from '~/composables/useVideoRoom'

const props = withDefaults(defineProps<{
  room: string
  displayName?: string
}>(), { displayName: '' })

const src = computed(() => {
  return jitsiRoomUrl(props.room, props.displayName || undefined)
})
</script>

<style scoped>
.video-wrap {
  position: relative;
  width: 100%;
  min-height: min(80vh, 720px);
  background: #0a0a0a;
  border-radius: var(--radius-lg);
  overflow: hidden;
  border: 1px solid rgba(0, 224, 255, 0.2);
  box-shadow: 0 12px 40px rgba(0,0,0,0.4);
}
.video-iframe {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  border: none;
}
</style>
