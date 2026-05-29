<template>
  <article class="article-body">
    <template v-for="(block, i) in blocks" :key="i">
      <p v-if="block.type === 'p'" class="article-p" v-html="formatInline(block.text)" />
      <h2 v-else-if="block.type === 'h2'" class="article-h2">{{ block.text }}</h2>
      <h3 v-else-if="block.type === 'h3'" class="article-h3">{{ block.text }}</h3>
      <ul v-else-if="block.type === 'ul'" class="article-ul">
        <li v-for="(item, j) in block.items" :key="j" v-html="formatInline(item)" />
      </ul>
      <ol v-else-if="block.type === 'ol'" class="article-ol">
        <li v-for="(item, j) in block.items" :key="j" v-html="formatInline(item)" />
      </ol>
      <aside v-else-if="block.type === 'tip'" class="article-tip" role="note">
        <strong v-if="block.title">{{ block.title }}</strong>
        <span v-html="formatInline(block.text)" />
      </aside>
      <p v-else-if="block.type === 'cta'" class="article-cta-wrap">
        <NuxtLink :to="block.to || '/sell'" class="btn btn-primary btn-sm">{{ block.label || 'Learn more' }}</NuxtLink>
      </p>
    </template>
  </article>
</template>

<script setup>
defineProps({
  blocks: { type: Array, default: () => [] },
})

function formatInline (text) {
  if (!text) return ''
  return String(text)
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/`([^`]+)`/g, '<code>$1</code>')
}
</script>

<style scoped>
.article-body { line-height: 1.7; color: #1f2937; font-weight: 500; }
.article-p { margin: 0 0 1rem; }
.article-h2 {
  font-size: 1.25rem;
  font-weight: 800;
  color: #111827;
  margin: 2rem 0 0.75rem;
}
.article-h3 { font-size: 1.05rem; font-weight: 700; margin: 1.25rem 0 0.5rem; }
.article-ul, .article-ol { margin: 0 0 1.25rem; padding-left: 1.35rem; }
.article-ul li, .article-ol li { margin-bottom: 0.5rem; }
.article-tip {
  display: block;
  margin: 1.25rem 0;
  padding: 14px 16px;
  background: rgba(201, 168, 76, 0.12);
  border: 1px solid rgba(201, 168, 76, 0.4);
  border-radius: 10px;
  font-size: 0.95rem;
}
.article-tip strong { display: block; margin-bottom: 4px; color: #92400e; }
.article-cta-wrap { margin: 1.5rem 0; }
:deep(code) {
  background: #f3f4f6;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 0.9em;
}
</style>
