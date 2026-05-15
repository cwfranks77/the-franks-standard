const rawSite = process.env.NUXT_PUBLIC_SITE_URL
const siteUrl = (rawSite && String(rawSite).trim())
  ? String(rawSite).replace(/\/$/, '')
  : 'https://thefranksstandard.com'
const rawOg = process.env.NUXT_PUBLIC_OG_IMAGE
const ogImage = (rawOg && String(rawOg).trim()) ? String(rawOg).trim() : `${siteUrl}/franks-pavilion.png`

export default defineNuxtConfig({
  compatibilityDate: '2025-05-15',
  // Off by default: the floating Nuxt DevTools bubble looks like a stray "moving blue outline" on the page in dev.
  devtools: { enabled: false },
  ssr: false,
  nitro: {
    // Vercel static hosting: use generic static preset. GitHub Pages keeps github-pages (.nojekyll, etc.).
    preset: process.env.VERCEL ? 'static' : 'github-pages',
  },

  // Operator unlock phrase for /ops (build-time; see the-franks-standard-continuity/OPS-ACCESS.md)
  runtimeConfig: {
    public: {
      siteUrl: siteUrl,
      opsAccessKey: process.env.NUXT_PUBLIC_OPS_ACCESS_KEY || '',
      payListingFeeUrl: process.env.NUXT_PUBLIC_PAY_LISTING_FEE_URL || 'https://buy.stripe.com/5kQfZa78O7EL8bAcqwbII09',
      payProSellerUrl: process.env.NUXT_PUBLIC_PAY_PRO_SELLER_URL || 'https://buy.stripe.com/5kQfZaeBgaQX0J8duAbII0a',
      payOrderDepositUrl: process.env.NUXT_PUBLIC_PAY_ORDER_DEPOSIT_URL || 'https://buy.stripe.com/cNiaEQeBg1gnezY4Y4bII0b',
      payDisputeFeeUrl: process.env.NUXT_PUBLIC_PAY_DISPUTE_FEE_URL || 'https://buy.stripe.com/bJe8wIal09MT8bAfCIbII0c',
      customerServicePhone: process.env.NUXT_PUBLIC_CUSTOMER_SERVICE_PHONE || '(877) 837-0527',
    },
  },

  modules: ['@nuxtjs/supabase'],

  // Client-only app (ssr: false); session lives in the browser. Set URL + anon key in .env and in GitHub Actions.
  supabase: {
    redirect: false,
    types: false,
    useSsrCookies: false,
  },

  app: {
    pageTransition: { name: 'page', mode: 'out-in' },
    layoutTransition: { name: 'layout', mode: 'out-in' },
    head: {
      title: 'The Franks Standard — Authenticity-Guaranteed Marketplace',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: 'The authenticity-first collectibles and gear marketplace: COA or a signed in-platform guarantee on every listing, escrow, and a zero-tolerance stance on fakes. Built for what eBay and Amazon are not: proof, not just volume.' },
        { property: 'og:title', content: 'The Franks Standard - Authenticity-Guaranteed Marketplace' },
        { property: 'og:description', content: 'Buy and sell with proof: every listing needs a COA or signed in-platform guarantee. The marketplace for collectors who refuse fakes.' },
        { property: 'og:url', content: siteUrl },
        { property: 'og:type', content: 'website' },
        { property: 'og:image', content: ogImage },
        { name: 'twitter:card', content: 'summary_large_image' },
        { name: 'twitter:title', content: 'The Franks Standard' },
        { name: 'twitter:description', content: 'Authenticity-first collectibles and gear. COA required. Built for real sellers and buyers.' },
        { name: 'twitter:image', content: ogImage },
        { name: 'theme-color', content: '#0c0619' },
        { name: 'mobile-web-app-capable', content: 'yes' },
        { name: 'apple-mobile-web-app-capable', content: 'yes' },
        { name: 'apple-mobile-web-app-status-bar-style', content: 'black-translucent' },
        { name: 'apple-mobile-web-app-title', content: 'Franks Standard' },
      ],
      link: [
        { rel: 'icon', type: 'image/png', href: '/franks-pavilion.png' },
        { rel: 'apple-touch-icon', href: '/franks-pavilion.png' },
        { rel: 'manifest', href: '/manifest.json' },
        { rel: 'canonical', href: siteUrl },
        { rel: 'preconnect', href: 'https://images.unsplash.com' },
        { rel: 'preconnect', href: 'https://meet.jit.si' },
        { rel: 'preconnect', href: 'https://js.stripe.com' },
        { rel: 'preconnect', href: 'https://checkout.stripe.com' },
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=Cinzel:wght@400;600;700;900&family=Inter:wght@400;500;600;700;800&display=swap' },
      ],
    },
  },

  css: ['~/assets/css/main.css'],
})
