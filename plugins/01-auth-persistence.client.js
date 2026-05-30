import {
  getAuthStorageKey,
  getRememberMe,
  REMEMBER_ME_KEY,
} from '~/utils/authPersistence.js'

/** Clear legacy localStorage sessions before Supabase client hydrates (default: session-only). */
export default defineNuxtPlugin({
  name: 'auth-persistence',
  enforce: 'pre',
  setup () {
    if (localStorage.getItem(REMEMBER_ME_KEY) !== '1') {
      localStorage.setItem(REMEMBER_ME_KEY, '0')
    }
    const config = useRuntimeConfig()
    const storageKey = getAuthStorageKey(config.public.supabase?.url)
    if (!getRememberMe()) {
      localStorage.removeItem(storageKey)
    }
  },
})
