/*
===========================================================
CURSOR: DO NOT SCREW UP — STRICT FILE ISOLATION MODE
You are ONLY allowed to modify THIS file.
Do NOT touch any other file.
===========================================================
*/

import { createClient } from '@supabase/supabase-js'

export default defineNuxtPlugin(() => {
  const supabaseUrl = process.env.SUPABASE_URL
  const supabaseAnonKey = process.env.SUPABASE_ANON_KEY

  const supabase = createClient(supabaseUrl, supabaseAnonKey)

  return {
    provide: {
      supabase,
    },
  }
})
