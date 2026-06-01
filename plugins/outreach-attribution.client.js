export default defineNuxtPlugin(() => {
  const route = useRoute()
  const { captureFromRoute } = useOutreachAttribution()

  captureFromRoute(route)

  watch(
    () => route.fullPath,
    () => captureFromRoute(route),
  )
})
