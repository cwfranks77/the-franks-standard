import { publicListingImageUrl } from '~/utils/listingImageUrl'

export type MarketplaceListing = {
  id: string
  title: string
  description: string
  category: string
  price: number | null
  image: string
  coaSerial: string
  featured: boolean
}

const SELECT =
  'id,title,description,category,price,image_paths,coa_serial_number,created_at,integrity_status'

function mapRow (row: Record<string, unknown>, supabaseUrl: string): MarketplaceListing {
  const paths = row.image_paths
  const firstPath = Array.isArray(paths) ? String(paths[0] || '') : ''
  return {
    id: String(row.id),
    title: String(row.title || 'Listing'),
    description: String(row.description || ''),
    category: String(row.category || 'General'),
    price: row.price != null ? Number(row.price) : null,
    image: publicListingImageUrl(supabaseUrl, firstPath),
    coaSerial: String(row.coa_serial_number || ''),
    featured: false,
  }
}

export function usePublishedListings () {
  const config = useRuntimeConfig()
  const listings = useState<MarketplaceListing[]>('published-listings', () => [])
  const pending = useState('published-listings-pending', () => true)
  const loadError = useState('published-listings-error', () => '')
  const loaded = useState('published-listings-loaded', () => false)

  async function load () {
    if (loaded.value) {
      pending.value = false
      return
    }
    pending.value = true
    loadError.value = ''

    const base = String(config.public.supabaseUrl || '').replace(/\/$/, '')
    const key = String(config.public.supabaseKey || '')
    if (!base || !key) {
      listings.value = []
      pending.value = false
      return
    }

    try {
      const params = new URLSearchParams({
        select: SELECT,
        status: 'eq.published',
        order: 'created_at.desc',
      })
      const res = await fetch(`${base}/rest/v1/listings?${params}`, {
        headers: {
          apikey: key,
          Authorization: `Bearer ${key}`,
        },
      })
      if (!res.ok) {
        loadError.value = 'Could not load live listings right now.'
        listings.value = []
        return
      }
      const rows = (await res.json()) as Record<string, unknown>[]
      listings.value = (rows || [])
        .filter((row) => {
          const status = String(row.integrity_status || 'clear')
          return status === 'clear'
        })
        .map((row) => mapRow(row, base))
    } catch {
      loadError.value = 'Could not load live listings right now.'
      listings.value = []
    } finally {
      pending.value = false
      loaded.value = true
    }
  }

  onMounted(() => {
    load()
  })

  return { listings, pending, loadError, reload: load }
}

export async function fetchPublishedListingById (id: string) {
  const config = useRuntimeConfig()
  const base = String(config.public.supabaseUrl || '').replace(/\/$/, '')
  const key = String(config.public.supabaseKey || '')
  if (!base || !key || !id) return null

  const params = new URLSearchParams({
    select: SELECT,
    id: `eq.${id}`,
    status: 'eq.published',
  })
  const res = await fetch(`${base}/rest/v1/listings?${params}`, {
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
    },
  })
  if (!res.ok) return null
  const rows = (await res.json()) as Record<string, unknown>[]
  const row = rows?.[0]
  if (!row) return null
  if (String(row.integrity_status || 'clear') !== 'clear') return null
  return mapRow(row, base)
}
