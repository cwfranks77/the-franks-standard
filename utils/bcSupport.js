import { isBcPowerAudioPrimarySite } from '~/utils/bcPrimarySite.js'

/** B&C Performance Audio — dedicated support line (Option 3 on the central hub). */
export const BC_SUPPORT_DEFAULTS = Object.freeze({
  phoneDisplay: '(877) 837-0527 · Option 3',
  phoneTel: '+18778370527,3',
  email: 'bc-audio@thefranksstandard.com',
  ownerName: 'Charles W. Franks',
})

export function getBcSupport (runtimeConfig) {
  const pub = runtimeConfig?.public || {}
  const phoneDisplay = String(pub.bcAudioSupportPhone || BC_SUPPORT_DEFAULTS.phoneDisplay).trim()
  const phoneTel = String(pub.bcAudioSupportTel || BC_SUPPORT_DEFAULTS.phoneTel).trim()
  const email = String(pub.bcAudioSupportEmail || BC_SUPPORT_DEFAULTS.email).trim()
  const ownerName = String(pub.bcAudioOwnerName || BC_SUPPORT_DEFAULTS.ownerName).trim()
  return { phoneDisplay, phoneTel, email, ownerName }
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
