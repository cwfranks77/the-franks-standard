/** Iron-clad COA policy — gates print, download, and buyer transfer. */

export const COA_NON_TRANSFERABLE_NOTICE =
  'NON-TRANSFERABLE: This certificate is permanently bound to one listing, one item snapshot, and one serial number. ' +
  'It may not be reassigned, transferred to another item, or reused on a different listing.'

export const MIN_DESCRIPTION_CHARS = 20
export const MIN_UPLOAD_BYTES = 2048

export type ListingCoaSnapshot = {
  image_paths?: string[] | null
  title?: string | null
  description?: string | null
  coa_serial_number?: string | null
  coa_document_serial?: string | null
  coa_type?: string | null
  coa_auth_status?: string | null
  coa_buyer_access_enabled?: boolean | null
  third_party_coa_serial?: string | null
}

export function listingItemFingerprint (listing: ListingCoaSnapshot): string {
  const paths = [...(listing.image_paths || [])].sort()
  const title = String(listing.title || '').trim()
  const description = String(listing.description || '').trim()
  return `${paths.join('|')}::${title}::${description}`
}

export function listingHasThumbnailImages (listing: ListingCoaSnapshot): boolean {
  return Array.isArray(listing.image_paths) && listing.image_paths.length >= 1
}

export function listingHasBriefDescription (listing: ListingCoaSnapshot): boolean {
  return String(listing.description || '').trim().length >= MIN_DESCRIPTION_CHARS
}

export function listingHasAssignedSerial (listing: ListingCoaSnapshot): boolean {
  const platform = String(listing.coa_serial_number || listing.coa_document_serial || '').trim()
  return platform.length >= 8
}

export type CertificateCoaSnapshot = {
  primary_image_path?: string | null
  image_fingerprint?: string | null
  auth_status?: string | null
  serial_number?: string | null
}

export type CoaGateResult = { ok: boolean; reason?: string; code?: string }

export function certificateHasFrozenThumbnail (cert: CertificateCoaSnapshot): boolean {
  return Boolean(String(cert?.primary_image_path || '').trim())
}

export function sellerMayPrintOrIssue (listing: ListingCoaSnapshot): CoaGateResult {
  if (!listingHasThumbnailImages(listing)) {
    return {
      ok: false,
      code: 'thumbnail_missing',
      reason: 'Upload at least one item thumbnail photo before COA print or issue.',
    }
  }
  if (!listingHasBriefDescription(listing)) {
    return {
      ok: false,
      code: 'description_missing',
      reason: `Add a brief item description (minimum ${MIN_DESCRIPTION_CHARS} characters) before COA issue.`,
    }
  }
  return { ok: true }
}

/** Full anti-fraud gate — listing + certificate must be complete before any print or copy issue. */
export function coaReadyForPrint (
  listing: ListingCoaSnapshot,
  cert: CertificateCoaSnapshot,
): CoaGateResult {
  const sellerGate = sellerMayPrintOrIssue(listing)
  if (!sellerGate.ok) return sellerGate

  if (!listingHasAssignedSerial(listing)) {
    return {
      ok: false,
      code: 'serial_missing',
      reason: 'COA serial not assigned yet — print stays locked.',
    }
  }

  const auth = String(listing.coa_auth_status || cert.auth_status || '')
  if (auth !== 'verified') {
    return {
      ok: false,
      code: 'auth_pending',
      reason: 'COA pending backend verification — print stays locked.',
    }
  }

  if (!certificateHasFrozenThumbnail(cert)) {
    return {
      ok: false,
      code: 'cert_thumbnail_missing',
      reason: 'Item thumbnail must be frozen on the certificate before print. Add listing photos and re-sync the COA.',
    }
  }

  if (!String(cert.image_fingerprint || '').trim()) {
    return {
      ok: false,
      code: 'fingerprint_missing',
      reason: 'Certificate item snapshot is incomplete — print locked.',
    }
  }

  const paths = listing.image_paths || []
  const thumb = String(cert.primary_image_path || '').trim()
  if (!paths.includes(thumb)) {
    return {
      ok: false,
      code: 'thumbnail_mismatch',
      reason: 'Certified thumbnail is not in current listing photos — print locked until photos match the certificate.',
    }
  }

  return { ok: true }
}

export function buyerCoaReadyForPrint (
  listing: ListingCoaSnapshot,
  cert: CertificateCoaSnapshot,
): CoaGateResult {
  const printGate = coaReadyForPrint(listing, cert)
  if (!printGate.ok) return printGate
  if (!listing.coa_buyer_access_enabled) {
    return {
      ok: false,
      code: 'buyer_locked',
      reason: 'COA unlocks for the buyer only after a completed purchase on this listing.',
    }
  }
  return { ok: true }
}

export function buyerMayAccessCoa (
  listing: ListingCoaSnapshot,
  cert?: CertificateCoaSnapshot | null,
): CoaGateResult {
  if (cert) {
    return buyerCoaReadyForPrint(listing, cert)
  }
  const sellerGate = sellerMayPrintOrIssue(listing)
  if (!sellerGate.ok) return sellerGate
  if (!listingHasAssignedSerial(listing)) {
    return { ok: false, code: 'serial_missing', reason: 'COA serial not assigned yet — certificate stays locked.' }
  }
  if (String(listing.coa_auth_status || '') !== 'verified') {
    return { ok: false, code: 'auth_pending', reason: 'COA pending backend authentication — download and transfer stay blocked.' }
  }
  if (!listing.coa_buyer_access_enabled) {
    return { ok: false, code: 'buyer_locked', reason: 'COA unlocks for the buyer only after a completed purchase on this listing.' }
  }
  return { ok: true }
}

export function formatPlatformSerial (year: number, n: number, prefix = 'FS') {
  return `${prefix}-${year}-${String(n).padStart(6, '0')}`
}

export function formatDocumentSerial (year: number, n: number) {
  return formatPlatformSerial(year, n, 'DOC-FS')
}
