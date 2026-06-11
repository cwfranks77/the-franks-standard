import { createClient } from '@supabase/supabase-js'

export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig()

  const supabaseUrl =
    process.env.SUPABASE_URL ||
    process.env.NUXT_PUBLIC_SUPABASE_URL ||
    process.env.NUXT_SUPABASE_URL ||
    config.public.supabase?.url

  const supabaseAnonKey =
    process.env.SUPABASE_ANON_KEY ||
    process.env.NUXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.NUXT_SUPABASE_ANON_KEY ||
    process.env.NUXT_PUBLIC_SUPABASE_KEY ||
    config.public.supabase?.key

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Supabase environment variables missing')
  }

  const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '')

  return {
    provide: {
      supabase,
    },
  }
})
