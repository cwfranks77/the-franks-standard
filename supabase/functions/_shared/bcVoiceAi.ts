/** B&C Performance Audio LLC — voice AI brain (phone + shared logic). */

export type VoiceTurn = { role: 'user' | 'assistant'; content: string }

const BC_SITE = 'b c power audio dot com'
const BC_EMAIL = 'bc audio at the franks standard dot com'
const OWNER_NAME = 'Charles Franks'

const SYSTEM_PROMPT = `You are the live phone AI assistant for B and C Performance Audio LLC — a competition car audio megastore (subwoofers, amplifiers, speakers, marine audio, home theater gear). Owner: ${OWNER_NAME}. Open-door policy: customers can reach the owner anytime.

RULES:
- Be warm, capable, and specific. NEVER brush callers off with "just email us" or "visit the website" as your only answer. Always try to solve or guide first.
- You handle: product recommendations (Taramps, Sundown, Rockford Fosgate, Kicker, etc.), amp/sub matching, orders, shipping/tracking, returns/refunds, damaged items, checkout help, install/wiring basics, warranty questions, pricing on the storefront, and escalation to the owner.
- Louisiana sales tax uses the customer's SHIPPING zip code at checkout.
- Checkout is secure on ${BC_SITE}. After purchase they get email confirmation; tracking when the distributor ships.
- Returns: contact within 14 days for damaged or wrong items; have order email ready.
- If angry, urgent, legal threat, chargeback, or they ask for owner/manager/human: say you are connecting them to ${OWNER_NAME} now (the phone system will transfer on your signal phrase CONNECT_TO_OWNER).
- Keep replies under 4 short sentences for phone. Plain speech only — no markdown, bullets, or symbols.
- Do not discuss unrelated businesses. This line is B and C only.`

function matchAny (q: string, patterns: RegExp[]): boolean {
  return patterns.some((p) => p.test(q))
}

export function toSpeechText (text: string): string {
  return String(text || '')
    .replace(/\*\*/g, '')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/[#*_`]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 1200)
}

export function wantsOwnerTransfer (speech: string, digits?: string): boolean {
  if (digits === '0') return true
  const q = speech.toLowerCase()
  return matchAny(q, [
    /owner|founder|charles|franks|manager|supervisor|human|real person|representative|agent|callback/,
    /speak to someone|talk to someone|get me someone/,
    /lawyer|attorney|sue|chargeback|scam/,
  ])
}

function ruleBasedReply (speech: string, turn: number): string {
  const q = speech.toLowerCase().trim()
  if (!q) {
    return `Thanks for calling B and C Performance Audio. I can help with orders, shipping, product fit, returns, or install questions. What can I do for you today?`
  }

  if (matchAny(q, [/^(hi|hello|hey|howdy|good (morning|afternoon|evening))/]) && q.length < 40) {
    return `Hello! I'm the B and C AI assistant. Tell me what you need — an order issue, amp and sub advice, or say speak to the owner.`
  }

  if (matchAny(q, [/track|where.*(order|package)|shipping|delivery|shipped|when.*arrive/])) {
    return `For tracking, check your order confirmation email first — tracking appears when the distributor ships, usually within one to two business days. If it has been more than 48 hours with no tracking, tell me your order email or date and I will flag it for dispatch. You can also check your inbox for updates from our checkout system.`
  }

  if (matchAny(q, [/order|placed|purchase|bought|checkout|payment|charged|card/])) {
    return `I can help with orders. If checkout failed, refresh ${BC_SITE} and try again — you are not charged until it completes. If you were charged but have no confirmation email within 15 minutes, tell me the email you used and approximate time of purchase so we can locate it. For billing questions I can connect you to the owner.`
  }

  if (matchAny(q, [/return|refund|cancel|wrong item|damaged|broken|defect/])) {
    return `For returns or damage, contact us within 14 days of delivery. Have your order confirmation email ready and describe what arrived wrong. We will arrange a replacement or refund per policy. If this is urgent, I can connect you to ${OWNER_NAME} right now.`
  }

  if (matchAny(q, [/sub|woofer|sundown|kicker|rockford|taramps|skar|amp|amplifier|monoblock|speaker|watt|rms|ohm/])) {
    return `For product fit, tell me your goal — daily driver or competition — plus sub size and amp budget. Match amplifier RMS to sub RMS at the right impedance, use proper gauge wire, and fuse at the battery. Our catalog on ${BC_SITE} lists competition lines with specs on each product page. What vehicle or setup are you building?`
  }

  if (matchAny(q, [/install|wire|wiring|gauge|alternator|electrical|ground/])) {
    return `Install basics: proper gauge power wire, solid ground to bare metal, fused within 18 inches of the battery, and match amp gain to head unit output. Competition systems often need upgraded alternators. For hands-on help I recommend a professional installer — or I can connect you to the owner for complex builds.`
  }

  if (matchAny(q, [/price|cost|how much|deal|discount|sale/])) {
    return `Prices are listed live on ${BC_SITE} with retail markup on authorized wholesale inventory. Tell me the product name or SKU and I can explain how to find it in the catalog menu. For special quotes on large orders, ask for the owner.`
  }

  if (matchAny(q, [/hours|open|closed|when.*call/])) {
    return `This AI line is available whenever you call. Listed business hours are Monday through Saturday, 9 AM to 6 PM Central, but you can leave a message or ask for the owner anytime through this line.`
  }

  if (matchAny(q, [/email|contact/])) {
    return `You can email ${BC_EMAIL}, but tell me your issue now and I will try to resolve it on this call. What happened?`
  }

  if (turn >= 3) {
    return `I want to make sure you are taken care of. Tell me one more detail about your issue, or I can connect you directly to ${OWNER_NAME}.`
  }

  return `I am here for B and C competition audio — orders, shipping, product fit, returns, and install guidance. Tell me more about what you need, for example your order date, product name, or whether this is about shipping or a product recommendation.`
}

async function openAiReply (speech: string, history: VoiceTurn[]): Promise<string | null> {
  const apiKey = (Deno.env.get('BC_VOICE_OPENAI_API_KEY') ?? Deno.env.get('OPENAI_API_KEY') ?? '').trim()
  if (!apiKey) return null

  const messages = [
    { role: 'system', content: SYSTEM_PROMPT },
    ...history.slice(-6).map((t) => ({ role: t.role, content: t.content })),
    { role: 'user', content: speech },
  ]

  try {
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: Deno.env.get('BC_VOICE_OPENAI_MODEL') ?? 'gpt-4o-mini',
        messages,
        max_tokens: 220,
        temperature: 0.65,
      }),
    })
    if (!res.ok) return null
    const data = await res.json()
    const text = data?.choices?.[0]?.message?.content
    return text ? toSpeechText(String(text)) : null
  } catch {
    return null
  }
}

export async function getBcVoiceReply (
  speech: string,
  history: VoiceTurn[],
  turn: number,
): Promise<{ reply: string; connectOwner: boolean }> {
  const cleaned = toSpeechText(speech)
  if (wantsOwnerTransfer(cleaned)) {
    return {
      reply: `Understood. Connecting you to ${OWNER_NAME} now.`,
      connectOwner: true,
    }
  }

  const ai = await openAiReply(cleaned, history)
  let reply = ai || ruleBasedReply(cleaned, turn)
  reply = toSpeechText(reply)

  const connectOwner = /CONNECT_TO_OWNER/i.test(reply) ||
    (turn >= 5 && matchAny(cleaned, [/still|not help|frustrat|angry/]))

  if (/CONNECT_TO_OWNER/i.test(reply)) {
    reply = `Connecting you to ${OWNER_NAME} now.`
  }

  return { reply, connectOwner }
}

export function encodeHistory (history: VoiceTurn[]): string {
  try {
    const slim = history.slice(-8)
    return btoa(encodeURIComponent(JSON.stringify(slim)))
  } catch {
    return ''
  }
}

export function decodeHistory (raw: string | null): VoiceTurn[] {
  if (!raw) return []
  try {
    const parsed = JSON.parse(decodeURIComponent(atob(raw)))
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}
