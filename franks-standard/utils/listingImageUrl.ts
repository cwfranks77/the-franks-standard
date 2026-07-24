/** Public URL for a listing image path in Supabase storage. */
export function publicListingImageUrl (
  supabaseUrl: string,
  path: string | null | undefined,
  fallback = '/img/tfs-logo-red-black.png?v=20260724c',
): string {
  const base = String(supabaseUrl || '').replace(/\/$/, '')
  const cleaned = String(path || '').trim().replace(/^\//, '')
  if (!base || !cleaned) return fallback
  if (/^https?:\/\//i.test(cleaned)) return cleaned
  return `${base}/storage/v1/object/public/listings/${cleaned}`
}
