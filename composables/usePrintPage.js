/**
 * Auto-open browser print dialog when ?print=1 (owner print pack / policies).
 */
export function usePrintPage () {
  const route = useRoute()

  const isPrintMode = computed(() => String(route.query.print || '') === '1')

  function triggerPrint () {
    if (!import.meta.client) return
    nextTick(() => {
      setTimeout(() => window.print(), 400)
    })
  }

  onMounted(() => {
    if (isPrintMode.value) triggerPrint()
  })

  return { isPrintMode, triggerPrint }
}
