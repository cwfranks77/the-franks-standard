import { createHash } from 'node:crypto'
import { normalizeOpsPhrase } from './utils/opsPhrase'

const opsKeyPlain = String(process.env.NUXT_PUBLIC_OPS_ACCESS_KEY || process.env.OWNER_SECRET_PASSPHRASE || '').trim()
const opsKeyHashFromEnv = String(process.env.NUXT_PUBLIC_OPS_ACCESS_KEY_HASH || '').trim().toLowerCase()
const opsAccessKeyHash = opsKeyPlain
  ? createHash('sha256').update(normalizeOpsPhrase(opsKeyPlain)).digest('hex')
  : opsKeyHashFromEnv

if (opsAccessKeyHash) {
  process.env.NUXT_PUBLIC_OPS_ACCESS_KEY_HASH = opsAccessKeyHash
}

// nuxt.config.ts
export default defineNuxtConfig({
  ssr: true,
  css: ['~/assets/css/main.css', '~/assets/css/marketplace-ui.css'],
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
      crawlLinks: true,
      routes: [
        '/',
        '/owner',
        '/browse',
        '/sell',
        '/item/cards-001',
        '/item/watch-001',
        '/item/sneaker-001',
        '/item/coin-001',
        '/item/art-001',
        '/item/estate-001'
      ],
      failOnError: false
    },
  },
  runtimeConfig: {
    public: {
      opsAccessKeyHash,
      siteUrl: process.env.NUXT_PUBLIC_SITE_URL || 'https://thefranksstandard.com'
    }
  }
})
