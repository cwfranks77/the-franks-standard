<script setup>
const name = ref('')
const description = ref('')
const category = ref('')
const emit = defineEmits(['submit'])

function submitForm() {
  emit('submit', {
    name: name.value,
    description: description.value,
    category: category.value
  })
}
</script>

<template>
  <div class="bg-surface2 border border-border rounded-lg p-4">
    <h2 class="text-sm font-semibold mb-3">Add Product</h2>
    <div class="space-y-3 text-sm">
      <input v-model="name" placeholder="Name" class="w-full bg-bg border border-border rounded px-2 py-1" />
      <input v-model="description" placeholder="Description" class="w-full bg-bg border border-border rounded px-2 py-1" />
      <input v-model="category" placeholder="Category" class="w-full bg-bg border border-border rounded px-2 py-1" />
      <button @click="submitForm" class="px-3 py-1 bg-primary text-bg rounded text-xs">
        Add
      </button>
    </div>
  </div>
</template>
