<script setup>
const links = [
  { label: 'Browse', href: '/browse' },
  { label: 'Categories', href: '/browse' },
  { label: 'Sell', href: '/sell/start' },
]

const router = useRouter()
const searchQuery = ref('')
const { onLogoKnock } = useLogoOwnerKnock()
const { support, load: loadProfile } = useFranksSiteProfile()

onMounted(() => {
  loadProfile()
})

function runSearch () {
  const q = searchQuery.value.trim()
  if (!q) {
    router.push('/browse')
    return
  }
  router.push({ path: '/browse', query: { q } })
}
</script>

<template>
  <header class="sticky top-0 z-50 bg-surface border-b border-border text-textMain shadow-[0_4px_24px_rgba(0,0,0,0.45)]">
    <!-- Support phone ribbon -->
    <div class="bg-[#0f172a] border-b border-border/60 text-center py-1.5 px-3">
      <a
        :href="`tel:${support.phoneTel}`"
        class="text-sm font-bold text-white hover:text-primary transition-colors"
      >
        Customer support: {{ support.phoneDisplay }}
      </a>
      <span class="text-white/50 text-xs mx-2 hidden sm:inline">·</span>
      <span class="text-white/70 text-xs hidden sm:inline">Mon–Sat 9AM–6PM CST</span>
    </div>

    <div class="max-w-6xl mx-auto px-4 py-3 flex flex-wrap items-center gap-3 md:gap-6">
      <div class="flex items-center gap-3 shrink-0">
        <button
          type="button"
          class="h-10 w-10 rounded-md overflow-hidden shrink-0 p-0 border-0 bg-transparent cursor-pointer touch-manipulation"
          aria-label="The Franks Standard home"
          @click="onLogoKnock"
        >
          <img
            src="/img/franks-pavilion.png"
            alt=""
            class="h-full w-full object-cover pointer-events-none select-none"
            width="40"
            height="40"
            decoding="async"
            draggable="false"
          >
        </button>
        <NuxtLink to="/" class="font-semibold text-lg tracking-tight text-white hover:text-primary transition-colors">
          The Franks Standard
        </NuxtLink>
      </div>

      <form class="flex-1 min-w-[200px] order-3 md:order-none w-full md:w-auto" @submit.prevent="runSearch">
        <input
          v-model="searchQuery"
          type="search"
          placeholder="Search antiques, gold, collectibles & verified listings…"
          class="w-full bg-surface2 border-2 border-primary/40 rounded-md px-3 py-2.5 text-sm text-textMain placeholder:text-textMuted focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
        >
      </form>

      <nav class="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-white shrink-0 order-2 md:order-none ml-auto md:ml-0">
        <NuxtLink
          v-for="link in links"
          :key="link.label"
          :to="link.href"
          class="text-white/90 hover:text-primary transition-colors"
        >
          {{ link.label }}
        </NuxtLink>
        <a
          :href="`tel:${support.phoneTel}`"
          class="text-primary font-semibold md:hidden"
        >
          {{ support.phoneDisplay }}
        </a>
      </nav>
    </div>
  </header>
</template>
