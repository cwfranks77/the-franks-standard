/** Message sanitization for edge functions — mirrors backend/security/message_sanitize.js */

const STRIP_RULES = [
  { id: 'email', re: /\b[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}\b/gi, label: 'email' },
  { id: 'phone', re: /(?:\+?1[-.\s]?)?(?:\(?\d{3}\)?[-.\s]?)?\d{3}[-.\s]?\d{4}\b/g, label: 'phone_number' },
  { id: 'url', re: /https?:\/\/[^\s]+|www\.[^\s]+/gi, label: 'external_link' },
  { id: 'social', re: /@([a-z0-9_]{2,30})\b|(?:instagram|facebook|tiktok|telegram|whatsapp|snapchat)\s*[:@]?\s*[a-z0-9._-]+/gi, label: 'social_handle' },
  { id: 'payment', re: /\b(venmo|zelle|cash\s*app|paypal\.me|wire\s+transfer|bitcoin|crypto\s+wallet|card\s+number|cvv)\b/gi, label: 'payment_info' },
  { id: 'off_platform', re: /\b(text\s+me|dm\s+me|email\s+me|call\s+me|contact\s+me\s+outside|off\s+platform)\b/gi, label: 'off_platform_contact' },
]

export function sanitizeMessage (text: string) {
  let sanitized = String(text || '')
  const stripped: { type: string; label: string; count: number }[] = []

  for (const rule of STRIP_RULES) {
    const matches = sanitized.match(rule.re)
    if (matches?.length) {
      stripped.push({ type: rule.id, label: rule.label, count: matches.length })
      sanitized = sanitized.replace(rule.re, `[${rule.label.toUpperCase()}_REMOVED]`)
    }
  }

  sanitized = sanitized.replace(/\s{2,}/g, ' ').trim()
  return { sanitized, stripped, modified: stripped.length > 0 }
}

export async function sanitizeAndLog (
  admin: import('npm:@supabase/supabase-js@2').SupabaseClient,
  params: {
    userId: string
    content: string
    sourceType?: string
    sourceId?: string | null
    ipAddress?: string | null
    deviceFingerprint?: string | null
  },
) {
  const result = sanitizeMessage(params.content)
  if (result.modified) {
    await admin.from('violation_events').insert({
      user_id: params.userId,
      source_type: params.sourceType ?? 'message',
      source_id: params.sourceId,
      violation_type: 'message_sanitization',
      severity: 'minor',
      action_taken: 'logged',
      content_excerpt: String(params.content).slice(0, 500),
      evidence: { stripped: result.stripped, sanitized_preview: result.sanitized.slice(0, 500) },
      matches: result.stripped.map((s) => ({ label: s.label, category: 'restricted_info' })),
      ip_address: params.ipAddress,
      device_fingerprint: params.deviceFingerprint,
      metadata: { auto_sanitized: true },
    })
  }
  return result
}
