export type EbayPreviewItem = {
  external_id: string
  title: string
  price: number | null
  image_url: string | null
  item_url: string | null
}

function parsePrice (raw: string): number | null {
  const m = raw.replace(/,/g, '').match(/[\d.]+/)
  if (!m) return null
  const n = Number.parseFloat(m[0])
  return Number.isFinite(n) && n > 0 ? n : null
}

/** Best-effort parse of eBay seller search HTML (public store / _ssn= pages). */
export function parseEbaySellerHtml (html: string, limit = 48): EbayPreviewItem[] {
  const items: EbayPreviewItem[] = []
  const seen = new Set<string>()

  const cardRe = /<li[^>]*class="[^"]*s-item[^"]*"[^>]*>([\s\S]*?)<\/li>/gi
  let card: RegExpExecArray | null
  while ((card = cardRe.exec(html)) !== null && items.length < limit) {
    const block = card[1]
    if (/s-item__placholder|s-item__sep|Shop on eBay/i.test(block)) continue

    const idMatch =
      block.match(/\/itm\/(\d{8,})/i) ||
      block.match(/item=(\d{8,})/i) ||
      block.match(/data-view="mi:(\d{8,})"/i)
    if (!idMatch) continue
    const external_id = idMatch[1]
    if (seen.has(external_id)) continue

    const titleMatch =
      block.match(/class="[^"]*s-item__title[^"]*"[^>]*>[\s\S]*?<[^>]+>([^<]+)</i) ||
      block.match(/role="heading"[^>]*>([^<]+)</i)
    const title = (titleMatch?.[1] || '').replace(/\s+/g, ' ').trim()
    if (!title || /^shop on ebay/i.test(title)) continue

    const priceMatch = block.match(/s-item__price[^>]*>([^<]+)</i)
    const price = priceMatch ? parsePrice(priceMatch[1]) : null

    const imgMatch =
      block.match(/src="(https:\/\/i\.ebayimg\.com[^"]+)"/i) ||
      block.match(/data-src="(https:\/\/i\.ebayimg\.com[^"]+)"/i)
    const image_url = imgMatch?.[1] || null

    const linkMatch = block.match(/href="(https:\/\/www\.ebay\.com\/itm\/[^"]+)"/i)
    const item_url = linkMatch?.[1]?.split('?')[0] || `https://www.ebay.com/itm/${external_id}`

    seen.add(external_id)
    items.push({ external_id, title, price, image_url, item_url })
  }

  if (items.length > 0) return items

  const idRe = /\/itm\/(\d{10,})/g
  let m: RegExpExecArray | null
  while ((m = idRe.exec(html)) !== null && items.length < limit) {
    const external_id = m[1]
    if (seen.has(external_id)) continue
    seen.add(external_id)
    items.push({
      external_id,
      title: `eBay item ${external_id}`,
      price: null,
      image_url: null,
      item_url: `https://www.ebay.com/itm/${external_id}`,
    })
  }

  return items
}
