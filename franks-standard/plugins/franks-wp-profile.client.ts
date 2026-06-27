/** Apply WordPress deployment profile SEO on Franks marketplace routes only. */
export default defineNuxtPlugin(async () => {
  if (!import.meta.client) return
  const route = useRoute()
  if (route.path.startsWith('/bc-audio')) return

  const { load, seoTitle, seoDescription } = useFranksSiteProfile()
  await load()

  useHead({
    title: seoTitle,
    meta: [{ name: 'description', content: seoDescription }],
  })
})
