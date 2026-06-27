import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'

export type FranksWpProfile = {
  STRICT_RULE: string
  SYSTEM_GUARD: string
  wordpress_deployment_profile: {
    site_name: string
    business_type: string
    location_target: string
    state_sales_tax_rate: string
    primary_collection_modules: string[]
    automated_seo_meta_tags: {
      homepage_title: string
      meta_description: string
    }
  }
}

const CONFIG_CANDIDATES = [
  resolve(process.cwd(), 'server/franksWpConfig.json'),
  resolve(process.cwd(), '../server/franksWpConfig.json'),
  resolve(process.cwd(), 'franks-standard/server/franksWpConfig.json'),
]

let cached: FranksWpProfile | null = null

export function loadFranksWpConfig (): FranksWpProfile | null {
  if (cached) return cached
  for (const path of CONFIG_CANDIDATES) {
    if (!existsSync(path)) continue
    try {
      cached = JSON.parse(readFileSync(path, 'utf8')) as FranksWpProfile
      return cached
    } catch {
      return null
    }
  }
  return null
}

/** Public fields safe for browser — never expose SYSTEM_GUARD internals to B&C routes. */
export function getFranksWpPublicProfile () {
  const raw = loadFranksWpConfig()
  if (!raw?.wordpress_deployment_profile) return null
  const p = raw.wordpress_deployment_profile
  return {
    siteName: p.site_name,
    businessType: p.business_type,
    locationTarget: p.location_target,
    stateSalesTaxRate: p.state_sales_tax_rate,
    collectionModules: p.primary_collection_modules || [],
    seo: {
      title: p.automated_seo_meta_tags?.homepage_title || '',
      description: p.automated_seo_meta_tags?.meta_description || '',
    },
  }
}
