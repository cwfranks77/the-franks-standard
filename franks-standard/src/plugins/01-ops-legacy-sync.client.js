/** Restore owner session from older unlock flags after deploys or storage changes. */
export default defineNuxtPlugin({
  name: 'ops-legacy-sync',
  enforce: 'pre',
  setup () {
    const { grant, isAuthed } = useOpsSession()
    if (isAuthed.value) return
    if (sessionStorage.getItem('ops_access_granted') === 'true') {
      grant()
    }
  },
})
