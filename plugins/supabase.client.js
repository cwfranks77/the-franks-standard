import { createClient } from '@supabase/supabase-js'
import { fetchWithRetry } from '~/utils/fetchWithRetry.js'
import { getRememberMe } from '~/utils/authPersistence.js'

/**
 * Replaces @nuxtjs/supabase's client plugin so auth.storage is always a real
 * Storage object (never a serialized {} from runtimeConfig).
 */
export default defineNuxtPlugin({
  name: 'supabase',
  enforce: 'pre',
  async setup ({ provide }) {
    const nuxtApp = useNuxtApp()
    const cfg = useRuntimeConfig().public.supabase
    const { url, key, useSsrCookies, clientOptions } = cfg

    const auth = { ...(clientOptions?.auth || {}) }
    delete auth.storage
    if (typeof window !== 'undefined') {
      auth.storage = getRememberMe() ? window.localStorage : window.sessionStorage
    }

    const client = createClient(url, key, {
      ...clientOptions,
      auth,
      global: {
        fetch: fetchWithRetry,
        ...(clientOptions?.global || {}),
      },
    })

    if (useSsrCookies) {
      console.warn('[supabase] useSsrCookies is enabled but this project uses a custom browser client plugin.')
    }

    provide('supabase', { client })

    const currentSession = useSupabaseSession()
    const currentUser = useSupabaseUser()

    const { data } = await client.auth.getSession()
    if (data.session) {
      currentSession.value = data.session
    }

    nuxtApp.hook('page:start', async () => {
      const { data: claims } = await client.auth.getClaims()
      currentUser.value = claims?.claims ?? null
    })

    client.auth.onAuthStateChange((_, session) => {
      if (JSON.stringify(currentSession.value) !== JSON.stringify(session)) {
        currentSession.value = session
        if (session?.user) {
          client.auth.getClaims().then(({ data: claims }) => {
            currentUser.value = claims?.claims ?? null
          })
        } else {
          currentUser.value = null
        }
      }
    })
  },
})
