import { BC_BRAND } from '~/utils/bcBrand.js'
import { BC_SUPPORT_DEFAULTS } from '~/utils/bcSupport.js'

interface BcCtx {
  turnCount: number
  askedOwner: boolean
  issueSeverity: number
}

const ctx: BcCtx = { turnCount: 0, askedOwner: false, issueSeverity: 0 }

function matchAny (q: string, patterns: RegExp[]): boolean {
  return patterns.some((p) => p.test(q))
}

function ownerEscalationBlock (phone: string, email: string, owner: string): string {
  return `**Speak with ${owner} (Open Door)**\n\n` +
    `• **Call:** ${phone} — say you want the **B&amp;C dispatch desk** or the owner\n` +
    `• **Email:** [${email}](mailto:${email}?subject=Open%20Door%20-%20B%26C%20Audio)\n` +
    `• **Open Door page:** /bc-audio/open-door\n\n` +
    `Our AI can route urgent install, warranty, or billing issues to the owner. ` +
    `If this needs a human now, call — complex cases are escalated automatically.`
}

function shouldEscalateToOwner (q: string): boolean {
  if (matchAny(q, [/owner|founder|charles|franks|speak.*(human|person|manager)|talk to.*(you|him|owner)|real person|callback|call me back/])) {
    return true
  }
  if (matchAny(q, [/angry|furious|lawyer|attorney|sue|broken|not working|scam|refund now|chargeback/])) {
    ctx.issueSeverity += 2
  }
  if (matchAny(q, [/urgent|rush|today|asap|emergency/])) {
    ctx.issueSeverity += 1
  }
  return ctx.issueSeverity >= 2 || (ctx.turnCount >= 4 && ctx.issueSeverity >= 1)
}

export function getBcAiReply (message: string, support?: { phoneDisplay: string; email: string; ownerName: string }): string {
  const phone = support?.phoneDisplay || BC_SUPPORT_DEFAULTS.phoneDisplay
  const email = support?.email || BC_SUPPORT_DEFAULTS.email
  const owner = support?.ownerName || BC_SUPPORT_DEFAULTS.ownerName
  const q = message.toLowerCase().trim()
  ctx.turnCount++

  if (!q) {
    return `Welcome to **${BC_BRAND.full}** — competition-grade car audio.\n\n` +
      'I can help with:\n' +
      '• Product fit (amps, subs, wiring)\n• Orders and checkout on this storefront\n• Shipping and returns\n• Speaking with the owner (Open Door)\n\n' +
      `**B&amp;C line:** ${phone}\n**Open Door:** /bc-audio/open-door\n\nWhat do you need?`
  }

  if (/^(hello|hi|hey|howdy)/i.test(q) && q.length < 24) {
    return `Hi! I'm the **${BC_BRAND.short} AI assistant**. Ask about subs, amps, checkout, or say **"speak to the owner"** anytime.`
  }

  if (/^(thanks|thank you|thx)/i.test(q)) {
    return `You're welcome! Need anything else? Call **${phone}** or visit **Open Door** if you want ${owner} directly.`
  }

  if (matchAny(q, [/open door|founder|owner|charles|speak.*human|talk to.*owner|real person|manager|callback/])) {
    ctx.askedOwner = true
    return ownerEscalationBlock(phone, email, owner)
  }

  if (shouldEscalateToOwner(q)) {
    return `I want to make sure you get the right help.\n\n${ownerEscalationBlock(phone, email, owner)}`
  }

  if (matchAny(q, [/phone|call|number|option 3|dispatch/])) {
    return `📞 **${BC_BRAND.full} support:** ${phone}\n\n` +
      'AI answers first — orders, product questions, and install basics. ' +
      'Ask for the **owner** or **dispatch desk** anytime; we escalate complex issues.\n\n' +
      `Email: ${email}`
  }

  if (matchAny(q, [/sub|woofer|l7|sundown|kicker|rockford|taramps|amp|amplifier|monoblock|speaker/])) {
    return '**Product help:** Browse the catalog on this page — tap a product for specs and checkout. ' +
      'Not sure on power matching? Tell me your vehicle or amp model and goal (daily vs competition).\n\n' +
      `For custom builds, call **${phone}** and ask for dispatch.`
  }

  if (matchAny(q, [/order|track|shipping|delivery|where.*package/])) {
    return '**Orders:** Checkout runs through The Franks Standard secure payment stack. ' +
      'After purchase you receive email confirmation with tracking when the distributor ships.\n\n' +
      `Missing tracking after 48 hours? Call **${phone}** or email ${email}.`
  }

  if (matchAny(q, [/return|refund|cancel|wrong item|damaged/])) {
    return '**Returns:** Contact us within 14 days of delivery for damaged or wrong items. ' +
      'Have your order email ready.\n\n' +
      `${ownerEscalationBlock(phone, email, owner)}`
  }

  if (matchAny(q, [/checkout|pay|card|stripe|price/])) {
    return 'Select a product in the catalog, then use the order form on the right. ' +
      'Payments are processed securely; Louisiana sales tax uses your **shipping ZIP**.\n\n' +
      'Checkout cancelled? Refresh and try again — your card is not charged until completion.'
  }

  if (matchAny(q, [/install|wire|wiring|gauge|alternator|electrical/])) {
    return '**Install guidance:** Match amp power to sub RMS, use proper gauge wire, and fuse at the battery. ' +
      'We recommend a professional install for competition systems.\n\n' +
      `For hands-on help, call **${phone}** — Option 3 routes to the B&amp;C dispatch desk.`
  }

  return `I'm here for **${BC_BRAND.full}** — products, orders, and owner access.\n\n` +
    `Try: "What amp for two 12s?" or "Speak to the owner."\n\n` +
    `Call **${phone}** · Open Door: /bc-audio/open-door`
}
