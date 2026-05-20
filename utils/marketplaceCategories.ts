/** Canonical listing / store categories — keep sell, browse, and store-builder in sync. */

export const LISTING_CATEGORIES = [
  'Sports Cards & Memorabilia',
  'Trading Card Games (Pokemon, MTG, etc.)',
  'Comics & Graphic Novels',
  'Autographs & Entertainment Memorabilia',
  'Musical Instruments',
  'Firearms Accessories',
  'Coins & Currency',
  'Art & Antiques',
  'Watches & Jewelry',
  'Sneakers & Streetwear',
  'Luxury Handbags & Fashion',
  'Vintage Electronics & Games',
  'Toys & Action Figures',
  'Books & Manuscripts',
  'Photography & Film Gear',
  'Tools & Workshop Equipment',
  'Home & Estate Collectibles',
  'Other (describe in listing)',
] as const

export type ListingCategory = (typeof LISTING_CATEGORIES)[number]

export const CATEGORY_CATALOG: { icon: string; name: ListingCategory; desc: string }[] = [
  { icon: '🏆', name: 'Sports Cards & Memorabilia', desc: 'Graded cards, signed jerseys, game-used gear' },
  { icon: '🃏', name: 'Trading Card Games (Pokemon, MTG, etc.)', desc: 'Sealed product, graded singles, tournament staples' },
  { icon: '📚', name: 'Comics & Graphic Novels', desc: 'Key issues, slabs, signed editions' },
  { icon: '✍️', name: 'Autographs & Entertainment Memorabilia', desc: 'Signed photos, props, concert and film collectibles' },
  { icon: '🎸', name: 'Musical Instruments', desc: 'Vintage guitars, amps, pro audio equipment' },
  { icon: '🔧', name: 'Firearms Accessories', desc: 'Parts, optics, triggers — no ATF-reportable items' },
  { icon: '🪙', name: 'Coins & Currency', desc: 'Rare coins, bullion, graded numismatics' },
  { icon: '🎨', name: 'Art & Antiques', desc: 'Original artwork, vintage collectibles, estate pieces' },
  { icon: '⌚', name: 'Watches & Jewelry', desc: 'Luxury watches, certified gems' },
  { icon: '👟', name: 'Sneakers & Streetwear', desc: 'Authenticated kicks, limited drops' },
  { icon: '👜', name: 'Luxury Handbags & Fashion', desc: 'Designer bags, apparel, accessories with proof' },
  { icon: '🎮', name: 'Vintage Electronics & Games', desc: 'Rare consoles, sealed software, retro tech' },
  { icon: '🧸', name: 'Toys & Action Figures', desc: 'Vintage toys, sealed boxes, graded figures' },
  { icon: '📖', name: 'Books & Manuscripts', desc: 'First editions, signed copies, ephemera' },
  { icon: '📷', name: 'Photography & Film Gear', desc: 'Cameras, lenses, cinema and studio equipment' },
  { icon: '🛠️', name: 'Tools & Workshop Equipment', desc: 'Pro tools, vintage machines, specialty gear' },
  { icon: '🏠', name: 'Home & Estate Collectibles', desc: 'Decor, glassware, estate finds with documentation' },
  { icon: '📦', name: 'Other (describe in listing)', desc: 'Specialty inventory — explain in your listing copy' },
]

export const STORE_CATEGORY_TAGLINES: Partial<Record<ListingCategory, string>> = {
  'Sports Cards & Memorabilia': 'Authenticated cards and memorabilia. Every piece has proof.',
  'Trading Card Games (Pokemon, MTG, etc.)': 'Verified TCG singles and sealed product. Play and collect with confidence.',
  'Comics & Graphic Novels': 'Key issues and slabs with provenance. Story-worthy inventory only.',
  'Autographs & Entertainment Memorabilia': 'Signed pieces and show memorabilia backed by proof.',
  'Musical Instruments': 'Verified instruments for serious musicians. Play with confidence.',
  'Firearms Accessories': 'Quality parts and optics. Every item as described.',
  'Coins & Currency': 'Graded coins and certified currency. Real value, real proof.',
  'Art & Antiques': 'Provenance-backed art and antiques. The real deal only.',
  'Watches & Jewelry': 'Certified timepieces and fine jewelry. Authenticity guaranteed.',
  'Sneakers & Streetwear': 'Authenticated kicks and drops. No fakes, no exceptions.',
  'Luxury Handbags & Fashion': 'Designer fashion with documentation. Wear and resell with proof.',
  'Vintage Electronics & Games': 'Verified retro tech and sealed games. Collector grade.',
  'Toys & Action Figures': 'Vintage and modern collectibles with clear condition notes.',
  'Books & Manuscripts': 'First editions and signed works. Bibliophile-grade listings.',
  'Photography & Film Gear': 'Working glass and bodies, honestly graded and described.',
  'Tools & Workshop Equipment': 'Pro-grade tools for makers who need the real thing.',
  'Home & Estate Collectibles': 'Estate pieces with story and proof where it matters.',
  'Other (describe in listing)': 'Specialty inventory with clear authenticity standards.',
}

export function categoryListForAi (): string {
  return CATEGORY_CATALOG.map((c) => `• ${c.icon} ${c.name}`).join('\n')
}
