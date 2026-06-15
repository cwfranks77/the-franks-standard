// nuxt.config.ts
export default defineNuxtConfig({
  ssr: true,
  modules: ['@nuxtjs/tailwindcss'],
  tailwindcss: {
    cssPath: '~/assets/css/tailwind.css',
    configPath: 'tailwind.config.cjs',
  },
  components: {
    dirs: [{ path: '~/components', pathPrefix: false }],
  },
  app: {
    head: {
      title: 'The Franks Standard | Authenticity-Guaranteed Collectibles Marketplace',
      meta: [
        {
          name: 'description',
          content:
            'The Franks Standard LLC — authenticity-guaranteed collectibles marketplace. Sports cards, watches, sneakers, coins, and estate finds with COA-backed listings.'
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
    preset: 'github-pages',
    prerender: {
      crawlLinks: false,
      routes: ['/'],
    },
  },
  runtimeConfig: {
    public: {
      ownerKey: '',
      siteUrl: process.env.NUXT_PUBLIC_SITE_URL || 'https://thefranksstandard.com'
    }
  }
})
