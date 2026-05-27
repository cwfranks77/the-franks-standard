/** Founding seller promo — first 10 sellers, 3 months Pro free. */
export const FOUNDING_PROMO_CODE = 'FOUNDERS10'
export const FOUNDING_PROMO_SLUG = 'founders10'
export const FOUNDING_PROMO_MAX = 10
export const FOUNDING_PROMO_MONTHS = 3

export function foundingPromoRegisterPath (): string {
  return /auth/register?promo=&account=sell
}

export function foundingPromoJoinPath (): string {
  return /join/
}
