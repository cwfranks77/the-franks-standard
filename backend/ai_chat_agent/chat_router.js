/**
 * AI chat support router — FAQ from knowledge base, escalation, session logging.
 */

const fs = require('fs')
const path = require('path')

const ROOT = __dirname
const KB_DIR = path.join(ROOT, 'knowledge_base')

const ESCALATION_PATTERNS = [
  { re: /\b(kill|murder|threat|harm|bomb|violence)\b/i, reason: 'threat' },
  { re: /\b(child|minor|underage|csam|pedo)\b/i, reason: 'child_safety' },
  { re: /\b(law enforcement|police report|fbi|subpoena|warrant)\b/i, reason: 'law_enforcement' },
  { re: /\b(fraud case|scam report|counterfeit ring)\b/i, reason: 'fraud' },
]

const TOPIC_PATTERNS = [
  { topic: 'payments', file: 'payments.md', re: /\b(pay|payment|checkout|fee|stripe|tax)\b/i },
  { topic: 'disputes', file: 'disputes.md', re: /\b(dispute|refund|return|not received)\b/i },
  { topic: 'fraud', file: 'fraud.md', re: /\b(fraud|scam|fake|counterfeit|authentic)\b/i },
  { topic: 'coa', file: 'coa.md', re: /\b(coa|certificate|chain of custody|serial)\b/i },
  { topic: 'overview', file: 'platform_overview.md', re: /.*/ },
]

function loadPrompt (name) {
  try {
    return fs.readFileSync(path.join(ROOT, 'prompts', name), 'utf8').trim()
  } catch {
    return ''
  }
}

function loadKnowledge (filename) {
  try {
    return fs.readFileSync(path.join(KB_DIR, filename), 'utf8').trim()
  } catch {
    return ''
  }
}

function pickTopic (message) {
  const text = String(message ?? '')
  for (const t of TOPIC_PATTERNS) {
    if (t.topic !== 'overview' && t.re.test(text)) return t
  }
  return TOPIC_PATTERNS.find((t) => t.topic === 'overview')
}

function checkEscalation (message) {
  const text = String(message ?? '')
  for (const { re, reason } of ESCALATION_PATTERNS) {
    if (re.test(text)) return { escalate: true, reason }
  }
  return { escalate: false, reason: null }
}

function extractFaqAnswer (markdown, message) {
  const lines = markdown.split('\n')
  const lower = String(message).toLowerCase()
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    if (line.startsWith('## ') || line.startsWith('### ')) {
      const heading = line.replace(/^#+\s*/, '').toLowerCase()
      if (heading.split(/\s+/).some((w) => w.length > 3 && lower.includes(w))) {
        const chunk = []
        for (let j = i + 1; j < lines.length && !lines[j].startsWith('#'); j++) {
          chunk.push(lines[j])
        }
        return chunk.join('\n').trim()
      }
    }
  }
  const intro = lines.filter((l) => l && !l.startsWith('#')).slice(0, 6).join('\n')
  return intro || 'Please visit our Help Center or contact support for more detail.'
}

function buildChatResponse (message) {
  const esc = checkEscalation(message)
  if (esc.escalate) {
    return {
      reply: loadPrompt('escalation_prompt.txt') || 'A member of our owner support team will review this conversation. You will be contacted if follow-up is needed.',
      escalated: true,
      escalation_reason: esc.reason,
      topic: 'escalation',
    }
  }

  const topic = pickTopic(message)
  const kb = loadKnowledge(topic.file)
  const answer = extractFaqAnswer(kb, message)

  const safety = loadPrompt('safety_prompt.txt')
  const system = loadPrompt('system_prompt.txt')

  return {
    reply: `${answer}\n\n---\n${safety}`.trim(),
    escalated: false,
    topic: topic.topic,
    knowledge_source: topic.file,
    system_guidance: system.slice(0, 500),
    note: 'AI support cannot override owner decisions or provide legal/financial advice.',
  }
}

async function getOrCreateSession (admin, { sessionId, userId = null }) {
  if (sessionId) {
    const { data } = await admin.from('chat_sessions').select('*').eq('id', sessionId).maybeSingle()
    if (data) return data
  }

  const { data, error } = await admin.from('chat_sessions').insert({
    user_id: userId,
    status: 'active',
    metadata: { channel: 'api' },
  }).select('*').single()

  if (error) return null
  return data
}

async function logMessage (admin, sessionId, role, content, metadata = {}) {
  await admin.from('chat_messages').insert({
    session_id: sessionId,
    role,
    content: String(content).slice(0, 8000),
    metadata,
  })
}

async function handleChatMessage (admin, { message, session_id, user_id = null }) {
  if (!admin) return { ok: false, error: 'admin_required' }
  if (!String(message ?? '').trim()) return { ok: false, error: 'message_required' }

  const session = await getOrCreateSession(admin, { sessionId: session_id, userId: user_id })
  if (!session) return { ok: false, error: 'session_create_failed' }

  const response = buildChatResponse(message)

  await logMessage(admin, session.id, 'user', message)
  await logMessage(admin, session.id, 'assistant', response.reply, {
    topic: response.topic,
    escalated: response.escalated,
    escalation_reason: response.escalation_reason,
  })

  if (response.escalated) {
    await admin.from('chat_sessions').update({
      status: 'escalated',
      escalated: true,
      escalation_reason: response.escalation_reason,
      updated_at: new Date().toISOString(),
    }).eq('id', session.id)
  } else {
    await admin.from('chat_sessions').update({ updated_at: new Date().toISOString() }).eq('id', session.id)
  }

  return {
    ok: true,
    session_id: session.id,
    ...response,
  }
}

module.exports = {
  buildChatResponse,
  handleChatMessage,
  checkEscalation,
  pickTopic,
  loadKnowledge,
  loadPrompt,
}
