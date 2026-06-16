/** Public-safe profile fields — never expose email, phone, or personal contact. */

export type PublicProfile = {
  id: string
  displayName: string
  storeName: string | null
  accountType: string | null
}

const HIDDEN_KEYS = new Set([
  'email',
  'phone',
  'phone_number',
  'mobile',
  'contact_email',
  'personal_email',
  'buyer_email',
  'shipping_name',
  'shipping_line1',
  'shipping_line2',
  'provider_account_email',
  'store_contact_email',
  'dropship_supplier_email',
])

export function publicDisplayName (profile: Record<string, unknown> | null | undefined): string {
  if (!profile) return 'Seller'
  const name =
    String(profile.public_display_name || profile.store_name || profile.full_name || '').trim()
  if (!name) return 'Seller'
  return name.split('@')[0] || 'Seller'
}

export function toPublicProfile (profile: Record<string, unknown> | null | undefined): PublicProfile | null {
  if (!profile?.id) return null
  return {
    id: String(profile.id),
    displayName: publicDisplayName(profile),
    storeName: profile.store_name ? String(profile.store_name) : null,
    accountType: profile.account_type ? String(profile.account_type) : null,
  }
}

export function stripPrivateFields<T extends Record<string, unknown>> (row: T): Partial<T> {
  const out: Record<string, unknown> = {}
  for (const [k, v] of Object.entries(row)) {
    if (HIDDEN_KEYS.has(k.toLowerCase())) continue
    if (typeof v === 'string' && v.includes('@') && !v.endsWith('@thefranksstandard.com')) {
      continue
    }
    out[k] = v
  }
  return out as Partial<T>
}

export const PROFILE_PRIVACY_NOTICE =
  'Buyer and seller emails, phone numbers, and personal contact info are never shown on public profiles. All deals and messages stay on The Franks Standard.'
