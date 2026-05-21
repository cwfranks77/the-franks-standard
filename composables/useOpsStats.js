/** Owner console stats from Supabase (client-side). */
export function useOpsStats () {
  const published = ref(0)
  const drafts = ref(0)
  const profiles = ref(0)
  const loading = ref(false)
  const error = ref('')

  async function refresh () {
    if (import.meta.server) return
    loading.value = true
    error.value = ''
    try {
      const supabase = useSupabaseClient()
      const [pubRes, draftRes, profRes] = await Promise.all([
        supabase.from('listings').select('id', { count: 'exact', head: true }).eq('status', 'published'),
        supabase.from('listings').select('id', { count: 'exact', head: true }).eq('status', 'draft'),
        supabase.from('profiles').select('id', { count: 'exact', head: true }),
      ])
      if (pubRes.error) throw pubRes.error
      if (draftRes.error) throw draftRes.error
      if (profRes.error) throw profRes.error
      published.value = pubRes.count ?? 0
      drafts.value = draftRes.count ?? 0
      profiles.value = profRes.count ?? 0
    } catch (e) {
      error.value = e?.message || 'Could not load stats'
    } finally {
      loading.value = false
    }
  }

  return { published, drafts, profiles, loading, error, refresh }
}
