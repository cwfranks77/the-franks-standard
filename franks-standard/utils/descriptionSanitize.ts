import { categoryRequiresCoa, listingRequiresCoa } from '~/utils/marketplaceCategories'

/** Platform boilerplate we inject into store builder — strip unless seller chose a collectible category. */
const PLATFORM_COA_SNIPPETS: RegExp[] = [
  /collectible listings include seller-provided coa[^.]*\./gi,
  /seller-provided coa or our signed guarantee template[^.]*\./gi,
  /\(seller backs the item;\s*the franks standard facilitates the marketplace\)\.?/gi,
  /seller-backed proof on collectibles\.?/gi,
  /seller proof on collectibles\.?/gi,
  /proof-backed,?\s*/gi,
  /authenticity-forward,?\s*/gi,
  /document supplier coas before listing dropship skus/gi,
  /vet suppliers, get coas before listing/gi,
  /get coas before listing/gi,
  /^authenticity:\s*\[coa[^\n]*\n*/gim,
  /^authenticity:\s*\[coa[^\n]*\n*/gim,
  /\bfranks standard guarantee\b/gi,
  /\bcertificate of authenticity\b/gi,
  /\bproof of authenticity included\b/gi,
  /\bcoa included\b/gi,
  /\b—\s*coa\b/gi,
  /\bcoa\b/gi,
  /\bauthenticated with coa\b/gi,
  /\bverified seller\b/gi,
]

const VOICE_COA_PHRASES: Record<string, string> = {
  'trusted, proof-backed, and straightforward': 'trusted and straightforward',
  'curated, premium, and authenticity-forward': 'curated, premium, and quality-focused',
  'serious-grade, documented, and collector-first': 'detail-oriented, documented, and product-first',
}

export function stripPlatformCoaLanguage (text: string): string {
  let out = text
  for (const re of PLATFORM_COA_SNIPPETS) {
    out = out.replace(re, '')
  }
  for (const [from, to] of Object.entries(VOICE_COA_PHRASES)) {
    out = out.replace(new RegExp(from.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi'), to)
  }
  return out
    .replace(/\s{2,}/g, ' ')
    .replace(/\s+([,.;])/g, '$1')
    .replace(/\.\s*\./g, '.')
    .replace(/\s+—\s+—/g, ' — ')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

export function sanitizeStoreOrListingText (
  text: string,
  category: string | null | undefined,
  title?: string | null,
): string {
  if (!text?.trim()) return text
  const needsCoa = listingRequiresCoa(category, title, text)
  if (needsCoa) return text.trim()
  return stripPlatformCoaLanguage(text)
}

export function sanitizeListingFields (
  category: string | null | undefined,
  title: string,
  description: string,
): { title: string; description: string } {
  if (listingRequiresCoa(category, title, description)) {
    return { title: title.trim(), description: description.trim() }
  }
  return {
    title: stripPlatformCoaLanguage(title),
    description: stripPlatformCoaLanguage(description),
  }
}

export function storeCopyUsesCoa (category: string | null | undefined): boolean {
  return categoryRequiresCoa(category)
}
