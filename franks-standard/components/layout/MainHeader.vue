<script setup>

const links = [

  { label: 'Browse', href: '/browse' },

  { label: 'Categories', href: '/browse' },

  { label: 'Sell', href: '/sell/start' },

  { label: 'Contact', href: '/contact' },

]



const router = useRouter()

const searchQuery = ref('')

const { onLogoKnock } = useLogoOwnerKnock()



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

    <div class="max-w-6xl mx-auto px-4 py-2.5 flex flex-wrap items-center gap-3 md:gap-5">

      <div class="flex items-center gap-2 shrink-0">

        <button

          type="button"

          class="h-9 w-9 rounded-md overflow-hidden shrink-0 p-0 border border-gold/25 bg-black cursor-pointer touch-manipulation"

          aria-label="The Franks Standard home"

          @click="onLogoKnock"

        >

          <img

            src="/img/franks-pavilion.png"

            alt=""

            class="h-full w-full object-cover pointer-events-none select-none"

            width="36"

            height="36"

            decoding="async"

            draggable="false"

          >

        </button>

        <button
          type="button"
          class="font-semibold text-base tracking-tight text-white hover:text-gold transition-colors bg-transparent border-0 p-0 cursor-pointer"
          @click="onLogoKnock"
        >
          The Franks Standard
        </button>
      </div>



      <form class="flex-1 min-w-[200px] order-3 md:order-none w-full md:w-auto" @submit.prevent="runSearch">

        <input

          v-model="searchQuery"

          type="search"

          placeholder="Search antiques, gold, collectibles & verified listings…"

          class="w-full bg-surface2 border-2 border-gold/35 rounded-md px-3 py-2 text-sm text-textMain placeholder:text-textMuted focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold"

        >

      </form>



      <nav class="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-white shrink-0 order-2 md:order-none ml-auto md:ml-0">

        <NuxtLink

          v-for="link in links"

          :key="link.label"

          :to="link.href"

          class="text-white/90 hover:text-gold transition-colors"

        >

          {{ link.label }}

        </NuxtLink>

      </nav>

    </div>

  </header>

</template>
