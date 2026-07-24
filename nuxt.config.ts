import { createHash } from 'node:crypto'
import { existsSync, globSync } from 'node:fs'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { normalizeOpsPhrase } from './franks-standard/utils/opsPhrase.js'
import { META_DESCRIPTION, OG_DESCRIPTION } from './franks-standard/utils/marketplaceFacilitatorCopy.js'
import { isBcPowerAudioPrimarySite } from './bc-performance-audio/src/utils/bcPrimarySite.js'
import { BC_BRAND } from './bc-performance-audio/src/utils/bcBrand.js'
import { collectPagesFromDir, createProjectModuleResolver, filterFranksPagesForBcPrimary } from './config/nuxtProjectBridge.ts'

const BC_LEGAL_NAME = 'B&C Performance Audio LLC'
/** B&C + TFS shared Supabase project — safe to bake in as URL fallback (anon key stays in secrets). */
const BC_SUPABASE_PROJECT_URL = 'https://rochesyrxiyrxhzmkuwk.supabase.co'
const supabasePublicUrl = String(
  process.env.NUXT_PUBLIC_SUPABASE_URL
  || process.env.SUPABASE_URL
  || BC_SUPABASE_PROJECT_URL,
).trim().replace(/\/+$/, '')
const supabasePublicKey = String(
  process.env.NUXT_PUBLIC_SUPABASE_KEY
  || process.env.NUXT_PUBLIC_SUPABASE_ANON_KEY
  || process.env.SUPABASE_KEY
  || process.env.SUPABASE_ANON_KEY
  || '',
).trim()
if (supabasePublicUrl) process.env.NUXT_PUBLIC_SUPABASE_URL = supabasePublicUrl
if (supabasePublicKey) process.env.NUXT_PUBLIC_SUPABASE_KEY = supabasePublicKey
const rawSite = process.env.NUXT_PUBLIC_SITE_URL
const siteUrl = (rawSite && String(rawSite).trim())
  ? String(rawSite).replace(/\/$/, '')
  : 'https://thefranksstandard.com'
const bcPrimarySite = isBcPowerAudioPrimarySite(siteUrl)
const bcSiteDescription = `${BC_LEGAL_NAME} — authorized wholesale distribution portal.`
const franksSiteTitle = 'The Franks Standard — Marketplace Facilitator for Collectibles & Gear'
const siteTitle = bcPrimarySite ? BC_LEGAL_NAME : franksSiteTitle
const siteDescription = bcPrimarySite ? bcSiteDescription : META_DESCRIPTION
const siteOgDescription = bcPrimarySite ? bcSiteDescription : OG_DESCRIPTION
const bcLogoAsset = '/img/bc-logo-primary.png?v=20260622'
/** Set NUXT_PUBLIC_COMING_SOON=true to lock storefronts to home pages only. Default: open for business. */
const comingSoon = String(process.env.NUXT_PUBLIC_COMING_SOON ?? 'false').trim().toLowerCase() === 'true'
const bcPrerenderRoutes = bcPrimarySite
  ? (
      comingSoon
        ? ['/']
        : [
            '/',
            '/bc-audio/catalog',
            '/bc-audio/open-door',
            '/bc-audio/order-success',
            '/bc-audio/sms-consent',
          ]
    )
  : []
const rawOg = process.env.NUXT_PUBLIC_OG_IMAGE
const franksLogoAsset = '/img/TFS-logo.png?v=20260724e' // Red TFS letters on black (text-only)
const ogImage = (rawOg && String(rawOg).trim())
  ? String(rawOg).trim()
  : (bcPrimarySite ? `${siteUrl}/img/bc-logo-primary.png` : `${siteUrl}${franksLogoAsset}`)

// Operator unlock: hash the phrase at BUILD time (normalized, same as the modal).
// NUXT_PUBLIC_OPS_ACCESS_KEY is the source of truth when set; HASH is fallback only.
const opsKeyPlain = String(process.env.NUXT_PUBLIC_OPS_ACCESS_KEY || process.env.OWNER_SECRET_PASSPHRASE || '').trim()
const opsKeyHashFromEnv = String(process.env.NUXT_PUBLIC_OPS_ACCESS_KEY_HASH || process.env.OPS_ACCESS_KEY_HASH || '').trim().toLowerCase()
const opsAccessKeyHash = opsKeyPlain
  ? createHash('sha256').update(normalizeOpsPhrase(opsKeyPlain)).digest('hex')
  : opsKeyHashFromEnv
const opsUnlockAvailable = Boolean(opsAccessKeyHash)
if (opsAccessKeyHash) {
  process.env.NUXT_PUBLIC_OPS_ACCESS_KEY_HASH = opsAccessKeyHash
}

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

const rootDir = fileURLToPath(new URL('.', import.meta.url))
const franksPagesRoot = resolve(rootDir, 'franks-standard/src/pages')
const bcPagesRoot = resolve(rootDir, 'bc-performance-audio/src/pages/bc-audio')
const bcPluginsDir = resolve(rootDir, 'bc-performance-audio/src/plugins')
const franksPluginsDir = resolve(rootDir, 'franks-standard/src/plugins')
const franksServerUtilsDir = resolve(rootDir, 'franks-standard/src/server/utils')
const bcServerUtilsDir = resolve(rootDir, 'bc-performance-audio/src/server/utils')
const serverUtilsAlias = existsSync(resolve(franksServerUtilsDir, 'ownerCms.ts'))
  ? franksServerUtilsDir
  : bcServerUtilsDir

function bcPage (relativeFile: string, path: string) {
  return { path, file: resolve(bcPagesRoot, relativeFile) }
}

const bcPagesFromProjectFolder = bcPrimarySite
  ? [
      bcPage('index.vue', '/'),
      bcPage('cart.vue', '/cart'),
      bcPage('catalog.vue', '/bc-audio/catalog'),
      bcPage('account.vue', '/bc-audio/account'),
      bcPage('open-door.vue', '/bc-audio/open-door'),
      bcPage('order-success.vue', '/bc-audio/order-success'),
      bcPage('sms-consent.vue', '/bc-audio/sms-consent'),
      bcPage('ops/index.vue', '/bc-audio/ops'),
      bcPage('ops/panel.vue', '/bc-audio/ops/panel'),
      bcPage('ops/marketing-automation.vue', '/bc-audio/ops/marketing-automation'),
      bcPage('ops/social-ads.vue', '/bc-audio/ops/social-ads'),
      bcPage('product/[id].vue', '/bc-audio/product/:id'),
    ]
  : [
      bcPage('index.vue', '/bc-audio'),
      bcPage('cart.vue', '/bc-audio/cart'),
      bcPage('catalog.vue', '/bc-audio/catalog'),
      bcPage('account.vue', '/bc-audio/account'),
      bcPage('open-door.vue', '/bc-audio/open-door'),
      bcPage('order-success.vue', '/bc-audio/order-success'),
      bcPage('sms-consent.vue', '/bc-audio/sms-consent'),
      bcPage('ops/index.vue', '/bc-audio/ops'),
      bcPage('ops/panel.vue', '/bc-audio/ops/panel'),
      bcPage('ops/marketing-automation.vue', '/bc-audio/ops/marketing-automation'),
      bcPage('ops/social-ads.vue', '/bc-audio/ops/social-ads'),
      bcPage('product/[id].vue', '/bc-audio/product/:id'),
    ]

const franksNuxtPlugins = existsSync(franksPluginsDir)
  ? [
      resolve(franksPluginsDir, '00-register-franks-middleware.ts'),
      ...globSync('*.{js,ts}', { cwd: franksPluginsDir })
        .filter((file) => file !== '00-register-franks-middleware.ts')
        .sort()
        .map((file) => resolve(franksPluginsDir, file)),
    ]
  : []

const bcNuxtPlugins = [
  resolve(bcPluginsDir, '00-register-bc-middleware.ts'),
  resolve(bcPluginsDir, 'bc-domain-host.client.js'),
  resolve(bcPluginsDir, 'bc-https-canonical.client.js'),
]

const nuxtPlugins = [...franksNuxtPlugins, ...bcNuxtPlugins]

export default defineNuxtConfig({
  compatibilityDate: '2025-05-15',
  // Off by default: the floating Nuxt DevTools bubble looks like a stray "moving blue outline" on the page in dev.
  devtools: { enabled: false },
  ssr: false,
  nitro: {
    // Vercel static hosting: use generic static preset. GitHub Pages keeps github-pages (.nojekyll, etc.).
    preset: process.env.VERCEL ? 'static' : 'github-pages',
    scanDirs: [
      resolve(rootDir, 'franks-standard/src/server'),
      resolve(rootDir, 'bc-performance-audio/src/server'),
      resolve(rootDir, 'tfs/api/owner'),
    ],
    alias: {
      '#backend': resolve(rootDir, 'backend'),
      '#cjs-require': resolve(rootDir, 'server/utils/cjsRequire.ts'),
      '#tfs-owner-api': resolve(rootDir, 'tfs/api/owner'),
      '#server-utils': serverUtilsAlias,
      '#bc-server-utils': bcServerUtilsDir,
    },
    publicAssets: [
      {
        baseURL: '/tfs/owner',
        dir: resolve(rootDir, 'tfs/owner'),
        maxAge: 0,
      },
    ],
    prerender: {
      routes: [
        '/ops/documents',
        '/ops/print-pack',
        '/ops/print-coa',
        '/verify/coa',
        '/tfs/owner/index.html',
        '/tfs/owner/file-manager.html',
        '/tfs/owner/tools/log-viewer.html',
        '/tfs/owner/tools/dealer-packet.html',
        ...bcPrerenderRoutes,
      ],
    },
  },

  // Operator unlock: SHA-256 hash ships to the browser for static unlock (never the plain phrase).
  runtimeConfig: {
    opsAccessKeyHash,
    opsSessionSecret: process.env.OPS_SESSION_SECRET || opsAccessKeyHash || '',
    stripeSecretKey: process.env.STRIPE_SECRET_KEY || '',
    stripeDistributorConnectAccountId: process.env.STRIPE_DISTRIBUTOR_CONNECT_ACCOUNT_ID || '',
    public: {
      siteUrl: siteUrl,
      comingSoon,
      opsUnlockAvailable,
      /** SHA-256 of normalized phrase — safe for static unlock; never the plain phrase. */
      opsAccessKeyHash,
      payListingFeeUrl,
      payProSellerUrl,
      payOrderDepositUrl,
      stripeCheckoutEnabled: process.env.NUXT_PUBLIC_STRIPE_CHECKOUT_ENABLED ?? 'true',
      stripeTaxCheckoutEnabled: process.env.NUXT_PUBLIC_STRIPE_TAX_CHECKOUT_ENABLED ?? 'true',
      stripePublishableKey: process.env.NUXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '',
      customerServicePhone: process.env.NUXT_PUBLIC_CUSTOMER_SERVICE_PHONE || '(877) 837-0527',
      /** Brandy's Sporting Goods storefront paused until supplier account is funded */
      brandyStoreOnHold: process.env.NUXT_PUBLIC_BRANDY_STORE_ON_HOLD ?? 'true',
      androidApkUrl: process.env.NUXT_PUBLIC_ANDROID_APK_URL || '',
      windowsInstallerUrl: process.env.NUXT_PUBLIC_WINDOWS_INSTALLER_URL || '',
      gadsId: process.env.NUXT_PUBLIC_GADS_ID || '',
      gadsConversionLabel: process.env.NUXT_PUBLIC_GADS_CONVERSION_LABEL || '',
      socialInstagram: process.env.NUXT_PUBLIC_SOCIAL_INSTAGRAM || '',
      socialTiktok: process.env.NUXT_PUBLIC_SOCIAL_TIKTOK || '',
      socialYoutube: process.env.NUXT_PUBLIC_SOCIAL_YOUTUBE || '',
      socialX: process.env.NUXT_PUBLIC_SOCIAL_X || '',
      socialLinkedin: process.env.NUXT_PUBLIC_SOCIAL_LINKEDIN || '',
      ownerNotifyEmail: process.env.NUXT_PUBLIC_OWNER_NOTIFY_EMAIL || 'info@thefranksstandard.com',
      /** Optional full B&C site (e.g. https://bcperformanceaudio.com). Marketplace still links /bc-audio for checkout. */
      bcAudioExternalUrl: (process.env.NUXT_PUBLIC_BC_AUDIO_EXTERNAL_URL || '').trim(),
      /** B&C dedicated support line (separate from Franks — see docs/BC-PHONE-SETUP.md). */
      bcAudioSupportPhone: process.env.NUXT_PUBLIC_BC_AUDIO_SUPPORT_PHONE || '(833) 722-4147',
      bcAudioSupportTel: process.env.NUXT_PUBLIC_BC_AUDIO_SUPPORT_TEL || '+18337224147',
      bcAudioSupportEmail: process.env.NUXT_PUBLIC_BC_AUDIO_SUPPORT_EMAIL || 'bc-audio@thefranksstandard.com',
      bcAudioOwnerName: process.env.NUXT_PUBLIC_BC_AUDIO_OWNER_NAME || 'Charles W. Franks',
      /** Legacy aliases — prefer runtimeConfig.public.supabase.url from @nuxtjs/supabase */
      supabaseUrl: supabasePublicUrl,
      supabaseKey: supabasePublicKey,
      supabase: {
        url: supabasePublicUrl,
        key: supabasePublicKey,
      },
    },
  },

  modules: ['@nuxtjs/tailwindcss', '@nuxtjs/supabase', '@vite-pwa/nuxt'],

  tailwindcss: {
    cssPath: '~/assets/css/tailwind.css',
    configPath: 'tailwind.config.cjs',
  },

  plugins: nuxtPlugins,

  hooks: {
    'pages:extend' (pages) {
      const registeredPaths = new Set(pages.map((page) => page.path))
      for (const page of bcPagesFromProjectFolder) {
        if (registeredPaths.has(page.path)) continue
        pages.push(page)
        registeredPaths.add(page.path)
      }
      const franksPages = collectPagesFromDir(franksPagesRoot, rootDir)
      const franksRoutes = bcPrimarySite ? filterFranksPagesForBcPrimary(franksPages) : franksPages
      for (const page of franksRoutes) {
        // Nuxt already discovers the root marketplace pages. Registering
        // another file for the same URL can make the client router choose a
        // missing route and show its 404 screen at the storefront home page.
        if (registeredPaths.has(page.path)) continue
        pages.push(page)
        registeredPaths.add(page.path)
      }
    },
    'vite:extendConfig' (viteInlineConfig) {
      viteInlineConfig.plugins ||= []
      viteInlineConfig.plugins.unshift(createProjectModuleResolver(rootDir))
    },
  },

  imports: {
    // Last matching dir wins on duplicate names — keep the active site's composables last.
    dirs: bcPrimarySite
      ? [
          'composables',
          'franks-standard/composables',
          'franks-standard/src/composables',
          'bc-performance-audio/src/composables',
        ]
      : [
          'composables',
          'bc-performance-audio/src/composables',
          'franks-standard/composables',
          'franks-standard/src/composables',
        ],
  },

  components: [
    { path: '~/components', pathPrefix: false },
    ...(bcPrimarySite
      ? [
          { path: '~/franks-standard/components', pathPrefix: false },
          { path: '~/franks-standard/src/components', pathPrefix: false },
          { path: '~/bc-performance-audio/src/components', pathPrefix: false },
        ]
      : [
          { path: '~/bc-performance-audio/src/components', pathPrefix: false },
          { path: '~/franks-standard/components', pathPrefix: false },
          { path: '~/franks-standard/src/components', pathPrefix: false },
        ]),
  ],

  vite: {
    plugins: [createProjectModuleResolver(rootDir)],
  },

  routeRules: {
    ...(bcPrimarySite
      ? {
          '/': {
            headers: { 'Cache-Control': 'no-cache, no-store, must-revalidate' },
          },
          '/bc-audio': { redirect: { to: '/', statusCode: 301 } },
        }
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
    includeAssets: bcPrimarySite
      ? ['img/bc-logo-primary.png', 'logo.svg', 'icons/icon-192.png', 'icons/icon-512.png']
      : ['img/TFS-logo.png', 'img/TFS logo.png', 'img/tfs-logo-red-black.png', 'TFS-logo.png', 'logo.png'],
    manifest: {
      id: '/',
      name: bcPrimarySite ? BC_LEGAL_NAME : 'The Franks Standard',
      short_name: bcPrimarySite ? BC_BRAND.short : 'Franks Standard',
      description: siteDescription,
      theme_color: bcPrimarySite ? '#0c0619' : '#050509',
      background_color: bcPrimarySite ? '#0c0619' : '#050509',
      display: 'standalone',
      start_url: '/',
      scope: '/',
      orientation: 'any',
      categories: ['shopping', 'business'],
      icons: bcPrimarySite
        ? [
            { src: bcLogoAsset, sizes: '192x192', type: 'image/png', purpose: 'any' },
            { src: bcLogoAsset, sizes: '512x512', type: 'image/png', purpose: 'any' },
            { src: bcLogoAsset, sizes: '512x512', type: 'image/png', purpose: 'maskable' },
          ]
        : [
            { src: franksLogoAsset, sizes: '192x192', type: 'image/png', purpose: 'any' },
            { src: franksLogoAsset, sizes: '512x512', type: 'image/png', purpose: 'any' },
            { src: franksLogoAsset, sizes: '512x512', type: 'image/png', purpose: 'maskable' },
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
    url: supabasePublicUrl,
    key: supabasePublicKey,
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
      title: siteTitle,
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: siteDescription },
        { property: 'og:title', content: siteTitle },
        { property: 'og:description', content: siteOgDescription },
        { property: 'og:url', content: siteUrl },
        { property: 'og:type', content: 'website' },
        { property: 'og:image', content: ogImage },
        { name: 'twitter:card', content: 'summary_large_image' },
        { name: 'twitter:title', content: siteTitle },
        { name: 'twitter:description', content: siteOgDescription },
        { name: 'twitter:image', content: ogImage },
        { name: 'theme-color', content: bcPrimarySite ? '#0c0619' : '#050509' },
        { name: 'mobile-web-app-capable', content: 'yes' },
        { name: 'apple-mobile-web-app-capable', content: 'yes' },
        { name: 'apple-mobile-web-app-status-bar-style', content: 'black-translucent' },
        { name: 'apple-mobile-web-app-title', content: bcPrimarySite ? BC_BRAND.short : 'Franks Standard' },
        { 'http-equiv': 'Cache-Control', content: 'no-cache, no-store, must-revalidate' },
        { 'http-equiv': 'Pragma', content: 'no-cache' },
        { 'http-equiv': 'Expires', content: '0' },
      ],
      link: [
        { rel: 'icon', type: 'image/png', href: bcPrimarySite ? bcLogoAsset : franksLogoAsset },
        { rel: 'apple-touch-icon', href: bcPrimarySite ? bcLogoAsset : franksLogoAsset },
        ...(bcPrimarySite
          ? [{ rel: 'preload', as: 'image', href: bcLogoAsset, fetchpriority: 'high' }]
          : [{ rel: 'preload', as: 'image', href: franksLogoAsset, fetchpriority: 'high' }]),
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

  css: [
    '~/assets/css/main.css',
    '~/assets/css/marketplace-ui.css',
    '~/assets/css/marketplace-dark.css',
    '~/assets/css/learn-hub.css',
  ],
})
