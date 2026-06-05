/** True when this build is the dedicated www.bcpoweraudio.com storefront (not the Franks marketplace). */
export function isBcPowerAudioPrimarySite (siteUrl) {
  const raw = String(siteUrl || '').trim().toLowerCase()
  if (!raw) return false
  try {
    const host = new URL(raw.startsWith('http') ? raw : `https://${raw}`).hostname
    return host === 'bcpoweraudio.com' || host === 'www.bcpoweraudio.com'
  } catch {
    return /bcpoweraudio\.com/i.test(raw)
  }
}

export const BC_POWER_AUDIO_HOSTS = new Set(['bcpoweraudio.com', 'www.bcpoweraudio.com'])
