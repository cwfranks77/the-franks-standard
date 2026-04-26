/**
 * Rule-based assistant for static hosting (no API keys in the browser).
 * Replace with a server route or hosted widget when you add a backend.
 */
export function getAiReply (message: string): string {
  const q = message.toLowerCase().trim()
  if (!q) {
    return 'Ask me about fees, payments, COA, disputes, video, or tech issues. For human help, open **Support** in the menu. I am a beta assistant for the most common paths.'
  }
  if (/(support|help desk|human|ticket|contact team|email)/.test(q)) {
    return 'Open **Support** in the header for customer vs tech lanes, quick links, and when to email. For anything sensitive, use **Contact** or mail **info@thefranksstandard.com** with order ID and photos.'
  }
  if (/(blank|white screen|crash|frozen|not loading|error page|404|stuck)/.test(q)) {
    return 'Try a hard refresh (Ctrl+Shift+R), another browser, and relax strict blockers for this site. If **Video** or checkout fails, note your browser and device and email **info@thefranksstandard.com** with a screenshot. Details are on **Support**.'
  }
  if (/(payment failed|card declined|checkout|stripe failed)/.test(q)) {
    return 'Checkout uses Stripe Payment Links on **Pay & fees**. We do not store your full card on this static site. Retry the link, check with your bank, then email **info@thefranksstandard.com** with the time you tried and which link.'
  }
  if (/(locked|banned|cannot log|cant log|suspended)/.test(q)) {
    return 'Account and moderation decisions need a human. Email **info@thefranksstandard.com** from the address on the account if possible, describe what you see on sign-in, and avoid creating duplicate accounts until support replies.'
  }
  if (/(fee|fees|cost|price|charge|payment|pay|stripe|card)/.test(q)) {
    return 'Seller and buyer fees are paid through our Payments page. Open **Pay & fees** in the menu. You will use secure Stripe checkout links (we do not store your full card number on this site). Set up your own Payment Links in Stripe and paste the URLs into your `.env` as `NUXT_PUBLIC_PAY_*` variables, then rebuild.'
  }
  if (/(refund|money back|return)/.test(q)) {
    return 'Eligible items follow the escrow and buyer-confirmation flow described in **How it works**. If something arrives not as described, use **Message** on the order and we prioritize proof (photos, COA). Disputes are reviewed with the listing terms and the Standard’s fraud policy.'
  }
  if (/(coa|authentic|fake|real|certificate)/.test(q)) {
    return 'Every public listing on The Franks Standard requires a COA or a signed in-platform guarantee. Fakes are not a “second chance” here — they are a permanent ban. Upload COA in the sell flow; buyers see it before money releases.'
  }
  if (/(fraud|scam|stolen|report)/.test(q)) {
    return 'Report through **Contact** with order ID and photos. The Standard has a zero-tolerance policy for counterfeits and will remove sellers who break trust.'
  }
  if (/(voice|speak|talk to someone|phone|call me|human on phone)/.test(q)) {
    return 'For **live voice** with another person, open **Video** (Jitsi) in the header — it is mic and camera in the browser, no app install. For **email**, use **info@thefranksstandard.com** from **Contact** or **Support**. This assistant is text-first; use the mic button in Help to dictate your question if your browser supports it.'
  }
  if (/(video|call|meet|jitsi)/.test(q)) {
    return 'Open **Video** in the header to start a Jitsi room, then share the link with your buyer or seller. Both of you use the same room. Allow camera and microphone in the browser when asked.'
  }
  if (/(backdoor|ops|operator|panel|unlock|phrase|password)/.test(q)) {
    return 'The operator area is for site owners. On the **home** page, tap the **logo and site name** five times quickly, then enter the same value as `NUXT_PUBLIC_OPS_ACCESS_KEY` in your build. If you **lost the phrase**, set a **new** value in `.env` and the GitHub secret, then **rebuild and deploy**; there is no secret recovery through chat.'
  }
  if (/(account|sign up|register|login|password)/.test(q)) {
    return 'Use **Join Free** or **Sign In** in the header. Your dashboard shows listings and orders. Password reset and email are wired up when you connect the auth backend (e.g. Supabase).'
  }
  if (/(hello|hi|hey|thanks|thank you)/.test(q)) {
    return 'Thanks for being on The Franks Standard. I am here to help with fees, orders, and policies. What do you need?'
  }
  return 'I do not have a specific answer for that yet. Try **Support** or **Contact** in the menu, or rephrase (for example: fees, refund, COA, video, blank page). A human process will grow as we do.'
}
