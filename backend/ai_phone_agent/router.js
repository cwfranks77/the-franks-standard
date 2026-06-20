/**
 * AI phone agent router — intent routing, escalation, call logging.
 * Backend logic only. No telephony provider integration.
 */

const fs = require('fs')
const path = require('path')

const ROOT = __dirname

const ESCALATION_PATTERNS = [
  { re: /\b(kill|murder|threat|harm you|hurt you|bomb)\b/i, reason: 'threat' },
  { re: /\b(child|minor|underage|pedo|csam)\b/i, reason: 'child_safety' },
  { re: /\b(fraud|scam|stolen|counterfeit|fake)\b/i, reason: 'fraud' },
  { re: /\b(lawyer|lawsuit|legal advice|sue|attorney)\b/i, reason: 'legal' },
  { re: /\b(refund amount|tax advice|wire transfer|investment)\b/i, reason: 'financial' },
]

const INTENT_PATTERNS = [
  { intent: 'order_status', re: /\b(order|tracking|shipped|delivery|where is my)\b/i },
  { intent: 'dispute', re: /\b(dispute|refund|return|not received|wrong item)\b/i },
  { intent: 'fraud', re: /\b(fraud|scam|fake|counterfeit|report seller)\b/i },
  { intent: 'general_support', re: /.*/ },
]

function loadText (relPath) {
  try {
    return fs.readFileSync(path.join(ROOT, relPath), 'utf8').trim()
  } catch {
    return ''
  }
}

function routeIntent (utterance) {
  const text = String(utterance ?? '').trim()
  for (const { intent, re } of INTENT_PATTERNS) {
    if (intent !== 'general_support' && re.test(text)) return intent
  }
  return 'general_support'
}

function checkEscalation (utterance) {
  const text = String(utterance ?? '')
  for (const { re, reason } of ESCALATION_PATTERNS) {
    if (re.test(text)) return { escalate: true, reason }
  }
  return { escalate: false, reason: null }
}

function scriptForIntent (intent) {
  const map = {
    order_status: 'scripts/order_status_script.txt',
    dispute: 'scripts/dispute_intake_script.txt',
    fraud: 'scripts/fraud_intake_script.txt',
    general_support: 'scripts/greeting_script.txt',
  }
  return loadText(map[intent] || map.general_support)
}

function buildResponse ({ utterance, intent, escalated, escalationReason }) {
  if (escalated) {
    return {
      say: loadText('prompts/escalation_prompt.txt') || 'I am connecting you with our owner support team now. Please hold.',
      escalate: true,
      escalation_reason: escalationReason,
      note: 'Never provide legal or financial advice on automated calls.',
    }
  }

  const verificationNeeded = /\b(verify|account|password|login)\b/i.test(utterance)
  if (verificationNeeded) {
    return {
      say: loadText('scripts/verification_script.txt'),
      escalate: false,
      script: 'verification',
    }
  }

  return {
    say: scriptForIntent(intent),
    escalate: false,
    intent,
    disclaimer: 'The Franks Standard cannot provide legal or financial advice on this line.',
  }
}

async function logCall (admin, payload) {
  if (!admin) return { ok: false, error: 'admin_required' }

  const { data, error } = await admin.from('phone_call_logs').insert({
    call_sid: payload.call_sid ?? null,
    caller_number: payload.caller_number ?? null,
    intent: payload.intent ?? 'general_support',
    transcript: payload.transcript ?? [],
    escalated: !!payload.escalated,
    escalation_reason: payload.escalation_reason ?? null,
    script_used: payload.script_used ?? null,
    metadata: payload.metadata ?? {},
  }).select('id').single()

  if (error) return { ok: false, error: error.message }
  return { ok: true, log_id: data.id }
}

async function handleCallTurn (admin, { utterance, call_sid, caller_number, transcript = [] }) {
  const intent = routeIntent(utterance)
  const esc = checkEscalation(utterance)
  const response = buildResponse({
    utterance,
    intent,
    escalated: esc.escalate,
    escalationReason: esc.reason,
  })

  const entry = {
    role: 'caller',
    text: String(utterance ?? ''),
    at: new Date().toISOString(),
  }
  const assistantEntry = {
    role: 'agent',
    text: response.say,
    intent,
    escalated: response.escalate,
    at: new Date().toISOString(),
  }

  const logResult = await logCall(admin, {
    call_sid,
    caller_number,
    intent,
    transcript: [...transcript, entry, assistantEntry],
    escalated: response.escalate,
    escalation_reason: response.escalation_reason ?? esc.reason,
    script_used: response.script ?? intent,
    metadata: { system_prompt_loaded: !!loadText('prompts/system_prompt.txt') },
  })

  return {
    ok: true,
    intent,
    ...response,
    log: logResult,
  }
}

module.exports = {
  routeIntent,
  checkEscalation,
  buildResponse,
  handleCallTurn,
  logCall,
  loadText,
  ESCALATION_PATTERNS,
}
