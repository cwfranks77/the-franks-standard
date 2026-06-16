import { verifyOpsPhraseRemote } from '~/utils/opsRemoteUnlock'

export const useOpsAccess = () => {
  const config = useRuntimeConfig()
  const logoClicks = ref(0)
  const showModal = ref(false)
  let clickTimeout: ReturnType<typeof setTimeout> | null = null

  const resetClicks = () => {
    logoClicks.value = 0
  }

  const handleLogoClick = () => {
    logoClicks.value++

    if (clickTimeout) clearTimeout(clickTimeout)

    clickTimeout = setTimeout(() => {
      resetClicks()
    }, 5000)

    if (logoClicks.value === 5) {
      showModal.value = true
      resetClicks()
    }
  }

  const verifyPassword = async (password: string): Promise<boolean> => {
    if (!config.public.opsUnlockAvailable) return false

    const isValid = await verifyOpsPhraseRemote(password)

    if (isValid && typeof window !== 'undefined') {
      const { grant } = useOpsSession()
      grant()
      sessionStorage.setItem('ops_access_granted', 'true')
    }

    return isValid
  }

  const hasOpsAccess = (): boolean => {
    if (typeof window === 'undefined') return false
    return sessionStorage.getItem('ops_access_granted') === 'true'
  }

  const clearOpsAccess = () => {
    if (typeof window === 'undefined') return
    sessionStorage.removeItem('ops_access_granted')
  }

  return {
    logoClicks: readonly(logoClicks),
    showModal,
    handleLogoClick,
    resetClicks,
    verifyPassword,
    hasOpsAccess,
    clearOpsAccess,
  }
}
