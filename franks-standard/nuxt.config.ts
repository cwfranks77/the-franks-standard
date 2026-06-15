// nuxt.config.ts
export default defineNuxtConfig({
  ssr: false,
  css: ['@/assets/css/tailwind.css'],
  modules: [],
  app: {
    head: {
      title: 'The Franks Standard',
      meta: [
        {
          name: 'description',
          content: 'Certified, documented, no-bullshit audio & performance gear.'
        }
      ]
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
