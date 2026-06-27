/** Client-side COA gate checks — mirrors server coaDocumentPolicy. */

export const COA_NON_TRANSFERABLE_NOTICE =
  'NON-TRANSFERABLE: This certificate is permanently bound to one listing, one item snapshot, and one serial number. ' +
  'It may not be reassigned, transferred to another item, or reused on a different listing.'

export const MIN_DESCRIPTION_CHARS = 20

export type CoaIssuanceRecord = {
  serial: string
  signedName: string
  signedAt: string
  listingTitle: string
  category: string
  listingId?: string
  descriptionExcerpt?: string
  thumbnailCount?: number
  authStatus?: 'pending' | 'verified' | 'rejected'
  buyerAccessEnabled?: boolean
}

const STORAGE_KEY = 'tfs-seller-coa-draft'

export function normalizeSignerName (name: string): string {
  return String(name || '').trim().replace(/\s+/g, ' ')
}

export function isValidElectronicSignature (name: string): boolean {
  const n = normalizeSignerName(name)
  if (n.length < 4) return false
  const parts = n.split(' ')
  return parts.length >= 2 && parts.every((p) => p.length >= 2)
}

export function generateCoaSerial (): string {
  const year = new Date().getFullYear()
  const n = String(Math.floor(Math.random() * 900000) + 100000)
  return `FS-${year}-${n}`
}

export function hasListingSnapshots (record: CoaIssuanceRecord | null | undefined): boolean {
  if (!record) return false
  return (record.thumbnailCount ?? 0) >= 1 && String(record.descriptionExcerpt || '').trim().length >= MIN_DESCRIPTION_CHARS
}

export function hasAssignedSerial (record: CoaIssuanceRecord | null | undefined): boolean {
  return Boolean(String(record?.serial || '').trim().length >= 8)
}

export function canPrintOrTransferCoa (record: CoaIssuanceRecord | null | undefined): boolean {
  if (!record) return false
  if (!hasListingSnapshots(record)) return false
  if (!hasAssignedSerial(record)) return false
  if (!isValidElectronicSignature(record.signedName)) return false
  if (record.authStatus && record.authStatus !== 'verified') return false
  return Boolean(record.serial && record.signedAt)
}

export function canBuyerDownloadCoa (record: CoaIssuanceRecord | null | undefined): boolean {
  if (!canPrintOrTransferCoa(record)) return false
  return Boolean(record?.buyerAccessEnabled)
}

export function loadCoaDraft (): CoaIssuanceRecord | null {
  if (!import.meta.client) return null
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    return JSON.parse(raw) as CoaIssuanceRecord
  } catch {
    return null
  }
}

export function saveCoaDraft (record: CoaIssuanceRecord) {
  if (!import.meta.client) return
  localStorage.setItem(STORAGE_KEY, JSON.stringify(record))
}

export function clearCoaDraft () {
  if (!import.meta.client) return
  localStorage.removeItem(STORAGE_KEY)
}
