import { categoryListForAi } from '~/utils/marketplaceCategories'

/**
 * AI Customer Service Assistant for The Franks Standard.
 * Comprehensive rule-based assistant with conversational flow,
 * order help, account support, and escalation paths.
 * No API keys needed — runs entirely client-side.
 */

interface ConversationContext {
  lastTopic: string
  turnCount: number
  mentionedIssue: boolean
  mentionedOrder: boolean
}

const ctx: ConversationContext = {
  lastTopic: '',
  turnCount: 0,
  mentionedIssue: false,
  mentionedOrder: false,
}

function matchAny (q: string, patterns: RegExp[]): boolean {
  return patterns.some(p => p.test(q))
}

export function getAiReply (message: string): string {
  const q = message.toLowerCase().trim()
  ctx.turnCount++

  if (!q) {
    return 'Welcome to The Franks Standard customer service. I can help with:\n\n' +
      '• Buying and selling\n• Fees and payments\n• COA and authenticity\n• Shipping and orders\n' +
      '• Account issues\n• Disputes and returns\n• Dropshipping\n• Technical problems\n\n' +
      'What can I help you with today? You can also call us at (877) 837-0527.'
  }

  // Greeting
  if (/^(hello|hi|hey|yo|sup|good morning|good afternoon|good evening|howdy|what'?s up)/i.test(q) && q.length < 30) {
    return 'Hi there! Welcome to The Franks Standard. I\'m your AI customer service assistant. ' +
      'I can help with buying, selling, fees, shipping, authenticity questions, account issues, and more. ' +
      'What do you need help with?'
  }

  // Thanks
  if (/^(thanks|thank you|thx|ty|appreciate|cheers|cool thanks)/i.test(q)) {
    return 'You\'re welcome! Is there anything else I can help you with? ' +
      'If you need to speak with a person, call (877) 837-0527 or email info@thefranksstandard.com.'
  }

  // Phone / call / speak to human
  if (matchAny(q, [/phone|call (us|me|them|you)|speak.*(human|person|agent|someone|representative)|talk to.*human|customer service number|toll.?free|1.?800/])) {
    ctx.lastTopic = 'phone'
    return '📞 **Customer Service Line: (877) 837-0527**\n\n' +
      'Our AI-powered phone service is available to help with:\n' +
      '• Order status and tracking\n• Returns and refunds\n• Account questions\n• Billing issues\n\n' +
      'For complex issues, the AI will connect you with a human agent. ' +
      'You can also email info@thefranksstandard.com or use the Video call feature for face-to-face help.'
  }

  // HOW TO SELL / just sell / I want to sell / selling
  if (matchAny(q, [/how.*(sell|list)|want to sell|start selling|can i sell|just sell|sell my|sell (an|some|a) |begin selling|selling on|become.*seller|set up.*shop|open.*store/])) {
    ctx.lastTopic = 'selling'
    return '**How to sell on The Franks Standard:**\n\n' +
      '1. **Create a free account** — click "Join Free" in the header\n' +
      '2. **Go to Sell** — click "Sell" in the navigation\n' +
      '3. **Choose your type** — Direct Sale (you ship) or Dropship (supplier ships)\n' +
      '4. **Fill in details** — title, photos, price; use **Write with AI** on the description field for a proof-first draft you can edit\n' +
      '5. **Add authenticity proof** — upload a COA or sign our guarantee\n' +
      '6. **Publish** — your listing goes live immediately\n\n' +
      'That\'s it! No approval wait. If you\'re the site owner, use Owner Mode for fee-free listing.\n\n' +
      'Need help with something specific about selling?'
  }

  // Dropshipping
  if (matchAny(q, [/dropship|drop.?ship|supplier.?ship|direct.?fulfil|third.?party.?ship|wholesale.?ship/])) {
    ctx.lastTopic = 'dropship'
    return '**Dropshipping on The Franks Standard:**\n\n' +
      'Yes, we support dropshipping! When creating a listing:\n\n' +
      '1. Click **"Dropship"** on the sell page (instead of Direct Sale)\n' +
      '2. Enter your **supplier name** and contact info\n' +
      '3. Set **estimated shipping time** and origin\n' +
      '4. A COA or guarantee is still required — you\'re responsible for authenticity\n\n' +
      '**Important:** You are accountable for items your supplier ships. ' +
      'If a buyer receives a counterfeit, the same zero-tolerance policy applies.\n\n' +
      'Dropship fees are the same as direct sale fees.'
  }

  // Store builder / AI tools
  if (matchAny(q, [/store builder|ai builder|design.*store|set up.*store|build.*store|create.*store|store setup|ai help.*sell/])) {
    ctx.lastTopic = 'storebuilder'
    return '**AI Store Builder:**\n\n' +
      'Our AI Store Builder helps you get set up in minutes:\n\n' +
      '1. Go to **AI Store Builder** in the Explore menu\n' +
      '2. Tell us your store name, what you sell, and your style (direct or dropship)\n' +
      '3. Click "Build my store with AI"\n' +
      '4. Get your store bio, listing descriptions, pricing strategy, and launch checklist\n\n' +
      'It\'s free for all sellers. Go to **AI Store Builder** in the menu to try it now!'
  }

  // Launch offer / promotion
  if (matchAny(q, [/launch offer|promo|promotion|discount|deal|special|new seller|first.*free|referr|invite|bonus/])) {
    ctx.lastTopic = 'promo'
    return '**New Seller Launch Offer:**\n\n' +
      '• **10 free listings** — no card needed\n' +
      '• **3% transaction fee** for first 90 days (then 5%)\n' +
      '• **Free AI Store Builder** to design your shop\n' +
      '• **Referral bonus** — invite a seller, both get 1 month Pro free\n\n' +
      'Go to **Launch Offer** in the Explore menu for full details, or create your free account to get started.'
  }

  // Fees / pricing / cost
  if (matchAny(q, [/fee|fees|cost|price|charge|how much|pricing|commission|percentage|listing fee|seller fee|pro seller/])) {
    ctx.lastTopic = 'fees'
    return '**Fees on The Franks Standard:**\n\n' +
      '• **Listing fee** — per listing or subscription. Pay via Stripe on the Pay & Fees page.\n' +
      '• **Pro Seller** (optional) — monthly/annual upgrade for featured placement\n' +
      '• **Dispute fee** — small fee for escalated mediation (either party)\n' +
      '• **Buyer deposits** — order payment via Stripe\n\n' +
      '**Owner/operator?** All fees are waived in Owner Mode.\n\n' +
      'All payments go through Stripe — we never store your card number. ' +
      'Visit **Pay & Fees** in the menu for payment links, or call (877) 837-0527 for billing questions.'
  }

  // Payment / Stripe / checkout / card
  if (matchAny(q, [/payment|pay |paying|stripe|checkout|card|debit|credit|wallet|apple pay|google pay|billing/])) {
    ctx.lastTopic = 'payment'
    return '**Payments on The Franks Standard:**\n\n' +
      'All payments use live **Stripe Payment Links** (secure checkout).\n\n' +
      '• **Pay & Fees** in the menu — four working links:\n' +
      '  - Listing / renewal fee (sellers)\n' +
      '  - Pro seller plan $9.99/mo (sellers)\n' +
      '  - Order payment / deposit (buyers)\n' +
      '  - Dispute fee (either party)\n' +
      '• On a listing page, tap **Buy now (Stripe)**\n' +
      '• Pricing page **Go Pro** opens Stripe directly\n\n' +
      'Cards, Apple Pay, and Google Pay accepted. Issues? Try another card or call (877) 837-0527.'
  }

  // Payment failed / declined
  if (matchAny(q, [/payment fail|card decline|declined|rejected|transaction fail|couldn'?t pay|can'?t pay|won'?t process/])) {
    ctx.lastTopic = 'payment-fail'
    return '**Payment not going through?** Try these steps:\n\n' +
      '1. **Check your card** — make sure it\'s not expired or over-limit\n' +
      '2. **Call your bank** — some block online marketplace transactions\n' +
      '3. **Try another card** — or use Apple/Google Pay\n' +
      '4. **Clear cookies** — then retry the Stripe checkout link\n\n' +
      'If it still fails, note the exact time and error message, then:\n' +
      '• Call **(877) 837-0527**\n' +
      '• Or email **info@thefranksstandard.com** with the details'
  }

  // COA / authenticity / certificate / verification
  if (matchAny(q, [/coa|certificate.*auth|authenti|proof|verif|genuine|legit|real or fake|is it real|certified|graded|psa|pcgs|beckett/])) {
    ctx.lastTopic = 'coa'
    return '**Authenticity on The Franks Standard:**\n\n' +
      'Every listing requires one of:\n' +
      '• **COA Upload** — photo/scan of your Certificate of Authenticity\n' +
      '• **Platform Guarantee** — you sign our in-platform authenticity guarantee with your legal name\n\n' +
      'Buyers see the proof before money moves. If an item is proven fake:\n' +
      '• Full refund to the buyer\n• Permanent ban for the seller\n• No second chances\n\n' +
      'We work with PSA, PCGS, Beckett, and other grading services. ' +
      'Include grading details in your listing description.\n\n' +
      'Questions about verifying a specific item? Call (877) 837-0527.'
  }

  // Fake / fraud / scam / counterfeit
  if (matchAny(q, [/fake|fraud|scam|counterfeit|stolen|knock.?off|replica|report|suspicious/])) {
    ctx.lastTopic = 'fraud'
    return '**Report fraud or counterfeits:**\n\n' +
      '⚠️ The Franks Standard has a **zero-tolerance** policy for fakes.\n\n' +
      'If you received a suspicious item:\n' +
      '1. **Do not return it yet** — keep it as evidence\n' +
      '2. **Take photos** of the item, packaging, and any COA\n' +
      '3. **Report it** via Contact with your order ID and photos\n' +
      '4. **Call (877) 837-0527** for urgent cases\n\n' +
      'Proven fakes result in: full buyer refund, permanent seller ban, and potential legal referral. ' +
      'Email info@thefranksstandard.com with "FRAUD REPORT" in the subject line for priority review.'
  }

  // Refund / return / money back
  if (matchAny(q, [/refund|return|money back|send back|not as described|wrong item|damaged|broken|defective/])) {
    ctx.lastTopic = 'refund'
    return '**Returns and Refunds:**\n\n' +
      '• Items use escrow — funds are held until buyer confirms\n' +
      '• **Not as described?** Open a dispute with photos before confirming delivery\n' +
      '• **Damaged in shipping?** Take photos of the packaging and item immediately\n' +
      '• **Counterfeit?** See our fraud report process (type "report fraud")\n\n' +
      'Refund timeline depends on the payment method (usually 5-10 business days via Stripe).\n\n' +
      'For return help: call **(877) 837-0527** or email with order ID and photos.'
  }

  // Shipping / tracking / delivery
  if (matchAny(q, [/ship|shipping|track|tracking|deliver|delivery|package|mail|ups|fedex|usps|carrier|when.*(arrive|get|ship)/])) {
    ctx.lastTopic = 'shipping'
    return '**Shipping and Delivery:**\n\n' +
      '• **Direct Sale** — seller ships within their stated timeframe\n' +
      '• **Dropship** — supplier ships directly to you (check listing for estimated time)\n' +
      '• Ask the seller for a tracking number via the listing page\n\n' +
      '**No tracking update?**\n' +
      '1. Check with the carrier directly (USPS, UPS, FedEx)\n' +
      '2. Message the seller through the listing\n' +
      '3. Open a video call for a live conversation\n\n' +
      'Packages not arrived after the estimated window? ' +
      'Call **(877) 837-0527** or file a dispute.'
  }

  // Order status / my order
  if (matchAny(q, [/order.*(status|where|track|update)|my order|order number|order id|where'?s my/])) {
    ctx.lastTopic = 'order'
    ctx.mentionedOrder = true
    return '**Check your order status:**\n\n' +
      '1. Sign in and go to **Dashboard**\n' +
      '2. Your orders and listings are listed there\n' +
      '3. Click on an order to see details and tracking\n\n' +
      'If you need help with a specific order, have your **order ID** ready and:\n' +
      '• Call **(877) 837-0527**\n' +
      '• Email **info@thefranksstandard.com** with the order ID\n\n' +
      'For urgent issues, include photos in your email.'
  }

  // Account / login / register / sign up / password
  if (matchAny(q, [/account|sign up|register|login|log in|sign in|password|reset|can'?t (log|sign)|locked out|create.*(account|profile)/])) {
    ctx.lastTopic = 'account'
    return '**Account Help:**\n\n' +
      '• **New here?** Click "Join Free" in the header to create your account\n' +
      '• **Can\'t sign in?** Check your email and password, then try resetting\n' +
      '• **Email not confirmed?** Check spam/junk folder for the confirmation email from The Franks Standard\n' +
      '• **Locked out?** Email info@thefranksstandard.com from your account email\n\n' +
      'Don\'t create duplicate accounts — this can trigger security flags. ' +
      'Call **(877) 837-0527** if you\'re stuck.'
  }

  // Banned / suspended
  if (matchAny(q, [/banned|suspend|restricted|account.*(closed|disabled|removed)|can'?t access/])) {
    ctx.lastTopic = 'banned'
    return '**Account restriction or ban:**\n\n' +
      'Account decisions are handled by the team, not this assistant.\n\n' +
      '• Email **info@thefranksstandard.com** from your account email address\n' +
      '• Include what you see when you try to sign in\n' +
      '• Do NOT create a new account (this will make it worse)\n\n' +
      'Bans for proven counterfeits are permanent. Other restrictions may be reviewed. ' +
      'Call **(877) 837-0527** for a status update.'
  }

  // Dispute / complaint / problem with order
  if (matchAny(q, [/dispute|complaint|problem.*(order|item|seller|buyer)|issue with|disagree|mediat/])) {
    ctx.lastTopic = 'dispute'
    return '**Filing a Dispute:**\n\n' +
      '1. **Gather evidence** — photos, screenshots, messages\n' +
      '2. **Contact the other party** first via the listing page\n' +
      '3. **Try a Video call** — sometimes face-to-face resolves things faster\n' +
      '4. **Formal dispute** — email info@thefranksstandard.com with:\n' +
      '   - Order ID\n   - Photos of the issue\n   - What resolution you want\n\n' +
      'A small mediation fee applies for escalated reviews (see Pay & Fees).\n' +
      'Call **(877) 837-0527** for urgent disputes.'
  }

  // Video / Jitsi / meet / call buyer/seller
  if (matchAny(q, [/video|jitsi|meet|face.?to.?face|camera|video call/])) {
    ctx.lastTopic = 'video'
    return '**Video Calls on The Franks Standard:**\n\n' +
      'Use our built-in video rooms for face-to-face conversations with buyers or sellers.\n\n' +
      '1. Go to **Video** in the navigation\n' +
      '2. Create or join a room\n' +
      '3. Share the room link with the other person\n' +
      '4. Allow camera and microphone access when prompted\n\n' +
      'No app install needed — works directly in Chrome, Firefox, Edge, or Safari. ' +
      'Great for verifying item condition, negotiating, or resolving disputes face-to-face.'
  }

  // Categories / what can I sell / what items
  if (matchAny(q, [/categor|what.*(sell|buy|list|items|types)|which items|can i sell|allowed|what kind/])) {
    ctx.lastTopic = 'categories'
    return '**What you can buy and sell:**\n\n' +
      `${categoryListForAi()}\n\n` +
      '• 🔧 Firearms Accessories: no ATF-reportable items\n\n' +
      'Everything requires a COA or signed guarantee. ' +
      'See **Prohibited Items** in the footer for what\'s not allowed.\n\n' +
      'Visit **Categories** for the full breakdown.'
  }

  // Prohibited items
  if (matchAny(q, [/prohibited|banned items|not allowed|can'?t sell|forbidden|restricted items|illegal/])) {
    ctx.lastTopic = 'prohibited'
    return '**Prohibited items** are listed on the Prohibited Items page (link in the footer).\n\n' +
      'Generally not allowed: ATF-reportable firearms, drugs/controlled substances, ' +
      'stolen goods, counterfeits (obviously), hazardous materials, and items that violate any law.\n\n' +
      'If you\'re unsure about a specific item, email info@thefranksstandard.com before listing it.'
  }

  // Website / tech issues / blank / error
  if (matchAny(q, [/blank|white screen|crash|frozen|not loading|error|404|stuck|bug|glitch|broken|won'?t load|page.*not/])) {
    ctx.lastTopic = 'tech'
    return '**Technical Issues:**\n\n' +
      '**Quick fixes:**\n' +
      '1. Hard refresh: **Ctrl+Shift+R** (or Cmd+Shift+R on Mac)\n' +
      '2. Try a different browser (Chrome works best)\n' +
      '3. Disable ad blockers for thefranksstandard.com\n' +
      '4. Clear browser cookies and cache\n\n' +
      '**Still broken?**\n' +
      '• Note your browser, device, and what you were doing\n' +
      '• Take a screenshot of the error\n' +
      '• Email **info@thefranksstandard.com** with these details\n' +
      '• Or call **(877) 837-0527**'
  }

  // Compare / why us / other marketplaces
  if (matchAny(q, [/compare|better than|why (this|you|here)|different|advantage|vs |versus|other marketplace|another platform/])) {
    ctx.lastTopic = 'compare'
    return '**Why The Franks Standard vs. other marketplaces:**\n\n' +
      '| Feature | Us | Typical marketplace |\n' +
      '|---------|-----|---------------------|\n' +
      '| Authenticity | Required (COA/guarantee) | Optional |\n' +
      '| Fakes policy | Permanent ban | Strike system |\n' +
      '| Video calls | Built in | Not available |\n' +
      '| Focus | Collectors & authenticity | Everything |\n\n' +
      'Visit **Compare** in the Explore menu for the full side-by-side breakdown.'
  }

  // Operator / ops / owner / hidden panel
  if (matchAny(q, [/operator|ops|owner|hidden|panel|unlock|admin|toolkit|5.?tap|five tap|secret/])) {
    ctx.lastTopic = 'ops'
    return '**Owner Toolkit (Operator Console):**\n\n' +
      'The operator console is for site owners only.\n\n' +
      'To access: On the **homepage**, tap the **logo and site name** five times quickly, ' +
      'then enter your access key (same as `NUXT_PUBLIC_OPS_ACCESS_KEY` in your build).\n\n' +
      'Owner Mode gives you: free seller access, all fees waived, priority features, and admin tools.\n\n' +
      '**Dev shortcut:** Add `?ops=unlock` to any URL in development mode.'
  }

  // Escrow / buyer protection
  if (matchAny(q, [/escrow|buyer protect|hold|secure|safe to buy|trustworthy|protection/])) {
    ctx.lastTopic = 'escrow'
    return '**Buyer Protection & Escrow:**\n\n' +
      'The Franks Standard uses an escrow-style system:\n\n' +
      '1. **Buyer pays** — funds are held securely via Stripe\n' +
      '2. **Seller ships** — item is sent with tracking\n' +
      '3. **Buyer confirms** — inspects the item and confirms it matches the listing\n' +
      '4. **Funds release** — seller gets paid after confirmation\n\n' +
      'If the item doesn\'t match, you can dispute before confirming. ' +
      'See **How It Works** for the full flow.'
  }

  // How does it work / how it works
  if (matchAny(q, [/how.*(work|does it|this work)|explain|walk me through|process|step.?by.?step|getting started/])) {
    ctx.lastTopic = 'howto'
    return '**How The Franks Standard works:**\n\n' +
      '1. **Create a free account** — buyer, seller, or both\n' +
      '2. **Sellers list with proof** — COA upload or sign our guarantee\n' +
      '3. **Buyers browse and buy** — see authenticity proof before purchasing\n' +
      '4. **Secure payment** — Stripe handles the transaction\n' +
      '5. **Escrow hold** — funds stay safe until buyer confirms receipt\n' +
      '6. **Zero tolerance** — proven fakes = permanent ban + full refund\n\n' +
      'Visit **How It Works** in the menu for the detailed play-by-play.'
  }

  // Goodbye
  if (matchAny(q, [/^(bye|goodbye|see ya|later|done|that'?s all|nothing else|no more|i'?m good)/])) {
    return 'Thanks for using The Franks Standard! If you need anything else:\n\n' +
      '• Call **(877) 837-0527** anytime\n' +
      '• Email **info@thefranksstandard.com**\n' +
      '• Use the **Help** button on any page\n\n' +
      'Have a great day! 👋'
  }

  // App download
  if (matchAny(q, [/app|download|install|android|windows|mobile|apk|exe|play store|google play/])) {
    ctx.lastTopic = 'app'
    return '**Download The Franks Standard app:**\n\n' +
      'Go to **thefranksstandard.com/download** (or tap **Download app** in the menu).\n\n' +
      '**Android:** download the APK, open it, and allow install from this source if prompted.\n\n' +
      '**Windows:** download the installer and run it on Windows 10 or 11.\n\n' +
      'Sign in with the same account you use on the website.'
  }

  // Catch-all with intelligent follow-up
  ctx.lastTopic = 'unknown'
  return 'I want to make sure I help you with the right thing. Could you tell me more about what you need?\n\n' +
    'Here are some things I can help with:\n\n' +
    '• **"How do I sell?"** — listing and selling guide\n' +
    '• **"Fees"** — pricing and payment info\n' +
    '• **"My order"** — order status and tracking\n' +
    '• **"Return"** — refunds and returns\n' +
    '• **"Report fraud"** — counterfeit or scam report\n' +
    '• **"Phone"** — our customer service number\n\n' +
    'Or call **(877) 837-0527** to speak with someone directly.'
}
