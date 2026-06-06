const STORAGE_KEY = 'bc-audio-theme-v1'

export const BC_THEME_PRESETS = [
  { id: 'classic-red', label: 'Classic B&C Red', accent: '#d32f2f', accentBright: '#ff5252', bg: '#0a0a0c', bgCard: '#16161c' },
  { id: 'crimson', label: 'Crimson Night', accent: '#c62828', accentBright: '#ef5350', bg: '#080808', bgCard: '#141414' },
  { id: 'ember', label: 'Ember Glow', accent: '#e53935', accentBright: '#ff7043', bg: '#0c0a0a', bgCard: '#1a1515' },
  { id: 'slate-red', label: 'Slate & Red', accent: '#b71c1c', accentBright: '#e57373', bg: '#12141a', bgCard: '#1c1f28' },
] as const

export type BcThemeState = {
  presetId: string
  accent: string
  accentBright: string
  bg: string
  bgCard: string
}

const defaults: BcThemeState = { ...BC_THEME_PRESETS[0], presetId: BC_THEME_PRESETS[0].id }

function readStored (): BcThemeState {
  if (!import.meta.client) return { ...defaults }
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return { ...defaults }
    return { ...defaults, ...JSON.parse(raw) }
  } catch {
    return { ...defaults }
  }
}

export function applyBcThemeToDom (theme: BcThemeState) {
  if (!import.meta.client) return
  const shell = document.querySelector('.bc-audio-shell')
  if (!shell) return
  const el = shell as HTMLElement
  el.style.setProperty('--bc-red', theme.accent)
  el.style.setProperty('--bc-red-bright', theme.accentBright)
  el.style.setProperty('--bc-red-glow', `${theme.accent}73`)
  el.style.setProperty('--bc-bg', theme.bg)
  el.style.setProperty('--bc-bg-card', theme.bgCard)
}

export function useBcTheme () {
  const theme = ref<BcThemeState>(readStored())
  const themeLoaded = ref(false)
  const themeSaving = ref(false)
  const themeMessage = ref('')

  function persistLocal () {
    if (!import.meta.client) return
    localStorage.setItem(STORAGE_KEY, JSON.stringify(theme.value))
    applyBcThemeToDom(theme.value)
  }

  async function loadPublishedTheme () {
    try {
      const data = await $fetch('/api/public/site-content', { query: { keys: 'bcTheme' } })
      const published = data?.bcTheme as Partial<BcThemeState> | undefined
      if (published?.accent) {
        theme.value = { ...defaults, ...published }
        persistLocal()
      }
    } catch { /* use local/default */ }
    finally {
      themeLoaded.value = true
      applyBcThemeToDom(theme.value)
    }
  }

  function applyPreset (presetId: string) {
    const preset = BC_THEME_PRESETS.find((p) => p.id === presetId)
    if (!preset) return
    theme.value = {
      presetId: preset.id,
      accent: preset.accent,
      accentBright: preset.accentBright,
      bg: preset.bg,
      bgCard: preset.bgCard,
    }
    persistLocal()
  }

  function patch (partial: Partial<BcThemeState>) {
    theme.value = { ...theme.value, ...partial, presetId: 'custom' }
    persistLocal()
  }

  function resetTheme () {
    theme.value = { ...defaults }
    persistLocal()
  }

  async function publishTheme () {
    themeSaving.value = true
    themeMessage.value = ''
    try {
      await $fetch('/api/ops/site-content', {
        method: 'PUT',
        body: { contentKey: 'bcTheme', payload: theme.value },
      })
      themeMessage.value = 'Theme published — all visitors will see this look.'
    } catch (e: unknown) {
      const err = e as { data?: { statusMessage?: string } }
      themeMessage.value = err?.data?.statusMessage || 'Could not publish theme. Unlock owner mode again.'
    } finally {
      themeSaving.value = false
    }
  }

  onMounted(() => {
    if (import.meta.client) {
      applyBcThemeToDom(theme.value)
      loadPublishedTheme()
    }
  })

  return {
    theme,
    themeLoaded,
    themeSaving,
    themeMessage,
    applyPreset,
    patch,
    resetTheme,
    publishTheme,
    presets: BC_THEME_PRESETS,
  }
}
