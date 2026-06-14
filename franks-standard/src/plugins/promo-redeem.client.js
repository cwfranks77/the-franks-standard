export default defineNuxtPlugin(() => {
  const supabase = useSupabaseClient()
  const { redeemPendingIfAny, getPendingPromo } = usePromoCode()
  let attempted = false
  supabase.auth.onAuthStateChange(async (_event, session) => {
    if (!session || attempted || !getPendingPromo()) return
    attempted = true
    try { await redeemPendingIfAny() } catch { attempted = false }
  })
})