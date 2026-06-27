<script setup>
useSeoMeta({
  title: 'AI Store Builder — SEO for Google, Bing & Listings',
  description: 'Build your store profile, SEO for Google and Bing, listing templates, and a search-engine checklist on The Franks Standard.',
})
</script>

<template>
  <div class="marketplace-shell min-h-screen flex flex-col bg-bg text-textMain">
    <MainHeader />
    <main class="flex-1 w-full">
      <AiStoreBuilderPanel />
    </main>
    <MainFooter />
  </div>
</template>
