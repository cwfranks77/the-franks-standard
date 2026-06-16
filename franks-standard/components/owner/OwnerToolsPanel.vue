<script setup>
const props = defineProps({
  tools: {
    type: Array,
    default: () => [],
  },
  activeTool: {
    type: String,
    default: '',
  },
})

const emit = defineEmits(['update:activeTool', 'select'])

const categories = computed(() => {
  const cats = [...new Set(props.tools.map((t) => t.category))]
  return cats.sort()
})

function toolsInCategory (cat) {
  return props.tools.filter((t) => t.category === cat)
}

function pickTool (id) {
  emit('update:activeTool', id)
  emit('select', id)
}
</script>

<template>
  <div class="grid lg:grid-cols-[240px_1fr] gap-6">
    <aside class="space-y-4 relative z-10" aria-label="Operator tools menu">
      <div
        v-for="cat in categories"
        :key="cat"
        class="bg-surface2 border border-border rounded-lg p-3"
      >
        <h3 class="text-xs uppercase tracking-wide text-white/70 mb-2 font-semibold">
          {{ cat }}
        </h3>
        <ul class="space-y-1">
          <li v-for="tool in toolsInCategory(cat)" :key="tool.id">
            <button
              type="button"
              class="w-full text-left px-2 py-1.5 rounded text-sm transition flex items-center gap-2 cursor-pointer touch-manipulation"
              :class="activeTool === tool.id
                ? 'bg-primary/20 text-white border border-primary/40'
                : 'text-white/85 border border-transparent hover:text-white hover:bg-surface hover:border-border'"
              :aria-current="activeTool === tool.id ? 'page' : undefined"
              @click.stop.prevent="pickTool(tool.id)"
            >
              <span aria-hidden="true">{{ tool.icon }}</span>
              <span>{{ tool.title }}</span>
            </button>
          </li>
        </ul>
      </div>
    </aside>

    <div
      id="owner-tool-panel"
      class="bg-surface2 border border-border rounded-lg p-5 min-h-[320px] relative z-0"
    >
      <slot />
    </div>
  </div>
</template>
