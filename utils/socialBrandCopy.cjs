/** Shared social profile + post copy for The Franks Standard (not ZFuel / Zentra). */

const SITE = 'https://thefranksstandard.com'

const X_PROFILE = {
  name: 'The Franks Standard',
  description:
    'Proof-first collectibles marketplace. COA/guarantee · escrow · 4–5% fees · AI store + dropship · eBay import. thefranksstandard.com',
  url: SITE,
  location: 'United States',
}

const PLATFORM_BLURB = `The Franks Standard — authenticity-first marketplace for collectibles & gear.

✓ COA or signed guarantee on every listing
✓ Stripe escrow — buyer confirms before payout
✓ Sale fees 4–5% by plan (3% launch) vs typical 13%+
✓ AI Store Builder + full AI dropship setup wizard
✓ Import from eBay (Seller Hub CSV)
✓ Auctions, Buy It Now, video rooms, seller reviews
✓ Dropship automation (your supplier, optional API)
✓ Founding sellers: FOUNDERS10 · Military/first responders: HONOR26

thefranksstandard.com/sell · /browse · /pricing`

function xTweetShort (uniq = '') {
  const tail = uniq ? ` ·${uniq}` : ''
  const base =
    'The Franks Standard: COA on every listing, escrow checkout, 4–5% fees, AI store + dropship setup, eBay CSV import, video rooms. Sell: thefranksstandard.com/sell'
  const tags = ' #TheFranksStandard #Collectibles #COA'
  const max = 280 - tail.length
  let text = base + tags
  if (text.length > max) text = base.slice(0, max - tags.length - 3) + '...' + tags
  return text + tail
}

const FACEBOOK_POST = `${PLATFORM_BLURB}

Join free: ${SITE}/auth/register
Sell: ${SITE}/sell
Dropship AI setup: ${SITE}/sell/dropship-setup?ai=1
Import eBay: ${SITE}/sell/import`

const INSTAGRAM_CAPTION = `ZERO tolerance for fakes on The Franks Standard 🏛️

Every listing needs a COA or signed guarantee. Escrow checkout. 4–5% sale fees by plan.

NEW: AI dropship setup · eBay CSV import · auctions · seller reviews · video rooms.

Link in bio 👆 ${SITE}

#TheFranksStandard #COARequired #Collectibles #SportsCards #Dropship #AuthenticOnly`

const TELEGRAM_POST = PLATFORM_BLURB

module.exports = {
  SITE,
  X_PROFILE,
  PLATFORM_BLURB,
  xTweetShort,
  FACEBOOK_POST,
  INSTAGRAM_CAPTION,
  TELEGRAM_POST,
}
