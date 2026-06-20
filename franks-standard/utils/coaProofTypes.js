/**
 * COA proof types for new collectible listings.
 * Seller Written Guarantee lives ON the Franks COA (one serial per listing) — not a standalone signature-only form.
 */

export const COA_PROOF_TYPES = Object.freeze(['upload', 'franks_issued'])

/** Legacy DB values still allowed on existing rows. */
export const COA_TYPE_DB_VALUES = Object.freeze(['upload', 'guarantee', 'franks_issued', 'none'])

export function isAllowedCoaProofType (type) {
  const t = String(type || '').toLowerCase()
  return COA_PROOF_TYPES.includes(t)
}
