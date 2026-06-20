export type ViolationSource =
  | 'message'
  | 'listing'
  | 'review'
  | 'dispute'
  | 'upload'
  | 'contact'
  | 'registration'
  | 'other'

export type ViolationSeverity = 'minor' | 'major' | 'severe'

export type ViolationMatch = {
  id: string
  label: string
  category: string
  severity: ViolationSeverity
  weight: number
}

export type ScanResult = {
  ok: boolean
  matches: ViolationMatch[]
  maxSeverity: ViolationSeverity | null
  score: number
  excerpt: string
}

const OFF_PLATFORM = [
  { id: 'pay-outside', re: /\b(pay\s*(me\s*)?(on\s+)?(venmo|zelle|cash\s*app|paypal|wire|crypto|bitcoin))\b/i, label: 'Off-platform payment', category: 'fraud', severity: 'major' as const, weight: 40 },
  { id: 'contact-outside', re: /\b(text\s+me|dm\s+me|whatsapp|telegram|signal\s+me|email\s+me\s+at|call\s+me\s+at)\b/i, label: 'Off-platform contact', category: 'restricted_info', severity: 'minor' as const, weight: 25 },
  { id: 'personal-email', re: /\b[a-z0-9._%+-]+@(gmail|yahoo|hotmail|outlook|icloud|aol)\.com\b/i, label: 'Personal email in content', category: 'restricted_info', severity: 'minor' as const, weight: 30 },
  { id: 'phone-number', re: /(?:\+?1[-.\s]?)?(?:\(?\d{3}\)?[-.\s]?)?\d{3}[-.\s]?\d{4}\b/, label: 'Phone number in content', category: 'restricted_info', severity: 'minor' as const, weight: 28 },
]

const THREATS = [
  { id: 'threat-violence', re: /\b(i will (kill|hurt|harm)|you('re| are) dead|burn your|destroy your)\b/i, label: 'Threat of violence', category: 'threats', severity: 'severe' as const, weight: 80 },
  { id: 'threat-legal', re: /\b(i will sue you|lawyer up|you will regret)\b/i, label: 'Threatening language', category: 'threats', severity: 'major' as const, weight: 45 },
]

const HARASSMENT = [
  { id: 'harassment', re: /\b(stupid|idiot|moron|scammer|fraud|piece of)\b/i, label: 'Harassment / insults', category: 'harassment', severity: 'minor' as const, weight: 20 },
]

const HATE = [
  { id: 'hate-slur', re: /\b(racial slur|hate speech)\b/i, label: 'Hate speech indicator', category: 'hate_speech', severity: 'major' as const, weight: 70 },
]

const ILLEGAL = [
  { id: 'illegal-drugs', re: /\b(cocaine|heroin|meth|fentanyl|illegal drugs|schedule i)\b/i, label: 'Illegal substances', category: 'illegal_items', severity: 'severe' as const, weight: 90 },
  { id: 'illegal-weapons', re: /\b(unregistered firearm|ghost gun|switchblade|illegal weapon)\b/i, label: 'Illegal weapons', category: 'illegal_items', severity: 'severe' as const, weight: 85 },
  { id: 'stolen-goods', re: /\b(stolen goods|hot merchandise|fell off a truck)\b/i, label: 'Stolen goods language', category: 'illegal_items', severity: 'severe' as const, weight: 75 },
]

const COUNTERFEIT = [
  { id: 'replica', re: /\b(replica|reproduction|counterfeit|fake|bootleg|super\s*clone|ua\b|unauthorized\s*authentic)\b/i, label: 'Counterfeit / replica language', category: 'counterfeit', severity: 'major' as const, weight: 55 },
  { id: 'not-genuine', re: /\b(not\s+genuine|not\s+authentic|no\s+guarantee\s+of\s+auth)/i, label: 'Authenticity disclaimer', category: 'counterfeit', severity: 'major' as const, weight: 50 },
]

const FRAUD = [
  { id: 'wire-fraud', re: /\b(western union|moneygram|gift card payment|itunes card)\b/i, label: 'Wire / gift card fraud pattern', category: 'fraud', severity: 'severe' as const, weight: 85 },
  { id: 'refund-scam', re: /\b(refund to different account|overpayment|send back difference)\b/i, label: 'Refund scam pattern', category: 'fraud', severity: 'severe' as const, weight: 80 },
]

const ALL_RULES = [
  ...OFF_PLATFORM,
  ...THREATS,
  ...HARASSMENT,
  ...HATE,
  ...ILLEGAL,
  ...COUNTERFEIT,
  ...FRAUD,
]

const SEVERITY_RANK: Record<ViolationSeverity, number> = { minor: 1, major: 2, severe: 3 }

export function scanContent (
  text: string,
  source: ViolationSource = 'other',
): ScanResult {
  const raw = String(text || '')
  const excerpt = raw.slice(0, 500)
  if (!raw.trim()) return { ok: true, matches: [], maxSeverity: null, score: 0, excerpt }

  const matches: ViolationMatch[] = []
  let score = 0

  for (const rule of ALL_RULES) {
    if (rule.re.test(raw)) {
      matches.push({
        id: rule.id,
        label: rule.label,
        category: rule.category,
        severity: rule.severity,
        weight: rule.weight,
      })
      score += rule.weight
    }
  }

  // Listing-only extra rules
  if (source === 'listing') {
    if (/\b(no\s+coa|without\s+certificate)\b/i.test(raw)) {
      matches.push({
        id: 'no-coa-language',
        label: 'Sold without COA language',
        category: 'counterfeit',
        severity: 'major',
        weight: 35,
      })
      score += 35
    }
  }

  const seen = new Set<string>()
  const unique = matches.filter((m) => {
    const k = `${m.id}:${m.label}`
    if (seen.has(k)) return false
    seen.add(k)
    return true
  })

  let maxSeverity: ViolationSeverity | null = null
  for (const m of unique) {
    if (!maxSeverity || SEVERITY_RANK[m.severity] > SEVERITY_RANK[maxSeverity]) {
      maxSeverity = m.severity
    }
  }

  return {
    ok: unique.length === 0,
    matches: unique,
    maxSeverity,
    score,
    excerpt,
  }
}

export function actionForSeverity (severity: ViolationSeverity | null): 'logged' | 'messaging_frozen' | 'account_frozen' | 'fraud_case_opened' {
  if (!severity) return 'logged'
  if (severity === 'minor') return 'messaging_frozen'
  if (severity === 'major') return 'account_frozen'
  return 'fraud_case_opened'
}
