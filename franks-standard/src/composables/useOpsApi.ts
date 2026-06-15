import {
  getStoredOpsPhrase,
  isOpsApiUnavailable,
} from '~/utils/opsClientAuth'
import { getSupabaseFunctionsBase } from '~/utils/publicSupabase.js'

type OpsFetchOptions = {
  method?: string
  body?: Record<string, unknown>
  query?: Record<string, string | number | undefined>
}

function functionsBase () {
  return getSupabaseFunctionsBase(useRuntimeConfig())
}

async function invokeOpsCms (action: string, payload: Record<string, unknown> = {}) {
  const opsKey = getStoredOpsPhrase()
  if (!opsKey) {
    throw new Error('Owner session expired. Tap the logo 5× and unlock again.')
  }
  const res = await fetch(`${functionsBase()}/ops-cms-action`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action, ops_key: opsKey, ...payload }),
  })
  let data: Record<string, unknown> = {}
  try {
    data = await res.json()
  } catch { /* empty */ }
  if (!res.ok) {
    const err = new Error(String(data.error || data.statusMessage || res.statusText)) as Error & {
      statusCode?: number
      data?: unknown
    }
    err.statusCode = res.status
    err.data = data
    throw err
  }
  return data
}

function mapOpsPathToEdge (url: string, options: OpsFetchOptions = {}) {
  const path = url.replace(/\?.*$/, '')
  const method = String(options.method || 'GET').toUpperCase()

  if (path === '/api/ops/dropship-store') {
    const storeId = String(options.query?.storeId || 'bc-performance-audio')
    if (method === 'GET') return invokeOpsCms('get_dropship_store', { storeId })
    if (method === 'PUT') {
      return invokeOpsCms('save_dropship_store', {
        store: options.body?.store,
        items: options.body?.items,
      })
    }
  }

  if (path === '/api/ops/site-content') {
    if (method === 'GET') {
      const keys = options.query?.keys ? String(options.query.keys) : undefined
      return invokeOpsCms('get_site_content', { keys })
    }
    if (method === 'PUT') {
      return invokeOpsCms('put_site_content', {
        contentKey: options.body?.contentKey,
        payload: options.body?.payload,
      })
    }
  }

  if (path === '/api/ops/bc-orders' && method === 'GET') {
    return invokeOpsCms('get_bc_orders', {})
  }

  throw new Error(`Owner API not available on this host: ${path}`)
}

/** Owner toolkit fetch — Nuxt API in dev; Supabase edge on static GitHub Pages. */
export async function opsFetch<T> (url: string, options: OpsFetchOptions = {}): Promise<T> {
  if (import.meta.dev) {
    return $fetch<T>(url, options as Parameters<typeof $fetch>[1])
  }
  if (url.startsWith('/api/ops/')) {
    return mapOpsPathToEdge(url, options) as Promise<T>
  }
  try {
    return await $fetch<T>(url, options as Parameters<typeof $fetch>[1])
  } catch (error: unknown) {
    if (!isOpsApiUnavailable(error)) throw error
    return mapOpsPathToEdge(url, options) as Promise<T>
  }
}
