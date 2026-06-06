import { isBcPowerAudioPrimarySite } from '~/utils/bcPrimarySite.js'

/**
 * B&C Performance Audio LLC — dedicated support line (separate from Franks Standard).
 * Set NUXT_PUBLIC_BC_AUDIO_SUPPORT_PHONE and NUXT_PUBLIC_BC_AUDIO_SUPPORT_TEL in GitHub Actions.
 * See docs/BC-PHONE-SETUP.md for Twilio purchase + Studio flow.
 */
export const BC_SUPPORT_DEFAULTS = Object.freeze({
  phoneDisplay: '(833) 322-8439',
  phoneTel: '+18333228439',
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
