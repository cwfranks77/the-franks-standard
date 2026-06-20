/**
 * B&C Performance Audio ONLY — +18337224147
 * Neural voice + GPT-4.1 agent. Owner handoff only when caller asks.
 */
import 'jsr:@supabase/functions-js/edge-runtime.d.ts'

const BC_LINE_E164 = '+18337224147'
const DEFAULT_OWNER_CELL = '+13373400449'
const BC_SUPPORT_DISPLAY = '(833) 722-4147'
const BC_SITE = 'b c power audio dot com'
/** Must match deployed Supabase edge function — Gather callbacks use this URL. */
const BC_VOICE_INBOUND_URL =
  'https://rochesyrxiyrxhzmkuwk.supabase.co/functions/v1/bc-voice-inbound'

const GREETING =
  'Thank you for calling B and C Performance Audio. Your call is important to us. ' +
  'The owner is available anytime you ask for them.'

const AI_BRIDGE =
  "I'm your assistant and I can help with products, orders, installs, returns, billing, " +
  'warranty questions, and competition audio advice. To reach the owner, just say owner or press zero. ' +
  'Otherwise, tell me what you need.'

const OWNER_SPEECH_RE =
  /\b(owner|founder|charles|get me the owner|speak (?:to|with) (?:the )?owner|talk (?:to|with) (?:the )?owner|want (?:the )?owner|need (?:the )?owner|manager|supervisor|human|real person|talk to a person|speak to a person|connect me to|transfer me)\b/i

function voiceName (): string {
  return (Deno.env.get('BC_TWILIO_VOICE') ?? 'Polly.Joanna-Neural').trim() || 'Polly.Joanna-Neural'
}

function aiModel (): string {
  return (Deno.env.get('BC_VOICE_AI_MODEL') ?? 'gpt-4.1').trim() || 'gpt-4.1'
}

function xmlEscape (s: string): string {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function twiml (inner: string): Response {
  return new Response(`<?xml version="1.0" encoding="UTF-8"?><Response>${inner}</Response>`, {
    headers: { 'Content-Type': 'text/xml; charset=utf-8' },
  })
}

function say (text: string): string {
  const v = xmlEscape(voiceName())
  return `<Say language="en-US" voice="${v}">${xmlEscape(text)}</Say>`
}

function sayWithPause (text: string): string {
  return `${say(text)}<Pause length="1"/>`
}

function normalizeE164 (raw: string): string {
  const digits = String(raw || '').replace(/\D/g, '')
  if (digits.length === 10) return `+1${digits}`
  if (digits.length === 11 && digits.startsWith('1')) return `+${digits}`
  const t = String(raw || '').trim()
  return t.startsWith('+') ? t.replace(/\s/g, '') : digits ? `+${digits}` : ''
}

function ownerE164 (): string {
  const raw = Deno.env.get('BC_OWNER_CELL_PHONE')
    || Deno.env.get('PRIVATE_OWNER_CELL_PHONE')
    || DEFAULT_OWNER_CELL
  return normalizeE164(raw) || DEFAULT_OWNER_CELL
}

function webhookBase (): string {
  const env = (Deno.env.get('BC_VOICE_WEBHOOK_URL') ?? '').trim().replace(/\/$/, '')
  if (env && env.includes('functions/v1/bc-voice-inbound')) return env
  return BC_VOICE_INBOUND_URL
}

function twimlActionUrl (url: string): string {
  return url.replace(/&/g, '&amp;').replace(/"/g, '&quot;')
}

function actionUrl (attempt: number, lastTopic = ''): string {
  const base = `${webhookBase()}?step=handle&attempt=${attempt}`
  if (!lastTopic) return base
  return `${base}&topic=${encodeURIComponent(lastTopic.slice(0, 120))}`
}

function parseForm (body: string): Record<string, string> {
  const out: Record<string, string> = {}
  for (const part of body.split('&')) {
    if (!part) continue
    const [k, ...rest] = part.split('=')
    out[decodeURIComponent(k.replace(/\+/g, ' '))] = decodeURIComponent(rest.join('=').replace(/\+/g, ' '))
  }
  return out
}

function gatherPrompt (action: string, prompt: string): string {
  return `<Gather input="speech dtmf" numDigits="1" timeout="12" speechTimeout="auto" speechModel="phone_call" action="${twimlActionUrl(action)}" method="POST" hints="owner, order, shipping, return, refund, amplifier, subwoofer, speaker, wiring, checkout, warranty, install, tracking, purchases, invoice, payment, damaged, exchange, taramps, sundown, kicker, rockford">${say(prompt)}</Gather>${say("I'm still here. Say owner or press zero if you'd like the owner.")}`
}

function dialOwner (): string {
  return `${sayWithPause('Absolutely. Connecting you with the owner now. One moment.')}` +
    `<Dial timeout="40" callerId="${xmlEscape(BC_LINE_E164)}">${xmlEscape(ownerE164())}</Dial>`
}

function wantsOwner (digits: string, speech: string): boolean {
  if (digits === '0') return true
  const s = speech.trim()
  return Boolean(s && OWNER_SPEECH_RE.test(s))
}

const AI_SYSTEM = `You are the expert live phone assistant for B and C Performance Audio — a Louisiana competition car audio dealer. Website: bcpoweraudio.com. You handle EVERY caller situation yourself. The owner is NOT transferred automatically; callers must ask for the owner (you may remind them they can say "owner" or press zero).

YOUR JOB — handle all of these confidently:
- Product recommendations: amps, subs, speakers, wiring kits, alternators, batteries, sound deadening, competition SPL builds
- Brands: Taramps, Sundown, Kicker, Rockford Fosgate, and full site catalog
- Fitment and install advice: vehicle type, electrical, amp wiring, sub box, port tuning, gain setting
- Orders: how to buy on site, checkout, confirmation emails, distributor fulfillment
- Shipping and tracking: timelines, carrier updates, delayed packages
- Returns and damage: 14-day window for damage or wrong item; need order email and photos
- Billing: charges, receipts, payment issues on Stripe checkout
- Louisiana sales tax: calculated from customer SHIPPING zip code (not billing)
- Warranty and defects: gather symptoms, serial or order info, next steps
- Angry, confused, or emotional callers: stay calm, acknowledge feelings, solve step by step — do NOT give up or defer to owner unless they ask
- Technical troubleshooting: no sound, blown fuse, clipping, alternator whine, remote turn-on, impedance

VOICE RULES (read aloud by text-to-speech):
- Sound like a warm, capable human. Use contractions.
- No markdown, bullets, emojis, or raw URLs. Say "b c power audio dot com".
- 2-5 short sentences per turn. One clear question when you need info.
- Never say you are an AI unless directly asked.
- Never mention The Franks Standard unless caller asks about a parent marketplace.
- Support email spoken as: bc audio at the franks standard dot com. Phone: (833) 722-4147.
- If caller explicitly asks for the owner, respond briefly that they can say owner or press zero now — do not pretend to transfer; the phone system handles transfer.
- NEVER refuse to help. NEVER auto-escalate. You are the primary support line.`

async function aiAgentReply (
  speech: string,
  attempt: number,
  priorTopic: string,
): Promise<string> {
  const key = (Deno.env.get('OPENAI_API_KEY') ?? '').trim()
  if (!key) return fallbackReply(speech)

  const context = priorTopic && priorTopic !== speech
    ? `Earlier in this call: ${priorTopic}\nCaller now says: ${speech}`
    : speech

  try {
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: aiModel(),
        temperature: 0.4,
        max_tokens: 280,
        messages: [
          { role: 'system', content: AI_SYSTEM },
          { role: 'user', content: `Call turn ${attempt}. Caller: ${context.slice(0, 900)}` },
        ],
      }),
    })
    if (!res.ok) return fallbackReply(speech)
    const data = await res.json()
    const raw = String(data?.choices?.[0]?.message?.content ?? '').trim()
    if (!raw) return fallbackReply(speech)
    return raw.replace(/\*\*/g, '').replace(/https?:\/\/\S+/g, BC_SITE).slice(0, 520)
  } catch {
    return fallbackReply(speech)
  }
}

function fallbackReply (speech: string): string {
  const q = speech.toLowerCase().trim()
  if (!q) {
    return "I'm here for whatever you need — products, orders, installs, or returns. What's going on?"
  }
  if (/order|track|ship|purchas|buy|checkout/.test(q)) {
    return "You can shop securely at b c power audio dot com. After checkout you'll get email confirmation and tracking when it ships. What part of your order can I help with?"
  }
  if (/return|refund|damaged|wrong/.test(q)) {
    return "For a return or damage claim, I'll need your order email and clear photos within 14 days of delivery. Tell me what arrived and we'll work through it."
  }
  if (/amp|sub|speaker|install|watt|ohm|wire/.test(q)) {
    return "Tell me your vehicle, what gear you're running or want to run, and your goal — daily driver, spl, or competition. I'll walk you through it."
  }
  if (/pay|charge|bill|receipt|card/.test(q)) {
    return "Checkout runs through secure Stripe on the website. If a charge looks wrong, tell me the date and amount and we'll sort it out."
  }
  return "I want to get this right for you. Can you tell me a bit more detail about what you need?"
}

Deno.serve(async (req) => {
  const url = new URL(req.url)
  const attempt = Math.min(8, Math.max(1, Number.parseInt(url.searchParams.get('attempt') ?? '1', 10) || 1))
  const priorTopic = (url.searchParams.get('topic') ?? '').trim()

  if (req.method !== 'POST') {
    return twiml(say(`${GREETING} Call ${BC_SUPPORT_DISPLAY} for assistance.`))
  }

  const form = parseForm(await req.text())
  const digits = String(form.Digits ?? '').trim()
  const speech = String(form.SpeechResult ?? '').trim()

  const stepParam = url.searchParams.get('step')
  let step = stepParam ?? 'start'
  if (step === 'start' && (speech || digits || url.searchParams.has('attempt'))) {
    step = 'handle'
  }

  if (step === 'start') {
    return twiml(
      `${sayWithPause(GREETING)}${sayWithPause(AI_BRIDGE)}` +
      gatherPrompt(actionUrl(1), "What's going on? How can I help?"),
    )
  }

  if (wantsOwner(digits, speech)) {
    return twiml(dialOwner())
  }

  const reply = await aiAgentReply(speech, attempt, priorTopic)
  const topic = speech || priorTopic
  const followUp = attempt >= 4
    ? "Anything else I can help with? Say owner anytime if you'd like them."
    : 'What else can I help with?'

  return twiml(`${say(reply)}${gatherPrompt(actionUrl(attempt + 1, topic), followUp)}`)
})
