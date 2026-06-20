import { backendRequire as require } from '#cjs-require'
const { applyResponseOptimization } = require('#backend/performance/response_optimizer.js')

export default defineNitroPlugin((nitroApp) => {
  nitroApp.hooks.hook('beforeResponse', (event, { body }) => {
    if (!event.path?.startsWith('/api/')) return body
    try {
      return applyResponseOptimization(event, body)
    } catch {
      return body
    }
  })
})
