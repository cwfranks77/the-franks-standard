<script setup>
const props = defineProps({
  products: {
    type: Array,
    default: () => []
  }
})
const emit = defineEmits(['add'])

function onAdd(payload) {
  emit('add', payload)
}
</script>

<template>
  <div class="space-y-4">
    <AddProductForm @submit="onAdd" />
    <div v-if="products.length" class="border-t border-border pt-4">
      <h3 class="text-xs uppercase tracking-wide text-textMuted mb-2">Current catalog ({{ products.length }})</h3>
      <ul class="space-y-2 text-sm max-h-48 overflow-y-auto">
        <li
          v-for="p in products"
          :key="p.id"
          class="flex justify-between gap-2 bg-bg border border-border rounded px-2 py-1.5"
        >
          <span class="line-clamp-1">{{ p.name }}</span>
          <span class="text-textMuted shrink-0">{{ p.category }}</span>
        </li>
      </ul>
    </div>
  </div>
</template>
