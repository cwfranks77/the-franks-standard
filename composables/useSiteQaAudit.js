/**
 * Full-site QA — HTTP checks every route in utils/siteRoutes.js + API smoke hooks.
 */
import { STATIC_SITE_ROUTES } from '~/utils/siteRoutes.js'

export function useSiteQaAudit () {
  const config = useRuntimeConfig()
  const results = ref([])
  const running = ref(false)
  const lastRunAt = ref('')
  const passCount = computed(() => results.value.filter((r) => r.status === 'pass').length)
  const failCount = computed(() => results.value.filter((r) => r.status === 'fail').length)
  const warnCount = computed(() => results.value.filter((r) => r.status === 'warn').length)

  function siteBase () {
    if (typeof window !== 'undefined' && window.location?.origin) {
      return String(window.location.origin).replace(/\/$/, '')
    }
    return String(config.public?.siteUrl || 'https://thefranksstandard.com').replace(/\/$/, '')
  }

  async function checkRoute (route) {
    const base = siteBase()
    const url = route.path === '/' ? `${base}/` : `${base}${route.path}`
    try {
      const res = await fetch(url, { method: 'GET', cache: 'no-store' })
      const html = await res.text()
      if (!res.ok) {
        return { status: 'fail', message: `HTTP ${res.status}` }
      }
      if (/useCharities is not defined|usecharities is not defined/i.test(html)) {
        return { status: 'fail', message: 'Broken JS: useCharities error in HTML' }
      }
      if (html.length < 200) {
        return { status: 'warn', message: 'Very short response — verify content' }
      }
      if (route.path.includes('sample-id') || route.path.includes('demo-room') || route.path.includes('FS-2026')) {
        return { status: 'warn', message: `HTTP ${res.status} — dynamic sample (may be empty state)` }
      }
      return { status: 'pass', message: `HTTP ${res.status}` }
    } catch (e) {
      return { status: 'fail', message: e instanceof Error ? e.message : 'Fetch failed' }
    }
  }

  async function runAllRoutes (filter = null) {
    running.value = true
    const routes = filter
      ? STATIC_SITE_ROUTES.filter((r) => r.group === filter)
      : STATIC_SITE_ROUTES

    results.value = routes.map((r) => ({
      path: r.path,
      label: r.label,
      group: r.group,
      status: 'pending',
      message: '',
    }))

    for (let i = 0; i < routes.length; i++) {
      results.value[i] = { ...results.value[i], status: 'running', message: 'Checking…' }
      const out = await checkRoute(routes[i])
      results.value[i] = { ...results.value[i], ...out }
    }

    lastRunAt.value = new Date().toLocaleString()
    running.value = false
  }

  return {
    results,
    running,
    lastRunAt,
    passCount,
    failCount,
    warnCount,
    siteBase,
    runAllRoutes,
    routeGroups: STATIC_SITE_ROUTES,
  }
}
