/**
 * Campaign copy for organic + paid ads (Meta, export for Reddit/Google UI).
 */
const SITE = 'https://thefranksstandard.com'

const SECURITY_BODY = `Proof before publish — not "trust me bro."

✓ COA serial tied to ONE listing (verify at ${SITE}/verify/coa)
✓ Stripe escrow until you confirm delivery
✓ Sellers sign policies before listing — refunds, freeze, bans in writing
✓ Forced refund + account freeze when seller at fault refuses
✓ Listing scan blocks Venmo/PayPal in descriptions

Honest sellers get a real floor. Serious buyers get proof.

${SITE}/protection · Rules: ${SITE}/marketplace-policy`

const CAMPAIGNS = {
  default: {
    label: 'default',
    telegram: null, // use socialBrandCopy
    facebook: null,
    instagram: null,
    x: null,
    metaPaid: {
      name: 'Franks Standard — Traffic',
      headline: 'Proof-First Collectibles Marketplace',
      message: `COA required on every listing. Escrow checkout. 4–5% sale fees by plan. Import from eBay.`,
      link: `${SITE}/sell`,
      cta: 'SHOP_NOW',
    },
  },
  security: {
    label: 'security',
    telegram: `The Franks Standard — security stack live 🛡️

${SECURITY_BODY}

Sell: ${SITE}/sell
Browse: ${SITE}/browse`,
    facebook: `The Franks Standard — we published the enforcement rules.

${SECURITY_BODY}

👉 Start selling: ${SITE}/sell`,
    instagram: `Security is the product on The Franks Standard 🛡️

COA office serial · verify before pay · escrow · forced refund policy · seller signatures

Link in bio → ${SITE}/protection

#TheFranksStandard #TrustBothSides #COA #Escrow #Collectibles`,
    x: `New: proof-first marketplace with teeth — COA tied to listings, escrow, written enforcement (forced refund + freeze if seller refuses). Not anti-seller — anti-fake. ${SITE}/protection #TheFranksStandard`,
    metaPaid: {
      name: 'Franks — Security Stack',
      headline: 'Trust Both Sides — COA + Escrow',
      message: SECURITY_BODY.slice(0, 500),
      link: `${SITE}/protection`,
      cta: 'LEARN_MORE',
    },
    redditExport: {
      title: 'We built a collectibles marketplace with published enforcement (COA gate, escrow, freeze policy)',
      body: SECURITY_BODY,
      url: `${SITE}/protection?utm_source=reddit&utm_medium=paid&utm_campaign=security`,
    },
    googleExport: {
      headlines: ['COA Required On Every Listing', 'Stripe Escrow Checkout', '4–5% Sale Fees By Plan'],
      descriptions: [
        'Proof before publish. Verify COA serial. Written refund & freeze policy.',
        'Import from eBay. AI store builder. Zero tolerance for proven fakes.',
      ],
      finalUrl: `${SITE}/protection`,
    },
  },
  founders: {
    label: 'founders',
    metaPaid: {
      name: 'Franks — FOUNDERS10',
      headline: 'First 10 Sellers — 3 Months Pro Free',
      message: `Founding seller spots on The Franks Standard. COA required. Escrow. Code FOUNDERS10.`,
      link: `${SITE}/join/founders10`,
      cta: 'SIGN_UP',
    },
  },
  honor: {
    label: 'honor',
    metaPaid: {
      name: 'Franks — HONOR26',
      headline: 'Veterans & First Responders — 6 Months Pro',
      message: `HONOR26: 6 months Pro free for military & first responders. Proof-first marketplace.`,
      link: `${SITE}/honor`,
      cta: 'LEARN_MORE',
    },
  },
}

function getCampaign (key) {
  return CAMPAIGNS[key] || CAMPAIGNS.default
}

module.exports = { SITE, SECURITY_BODY, CAMPAIGNS, getCampaign }
