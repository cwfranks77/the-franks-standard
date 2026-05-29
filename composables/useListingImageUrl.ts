export function useListingImageUrl() {
  const supabase = useSupabaseClient()

  function publicUrlForPath(path) {
    if (!path) {
      return '/img/hero-showcase-v2.svg'
    }
    if (/^https?:\/\//i.test(String(path))) {
      return String(path)
    }
    const { data } = supabase.storage.from('listings').getPublicUrl(path)
    return data.publicUrl
  }

  return { publicUrlForPath }
}