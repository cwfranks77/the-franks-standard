import {
  isActiveListingFlow,
  LIST_ITEM_START_PATH,
  SELL_FORM_PATH,
} from '~/utils/listItemRoutes.js'

/** Bare /sell (no kind/mode) → chooser at /sell/start before hub or policy gate. */
export default defineNuxtRouteMiddleware((to) => {
  const path = to.path.replace(/\/$/, '') || '/'
  if (path !== SELL_FORM_PATH) return
  if (isActiveListingFlow(to.query)) return
  // Trailing slash matches GitHub Pages canonical URLs so nested /sell/start child renders.
  return navigateTo(`${LIST_ITEM_START_PATH}/`)
})
