/** Client COA gate checks — mirrors server coaDocumentPolicy. */

export const MIN_DESCRIPTION_CHARS = 20

export function listingHasThumbnailImages (listing) {
  return Array.isArray(listing?.image_paths) && listing.image_paths.length >= 1
}

export function listingHasBriefDescription (listing) {
  return String(listing?.description || '').trim().length >= MIN_DESCRIPTION_CHARS
}

export function listingHasAssignedSerial (listing) {
  const platform = String(listing?.coa_serial_number || listing?.coa_document_serial || '').trim()
  return platform.length >= 8
}

export function certificateHasFrozenThumbnail (cert) {
  return Boolean(String(cert?.primary_image_path || '').trim())
}

export function coaReadyForPrint (listing, cert) {
  if (!listingHasThumbnailImages(listing)) {
    return { ok: false, reason: 'Upload at least one item thumbnail photo before COA print.' }
  }
  if (!listingHasBriefDescription(listing)) {
    return { ok: false, reason: `Add a brief item description (minimum ${MIN_DESCRIPTION_CHARS} characters) before COA print.` }
  }
  if (!listingHasAssignedSerial(listing)) {
    return { ok: false, reason: 'COA serial not assigned yet — print stays locked.' }
  }
  const auth = String(listing.coa_auth_status || cert.auth_status || '')
  if (auth !== 'verified') {
    return { ok: false, reason: 'COA pending backend verification — print stays locked.' }
  }
  if (!certificateHasFrozenThumbnail(cert)) {
    return { ok: false, reason: 'Item thumbnail must be on the certificate before print.' }
  }
  const thumb = String(cert.primary_image_path || '').trim()
  const paths = listing.image_paths || []
  if (!paths.includes(thumb)) {
    return { ok: false, reason: 'Certified thumbnail does not match listing photos — print locked.' }
  }
  return { ok: true }
}

export function buyerMayViewCoaDocument (listing, cert, isBuyer, isSeller) {
  const printGate = coaReadyForPrint(listing, cert)
  if (!printGate.ok) return printGate
  if (isSeller) return { ok: true }
  if (!isBuyer) {
    return { ok: false, reason: 'Sign in as the buyer who purchased this item to view the COA.' }
  }
  if (!listing.coa_buyer_access_enabled) {
    return { ok: false, reason: 'COA unlocks for the buyer only after a completed purchase.' }
  }
  return { ok: true }
}
