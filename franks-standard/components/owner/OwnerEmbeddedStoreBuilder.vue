<template>
  <div class="owner-embed -mx-2">
    <p class="text-sm text-white/75 mb-4">
      Build store SEO, listing templates, and search-engine checklists without leaving the operator console.
    </p>
    <div class="max-h-[70vh] overflow-y-auto rounded-lg border border-border">
      <AiStoreBuilderPanel />
    </div>
  </div>
</template>

<style scoped>
.owner-embed :deep(.builder-page) {
  padding: 16px 0 32px;
}
.owner-embed :deep(.container) {
  max-width: 100%;
  padding-left: 12px;
  padding-right: 12px;
}
</style>
