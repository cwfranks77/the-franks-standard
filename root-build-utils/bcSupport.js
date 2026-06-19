import { isBcPowerAudioPrimarySite } from '~/utils/bcPrimarySite.js'
import { getBcSupportFromLedger } from '~/utils/supportContacts.js'

/** @deprecated use getBcSupportFromLedger — kept for imports site-wide */
export const BC_SUPPORT_DEFAULTS = Object.freeze({
  phoneDisplay: '(833) 722-4147',
  phoneTel: '+18337224147',
  email: 'bc-audio@thefranksstandard.com',
  ownerName: 'Charles W. Franks',
})

export function getBcSupport (runtimeConfig) {
  return getBcSupportFromLedger(runtimeConfig)
}

/** True when visitor is on the dedicated B&C website (not Franks marketplace /bc-audio). */
export function isOnBcWebsite () {
  if (!import.meta.client) return false
  const config = useRuntimeConfig()
  const host = window.location.hostname.toLowerCase()
  if (host === 'bcpoweraudio.com' || host === 'www.bcpoweraudio.com') return true
  return isBcPowerAudioPrimarySite(config.public.siteUrl)
}

export function getBcOpsPanelPath () {
  return isOnBcWebsite() ? '/bc-audio/ops/panel' : '/ops/panel'
}

export function getBcOpsUnlockPath () {
  return isOnBcWebsite() ? '/bc-audio/ops' : '/ops'
}

/** Cart page — short /cart on www.bcpoweraudio.com, /bc-audio/cart on the Franks marketplace. */
export function getBcCartPath (runtimeConfig) {
  if (import.meta.client) {
    const host = window.location.hostname.toLowerCase()
    if (host === 'bcpoweraudio.com' || host === 'www.bcpoweraudio.com') return '/cart'
  }
  const config = runtimeConfig || (typeof useRuntimeConfig === 'function' ? useRuntimeConfig() : null)
  if (config && isBcPowerAudioPrimarySite(config.public?.siteUrl)) return '/cart'
  return '/bc-audio/cart'
}
