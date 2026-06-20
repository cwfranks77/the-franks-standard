/**
 * Registers Franks Standard route middleware from franks-standard/src/middleware when present.
 */
export default defineNuxtPlugin(() => {
  // Middleware files are merged into /middleware at build time via merge-project-middleware.cjs.
  // Add named registrations here when franks-specific route guards are added under src/middleware.
})
