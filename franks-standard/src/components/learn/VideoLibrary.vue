<template>
  <div class="video-library">
    <div v-for="v in videos" :key="v.id" class="video-card">
      <div v-if="v.youtubeId" class="video-embed">
        <iframe
          :src="`https://www.youtube.com/embed/${v.youtubeId}`"
          :title="v.title"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowfullscreen
        />
      </div>
      <div v-else class="video-placeholder" role="img" :aria-label="`${v.title} — coming soon`">
        <span class="play-icon" aria-hidden="true">▶</span>
        <span class="placeholder-label">Coming soon on YouTube</span>
      </div>
      <div class="video-meta">
        <h3>{{ v.title }}</h3>
        <p class="text-muted">{{ v.description }}</p>
        <p v-if="v.duration" class="duration">{{ v.duration }}</p>
        <div class="tag-row">
          <span v-for="t in v.tags" :key="t" class="tag">{{ t }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  videos: { type: Array, default: () => [] },
})
</script>

<style scoped>
.video-library {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 24px;
}
.video-card {
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 12px rgba(17, 24, 39, 0.06);
}
.video-embed {
  aspect-ratio: 16 / 9;
  background: #111827;
}
.video-embed iframe { width: 100%; height: 100%; border: 0; }
.video-placeholder {
  aspect-ratio: 16 / 9;
  background: linear-gradient(145deg, #0f0a1a, #1a1035);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  color: #e2e8f0;
}
.play-icon {
  font-size: 2rem;
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: rgba(247, 202, 0, 0.25);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--gold, #f7ca00);
}
.placeholder-label { font-size: 0.85rem; font-weight: 700; }
.video-meta { padding: 16px; }
.video-meta h3 { font-size: 1rem; font-weight: 800; margin: 0 0 8px; color: #111827; }
.duration { font-size: 0.8rem; font-weight: 700; color: #6b7280; margin: 8px 0 0; }
.tag-row { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 10px; }
.tag {
  font-size: 0.7rem;
  font-weight: 700;
  text-transform: uppercase;
  padding: 3px 8px;
  border-radius: 4px;
  background: #f3f4f6;
  color: #4b5563;
}
</style>
