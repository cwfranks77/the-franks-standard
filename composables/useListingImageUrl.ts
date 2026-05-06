export function useListingImageUrl() {
  const supabase = useSupabaseClient()

  function publicUrlForPath(path) {
    if (!path) {
      return '/img/hero-showcase-v2.svg'
    }
    const { data } = supabase.storage.from('listings').getPublicUrl(path)
    return data.publicUrl
  }

  return { publicUrlForPath }
}