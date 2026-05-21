/** Listing description generator (plain JS). */

export function generateListingDescription(input) {
  const title = (input.title || '').trim() || 'Item'
  const category = (input.category || '').trim() || 'collectibles'
  const condition = input.condition || ''
  const tone = input.tone || 'professional'
  const notes = (input.sellerNotes || '').trim()
  const coaType = input.coaType || ''
  const listingMode = input.listingMode || 'direct'

  const CONDITION = { new: 'New / Sealed', 'like-new': 'Like New', excellent: 'Excellent', good: 'Good', fair: 'Fair' }
  const OPENER = {
    professional: 'Offered with full transparency on The Franks Standard.',
    friendly: 'Happy to answer questions — message or start a Video call from this listing.',
    collector: 'Built for serious collectors who want proof before they buy.',
    luxury: 'Presented with careful attention to condition, provenance, and presentation.',
  }

  let priceStr = null
  if (input.price != null && input.price !== '') {
    const n = typeof input.price === 'number' ? input.price : parseFloat(String(input.price))
    if (Number.isFinite(n) && n > 0) {
      priceStr = n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 2 })
    }
  }

  const hook = category.toLowerCase()
  const conditionLabel = CONDITION[condition] || condition || 'As described'

  let auth = 'Authenticity: COA upload or signed Franks Standard guarantee required — add proof in the COA section below.'
  if (coaType === 'upload') auth = 'Authenticity: Certificate of Authenticity (COA) on file — uploaded with this listing.'
  if (coaType === 'guarantee') auth = 'Authenticity: Backed by The Franks Standard in-platform seller guarantee.'

  let ship = 'Shipping: Ships within 2 business days after escrow — insured and tracked when applicable.'
  if (listingMode === 'dropship') {
    ship = 'Shipping: Dropship — supplier ships direct to buyer.'
    if (input.shipTime) ship += ' Estimated handling: ' + input.shipTime + '.'
    if (input.shipsFrom) ship += ' Ships from: ' + input.shipsFrom + '.'
  }

  const lines = [
    title,
    '',
    'Category: ' + category + '. This listing is for ' + hook + '. ' + (OPENER[tone] || OPENER.professional),
  ]
  if (priceStr) lines.push('Price: ' + priceStr + ' — message the seller for bundle offers.')
  lines.push('', 'Condition & details', '• Condition: ' + conditionLabel, '• Includes: Everything shown in photos unless noted.', '• Packaging: See photos for wear and completeness.')
  if (notes) {
    lines.push('', 'Seller notes')
    notes.split(/\n+/).forEach(function (line) {
      const t = line.trim()
      if (t) lines.push('• ' + t)
    })
  }
  lines.push('', auth, '', ship, '', 'Buyer protection: Escrow until you confirm the item matches this listing.', 'Listed on The Franks Standard — proof-first marketplace.')
  return lines.join('\n')
}

export function generateListingDescriptionAsync(input, delayMs) {
  if (delayMs === undefined) delayMs = 700
  return new Promise(function (resolve) {
    setTimeout(function () { resolve(generateListingDescription(input)) }, delayMs)
  })
}