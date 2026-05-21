/** Stripe Tax — optional; off by default when Stripe products are non-taxable. */

export const TAX_CODE_TANGIBLE = 'txcd_99999999'
export const TAX_CODE_SERVICES = 'txcd_20030000'

export function stripeTaxEnabled (): boolean {
  const raw = (Deno.env.get('STRIPE_TAX_ENABLED') ?? 'false').trim().toLowerCase()
  return raw === 'true' || raw === '1' || raw === 'on'
}

export function shippingCountriesForTax (): string[] {
  const raw = Deno.env.get('STRIPE_TAX_SHIPPING_COUNTRIES') ?? 'US'
  const list = raw.split(',').map((s) => s.trim().toUpperCase()).filter(Boolean)
  return list.length ? list : ['US']
}

export function marketplaceListingTaxOptions () {
  if (!stripeTaxEnabled()) return {}
  return {
    automatic_tax: { enabled: true },
    shipping_address_collection: {
      allowed_countries: shippingCountriesForTax(),
    },
  }
}

export function platformServiceTaxOptions () {
  if (!stripeTaxEnabled()) return {}
  return {
    automatic_tax: { enabled: true },
    billing_address_collection: 'required' as const,
  }
}