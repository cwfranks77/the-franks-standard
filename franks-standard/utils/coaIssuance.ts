/** COA issuance rules — not printable or transferable until serial + e-signature. */

export type CoaIssuanceRecord = {
  serial: string
  signedName: string
  signedAt: string
  listingTitle: string
  category: string
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

export function canPrintOrTransferCoa (record: CoaIssuanceRecord | null | undefined): boolean {
  if (!record) return false
  return Boolean(record.serial && record.signedName && record.signedAt && isValidElectronicSignature(record.signedName))
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
