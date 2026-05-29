/**
 * Detect attempts to move buyers/sellers off-platform (fees, escrow, safety).
 * Used on listings, store copy, and AI support — extend patterns as you see abuse.
 */

const ALLOWED_EMAIL_DOMAINS = ['thefranksstandard.com']

const PHRASE_PATTERNS = [
  { id: 'pay-outside', re: /\b(pay\s*(me\s*)?(on\s+)?(venmo|zelle|cash\s*app|paypal|pay\s*pal|apple\s*pay|google\s*pay|wire|bank\s*transfer|crypto|bitcoin|btc|usdt|ethereum))\b/i, label: 'Off-platform payment' },
  { id: 'avoid-fees', re: /\b(no\s+fees?\s+if|avoid\s+(the\s+)?fees?|skip\s+(the\s+)?fees?|cheaper\s+if\s+you\s+pay\s+me\s+direct|pay\s+direct(ly)?\s+(and\s+)?(save|avoid)|outside\s+(the\s+)?(platform|site|app|marketplace))\b/i, label: 'Fee circumvention' },
  { id: 'contact-outside', re: /\b(text\s+me|dm\s+me|message\s+me\s+on|contact\s+me\s+(at|on)|reach\s+me\s+(at|on)|email\s+me\s+at|call\s+me\s+at|whatsapp|what'?s\s*app|telegram|signal\s+me|instagram|insta\s*@|snap\s*chat|facebook\s+marketplace|fb\s+marketplace)\b/i, label: 'Off-platform contact' },
  { id: 'deal-offsite', re: /\b(deal\s+off\s+(ebay|site|platform)|sell\s+off\s+(ebay|site)|buy\s+direct\s+from\s+me|invoice\s+me\s+outside|complete\s+(this\s+)?(sale|deal)\s+(off|outside))\b/i, label: 'Off-platform deal' },
  { id: 'personal-email', re: /\b(gmail\.com|yahoo\.com|hotmail\.com|outlook\.com|icloud\.com|aol\.com)\b/i, label: 'Personal email in listing' },
]

const URL_PATTERN = /\bhttps?:\/\/[^\s]+|www\.[^\s]+/gi
const BLOCKED_URL_HOSTS = [
  'venmo.com', 'paypal.me', 'paypal.com', 'cash.app', 'zellepay.com', 'wa.me', 't.me',
  'instagram.com', 'facebook.com', 'fb.com',
]

const EMAIL_PATTERN = /[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/gi
const PHONE_PATTERN = /(?:\+?1[-.\s]?)?(?:\(?\d{3}\)?[-.\s]?)?\d{3}[-.\s]?\d{4}\b/g

function normalize (text) {
  return String(text || '').replace(/\s+/g, ' ').trim()
}

function emailAllowed (email) {
  const domain = String(email).split('@')[1]?.toLowerCase()
  return ALLOWED_EMAIL_DOMAINS.some((d) => domain === d || domain?.endsWith(`.${d}`))
}

export function scanOffPlatformContent (text) {
  const raw = String(text || '')
  const violations = []
  const q = raw.toLowerCase()

  if (!q) return { ok: true, violations: [] }

  for (const { id, re, label } of PHRASE_PATTERNS) {
    if (re.test(raw)) violations.push({ id, label, type: 'phrase' })
  }

  const emails = raw.match(EMAIL_PATTERN) || []
  for (const email of emails) {
    if (!emailAllowed(email)) {
      violations.push({ id: 'email', label: `Email address not allowed in public content (${email})`, type: 'email' })
    }
  }

  const phones = raw.match(PHONE_PATTERN) || []
  if (phones.length) {
    violations.push({ id: 'phone', label: 'Phone numbers must not appear in listings — buyers use checkout & Video Call', type: 'phone' })
  }

  const urls = raw.match(URL_PATTERN) || []
  for (const url of urls) {
    const lower = url.toLowerCase()
    if (BLOCKED_URL_HOSTS.some((h) => lower.includes(h))) {
      violations.push({ id: 'url', label: `External link not allowed (${url})`, type: 'url' })
    }
  }

  const seen = new Set()
  const unique = violations.filter((v) => {
    const key = `${v.id}:${v.label}`
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })

  return { ok: unique.length === 0, violations: unique }
}

export function formatOffPlatformBlockMessage (result) {
  if (!result?.violations?.length) return ''
  const lines = result.violations.map((v) => `• ${v.label}`)
  return (
    'This content cannot be published on The Franks Standard. All buyer–seller deals and messages must stay on the platform (escrow checkout, Video Call, or Message seller via info@).\n\n'
    + lines.join('\n')
    + '\n\nRemove off-platform payment or contact info and try again.'
  )
}

/** Store-facing contact must route through the marketplace, not a personal inbox. */
export function validateStoreContactEmail (email) {
  const e = String(email || '').trim().toLowerCase()
  if (!e) return { ok: true }
  if (!emailAllowed(e)) {
    return {
      ok: false,
      message: 'Store contact must use an @thefranksstandard.com address (or leave blank — buyers will reach you through the platform).',
    }
  }
  return { ok: true }
}

export const OFF_PLATFORM_POLICY_SUMMARY =
  'Buyers and sellers may not exchange personal emails, phone numbers, social handles, or off-platform payment links in listings or store pages. Complete sales through escrow checkout on The Franks Standard.'
