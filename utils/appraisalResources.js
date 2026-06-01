/**
 * Curated live links — grading services, comp research, and accredited appraiser finders.
 * Not legal appraisals unless you hire a licensed professional.
 */

export const APPRAISAL_DISCLAIMER =
  'These links are starting points for research. A formal appraisal for insurance, estate, or court may require an in-person inspection and a fee. The Franks Standard does not employ these firms.'

export const APPRAISAL_SECTIONS = [
  {
    id: 'find-appraiser',
    title: 'Find a credentialed appraiser',
    description: 'Use official member directories to locate ASA-, ISA-, or specialty-credentialed appraisers near you.',
    links: [
      {
        name: 'American Society of Appraisers — Find an appraiser',
        url: 'https://www.appraisers.org/find-an-appraiser',
        note: 'Personal property, antiques, business valuation',
      },
      {
        name: 'International Society of Appraisers — Find an expert',
        url: 'https://www.isa-appraisers.org/find-an-appraiser',
        note: 'Fine art, residential contents, collectibles',
      },
      {
        name: 'Appraisers Association of America — Directory',
        url: 'https://www.appraisersassociation.org/index.cfm?fuseaction=Page.viewPage&pageId=471',
        note: 'Fine and decorative arts specialists',
      },
      {
        name: 'NAJA — Find a jeweler / gemologist',
        url: 'https://www.accreditedgemologists.org/find-a-jeweler',
        note: 'Jewelry, watches, gemstones',
      },
    ],
  },
  {
    id: 'grading',
    title: 'Authentication & grading (cards, coins, comics)',
    description: 'Third-party grading establishes condition and authenticity before you list high-value items.',
    links: [
      {
        name: 'PSA — Submit cards for grading',
        url: 'https://www.psacard.com/info/submit-grading',
        note: 'Trading cards',
      },
      {
        name: 'Beckett — Grading services',
        url: 'https://www.beckett.com/grading/',
        note: 'Cards and memorabilia',
      },
      {
        name: 'PCGS — Coin grading',
        url: 'https://www.pcgs.com/info/submission',
        note: 'U.S. and world coins',
      },
      {
        name: 'CGC — Comics & collectibles',
        url: 'https://www.cgccomics.com/submit/',
        note: 'Comics, magazines, related collectibles',
      },
    ],
  },
  {
    id: 'comps',
    title: 'Sold-price research (comps)',
    description: 'Compare what similar items actually sold for — not just asking prices.',
    links: [
      {
        name: 'eBay — Sold listings search',
        url: 'https://www.ebay.com/sch/i.html?_from=R40&_nkw=&_sacat=0&LH_Sold=1&LH_Complete=1',
        note: 'Broad C2C sold history',
      },
      {
        name: 'Heritage Auctions — Prices realized',
        url: 'https://coins.ha.com/c/search-results.zx',
        note: 'Auction hammer prices',
      },
      {
        name: 'WorthPoint — Price guide',
        url: 'https://www.worthpoint.com/',
        note: 'Antiques & collectibles archive (subscription)',
      },
      {
        name: 'TCGplayer — Market pricing',
        url: 'https://www.tcgplayer.com/',
        note: 'Trading card games',
      },
      {
        name: 'Reverb — Instrument price guide',
        url: 'https://reverb.com/price-guide',
        note: 'Guitars, amps, gear',
      },
      {
        name: 'Chrono24 — Watch market',
        url: 'https://www.chrono24.com/',
        note: 'Luxury watches',
      },
      {
        name: 'StockX — Sneaker/streetwear comps',
        url: 'https://stockx.com/',
        note: 'Sneakers and streetwear',
      },
    ],
  },
  {
    id: 'consign',
    title: 'Major auction houses (consign / estimate)',
    description: 'High-value pieces may be better sold through established auction channels.',
    links: [
      {
        name: 'Heritage Auctions — Consign',
        url: 'https://www.ha.com/consign/',
      },
      {
        name: 'Sotheby\'s — Sell',
        url: 'https://www.sothebys.com/en/sell',
      },
      {
        name: 'Christie\'s — Sell',
        url: 'https://www.christies.com/selling-services',
      },
    ],
  },
]
