import { createClient } from '@supabase/supabase-js'

export default defineNuxtPlugin({
  name: 'supabase-custom',
  enforce: 'pre',
  setup () {
    const config = useRuntimeConfig()

    const supabaseUrl =
      process.env.SUPABASE_URL ||
      process.env.NUXT_PUBLIC_SUPABASE_URL ||
      process.env.NUXT_SUPABASE_URL;

    const supabaseAnonKey =
      process.env.SUPABASE_ANON_KEY ||
      process.env.NUXT_PUBLIC_SUPABASE_ANON_KEY ||
      process.env.NUXT_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      console.error('Supabase environment variables missing');
    }

    const url = supabaseUrl || config.public.supabase?.url || ''
    const key =
      supabaseAnonKey ||
      process.env.NUXT_PUBLIC_SUPABASE_KEY ||
      config.public.supabase?.key ||
      ''

    const client = createClient(url, key)

    return {
      provide: {
        supabase: { client },
      },
    }
  },
})
