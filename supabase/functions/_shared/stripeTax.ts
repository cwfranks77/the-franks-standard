/** Stripe Tax at checkout — always from buyer billing address. */

export const TAX_CODE_TANGIBLE = 'txcd_99999999'
export const TAX_CODE_SERVICES = 'txcd_20030000'

export function stripeTaxEnabled (): boolean {
  const raw = (Deno.env.get('STRIPE_TAX_ENABLED') ?? 'true').trim().toLowerCase()
  return raw !== 'false' && raw !== '0' && raw !== 'off'
}

export function billingCountriesForTax (): string[] {
  const raw = Deno.env.get('STRIPE_TAX_BILLING_COUNTRIES')
    ?? Deno.env.get('STRIPE_TAX_SHIPPING_COUNTRIES')
    ?? 'US'
  const list = raw.split(',').map((s) => s.trim().toUpperCase()).filter(Boolean)
  return list.length ? list : ['US']
}

function checkoutTaxOptions () {
  if (!stripeTaxEnabled()) return {}
  return {
    automatic_tax: {
      enabled: true,
      liability: { type: 'self' },
    },
    billing_address_collection: 'required' as const,
  }
}

/** Listing purchases and platform fees — tax from billing address. */
export function marketplaceListingTaxOptions () {
  return checkoutTaxOptions()
}

export function platformServiceTaxOptions () {
  return checkoutTaxOptions()
}