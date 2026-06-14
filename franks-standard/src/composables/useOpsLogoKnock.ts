import { getBcOpsPanelPath } from '~/utils/bcSupport.js'

/** Five-tap logo knock opens the operator unlock modal (same on Franks home and B&C storefront). */
export function useOpsLogoKnock () {
  const route = useRoute()
  const router = useRouter()
  const isDev = computed(() => import.meta.dev)

  const opModalOpen = ref(false)
  const {
    phrase: opPhrase,
    error: opError,
    submitting: opSubmitting,
    keyConfigured,
    submit: submitOpsPhrase,
  } = useOpsUnlock()

  let opKnockClicks = 0
  let opKnockTimer: ReturnType<typeof setTimeout> | null = null

  function tryOpenOpsFromQuery () {
    if (!import.meta.client || !import.meta.dev) return
    const q = route.query
    if (String(q.ops) === 'unlock') {
      opModalOpen.value = true
      opError.value = ''
      const { ops: _drop, ...rest } = q
      router.replace({ path: route.path, query: rest })
    }
  }

  onMounted(tryOpenOpsFromQuery)
  watch(() => [route.path, route.query], tryOpenOpsFromQuery, { deep: true })

  function onBrandOrLogoClick (e?: Event) {
    e?.preventDefault()
    if (opKnockTimer) clearTimeout(opKnockTimer)
    opKnockClicks += 1
    opKnockTimer = setTimeout(() => { opKnockClicks = 0 }, 2800)
    if (opKnockClicks >= 5) {
      opKnockClicks = 0
      if (opKnockTimer) clearTimeout(opKnockTimer)
      opModalOpen.value = true
      opError.value = ''
    }
  }

  function closeOpModal () {
    opModalOpen.value = false
    opPhrase.value = ''
    opError.value = ''
  }

  async function submitOpModal () {
    const ok = await submitOpsPhrase()
    if (ok) {
      closeOpModal()
      await router.push(getBcOpsPanelPath())
    }
  }

  return {
    isDev,
    opModalOpen,
    opPhrase,
    opError,
    opSubmitting,
    keyConfigured,
    onBrandOrLogoClick,
    closeOpModal,
    submitOpModal,
  }
}
