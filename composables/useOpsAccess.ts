export const useOpsAccess = () => {
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

  // Normalize user input from mobile keyboards:
  // - trim
  // - lowercase
  // - convert unicode dashes to ASCII hyphen
  // - remove zero-width chars
  // - treat spaces as separators (equivalent to hyphens)
  function normalizeOpsPhrase (input: string): string {
    return String(input || '')
      .trim()
      .toLowerCase()
      .replace(/[\u200B-\u200D\uFEFF]/g, '')
      .replace(/[\u2010-\u2015\u2212\uFE58\uFE63\uFF0D]/g, '-')
      .replace(/\s*-\s*/g, '-')
      .replace(/\s+/g, '-')
  }

  // Hash the normalized phrase in the browser and compare against the stored hash.
  // The plaintext is never shipped to the client; only the SHA-256 hash is.
  async function sha256Hex (input: string): Promise<string> {
    const bytes = new TextEncoder().encode(input)
    const digest = await crypto.subtle.digest('SHA-256', bytes)
    return Array.from(new Uint8Array(digest))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('')
  }

  const verifyPassword = async (password: string): Promise<boolean> => {
    const config = useRuntimeConfig()
    const expectedHash = String((config.public as any).opsAccessKeyHash || '').toLowerCase()
    if (!expectedHash) return false

    const typedHash = await sha256Hex(normalizeOpsPhrase(password))
    const isValid = typedHash === expectedHash

    if (isValid && typeof window !== 'undefined') {
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
