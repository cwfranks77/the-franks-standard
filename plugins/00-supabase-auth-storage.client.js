import { createAuthStorageAdapter } from '~/utils/authPersistence.js'

/**
 * Auth storage must be registered here — not in nuxt.config.
 * Functions in runtimeConfig are stripped on the client, which caused
 * "e.getItem is not a function" and a sitewide Nuxt 500.
 */
export default defineNuxtPlugin({
  name: 'supabase-auth-storage',
  enforce: 'pre',
  // Must run before @nuxtjs/supabase's "supabase" plugin (module plugins default to order 0).
  order: -100,
  setup () {
    const config = useRuntimeConfig()
    const pub = config.public.supabase
    if (!pub.clientOptions) pub.clientOptions = {}
    if (!pub.clientOptions.auth) pub.clientOptions.auth = {}
    const auth = pub.clientOptions.auth
    // Serialized runtimeConfig used to leave storage as {} — truthy but no getItem → sitewide 500.
    if (auth.storage && typeof auth.storage.getItem !== 'function') {
      delete auth.storage
    }
    auth.storage = createAuthStorageAdapter()
  },
})
