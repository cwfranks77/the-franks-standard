export const useOpsAccess = () => {
  const logoClicks = ref(0)
  const showModal = ref(false)
  let clickTimeout: ReturnType<typeof setTimeout> | null = null

  const resetClicks = () => {
    logoClicks.value = 0
  }

  const handleLogoClick = () => {
    logoClicks.value++

    // Clear existing timeout
    if (clickTimeout) clearTimeout(clickTimeout)

    // Reset after 5 seconds of inactivity
    clickTimeout = setTimeout(() => {
      resetClicks()
    }, 5000)

    // Show modal on 5th click
    if (logoClicks.value === 5) {
      showModal.value = true
      resetClicks()
    }
  }

  const verifyPassword = (password: string): boolean => {
    const config = useRuntimeConfig()
    const correctPassword = config.public.opsAccessKey
    const isValid = password === correctPassword && correctPassword !== ''
    
    if (isValid) {
      sessionStorage.setItem('ops_access_granted', 'true')
    }
    
    return isValid
  }

  const hasOpsAccess = (): boolean => {
    if (process.server) return false
    return sessionStorage.getItem('ops_access_granted') === 'true'
  }

  const clearOpsAccess = () => {
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
