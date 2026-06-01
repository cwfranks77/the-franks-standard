/**
 * Floor-slot binding — one listing = one "office" = one COA serial.
 * Prevents pairing a COA from an authentic item with a different lookalike listing.
 */

/** Build stable fingerprint of what the COA certifies (photos + copy). */
export function listingItemFingerprint (row = {}) {
  const paths = Array.isArray(row.image_paths) ? [...row.image_paths].sort() : []
  const title = String(row.title || '').trim()
  const description = String(row.description || '').trim()
  return `${paths.join('|')}::${title}::${description}`
}

/** Office number shown on listing + COA — same as serial when Franks-issued. */
export function floorSlotLabel (listing = {}, cert = null) {
  return (
    listing.floor_slot_code
    || listing.coa_serial_number
    || cert?.serial_number
    || ''
  )
}

/**
 * Is this COA digitally tied to THIS listing display (not another slot)?
 * @param {object} listing — current listing row
 * @param {object|null} cert — coa_certificates row for this listing
 */
export function evaluateCoaListingBond (listing = {}, cert = null) {
  if (!cert || !listing?.id) {
    return {
      paired: false,
      reason: 'no_certificate',
      message: 'No Franks issued COA on file for this listing.',
    }
  }

  if (cert.listing_id !== listing.id) {
    return {
      paired: false,
      reason: 'wrong_office',
      message: 'This COA belongs to a different listing office — serial does not match this item slot.',
      expected_listing_id: cert.listing_id,
      actual_listing_id: listing.id,
    }
  }

  const serial = listing.coa_serial_number || cert.serial_number
  const slot = listing.floor_slot_code || serial
  if (slot && serial && slot !== serial) {
    return {
      paired: false,
      reason: 'slot_serial_mismatch',
      message: 'Floor slot number and COA serial do not match — do not buy until resolved.',
    }
  }

  const currentFp = listingItemFingerprint(listing)
  if (cert.image_fingerprint && currentFp !== cert.image_fingerprint) {
    return {
      paired: false,
      reason: 'item_changed',
      message: 'Photos or description changed after the COA was issued. Certificate may not match what is shown now.',
      photos_or_copy_changed: true,
    }
  }

  if (cert.status && cert.status !== 'active') {
    return {
      paired: false,
      reason: 'cert_revoked',
      message: `COA status: ${cert.status}. Not valid for this item.`,
    }
  }

  return {
    paired: true,
    reason: 'ok',
    message: 'COA serial is locked to this listing office and matches current photos/description.',
    floor_slot_code: slot || serial,
    serial_number: serial,
    listing_id: listing.id,
  }
}

export const FLOOR_SLOT_HELP = 'Each listing gets one floor office number (same as the COA serial). The authentic item shown in those photos is the only item that certificate covers — not a lookalike in another slot.'
