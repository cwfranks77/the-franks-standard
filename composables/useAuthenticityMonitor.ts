import { scanListingIntegrity } from '~/utils/authenticityScan.js'

/**
 * Scans published listings for counterfeit / misrepresentation risk signals.
 * Complements useCoaMonitor (missing COA) with content-based integrity flags.
 */
export function useAuthenticityMonitor () {
  const riskListings = ref<any[]>([])
  const lastCheck = ref('')
  const checking = ref(false)

  async function scan () {
    if (import.meta.server) return
    checking.value = true
    try {
      const supabase = useSupabaseClient()
      const { data, error } = await supabase
        .from('listings')
        .select('id, title, description, category, price, coa_type, coa_storage_path, guarantee_signed, integrity_status, integrity_score, integrity_flags, created_at, seller_id')
        .eq('status', 'published')
        .order('created_at', { ascending: false })

      if (error || !data) {
        checking.value = false
        return
      }

      const risks: any[] = []
      for (const row of data) {
        if (row.integrity_status === 'counterfeit_confirmed' || row.integrity_status === 'suspended') {
          risks.push({
            id: row.id,
            title: row.title,
            category: row.category,
            integrityStatus: row.integrity_status,
            sellerId: row.seller_id,
            createdAt: row.created_at,
            problems: ['Enforcement: listing suspended or counterfeit confirmed'],
            severity: 'enforced',
          })
          continue
        }

        const scan = scanListingIntegrity(row)
        const dbFlags = Array.isArray(row.integrity_flags) ? row.integrity_flags : []
        const needsAttention =
          row.integrity_status === 'review'
          || scan.severity !== 'clear'
          || scan.score >= 20

        if (!needsAttention) continue

        const problems = [
          ...scan.flags.map((f: { label: string }) => f.label),
          ...(row.integrity_status === 'review' ? ['Flagged for review (status or report)'] : []),
        ]

        risks.push({
          id: row.id,
          title: row.title,
          category: row.category,
          integrityStatus: row.integrity_status,
          score: scan.score,
          severity: scan.severity,
          sellerId: row.seller_id,
          createdAt: row.created_at,
          problems: [...new Set(problems)],
          flags: scan.flags,
          dbFlags,
        })
      }

      riskListings.value = risks.sort((a, b) => (b.score || 0) - (a.score || 0))
      lastCheck.value = new Date().toLocaleString()
    } catch {
      // network / schema
    }
    checking.value = false
  }

  return { riskListings, lastCheck, checking, scan }
}
