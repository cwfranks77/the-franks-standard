/**
 * COA Enforcement Monitor.
 * Scans all published listings for missing COA/guarantee.
 * Alerts the owner in real-time when a violation is detected.
 */
export function useCoaMonitor () {
  const violations = ref<any[]>([])
  const lastCheck = ref<string>('')
  const checking = ref(false)

  async function scan () {
    if (import.meta.server) return
    checking.value = true
    try {
      const supabase = useSupabaseClient()
      const { data, error } = await supabase
        .from('listings')
        .select('id, title, category, coa_type, guarantee_signed, coa_storage_path, seller_legal_name, created_at, seller_id')
        .eq('status', 'published')
        .order('created_at', { ascending: false })

      if (error || !data) {
        checking.value = false
        return
      }

      const issues: any[] = []
      for (const row of data) {
        const problems: string[] = []

        if (!row.coa_type || (row.coa_type !== 'upload' && row.coa_type !== 'guarantee')) {
          problems.push('No COA type selected')
        }

        if (row.coa_type === 'upload' && !row.coa_storage_path) {
          problems.push('COA type is "upload" but no COA file attached')
        }

        if (row.coa_type === 'guarantee') {
          if (!row.guarantee_signed) {
            problems.push('Guarantee not signed')
          }
          if (!row.seller_legal_name || !row.seller_legal_name.trim()) {
            problems.push('Guarantee missing seller legal name')
          }
        }

        if (problems.length > 0) {
          issues.push({
            id: row.id,
            title: row.title,
            category: row.category,
            coaType: row.coa_type,
            sellerId: row.seller_id,
            createdAt: row.created_at,
            problems,
          })
        }
      }

      violations.value = issues
      lastCheck.value = new Date().toLocaleString()
    } catch {
      // Supabase not configured or network error
    }
    checking.value = false
  }

  return { violations, lastCheck, checking, scan }
}
