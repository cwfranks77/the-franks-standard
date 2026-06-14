import { excellenceScore } from '~/utils/sellerExcellenceProgram.js'

const COMPLETED_STATUSES = ['paid', 'shipped', 'delivered']

/**
 * Load top sellers for showcase. Uses seller_leaderboard view when available;
 * falls back to aggregating published listings + orders.
 */
export function useSellerLeaderboard () {
  const supabase = useSupabaseClient()
  const loading = ref(false)
  const error = ref('')
  const leaders = ref([])

  async function load (limit = 6) {
    loading.value = true
    error.value = ''
    leaders.value = []
    try {
      const { data, error: viewErr } = await supabase
        .from('seller_leaderboard')
        .select('*')
        .order('completed_sales', { ascending: false })
        .limit(Math.max(limit, 12))

      if (!viewErr && data?.length) {
        leaders.value = rankRows(
          data.filter((r) => (Number(r.completed_sales) || 0) > 0),
        ).slice(0, limit)
        return leaders.value
      }

      const { data: orders, error: ordErr } = await supabase
        .from('orders')
        .select('seller_id, status, seller:profiles!orders_seller_id_fkey(id, full_name, store_name, store_slug, excellence_badge)')
        .in('status', COMPLETED_STATUSES)

      if (ordErr) throw ordErr

      const bySeller = new Map()
      for (const o of orders || []) {
        const sid = o.seller_id
        if (!sid || !o.seller) continue
        const cur = bySeller.get(sid) || {
          seller_id: sid,
          display_name: o.seller.store_name || o.seller.full_name || 'Seller',
          store_slug: o.seller.store_slug,
          excellence_badge: o.seller.excellence_badge,
          completed_sales: 0,
          rating_avg: 0,
          review_count: 0,
          positive_reviews: 0,
        }
        cur.completed_sales += 1
        bySeller.set(sid, cur)
      }
      leaders.value = rankRows([...bySeller.values()]).slice(0, limit)
      return leaders.value
    } catch (e) {
      error.value = e?.message || 'Could not load leaderboard'
      return []
    } finally {
      loading.value = false
    }
  }

  return { loading, error, leaders, load }
}

function rankRows (rows) {
  return [...rows]
    .map((r, i) => ({
      ...r,
      rank: i + 1,
      score: excellenceScore(r),
    }))
    .sort((a, b) => b.score - a.score || b.completed_sales - a.completed_sales)
    .map((r, i) => ({ ...r, rank: i + 1 }))
}
