import supportLedger from '~/src/content/support-contacts.json'

const PLACEHOLDER_RE = /your (personal cell|new google voice) number here/i

export function isPlaceholderPhone (phone) {
  return !phone || PLACEHOLDER_RE.test(String(phone).trim())
}

/** Display `(555) 123-4567` → `+15551234567` for tel: links. */
export function phoneDisplayToTel (display) {
  const raw = String(display || '').trim()
  if (!raw || isPlaceholderPhone(raw)) return ''
  if (raw.startsWith('+')) return raw.replace(/\s/g, '')
  const digits = raw.replace(/\D/g, '')
  if (digits.length === 10) return `+1${digits}`
  if (digits.length === 11 && digits.startsWith('1')) return `+${digits}`
  return digits ? `+${digits}` : ''
}

export function getSupportLedger () {
  return supportLedger
}

/** The Franks Standard LLC — marketplace support row from ledger + env fallbacks. */
export function getFranksSupport (runtimeConfig) {
  const pub = runtimeConfig?.public || {}
  const row = supportLedger.parentCompany || {}
  const envPhone = String(pub.customerServicePhone || '').trim()
  const phoneDisplay = !isPlaceholderPhone(row.phone)
    ? String(row.phone).trim()
    : (envPhone || '(877) 837-0527')
  const phoneTel = phoneDisplayToTel(phoneDisplay) || '+18778370527'
  return {
    name: row.name || 'The Franks Standard LLC',
    lineType: row.lineType || 'General Marketplace Support',
    phoneDisplay,
    phoneTel,
    email: String(row.email || 'info@thefranksstandard.com').trim(),
    hours: String(row.hours || 'Mon-Sat 9AM - 6PM CST').trim(),
  }
}

/** B&C Performance Audio LLC — audio division row from ledger + env fallbacks. */
export function getBcSupportFromLedger (runtimeConfig) {
  const pub = runtimeConfig?.public || {}
  const row = supportLedger.audioDivision || {}
  const envDisplay = String(pub.bcAudioSupportPhone || '').trim()
  const envTel = String(pub.bcAudioSupportTel || '').trim()
  const ledgerDisplay = !isPlaceholderPhone(row.phone) ? String(row.phone).trim() : ''
  const phoneDisplay = envDisplay || ledgerDisplay || '(833) 722-4147'
  const phoneTel = envTel || phoneDisplayToTel(ledgerDisplay) || phoneDisplayToTel(phoneDisplay) || '+18337224147'
  return {
    name: row.name || 'B&C Performance Audio LLC',
    lineType: row.lineType || 'Competition Audio Tech Support',
    phoneDisplay,
    phoneTel,
    email: String(row.email || pub.bcAudioSupportEmail || 'bc-audio@thefranksstandard.com').trim(),
    hours: String(row.hours || 'Mon-Sat 9AM - 6PM CST').trim(),
    ownerName: String(pub.bcAudioOwnerName || 'Charles W. Franks').trim(),
  }
}
