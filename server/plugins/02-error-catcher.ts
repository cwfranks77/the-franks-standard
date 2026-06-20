import { backendRequire as require } from '#cjs-require'
const {
  attachCrashGuards,
  writeErrorLog,
  shouldLogNitroError,
} = require('#backend/error/error_catcher.js')

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
