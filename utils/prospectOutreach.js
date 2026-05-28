import { SELLER_INQUIRY_EMAIL } from '~/utils/inquiryMailto'

export function buildProspectOutreachMailto (prospect, siteOrigin = 'https://thefranksstandard.com') {
  const name = prospect?.username || 'there'
  const subject = encodeURIComponent(`Sell on The Franks Standard — lower fees, escrow, COA standard`)
  const body = [
    `Hi ${name},`,
    '',
    `I noticed your eBay store (${prospect?.store_url || 'your listings'}) and thought you might be a fit for The Franks Standard — an authenticity-first marketplace for collectibles.`,
    '',
    `What we offer sellers:`,
    `- COA or signed in-platform guarantee on every listing`,
    `- Stripe escrow (buyers confirm receipt before payout)`,
    `- Sale fees from 4% (vs typical ~13% on large marketplaces)`,
    `- Import tool: bring listings from eBay via CSV or saved page`,
    '',
    `List free to start: ${siteOrigin}/sell`,
    `Seller program: ${siteOrigin}/sellers`,
    '',
    `Questions? Call (877) 837-0527 or reply here.`,
    '',
    `— Charles Franks`,
    `The Franks Standard`,
    siteOrigin,
  ].join('\n')
  return `mailto:${SELLER_INQUIRY_EMAIL}?bcc=&subject=${subject}&body=${encodeURIComponent(body)}`
}
