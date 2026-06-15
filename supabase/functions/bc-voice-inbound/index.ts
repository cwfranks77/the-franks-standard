/**
 * B&C Performance Audio LLC — AI phone assistant (Twilio webhook).
 */
import {
  decodeHistory,
  encodeHistory,
  getBcVoiceReply,
  wantsOwnerTransfer,
  type VoiceTurn,
} from '../_shared/bcVoiceAi.ts'

const SUPABASE_URL = (Deno.env.get('SUPABASE_URL') ?? '').replace(/\/$/, '')
const BASE_URL = `${SUPABASE_URL}/functions/v1/bc-voice-inbound`
const OWNER_PHONE = (Deno.env.get('BC_VOICE_OWNER_PHONE') ?? Deno.env.get('PRIVATE_OWNER_CELL_PHONE') ?? '').trim()
const BC_CALLER_ID = (Deno.env.get('TWILIO_BC_CALLER_ID') ?? '+18337224147').trim()

const SPEECH_HINTS = [
  'order', 'shipping', 'tracking', 'refund', 'return', 'damaged',
  'subwoofer', 'amplifier', 'install', 'wiring', 'owner', 'price', 'checkout',
].join(', ')

function xmlEscape (value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function twiml (body: string) {
  return new Response(`<?xml version="1.0" encoding="UTF-8"?><Response>${body}</Response>`, {
    headers: { 'Content-Type': 'text/xml; charset=utf-8' },
  })
}

function say (text: string) {
  return `<Say voice="Polly.Joanna">${xmlEscape(text)}</Say>`
}

function dialOwner () {
  if (!OWNER_PHONE) {
    return say('The owner is unavailable right now. Please try again in a few minutes. Goodbye.')
  }
  return `${say('Connecting you to the owner now. Please hold.')}<Dial timeout="40" callerId="${xmlEscape(BC_CALLER_ID)}">${xmlEscape(OWNER_PHONE)}</Dial>${say('The owner could not be reached. Please call back or visit b c power audio dot com. Goodbye.')}`
}

function gatherAi (actionUrl: string, prompt: string) {
  return `<Gather input="speech dtmf" numDigits="1" action="${xmlEscape(actionUrl)}" method="POST" speechTimeout="auto" timeout="14" hints="${xmlEscape(SPEECH_HINTS)}">${say(prompt)}</Gather>${say('I did not hear a response. Call back anytime. Goodbye.')}`
}

async function readTwilioForm (req: Request) {
  const url = new URL(req.url)
  if (req.method === 'GET') {
    return {
      digits: url.searchParams.get('Digits')?.trim() ?? '',
      speech: url.searchParams.get('SpeechResult')?.trim() ?? '',
      history: decodeHistory(url.searchParams.get('h')),
      turn: Number(url.searchParams.get('t') ?? '0') || 0,
    }
  }
  const form = await req.formData()
  return {
    digits: String(form.get('Digits') ?? '').trim(),
    speech: String(form.get('SpeechResult') ?? '').trim(),
    history: decodeHistory(url.searchParams.get('h')),
    turn: Number(url.searchParams.get('t') ?? '0') || 0,
  }
}

function nextActionUrl (history: VoiceTurn[], turn: number) {
  const q = new URLSearchParams()
  const encoded = encodeHistory(history)
  if (encoded) q.set('h', encoded)
  q.set('t', String(turn))
  return `${BASE_URL}?${q.toString()}`
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok')
  if (req.method !== 'POST' && req.method !== 'GET') {
    return new Response('method not allowed', { status: 405 })
  }

  const { digits, speech, history, turn } = await readTwilioForm(req)

  if (wantsOwnerTransfer(speech, digits)) {
    return twiml(dialOwner())
  }

  if (!speech && !digits && turn === 0) {
    const welcome =
      'Thank you for calling B and C Performance Audio. I am your AI assistant for orders, shipping, product fit, returns, and install help. ' +
      'Tell me what you need, or press zero anytime to speak with the owner, Charles Franks.'
    return twiml(gatherAi(nextActionUrl([], 1), welcome))
  }

  const utterance = speech || (digits && digits !== '0' ? `option ${digits}` : '')
  if (!utterance) {
    return twiml(gatherAi(nextActionUrl(history, turn + 1), 'Sorry, I missed that. What can I help you with?'))
  }

  const { reply, connectOwner } = await getBcVoiceReply(utterance, history, turn)
  if (connectOwner) {
    return twiml(dialOwner())
  }

  const newHistory: VoiceTurn[] = [
    ...history,
    { role: 'user', content: utterance },
    { role: 'assistant', content: reply },
  ]

  const followUp = `${reply} Anything else I can help with? Or press zero for the owner.`
  return twiml(gatherAi(nextActionUrl(newHistory, turn + 1), followUp))
})
