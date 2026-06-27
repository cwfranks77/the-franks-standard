<template>
  <div class="marketplace-shell min-h-screen flex flex-col bg-bg text-textMain">
    <MainHeader />
    <main class="flex-1 max-w-3xl mx-auto px-4 py-10 w-full legal-doc">
      <slot />
    </main>
    <MainFooter />
  </div>
</template>

<style scoped>
.legal-doc :deep(h1) {
  font-size: 1.75rem;
  font-weight: 700;
  color: #fff;
  margin-bottom: 0.5rem;
}
.legal-doc :deep(h2) {
  font-size: 1.1rem;
  font-weight: 600;
  color: #c9a84c;
  margin: 1.5rem 0 0.5rem;
}
.legal-doc :deep(p),
.legal-doc :deep(li) {
  color: rgba(255, 255, 255, 0.85);
  line-height: 1.65;
  font-size: 0.9rem;
}
.legal-doc :deep(ul) {
  padding-left: 1.25rem;
  margin: 0.5rem 0 1rem;
}
.legal-doc :deep(a) {
  color: #67e8f9;
}
.legal-doc :deep(.updated) {
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.55);
  margin-bottom: 1rem;
}
</style>
