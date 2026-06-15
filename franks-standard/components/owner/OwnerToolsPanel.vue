<script setup>
const props = defineProps({
  tools: {
    type: Array,
    default: () => []
  },
  activeTool: {
    type: String,
    default: ''
  }
})
const emit = defineEmits(['select'])

const categories = computed(() => {
  const cats = [...new Set(props.tools.map((t) => t.category))]
  return cats.sort()
})

function toolsInCategory(cat) {
  return props.tools.filter((t) => t.category === cat)
}
</script>

<template>
  <div class="grid lg:grid-cols-[240px_1fr] gap-6">
    <aside class="space-y-4">
      <div
        v-for="cat in categories"
        :key="cat"
        class="bg-surface2 border border-border rounded-lg p-3"
      >
        <h3 class="text-xs uppercase tracking-wide text-textMuted mb-2 font-semibold">
          {{ cat }}
        </h3>
        <ul class="space-y-1">
          <li v-for="tool in toolsInCategory(cat)" :key="tool.id">
            <button
              type="button"
              class="w-full text-left px-2 py-1.5 rounded text-sm transition flex items-center gap-2"
              :class="activeTool === tool.id
                ? 'bg-primary/15 text-primary border border-primary/30'
                : 'text-textMuted hover:text-textMain hover:bg-surface'"
              @click="emit('select', tool.id)"
            >
              <span aria-hidden="true">{{ tool.icon }}</span>
              <span>{{ tool.title }}</span>
            </button>
          </li>
        </ul>
      </div>
    </aside>

    <div class="bg-surface2 border border-border rounded-lg p-5 min-h-[320px]">
      <slot />
    </div>
  </div>
</template>
