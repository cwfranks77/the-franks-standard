/** Shared auction helpers for listings UI. */

export function isAuctionOpen (listing) {
  if (!listing || listing.saleType !== 'auction') return false
  if (!listing.auctionEndsAt) return false
  return new Date(listing.auctionEndsAt) > new Date()
}

export function auctionEnded (listing) {
  if (!listing || listing.saleType !== 'auction') return false
  if (!listing.auctionEndsAt) return true
  return new Date(listing.auctionEndsAt) <= new Date()
}

export function minNextBid (listing) {
  const start = Number(listing?.startingBid ?? listing?.price ?? 0)
  const increment = Number(listing?.bidIncrement ?? 1)
  const current = listing?.currentBid != null ? Number(listing.currentBid) : null
  if (current == null || !Number.isFinite(current)) {
    return start
  }
  return Math.round((current + increment) * 100) / 100
}

export function formatAuctionTimeLeft (endsAt) {
  if (!endsAt) return ''
  const ms = new Date(endsAt).getTime() - Date.now()
  if (ms <= 0) return 'Ended'
  const sec = Math.floor(ms / 1000)
  const days = Math.floor(sec / 86400)
  const hours = Math.floor((sec % 86400) / 3600)
  const mins = Math.floor((sec % 3600) / 60)
  if (days > 0) return `${days}d ${hours}h left`
  if (hours > 0) return `${hours}h ${mins}m left`
  return `${mins}m left`
}

export function reserveMet (listing) {
  if (listing?.reservePrice == null || listing.reservePrice === '') return true
  const reserve = Number(listing.reservePrice)
  const bid = Number(listing.currentBid ?? 0)
  if (!Number.isFinite(reserve)) return true
  return bid >= reserve
}

export function auctionEndsAtFromDays (days) {
  const d = Number(days)
  const n = Number.isFinite(d) && d > 0 ? d : 7
  return new Date(Date.now() + n * 24 * 60 * 60 * 1000).toISOString()
}
