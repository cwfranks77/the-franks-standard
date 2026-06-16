/** Five taps on the pavilion logo opens owner unlock (hidden from public nav). */
export function useLogoOwnerKnock () {
  const router = useRouter()
  const modalOpen = useState('owner-knock-modal', () => false)
  const phrase = ref('')
  const submitting = ref(false)
  const { tryUnlock, error, keyConfigured } = useOwnerAccess()

  let clicks = 0
  let timer: ReturnType<typeof setTimeout> | null = null

  function onLogoKnock (event?: Event) {
    event?.stopPropagation()
    if (timer) clearTimeout(timer)
    clicks += 1
    timer = setTimeout(() => { clicks = 0 }, 2800)
    if (clicks >= 5) {
      clicks = 0
      if (timer) clearTimeout(timer)
      phrase.value = ''
      modalOpen.value = true
    }
  }

  function closeModal () {
    modalOpen.value = false
    phrase.value = ''
    error.value = ''
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
    onLogoKnock,
    closeModal,
    submitModal,
  }
}
