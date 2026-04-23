export default defineNuxtConfig({
  compatibilityDate: '2025-05-15',
  devtools: { enabled: true },

  // Uncomment when you have real Supabase credentials in .env
  // modules: ['@nuxtjs/supabase'],
  // supabase: { redirect: false },

  app: {
    head: {
      title: 'The Franks Standard — Authenticity-Guaranteed Marketplace',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: 'Buy and sell authentic collectibles, gear, and accessories. Every seller must provide a Certificate of Authenticity. If it\'s on The Franks Standard, it\'s real.' },
        { property: 'og:title', content: 'The Franks Standard — Authenticity-Guaranteed Marketplace' },
        { property: 'og:description', content: 'The marketplace where every item is backed by a Certificate of Authenticity.' },
        { name: 'theme-color', content: '#1a1a2e' },
      ],
      link: [
        { rel: 'icon', type: 'image/png', href: '/logo.png' },
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700;900&family=Inter:wght@300;400;500;600;700&display=swap' },
      ],
    },
  },

  css: ['~/assets/css/main.css'],
})
