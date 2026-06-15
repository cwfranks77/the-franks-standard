/**
 * ?print=1 on any page — hide site chrome and open print dialog (owner policy printing).
 */
export default defineNuxtPlugin(() => {
  const route = useRoute()

  function applyPrintMode () {
    if (!import.meta.client) return
    const on = String(route.query.print || '') === '1'
    document.documentElement.classList.toggle('policy-print-mode', on)
    if (on) {
      nextTick(() => {
        setTimeout(() => window.print(), 500)
      })
    }
  }

  watch(() => route.fullPath, applyPrintMode, { immediate: true })
})
