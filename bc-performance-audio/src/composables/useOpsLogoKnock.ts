import { useOpsSession } from '~/composables/useOpsSession'
import { getBcOpsPanelPath, getBcStorefrontPath } from '~/utils/bcSupport.js'

const KNOCK_COUNT = 5
const KNOCK_WINDOW_MS = 2800
const KNOCK_STORAGE_KEY = 'bc_ops_logo_taps_v1'

function readKnockTimes (): number[] {
  if (!import.meta.client) return []
  try {
    return JSON.parse(sessionStorage.getItem(KNOCK_STORAGE_KEY) || '[]')
  } catch {
    return []
  }
}

function writeKnockTimes (times: number[]) {
  if (!import.meta.client) return
  try {
    sessionStorage.setItem(KNOCK_STORAGE_KEY, JSON.stringify(times))
  } catch { /* ignore */ }
}

function clearKnockTimes () {
  if (!import.meta.client) return
  try {
    sessionStorage.removeItem(KNOCK_STORAGE_KEY)
  } catch { /* ignore */ }
}

export function useOpsLogoKnock () {
  const config = useRuntimeConfig()
  const router = useRouter()
  const { unlock } = useOpsSession()

  const isDev = computed(() => import.meta.dev)
  const keyConfigured = computed(() =>
    Boolean(String(config.public.opsAccessKeyHash || '').trim())
    || Boolean(config.public.opsUnlockAvailable),
  )

  // useState survives layout remounts (NuxtLink home nav used to wipe a plain ref modal).
  const opModalOpen = useState('bc-ops-knock-modal', () => false)
  const opPhrase = ref('')
  const opError = ref('')
  const opSubmitting = ref(false)

  function onBrandOrLogoClick (e?: Event) {
    // Stop the logo NuxtLink from navigating on the 5th tap (and remounting away the popup).
    e?.preventDefault?.()
    try {
      e?.stopPropagation?.()
    } catch { /* ignore */ }

    const now = Date.now()
    const knockTimes = readKnockTimes().filter((t) => now - t < KNOCK_WINDOW_MS)
    knockTimes.push(now)
    writeKnockTimes(knockTimes)

    if (knockTimes.length >= KNOCK_COUNT) {
      clearKnockTimes()
      opPhrase.value = ''
      opError.value = ''
      // Defer open so the same tap cannot hit the modal backdrop and instantly close it.
      nextTick(() => {
        opModalOpen.value = true
      })
      return
    }

    // Taps 1–4: logo still acts as Home (count keeps rising for the secret unlock).
    const home = getBcStorefrontPath()
    if (router.currentRoute.value.path !== home) {
      void router.push(home)
    }
  }

  function closeOpModal () {
    opModalOpen.value = false
    opPhrase.value = ''
    opError.value = ''
  }

  if (import.meta.client) {
    router.afterEach((to) => {
      if (to.path.startsWith('/bc-audio/ops')) opModalOpen.value = false
    })
  }

  async function submitOpModal () {
    opSubmitting.value = true
    opError.value = ''
    try {
      const ok = await unlock(opPhrase.value)
      if (!ok) {
        opError.value = 'Wrong phrase — try again.'
        return
      }
      closeOpModal()
      await navigateTo(getBcOpsPanelPath())
    } finally {
      opSubmitting.value = false
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
