/** Five taps on the pavilion logo opens owner unlock (hidden from public nav). */
export function useLogoOwnerKnock () {
  const router = useRouter()
  const modalOpen = useState('owner-knock-modal', () => false)
  const knockCount = useState('owner-logo-knock-count', () => 0)
  const phrase = useState('owner-knock-phrase', () => '')
  const submitting = ref(false)
  const { tryUnlock, error, keyConfigured } = useOwnerAccess()

  let knockTimer: ReturnType<typeof setTimeout> | null = null

  function resetKnockWindow () {
    if (knockTimer) clearTimeout(knockTimer)
    knockTimer = setTimeout(() => {
      knockCount.value = 0
      knockTimer = null
    }, 2800)
  }

  function onLogoKnock (event?: Event) {
    event?.preventDefault()
    event?.stopPropagation()

    resetKnockWindow()
    knockCount.value += 1

    if (knockCount.value >= 5) {
      knockCount.value = 0
      if (knockTimer) {
        clearTimeout(knockTimer)
        knockTimer = null
      }
      phrase.value = ''
      error.value = ''
      // Defer modal so the same tap cannot hit the overlay and instantly close it.
      nextTick(() => {
        modalOpen.value = true
      })
    }
  }

  function closeModal () {
    modalOpen.value = false
    phrase.value = ''
    error.value = ''
  }

  if (import.meta.client) {
    const router = useRouter()
    router.afterEach((to) => {
      if (to.path.startsWith('/owner')) modalOpen.value = false
    })
  }

  async function submitModal () {
    submitting.value = true
    const ok = await tryUnlock(phrase.value)
    submitting.value = false
    if (ok) {
      closeModal()
      await router.push('/owner')
    }
  }

  return {
    modalOpen,
    phrase,
    submitting,
    keyConfigured,
    error,
    knockCount,
    onLogoKnock,
    closeModal,
    submitModal,
  }
}
