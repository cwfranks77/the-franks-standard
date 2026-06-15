/** Quick checks on a saved eBay HTML file (for owner-facing upload feedback). */
export function diagnoseEbaySavedHtml (html) {
  const text = String(html || '')
  const len = text.length
  const hasSItem = /\bs-item\b/i.test(text)
  const hasSCard = /\bs-card\b/i.test(text)
  const hasUsr = /ebay\.com\/usr\//i.test(text)
  const hasItm = /\/itm\/\d{10,}/i.test(text)
  const hasSsn = /[?&]_ssn=/i.test(text)
  const itemIds = new Set([...text.matchAll(/\/itm\/(\d{10,})/gi)].map((m) => m[1]))
  const usrNames = new Set([...text.matchAll(/ebay\.com\/usr\/([A-Za-z0-9._-]{2,64})/gi)].map((m) => m[1]))

  let likelyEmptySave = false
  let hint = ''

  if (len < 8000 && !hasSItem && !hasSCard && itemIds.size < 2) {
    likelyEmptySave = true
    hint =
      'This file looks too small — eBay probably did not include listings in the save. ' +
      'On eBay: scroll until you see many items, wait 5 seconds, then Ctrl+S again. ' +
      'Try "Webpage, Complete" if "HTML only" still fails.'
  } else if (len > 0 && !hasUsr && itemIds.size > 0 && usrNames.size === 0) {
    hint =
      'Listings were found but seller names may be hidden on this eBay page design. ' +
      'Try a normal search results page (not a single store), or save again after scrolling.'
  }

  return {
    bytes: len,
    hasSItem,
    hasSCard,
    hasUsr,
    hasItm,
    hasSsn,
    itemCount: itemIds.size,
    usrCount: usrNames.size,
    likelyEmptySave,
    hint,
  }
}
