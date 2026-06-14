/** Best-effort parse of eBay seller store/search HTML (saved page in browser). */

import { diagnoseEbaySavedHtml } from '~/utils/ebayHtmlDiagnostics.js'

function parsePrice (raw) {
  const m = String(raw).replace(/,/g, '').match(/[\d.]+/)
  if (!m) return null
  const n = Number.parseFloat(m[0])
  return Number.isFinite(n) && n > 0 ? n : null
}

function ingestItemBlock (block, items, seen, limit) {
  if (/s-item__placholder|s-item__sep|Shop on eBay/i.test(block)) return

  const idMatch =
    block.match(/\/itm\/(\d{8,})/i) ||
    block.match(/item=(\d{8,})/i) ||
    block.match(/data-view="mi:(\d{8,})"/i) ||
    block.match(/"itemId"\s*:\s*"(\d{8,})"/i)
  if (!idMatch) return
  const external_id = idMatch[1]
  if (seen.has(external_id)) return

  const titleMatch =
    block.match(/class="[^"]*s-item__title[^"]*"[^>]*>[\s\S]*?<[^>]+>([^<]+)</i) ||
    block.match(/s-card__title[^>]*>([^<]+)</i) ||
    block.match(/role="heading"[^>]*>([^<]+)</i) ||
    block.match(/"title"\s*:\s*"([^"]{4,200})"/i)
  const title = (titleMatch?.[1] || '').replace(/\s+/g, ' ').trim()
  if (!title || /^shop on ebay/i.test(title)) return

  const priceMatch =
    block.match(/s-item__price[^>]*>([^<]+)</i) ||
    block.match(/s-card__price[^>]*>([^<]+)</i)
  const price = priceMatch ? parsePrice(priceMatch[1]) : null

  const imgMatch =
    block.match(/src="(https:\/\/i\.ebayimg\.com[^"]+)"/i) ||
    block.match(/data-src="(https:\/\/i\.ebayimg\.com[^"]+)"/i) ||
    block.match(/"imageUrl"\s*:\s*"(https:\/\/i\.ebayimg\.com[^"]+)"/i)
  const image_url = imgMatch?.[1]?.replace(/\\u002F/g, '/') || null

  const linkMatch = block.match(/href="(https:\/\/www\.ebay\.com\/itm\/[^"]+)"/i)
  const item_url = linkMatch?.[1]?.split('?')[0] || `https://www.ebay.com/itm/${external_id}`

  seen.add(external_id)
  items.push({ external_id, title, price, image_url, item_url })
}

export function parseEbaySellerHtml (html, limit = 48) {
  const text = String(html || '')
  const items = []
  const seen = new Set()

  const cardRe = /<li[^>]*class="[^"]*s-item[^"]*"[^>]*>([\s\S]*?)<\/li>/gi
  let card
  while ((card = cardRe.exec(text)) !== null && items.length < limit) {
    ingestItemBlock(card[1], items, seen, limit)
  }

  const cardDivRe = /<div[^>]*class="[^"]*s-card[^"]*s-item[^"]*"[^>]*>([\s\S]*?)<\/div>/gi
  while ((card = cardDivRe.exec(text)) !== null && items.length < limit) {
    ingestItemBlock(card[1], items, seen, limit)
  }

  if (items.length > 0) return items

  const idRe = /\/itm\/(\d{10,})/g
  let m
  while ((m = idRe.exec(text)) !== null && items.length < limit) {
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

export function parseEbaySellerHtmlWithDiagnostics (html, limit = 48) {
  const diag = diagnoseEbaySavedHtml(html)
  const items = parseEbaySellerHtml(html, limit)
  const hint =
    items.length > 0
      ? ''
      : diag.hint ||
        'No items in file. In Seller Hub download a CSV (best), or re-save eBay as Webpage, Complete.'
  return { items, diag, hint }
}
