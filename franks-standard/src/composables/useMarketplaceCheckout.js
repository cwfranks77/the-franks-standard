/** Start Stripe Checkout for a listing (Supabase Edge Function). */
import { logPlatformActivity } from '~/utils/platformActivityRemote'
import { CHECKOUT_ACK_VERSION, checkoutAckTextForHash } from '~/utils/buyerCheckoutAcknowledgment.js'
import { sha256HexUtf8 } from '~/utils/sha256Browser.js'

const CHECKOUT_ERROR_MESSAGES = {
  unauthorized: 'Sign in again, then try Buy now.',
  listing_id_required: 'Listing not found. Refresh the page and try again.',
  listing_not_found: 'This listing is not available for purchase.',
  cannot_buy_own_listing: 'You cannot buy your own listing. Sign in as a different account or share the link with a buyer.',
  auction_still_open: 'This auction is still live — place a bid, or use Buy It Now if this listing offers it (before the first bid).',
  buy_now_unavailable: 'Buy It Now is no longer available — someone has already bid. Place a bid or wait for the auction to end.',
  not_auction_winner: 'Only the high bidder can pay after the auction ends.',
  reserve_not_met: 'This auction did not meet the seller\'s reserve price.',
  invalid_listing_price: 'This listing has an invalid price.',
  order_create_failed: 'Could not start checkout (orders database). Run supabase/migrations/003_stripe_payments.sql in Supabase SQL Editor, then try again.',
  method_not_allowed: 'Checkout service error. Try again in a moment.',
  buyer_policies_not_accepted: 'Sign the buyer agreement on this page before your first purchase.',
  checkout_ack_required: 'Check the checkout acknowledgment box before paying.',
  checkout_ack_record_failed: 'Checkout could not start — acknowledgment could not be saved. Try again or contact support.',
}

function friendlyCheckoutError (raw, detail) {
  const code = String(raw || '').trim()
  if (CHECKOUT_ERROR_MESSAGES[code]) {
    const msg = CHECKOUT_ERROR_MESSAGES[code]
    return detail && code === 'order_create_failed' ? `${msg} (${detail})` : msg
  }
  if (/tax/i.test(code)) {
    return 'Sales tax is calculated at checkout from your shipping address ZIP code (Louisiana marketplace rules). Enable Stripe Tax in Stripe Dashboard if checkout fails.'
  }
  if (code) return code
  if (detail) return String(detail)
  return 'Checkout could not start. Sign in, refresh the page, and try again.'
}

async function parseFunctionError (fnError, data) {
  if (data?.error) {
    return friendlyCheckoutError(data.error, data.detail)
  }
  const ctx = fnError?.context
  if (ctx && typeof ctx.json === 'function') {
    try {
      const body = await ctx.json()
      if (body?.error) {
        return friendlyCheckoutError(body.error, body.detail)
      }
    } catch { /* ignore */ }
  }
  const msg = fnError?.message || ''
  if (msg && !/non-2xx/i.test(msg)) return msg
  return friendlyCheckoutError('checkout_failed')
}

function resolveAck (options = {}) {
  if (options.ackVersion && options.ackHash) {
    return { ackVersion: options.ackVersion, ackHash: options.ackHash }
  }
  const hasSerializedCoa = !!options.serializedCoaSerial
  const ackVersion = CHECKOUT_ACK_VERSION
  const ackHash = sha256HexUtf8(checkoutAckTextForHash({ hasSerializedCoa }))
  return { ackVersion, ackHash }
}

/** @param {import('@supabase/supabase-js').SupabaseClient} supabase */
export function useMarketplaceCheckout () {
  const supabase = useSupabaseClient()
  const router = useRouter()
  const loading = ref(false)
  const error = ref('')

  async function startCheckout (listingId, options = {}) {
    if (!import.meta.client) return
    loading.value = true
    error.value = ''
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        await router.push({ path: '/auth/login', query: { redirect: `/listing/${listingId}` } })
        return
      }

      const { ackVersion, ackHash } = resolveAck(options)

      const { data, error: fnError } = await supabase.functions.invoke('create-checkout-session', {
        body: {
          listing_id: listingId,
          checkout_ack_version: ackVersion,
          checkout_ack_hash: ackHash,
          serialized_coa_serial: options.serializedCoaSerial || null,
          buy_now: options.buyNow === true,
        },
      })

      if (fnError) {
        const message = await parseFunctionError(fnError, data)
        throw new Error(message)
      }
      if (data?.error) {
        throw new Error(friendlyCheckoutError(data.error, data.detail))
      }
      if (!data?.url) {
        throw new Error('No checkout URL returned. Confirm create-checkout-session is deployed and STRIPE_SECRET_KEY is set in Supabase Edge secrets.')
      }

      await logPlatformActivity(supabase, {
        action: 'Checkout started',
        action_category: 'transaction',
        event_type: 'checkout_start',
        metadata: { listing_id: listingId, order_id: data.order_id || null },
      })

      window.location.assign(data.url)
    } catch (e) {
      const message = e?.message || 'Checkout failed'
      error.value = message
      console.error('[checkout]', message, e)
    } finally {
      loading.value = false
    }
  }

  return { loading, error, startCheckout }
}
