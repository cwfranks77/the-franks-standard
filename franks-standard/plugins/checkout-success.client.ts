import { logPlatformActivity } from '~/utils/platformActivityRemote'

/** Clear cart and log purchase when buyer lands on order success. */
export default defineNuxtPlugin(() => {
  if (!import.meta.client) return

  const router = useRouter()
  const supabase = useSupabaseClient()

  router.afterEach((to) => {
    if (!to.path.startsWith('/order/success')) return

    try {
      const { clearCart } = useCart()
      clearCart()
    } catch { /* cart composable optional */ }

    const sessionId = String(to.query.session_id || '').trim()
    if (!sessionId) return

    logPlatformActivity(supabase, {
      action: 'Checkout success page viewed',
      action_category: 'transaction',
      event_type: 'purchase',
      metadata: { stripe_checkout_session_id: sessionId },
    })
  })
})
