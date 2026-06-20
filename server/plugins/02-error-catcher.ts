import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)
const {
  attachCrashGuards,
  writeErrorLog,
  shouldLogNitroError,
} = require('../../backend/error/error_catcher.js')

export default defineNitroPlugin((nitroApp) => {
  attachCrashGuards()

  nitroApp.hooks.hook('error', (error, { event }) => {
    if (!shouldLogNitroError(error)) return

    writeErrorLog(error, {
      path: event?.path ?? null,
      method: event?.method ?? null,
      source: 'nitro_error',
    })
  })
})
