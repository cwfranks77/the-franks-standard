import { FOUNDING_PROMO_CODE } from '~/utils/foundingPromo.js'
import { HONOR_PROMO_CODE, savePendingHonorCategory } from '~/utils/honorPromo.js'

export default defineNuxtPlugin(() => {
  const route = useRoute()
  const { savePendingPromo } = usePromoCode()
  const promo = String(route.query.promo || '').trim().toUpperCase()
  if (promo) savePendingPromo(promo)
  if (route.path.startsWith('/join/') && !promo) savePendingPromo(FOUNDING_PROMO_CODE)
  if (route.path === '/honor' && !promo) savePendingPromo(HONOR_PROMO_CODE)
  const honorCat = String(route.query.honor || '').trim().toLowerCase()
  if (honorCat) savePendingHonorCategory(honorCat)
})