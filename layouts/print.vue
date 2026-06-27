<template>
  <div class="print-layout" :class="{ 'print-layout--dialog': isPrintMode }">
    <div v-if="!isPrintMode" class="print-toolbar no-print">
      <button type="button" class="btn btn-primary" @click="triggerPrint">Print</button>
      <NuxtLink to="/ops/documents" class="btn btn-outline">Back to documents</NuxtLink>
    </div>
    <main class="print-main">
      <slot />
    </main>
  </div>
</template>

<script setup>
const route = useRoute()
const isPrintMode = computed(() => String(route.query.print || '') === '1')

function triggerPrint () {
  if (!import.meta.client) return
  nextTick(() => {
    setTimeout(() => window.print(), 300)
  })
}

onMounted(() => {
  if (isPrintMode.value) triggerPrint()
})
</script>

<style>
.print-layout {
  min-height: 100vh;
  background: #fff;
  color: #111827;
}
.print-toolbar {
  position: sticky;
  top: 0;
  z-index: 10;
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  padding: 12px 16px;
  background: #f8fafc;
  border-bottom: 1px solid #e2e8f0;
}
.print-main {
  max-width: 8.5in;
  margin: 0 auto;
  padding: 24px 20px 48px;
}
@media print {
  .no-print { display: none !important; }
  .print-layout--dialog .print-main { padding: 0; }
  @page { margin: 0.6in; }
}
</style>
