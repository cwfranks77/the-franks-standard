// nuxt.config.ts
export default defineNuxtConfig({
  ssr: false,
  css: ['@/assets/css/tailwind.css'],
  modules: [],
  app: {
    head: {
      title: 'The Franks Standard | Authenticity-Guaranteed Collectibles Marketplace',
      meta: [
        {
          name: 'description',
          content:
            'Proof-first collectibles marketplace — sports cards, watches, sneakers, instruments, coins, and estate finds. Every listing backed by a COA or signed guarantee. The Franks Standard LLC.'
        },
        { name: 'robots', content: 'index,follow' },
        { name: 'application-name', content: 'The Franks Standard' },
        { property: 'og:site_name', content: 'The Franks Standard' },
        { property: 'og:type', content: 'website' }
      ],
      link: [{ rel: 'canonical', href: 'https://thefranksstandard.com/' }]
    }
  },
  nitro: {
    preset: 'github-pages'
  },
  runtimeConfig: {
    public: {
      ownerKey: '',
      siteUrl: process.env.NUXT_PUBLIC_SITE_URL || 'https://thefranksstandard.com'
    }
  }
})
