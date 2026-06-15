import franksMiddlewareOpsAuth from '../middleware/ops-auth'
import franksMiddlewareOwnerOnly from '../middleware/owner-only'
import franksMiddlewareRequiresAuth from '../middleware/requires-auth'
import franksMiddlewareSellAuth from '../middleware/sell-auth'
import franksMiddlewareSellEntry from '../middleware/sell-entry'

export default defineNuxtPlugin(() => {
  addRouteMiddleware('ops-auth', franksMiddlewareOpsAuth)
  addRouteMiddleware('owner-only', franksMiddlewareOwnerOnly)
  addRouteMiddleware('requires-auth', franksMiddlewareRequiresAuth)
  addRouteMiddleware('sell-auth', franksMiddlewareSellAuth)
  addRouteMiddleware('sell-entry', franksMiddlewareSellEntry)
})
