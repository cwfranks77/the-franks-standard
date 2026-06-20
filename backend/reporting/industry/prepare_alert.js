/**
 * Industry fraud alert packager — behavior evidence only, all PII stripped.
 * NEVER sends automatically. Owner must approve before external distribution.
 *
 * @param {import('@supabase/supabase-js').SupabaseClient} admin
 * @param {string} fraudCaseId
 */

const PII_KEYS = new Set([
  'email', 'buyer_email', 'reporter_email', 'seller_email', 'phone', 'name',
  'buyer_name', 'seller_name', 'user_display_name', 'public_display_name',
  'ip_address', 'last_known_ip', 'device_fingerprint', 'browser_fingerprint',
  'last_device_fingerprint', 'contact_phone', 'contact_email', 'auth_email',
  'shipping_address', 'billing_address', 'address', 'street', 'zip', 'postal_code',
  'payment_method', 'card_last4', 'stripe_customer_id', 'stripe_account_id',
])

const PII_PATTERNS = [
  { re: /@/, test: (s) => /\.[a-z]{2,}$/i.test(s) },
  { re: /\d{3}[-.\s]?\d{3}[-.\s]?\d{4}/ },
  { re: /\b\d{1,5}\s+\w+\s+(st|street|ave|avenue|rd|road|blvd|drive|dr|ln|lane)\b/i },
]

function looksLikePiiString (value) {
  if (typeof value !== 'string') return false
  for (const p of PII_PATTERNS) {
    if (p.re.test(value) && (!p.test || p.test(value))) return true
  }
  return false
}

function redactValue (key, value) {
  if (PII_KEYS.has(String(key).toLowerCase())) return '[REDACTED]'
  if (looksLikePiiString(value)) return '[REDACTED_PII]'
  return value
}

function redactObject (obj, depth = 0) {
  if (depth > 10) return '[TRUNCATED]'
  if (Array.isArray(obj)) return obj.map((v) => redactObject(v, depth + 1))
  if (!obj || typeof obj !== 'object') {
    if (typeof obj === 'string' && looksLikePiiString(obj)) return '[REDACTED_PII]'
    return obj
  }

  const out = {}
  for (const [k, v] of Object.entries(obj)) {
    if (typeof v === 'object' && v !== null) {
      out[k] = redactObject(v, depth + 1)
    } else {
      out[k] = redactValue(k, v)
    }
  }
  return out
}

async function prepareIndustryAlert (admin, fraudCaseId) {
  const { data: fraudCase, error: caseErr } = await admin
    .from('fraud_cases')
    .select('*')
    .eq('id', fraudCaseId)
    .maybeSingle()

  if (caseErr || !fraudCase) {
    return { ok: false, error: caseErr?.message ?? 'case_not_found' }
  }

  const userId = fraudCase.user_id

  const [
    violationsRes,
    listingsRes,
    messagesRes,
  ] = await Promise.all([
    userId
      ? admin.from('violation_events').select('violation_type, severity, matches, source_type, created_at, action_taken, content_excerpt').eq('user_id', userId).order('created_at', { ascending: false }).limit(50)
      : Promise.resolve({ data: [] }),
    userId
      ? admin.from('listings').select('id, title, category, description, integrity_status, integrity_flags, status, created_at').eq('seller_id', userId).limit(30)
      : Promise.resolve({ data: [] }),
    userId
      ? admin.from('platform_messages').select('id, body, created_at').eq('sender_id', userId).order('created_at', { ascending: false }).limit(50)
      : Promise.resolve({ data: [] }),
  ])

  const violations = violationsRes.data ?? []
  const listings = listingsRes.data ?? []
  const messages = (messagesRes.data ?? []).map((m) => ({
    id: m.id,
    created_at: m.created_at,
    body_redacted: redactObject(m.body),
  }))

  const behaviorEvidence = {
    fraud_case_id: fraudCaseId,
    severity: fraudCase.severity,
    status: fraudCase.status,
    violation_summary: violations.map((v) => ({
      type: v.violation_type,
      severity: v.severity,
      action: v.action_taken,
      at: v.created_at,
      source_type: v.source_type,
      pattern_labels: (v.matches || []).map((m) => m?.label).filter(Boolean),
      content_sample: v.content_excerpt ? redactObject(v.content_excerpt) : null,
    })),
    listing_behavior: listings.map((l) => ({
      listing_id: l.id,
      category: l.category,
      title_pattern: typeof l.title === 'string' ? l.title.slice(0, 120) : null,
      integrity_status: l.integrity_status,
      flags: l.integrity_flags,
      status: l.status,
      counterfeit_indicators: l.integrity_flags,
    })),
    scam_attempts: messages,
    fraud_patterns: fraudCase.evidence?.matches ?? fraudCase.evidence,
    screenshots: (fraudCase.evidence?.screenshots ?? fraudCase.evidence?.images ?? []),
  }

  const alert = redactObject({
    report_type: 'industry_fraud_alert',
    marketplace: 'The Franks Standard LLC',
    prepared_at: new Date().toISOString(),
    requires_owner_approval: true,
    auto_send: false,
    behavior_evidence: behaviorEvidence,
    disclaimer: 'No personal identifiers included. Owner approval required before external distribution.',
  })

  const { data: saved, error: saveErr } = await admin
    .from('industry_alerts')
    .upsert({
      fraud_case_id: fraudCaseId,
      case_id: fraudCaseId,
      alert,
      alert_json: alert,
      prepared_at: new Date().toISOString(),
    }, { onConflict: 'fraud_case_id' })
    .select('id')
    .single()

  if (saveErr || !saved?.id) {
    return { ok: false, error: saveErr?.message ?? 'save_failed' }
  }

  await admin.from('fraud_cases').update({
    industry_alert_prepared: true,
    updated_at: new Date().toISOString(),
  }).eq('id', fraudCaseId)

  return { ok: true, alertId: saved.id, alert }
}

module.exports = { prepareIndustryAlert, redactObject }
