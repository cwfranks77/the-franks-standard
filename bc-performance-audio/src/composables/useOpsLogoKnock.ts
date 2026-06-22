import { useOpsSession } from '~/composables/useOpsSession'
import { getBcOpsPanelPath } from '~/utils/bcSupport.js'

const KNOCK_COUNT = 5
const KNOCK_WINDOW_MS = 2500

export function useOpsLogoKnock () {
  const config = useRuntimeConfig()
  const { unlock } = useOpsSession()

  const isDev = computed(() => import.meta.dev)
  const keyConfigured = computed(() =>
    Boolean(String(config.public.opsAccessKeyHash || '').trim())
    || Boolean(config.public.opsUnlockAvailable),
  )

  const opModalOpen = ref(false)
  const opPhrase = ref('')
  const opError = ref('')
  const opSubmitting = ref(false)

  let knockTimes: number[] = []

  function onBrandOrLogoClick (e?: Event) {
    if (e?.defaultPrevented) return
    const now = Date.now()
    knockTimes = knockTimes.filter((t) => now - t < KNOCK_WINDOW_MS)
    knockTimes.push(now)
    if (knockTimes.length >= KNOCK_COUNT) {
      knockTimes = []
      opModalOpen.value = true
      opPhrase.value = ''
      opError.value = ''
    }
  }

  function closeOpModal () {
    opModalOpen.value = false
    opPhrase.value = ''
    opError.value = ''
  }

  async function submitOpModal () {
    opSubmitting.value = true
    opError.value = ''
    const ok = await unlock(opPhrase.value)
    opSubmitting.value = false
    if (!ok) {
      opError.value = 'Wrong phrase — try again.'
      return
    }
    closeOpModal()
    await navigateTo(getBcOpsPanelPath())
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
