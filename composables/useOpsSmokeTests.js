/** Owner smoke tests — run in browser before/after deploy. */
export function useOpsSmokeTests () {
  const config = useRuntimeConfig()
  const supabase = useSupabaseClient()

  const results = ref([])
  const running = ref(false)
  const lastRunAt = ref('')

  const criticalPages = [
    { path: '/', label: 'Homepage' },
    { path: '/sell', label: 'Sell (policy gate + COA)' },
    { path: '/sell/import', label: 'Import' },
    { path: '/browse', label: 'Browse listings' },
    { path: '/collections', label: 'Collections' },
    { path: '/protection', label: 'Protection overview' },
    { path: '/marketplace-policy', label: 'Marketplace Policies' },
    { path: '/pay', label: 'Pay and fees' },
    { path: '/ops/site-qa', label: 'Full site QA runner' },
    { path: '/ops/test-checkout', label: 'Stripe checkout tests' },
    { path: '/ops/refunds', label: 'Ops forced refunds' },
    { path: '/ops/authenticity', label: 'Ops authenticity' },
  ]

  async function checkCharitiesModule () {
    const mod = await import('~/utils/charities.js')
    const n = mod.CHARITY_OPTIONS?.length ?? 0
    if (n < 1) throw new Error('CHARITY_OPTIONS is empty')
    if (typeof mod.charityByKey !== 'function') throw new Error('charityByKey missing')
    return 'OK — ' + n + ' charities loaded'
  }

  async function checkSupabase () {
    const { count, error } = await supabase.from('listings').select('id', { count: 'exact', head: true })
    if (error) throw error
    return 'OK — listings table reachable (count: ' + (count ?? 0) + ')'
  }

  async function checkAuth () {
    const { data: { user }, error } = await supabase.auth.getUser()
    if (error) throw error
    if (!user) return 'SKIP — sign in to test checkout APIs'
    return 'OK — signed in as ' + (user.email || user.id)
  }

  async function checkPlatformCheckout () {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return 'SKIP — sign in first'
    const { data, error: fnError } = await supabase.functions.invoke('create-platform-checkout-session', { body: { checkout_type: 'tax_smoke' } })
    if (fnError) throw new Error(fnError.message || 'Edge function error')
    if (data?.error) throw new Error(data.detail ? data.error + ': ' + data.detail : data.error)
    if (!data?.url) throw new Error('No checkout URL returned')
    return 'OK — tax_smoke session created (not opened)'
  }

  async function checkListingCheckout () {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return 'SKIP — sign in first'
    const { data: listing } = await supabase.from('listings').select('id, seller_id').eq('status', 'published').limit(1).maybeSingle()
    if (!listing?.id) return 'SKIP — publish a listing first'
    if (listing.seller_id === session.user.id) return 'SKIP — use incognito buyer to test Buy now on your listing'
    const { data, error: fnError } = await supabase.functions.invoke('create-checkout-session', { body: { listing_id: listing.id } })
    if (fnError) throw new Error(fnError.message || 'Edge function error')
    if (data?.error) throw new Error(data.detail ? data.error + ': ' + data.detail : data.error)
    if (!data?.url) throw new Error('No checkout URL returned')
    return 'OK — Buy now session for listing ' + listing.id.slice(0, 8) + '...'
  }

  async function checkStaticRoute (routePath) {
    const base = String(config.public.siteUrl || window.location.origin).replace(/\/$/, '')
    const url = routePath === '/' ? base + '/' : base + routePath
    const res = await fetch(url, { method: 'GET', cache: 'no-store' })
    if (!res.ok) throw new Error('HTTP ' + res.status)
    const html = await res.text()
    if (/useCharities is not defined|usecharities is not defined/i.test(html)) throw new Error('HTML references useCharities error')
    return 'OK — HTTP ' + res.status
  }

  function checkTaxConfig () {
    const on = String(config.public.stripeTaxCheckoutEnabled ?? 'true') !== 'false'
    return on ? 'OK — tax checkout enabled in build' : 'WARN — tax checkout disabled in build'
  }

  const automatedChecks = [
    { id: 'charities', label: 'Charity module (sell page)', run: checkCharitiesModule },
    { id: 'supabase', label: 'Supabase database', run: checkSupabase },
    { id: 'auth', label: 'Your login session', run: checkAuth },
    { id: 'tax-config', label: 'Tax checkout build flag', run: async () => checkTaxConfig() },
    { id: 'home-html', label: 'Homepage HTML', run: () => checkStaticRoute('/') },
    { id: 'sell-html', label: 'Sell page HTML', run: () => checkStaticRoute('/sell') },
    { id: 'policy-html', label: 'Marketplace policy HTML', run: () => checkStaticRoute('/marketplace-policy') },
    { id: 'terms-html', label: 'Terms HTML', run: () => checkStaticRoute('/terms') },
    { id: 'platform-api', label: 'Platform checkout API ($1 smoke)', run: checkPlatformCheckout },
    { id: 'listing-api', label: 'Buy now checkout API', run: checkListingCheckout },
  ]

  async function runAll () {
    running.value = true
    results.value = automatedChecks.map((c) => ({ id: c.id, label: c.label, status: 'pending', message: '' }))
    for (let i = 0; i < automatedChecks.length; i++) {
      const check = automatedChecks[i]
      results.value[i] = { ...results.value[i], status: 'running', message: 'Running...' }
      try {
        const message = await check.run()
        const isSkip = String(message).startsWith('SKIP')
        const isWarn = String(message).startsWith('WARN')
        results.value[i] = { ...results.value[i], status: isSkip ? 'skip' : isWarn ? 'warn' : 'pass', message }
      } catch (e) {
        results.value[i] = { ...results.value[i], status: 'fail', message: e?.message || 'Failed' }
      }
    }
    lastRunAt.value = new Date().toLocaleString()
    running.value = false
  }

  const passCount = computed(() => results.value.filter((r) => r.status === 'pass').length)
  const failCount = computed(() => results.value.filter((r) => r.status === 'fail').length)

  return { results, running, lastRunAt, passCount, failCount, criticalPages, runAll }
}