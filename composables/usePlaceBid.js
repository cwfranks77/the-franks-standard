/** Place a bid on an auction listing via Edge Function. */

const BID_ERRORS = {
  unauthorized: 'Sign in to place a bid.',
  listing_id_required: 'Listing not found.',
  listing_not_found: 'This listing is not available.',
  not_an_auction: 'This listing is not an auction.',
  cannot_bid_own_listing: 'You cannot bid on your own listing.',
  auction_ended: 'This auction has ended.',
  bid_too_low: 'Your bid is below the minimum.',
  invalid_bid_amount: 'Enter a valid bid amount.',
}

function friendlyBidError (raw, detail) {
  const code = String(raw || '').trim()
  if (BID_ERRORS[code]) {
    return detail && code === 'bid_too_low' ? detail : BID_ERRORS[code]
  }
  return detail || code || 'Could not place bid.'
}

export function usePlaceBid () {
  const supabase = useSupabaseClient()
  const router = useRouter()
  const loading = ref(false)
  const error = ref('')

  async function placeBid (listingId, amount) {
    if (!import.meta.client) return null
    loading.value = true
    error.value = ''
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        await router.push({ path: '/auth/login', query: { redirect: `/listing/${listingId}` } })
        return null
      }

      const { data, error: fnError } = await supabase.functions.invoke('place-bid', {
        body: { listing_id: listingId, amount: Number(amount) },
      })

      if (fnError) {
        throw new Error(fnError.message)
      }
      if (data?.error) {
        throw new Error(friendlyBidError(data.error, data.detail))
      }
      return data
    } catch (e) {
      error.value = e?.message || 'Bid failed'
      return null
    } finally {
      loading.value = false
    }
  }

  return { loading, error, placeBid }
}