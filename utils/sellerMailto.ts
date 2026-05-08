export function buildSellerApplicationMailto (): string {
  const subject = encodeURIComponent('Seller / store application \u2014 The Franks Standard')
  const body = encodeURIComponent(
    'Hello,\n\nI would like to apply to sell on The Franks Standard.\n\n' +
    'Store / brand name:\nInventory categories:\nWebsite or social (optional):\n\n' +
    'Thank you'
  )
  return `mailto:info@thefranksstandard.com?subject=${subject}&body=${body}`
}
