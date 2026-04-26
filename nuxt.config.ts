export default defineNuxtConfig({
  compatibilityDate: '2025-05-15',
  devtools: { enabled: true },
  ssr: false,
  nitro: {
    preset: 'github-pages',
  },

  // Operator unlock phrase for /ops (build-time; see the-franks-standard-continuity/OPS-ACCESS.md)
  runtimeConfig: {
    public: {
      opsAccessKey: process.env.NUXT_PUBLIC_OPS_ACCESS_KEY || '',
    },
  },

  // Uncomment when you have real Supabase credentials in .env
  // modules: ['@nuxtjs/supabase'],
  // supabase: { redirect: false },

  app: {
    head: {
      title: 'The Franks Standard — Authenticity-Guaranteed Marketplace',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: 'The authenticity-first collectibles and gear marketplace: COA or a signed in-platform guarantee on every listing, escrow, and a zero-tolerance stance on fakes. Built for what eBay and Amazon are not: proof, not just volume.' },
        { property: 'og:title', content: 'The Franks Standard - Authenticity-Guaranteed Marketplace' },
        { property: 'og:description', content: 'Buy and sell with proof: every listing needs a COA or signed in-platform guarantee. The marketplace for collectors who refuse fakes.' },
        { property: 'og:url', content: 'https://thefranksstandard.com' },
        { property: 'og:type', content: 'website' },
        { property: 'og:image', content: 'https://thefranksstandard.com/logo.png' },
        { name: 'twitter:card', content: 'summary_large_image' },
        { name: 'twitter:title', content: 'The Franks Standard' },
        { name: 'twitter:description', content: 'Authenticity-first collectibles and gear. COA required. Built for real sellers and buyers.' },
        { name: 'twitter:image', content: 'https://thefranksstandard.com/logo.png' },
        { name: 'theme-color', content: '#1a1a2e' },
      ],
      link: [
        { rel: 'icon', type: 'image/png', href: '/logo.png' },
        { rel: 'preconnect', href: 'https://images.unsplash.com' },
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700;900&family=Inter:wght@300;400;500;600;700&display=swap' },
      ],
    },
  },

  css: ['~/assets/css/main.css'],
})
