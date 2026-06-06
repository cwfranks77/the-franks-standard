import { BC_BRAND } from '~/utils/bcBrand.js'
import { BC_SUPPORT_DEFAULTS } from '~/utils/bcSupport.js'

/** Niche keywords for meta tags and product page copy (Louisiana car audio / competition). */
export const BC_SEO_KEYWORDS = [
  'B&C Performance Audio',
  'B&C Performance Audio LLC',
  'competition car audio',
  'competition subwoofers',
  'car audio amplifiers',
  'monoblock amplifier',
  'Sundown Audio',
  'Kicker SoloBaric',
  'Rockford Fosgate',
  'Taramps amplifier',
  'car subwoofer Louisiana',
  'spl car audio',
  'bass head subwoofers',
  'car audio megastore',
].join(', ')

export const BC_LEGAL_NAME = 'B&C Performance Audio LLC'

export function bcProductSeoTitle (productName) {
  return `${productName} | ${BC_LEGAL_NAME}`
}

export function bcStoreJsonLd (siteUrl, products = [], phoneTel = BC_SUPPORT_DEFAULTS.phoneTel) {
  const base = String(siteUrl || 'https://www.bcpoweraudio.com').replace(/\/$/, '')
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        name: BC_LEGAL_NAME,
        alternateName: BC_BRAND.full,
        url: `${base}/bc-audio`,
        logo: `${base}/franks-pavilion.png`,
        contactPoint: {
          '@type': 'ContactPoint',
          telephone: phoneTel,
          contactType: 'customer service',
          areaServed: 'US',
        },
      },
      {
        '@type': 'Store',
        name: BC_BRAND.full,
        description: 'Competition-grade car audio — subwoofers, amplifiers, and home audio.',
        url: `${base}/bc-audio`,
        priceRange: '$$',
      },
      {
        '@type': 'ItemList',
        itemListElement: products.slice(0, 50).map((p, i) => ({
          '@type': 'ListItem',
          position: i + 1,
          url: `${base}/bc-audio/product/${encodeURIComponent(p.id)}`,
          name: p.name,
        })),
      },
    ],
  }
}

export function bcProductJsonLd (siteUrl, product) {
  const base = String(siteUrl || 'https://www.bcpoweraudio.com').replace(/\/$/, '')
  const price = Number(product.retailPrice ?? product.price ?? 0)
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.tagline || product.description || '',
    image: product.image?.startsWith('http') ? product.image : `${base}${product.image || ''}`,
    brand: { '@type': 'Brand', name: product.brand || product.category || BC_BRAND.short },
    offers: {
      '@type': 'Offer',
      priceCurrency: 'USD',
      price: price > 0 ? price.toFixed(2) : undefined,
      availability: 'https://schema.org/InStock',
      url: `${base}/bc-audio/product/${encodeURIComponent(product.id)}`,
    },
  }
}
