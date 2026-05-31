import { createAuthStorageAdapter } from '~/utils/authPersistence.js'

/**
 * Auth storage must be registered here — not in nuxt.config.
 * Functions in runtimeConfig are stripped on the client, which caused
 * "e.getItem is not a function" and a sitewide Nuxt 500.
 */
export default defineNuxtPlugin({
  name: 'supabase-auth-storage',
  enforce: 'pre',
  setup () {
    const config = useRuntimeConfig()
    const pub = config.public.supabase
    if (!pub.clientOptions) pub.clientOptions = {}
    if (!pub.clientOptions.auth) pub.clientOptions.auth = {}
    pub.clientOptions.auth.storage = createAuthStorageAdapter()
  },
})
