import { createHash } from 'node:crypto'
import { normalizeOpsPhrase } from './utils/opsPhrase'
import { META_DESCRIPTION, OG_DESCRIPTION } from './utils/marketplaceFacilitatorCopy.js'
import { isBcPowerAudioPrimarySite } from './utils/bcPrimarySite.js'
const rawSite = process.env.NUXT_PUBLIC_SITE_URL
const siteUrl = (rawSite && String(rawSite).trim())
  ? String(rawSite).replace(/\/$/, '')
  : 'https://thefranksstandard.com'
const bcPrimarySite = isBcPowerAudioPrimarySite(siteUrl)
const bcPrerenderRoutes = bcPrimarySite
  ? [
      '/bc-audio',
      '/bc-audio/open-door',
      '/bc-audio/sms-consent',
    ]
  : []
const rawOg = process.env.NUXT_PUBLIC_OG_IMAGE
const ogImage = (rawOg && String(rawOg).trim()) ? String(rawOg).trim() : `${siteUrl}/franks-pavilion.png`

// Operator unlock: hash the phrase at BUILD time (normalized, same as the modal).
// NUXT_PUBLIC_OPS_ACCESS_KEY is the source of truth when set; HASH is fallback only.
const opsKeyPlain = String(process.env.NUXT_PUBLIC_OPS_ACCESS_KEY || '').trim()
const opsKeyHashFromEnv = String(process.env.NUXT_PUBLIC_OPS_ACCESS_KEY_HASH || '').trim().toLowerCase()
const opsAccessKeyHash = opsKeyPlain
  ? createHash('sha256').update(normalizeOpsPhrase(opsKeyPlain)).digest('hex')
  : opsKeyHashFromEnv
// IMPORTANT: write the computed hash back into process.env so Nuxt's
// automatic runtimeConfig override (NUXT_PUBLIC_OPS_ACCESS_KEY_HASH ->
// runtimeConfig.public.opsAccessKeyHash) picks up our computed value
// instead of the empty string a CI job might pass when the HASH secret
// is not separately set. Without this, the GitHub Actions workflow's
// `${{ secrets.NUXT_PUBLIC_OPS_ACCESS_KEY_HASH }}` (which resolves to "")
// would silently wipe out the hash we just computed from the plaintext.
if (opsAccessKeyHash) {
  process.env.NUXT_PUBLIC_OPS_ACCESS_KEY_HASH = opsAccessKeyHash
}
console.log('[ops] opsAccessKeyHash length:', opsAccessKeyHash.length)

// Stripe Payment Link defaults — CI passes empty secrets when unset; write back so Nuxt
// does not override runtimeConfig.public.pay*Url with "" (same gotcha as ops hash above).
const PAY_DEFAULTS = {
  NUXT_PUBLIC_PAY_LISTING_FEE_URL: 'https://buy.stripe.com/5kQfZa78O7EL8bAcqwbII09',
  NUXT_PUBLIC_PAY_PRO_SELLER_URL: 'https://buy.stripe.com/7sY14gct82kr1Nc628bII0d',
  NUXT_PUBLIC_PAY_ORDER_DEPOSIT_URL: 'https://buy.stripe.com/cNiaEQeBg1gnezY4Y4bII0b',
} as const
function payUrl (envKey: keyof typeof PAY_DEFAULTS): string {
  const v = String(process.env[envKey] || '').trim()
  const url = v || PAY_DEFAULTS[envKey]
  process.env[envKey] = url
  return url
}
const payListingFeeUrl = payUrl('NUXT_PUBLIC_PAY_LISTING_FEE_URL')
const payProSellerUrl = payUrl('NUXT_PUBLIC_PAY_PRO_SELLER_URL')
const payOrderDepositUrl = payUrl('NUXT_PUBLIC_PAY_ORDER_DEPOSIT_URL')

export default defineNuxtConfig({
  compatibilityDate: '2025-05-15',
  // Off by default: the floating Nuxt DevTools bubble looks like a stray "moving blue outline" on the page in dev.
  devtools: { enabled: false },
  hooks: {
    'app:resolve'(app) {
      app.plugins = app.plugins.filter((p) => {
        const src = String(p.src || '').replace(/\\/g, '/')
        return !(src.includes('@nuxtjs/supabase') && src.includes('supabase.client'))
      })
    },
  },
  ssr: false,
  nitro: {
    // Vercel static hosting: use generic static preset. GitHub Pages keeps github-pages (.nojekyll, etc.).
    preset: process.env.VERCEL ? 'static' : 'github-pages',
    prerender: {
      routes: [
        '/ops/documents',
        '/ops/print-pack',
        '/ops/print-coa',
        '/verify/coa',
        ...bcPrerenderRoutes,
      ],
    },
  },

  // Operator unlock phrase for /ops — only the SHA-256 hash ships to the browser.
  // See the-franks-standard-continuity/OPS-ACCESS.md and scripts/hash-ops-key.cjs.
  runtimeConfig: {
    public: {
      siteUrl: siteUrl,
      opsAccessKeyHash,
      payListingFeeUrl,
      payProSellerUrl,
      payOrderDepositUrl,
      stripeCheckoutEnabled: process.env.NUXT_PUBLIC_STRIPE_CHECKOUT_ENABLED ?? 'true',
      stripeTaxCheckoutEnabled: process.env.NUXT_PUBLIC_STRIPE_TAX_CHECKOUT_ENABLED ?? 'true',
      customerServicePhone: process.env.NUXT_PUBLIC_CUSTOMER_SERVICE_PHONE || '(877) 837-0527',
      /** Brandy's Sporting Goods storefront paused until supplier account is funded */
      brandyStoreOnHold: process.env.NUXT_PUBLIC_BRANDY_STORE_ON_HOLD ?? 'true',
      androidApkUrl: process.env.NUXT_PUBLIC_ANDROID_APK_URL || '',
      windowsInstallerUrl: process.env.NUXT_PUBLIC_WINDOWS_INSTALLER_URL || '',
      gadsId: process.env.NUXT_PUBLIC_GADS_ID || '',
      gadsConversionLabel: process.env.NUXT_PUBLIC_GADS_CONVERSION_LABEL || '',
      socialInstagram: process.env.NUXT_PUBLIC_SOCIAL_INSTAGRAM || '',
      socialFacebook: process.env.NUXT_PUBLIC_SOCIAL_FACEBOOK || '',
      socialTiktok: process.env.NUXT_PUBLIC_SOCIAL_TIKTOK || '',
      socialYoutube: process.env.NUXT_PUBLIC_SOCIAL_YOUTUBE || '',
      socialX: process.env.NUXT_PUBLIC_SOCIAL_X || '',
      socialLinkedin: process.env.NUXT_PUBLIC_SOCIAL_LINKEDIN || '',
      ownerNotifyEmail: process.env.NUXT_PUBLIC_OWNER_NOTIFY_EMAIL || 'info@thefranksstandard.com',
      /** Optional full B&C site (e.g. https://bcperformanceaudio.com). Marketplace still links /bc-audio for checkout. */
      bcAudioExternalUrl: (process.env.NUXT_PUBLIC_BC_AUDIO_EXTERNAL_URL || '').trim(),
      /** B&C dedicated support line (separate from Franks — see docs/BC-PHONE-SETUP.md). */
      bcAudioSupportPhone: process.env.NUXT_PUBLIC_BC_AUDIO_SUPPORT_PHONE || '(877) 837-0527',
      bcAudioSupportTel: process.env.NUXT_PUBLIC_BC_AUDIO_SUPPORT_TEL || '+18778370527',
      bcAudioSupportEmail: process.env.NUXT_PUBLIC_BC_AUDIO_SUPPORT_EMAIL || 'bc-audio@thefranksstandard.com',
      bcAudioOwnerName: process.env.NUXT_PUBLIC_BC_AUDIO_OWNER_NAME || 'Charles W. Franks',
    },
  },

  modules: ['@nuxtjs/supabase', '@vite-pwa/nuxt'],

  routeRules: {
    ...(bcPrimarySite
      ? { '/': { redirect: { to: '/bc-audio', statusCode: 302 } } }
      : {
          '/': {
            headers: { 'Cache-Control': 'no-cache, no-store, must-revalidate' },
          },
        }),
    '/**': {
      headers: { 'Cache-Control': 'no-cache, no-store, must-revalidate' },
    },
    '/_nuxt/**': {
      headers: { 'Cache-Control': 'public, max-age=31536000, immutable' },
    },
    '/ops/**': {
      headers: { 'Cache-Control': 'no-cache, no-store, must-revalidate' },
    },
    '/ops/print/pack': { redirect: { to: '/ops/print-pack', statusCode: 301 } },
    '/ops/print/coa': { redirect: { to: '/ops/print-coa', statusCode: 301 } },
  },

  pwa: {
    registerType: 'autoUpdate',
    // Service worker caused flip-flop between fixed and broken cached JS after deploys.
    injectRegister: false,
    selfDestroying: true,
    registerWebManifestInRouteRules: true,
    includeAssets: ['franks-pavilion.png', 'logo.svg', 'icons/icon-192.png', 'icons/icon-512.png'],
    manifest: {
      id: '/',
      name: 'The Franks Standard',
      short_name: 'Franks Standard',
      description: META_DESCRIPTION,
      theme_color: '#0c0619',
      background_color: '#0c0619',
      display: 'standalone',
      start_url: bcPrimarySite ? '/bc-audio' : '/',
      scope: '/',
      orientation: 'any',
      categories: ['shopping', 'business'],
      icons: [
        { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
        { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
        { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
      ],
    },
    workbox: {
      // Do not precache HTML or hashed /_nuxt bundles — stale shells pin users to 404 chunks after deploy.
      globPatterns: ['**/*.{png,svg,ico,json,woff2,webmanifest,jpg,jpeg,webp}'],
      globIgnores: ['**/node_modules/**', '**/_nuxt/**', '**/*.html'],
      skipWaiting: true,
      clientsClaim: true,
      cleanupOutdatedCaches: true,
      runtimeCaching: [
        {
          urlPattern: ({ request }) => request.mode === 'navigate',
          handler: 'NetworkFirst',
          options: {
            cacheName: 'fss-html',
            networkTimeoutSeconds: 4,
            expiration: { maxEntries: 8, maxAgeSeconds: 60 * 60 },
          },
        },
        {
          urlPattern: ({ url }) => url.pathname.startsWith('/_nuxt/'),
          handler: 'NetworkFirst',
          options: {
            cacheName: 'fss-nuxt-chunks',
            networkTimeoutSeconds: 3,
            expiration: { maxEntries: 96, maxAgeSeconds: 7 * 24 * 60 * 60 },
          },
        },
      ],
    },
    client: {
      installPrompt: false,
      periodicSyncForUpdates: 3600,
    },
    devOptions: {
      enabled: false,
    },
  },

  // Client-only app (ssr: false); session lives in the browser. Set URL + anon key in .env and in GitHub Actions.
  supabase: {
    redirect: false,
    types: false,
    useSsrCookies: false,
    clientOptions: {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        // storage: set in plugins/00-supabase-auth-storage.client.js (not serializable here)
      },
    },
  },

  app: {
    pageTransition: { name: 'page', mode: 'out-in' },
    layoutTransition: { name: 'layout', mode: 'out-in' },
    head: {
      title: 'The Franks Standard — Marketplace Facilitator for Collectibles & Gear',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: META_DESCRIPTION },
        { property: 'og:title', content: 'The Franks Standard — Marketplace Facilitator' },
        { property: 'og:description', content: OG_DESCRIPTION },
        { property: 'og:url', content: siteUrl },
        { property: 'og:type', content: 'website' },
        { property: 'og:image', content: ogImage },
        { name: 'twitter:card', content: 'summary_large_image' },
        { name: 'twitter:title', content: 'The Franks Standard' },
        { name: 'twitter:description', content: META_DESCRIPTION },
        { name: 'twitter:image', content: ogImage },
        { name: 'theme-color', content: '#0c0619' },
        { name: 'mobile-web-app-capable', content: 'yes' },
        { name: 'apple-mobile-web-app-capable', content: 'yes' },
        { name: 'apple-mobile-web-app-status-bar-style', content: 'black-translucent' },
        { name: 'apple-mobile-web-app-title', content: 'Franks Standard' },
        { 'http-equiv': 'Cache-Control', content: 'no-cache, no-store, must-revalidate' },
        { 'http-equiv': 'Pragma', content: 'no-cache' },
        { 'http-equiv': 'Expires', content: '0' },
      ],
      link: [
        { rel: 'icon', type: 'image/png', href: '/franks-pavilion.png' },
        { rel: 'apple-touch-icon', href: '/franks-pavilion.png' },
        { rel: 'manifest', href: '/manifest.webmanifest' },
        { rel: 'preconnect', href: 'https://meet.jit.si' },
        { rel: 'preconnect', href: 'https://js.stripe.com' },
        { rel: 'preconnect', href: 'https://checkout.stripe.com' },
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        { rel: 'preconnect', href: 'https://petraimages.com.s3.amazonaws.com' },
        { rel: 'dns-prefetch', href: 'https://petraimages.com.s3.amazonaws.com' },
        { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=Cinzel:wght@400;600;700;900&family=Inter:wght@400;500;600;700;800&display=swap' },
      ],
    },
  },

  css: ['~/assets/css/main.css', '~/assets/css/marketplace-ui.css', '~/assets/css/learn-hub.css'],
})
