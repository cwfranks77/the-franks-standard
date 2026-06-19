const BC_SUPPORT_DEFAULTS = Object.freeze({
  phoneDisplay: '(833) 722-4147',
  phoneTel: '+18337224147',
  email: 'bc-audio@thefranksstandard.com',
  ownerName: 'Charles W. Franks',
})

/** Support contacts shown on the B&C storefront (override via runtimeConfig.public). */
export function getBcSupportFromLedger (runtimeConfig) {
  const pub = runtimeConfig?.public || {}
  return {
    phoneDisplay: pub.bcAudioSupportPhone || BC_SUPPORT_DEFAULTS.phoneDisplay,
    phoneTel: pub.bcAudioSupportTel || BC_SUPPORT_DEFAULTS.phoneTel,
    email: pub.bcAudioSupportEmail || BC_SUPPORT_DEFAULTS.email,
    ownerName: pub.bcAudioOwnerName || BC_SUPPORT_DEFAULTS.ownerName,
  }
}
