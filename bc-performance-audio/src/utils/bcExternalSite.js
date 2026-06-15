/**
 * Optional standalone site for B&C Performance Audio.
 * Checkout on The Franks Standard stays at /bc-audio when externalUrl is set.
 */
export function getBcExternalSiteUrl (runtimeConfig) {
  const raw = String(
    runtimeConfig?.public?.bcAudioExternalUrl
    || runtimeConfig?.bcAudioExternalUrl
    || '',
  ).trim()
  if (!raw) return ''
  try {
    const u = new URL(raw)
    if (u.protocol !== 'https:' && u.protocol !== 'http:') return ''
    return u.toString().replace(/\/$/, '')
  } catch {
    return ''
  }
}
