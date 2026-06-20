import { readFile, readdir, stat } from 'node:fs/promises'
import { join, relative } from 'node:path'
import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)
const { getOrSet, DEFAULT_TTLS } = require('../../backend/cache/cache.js')
const { prepareHandlerContext } = require('../../backend/performance/response_optimizer.js')

const MARKETING_DIR = join(process.cwd(), 'marketing')

async function walkFiles (dir: string, base = dir): Promise<string[]> {
  const entries = await readdir(dir, { withFileTypes: true })
  const files: string[] = []
  for (const e of entries) {
    const full = join(dir, e.name)
    if (e.isDirectory()) {
      files.push(...await walkFiles(full, base))
    } else {
      files.push(relative(base, full).replace(/\\/g, '/'))
    }
  }
  return files
}

async function loadFile (relPath: string) {
  const content = await readFile(join(MARKETING_DIR, relPath), 'utf8')
  const s = await stat(join(MARKETING_DIR, relPath))
  return {
    path: `/marketing/${relPath}`,
    content,
    bytes: s.size,
    updated: s.mtime.toISOString(),
  }
}

/**
 * GET /api/marketing-content
 * GET /api/marketing-content?key=facebook_rebrand_package
 * GET /api/marketing-content?path=video_ads/ad_1_authenticity_push.md
 * GET /api/marketing-content?keys=seo_keywords,social_posts
 */
export default defineEventHandler(async (event) => {
  prepareHandlerContext(event, { cdnMaxAge: DEFAULT_TTLS.seo })

  const query = getQuery(event)
  const key = String(query.key ?? '').trim()
  const filePath = String(query.path ?? '').trim()
  const rawKeys = String(query.keys ?? '').trim()

  if (!key && !filePath && !rawKeys) {
    const indexRaw = await readFile(join(MARKETING_DIR, 'marketing_content_index.json'), 'utf8')
    const files = await walkFiles(MARKETING_DIR)
    return {
      index: JSON.parse(indexRaw),
      files: files.map((f) => `/marketing/${f}`),
      note: 'Owner download only. Nothing auto-publishes.',
    }
  }

  const KEY_MAP: Record<string, string> = {
    facebook_rebrand_package: 'facebook_rebrand_package.md',
    live_broadcast_script: 'live_broadcast_script.md',
    ai_agent_script: 'ai_agent_script.md',
    seo_keywords: 'seo_keywords.md',
    seo_blog_topics: 'seo_blog_topics.md',
    seo_marketplace_copy: 'seo_marketplace_copy.md',
    social_posts: 'social_posts.md',
    ad_1_authenticity_push: 'video_ads/ad_1_authenticity_push.md',
    ad_2_seller_recruitment: 'video_ads/ad_2_seller_recruitment.md',
    ad_3_buyer_safety: 'video_ads/ad_3_buyer_safety.md',
    ad_4_bc_audio_launch: 'video_ads/ad_4_bc_audio_launch.md',
    ad_5_marketplace_trust: 'video_ads/ad_5_marketplace_trust.md',
    welcome_sequence: 'email_sequences/welcome_sequence.md',
    seller_onboarding_sequence: 'email_sequences/seller_onboarding_sequence.md',
    buyer_onboarding_sequence: 'email_sequences/buyer_onboarding_sequence.md',
    abandoned_cart_sequence: 'email_sequences/abandoned_cart_sequence.md',
    dispute_resolution_sequence: 'email_sequences/dispute_resolution_sequence.md',
    fraud_alert_sequence: 'email_sequences/fraud_alert_sequence.md',
  }

  if (filePath) {
    const safe = filePath.replace(/^\/+/, '').replace(/\.\./g, '')
    return { file: await loadFile(safe) }
  }

  const keys = rawKeys ? rawKeys.split(',').map((k) => k.trim()).filter(Boolean) : [key]
  const cacheKey = `seo:${keys.sort().join(',')}`

  const { value, hit } = await getOrSet(cacheKey, DEFAULT_TTLS.seo, async () => {
    const assets: Record<string, Awaited<ReturnType<typeof loadFile>>> = {}
    for (const k of keys) {
      const rel = KEY_MAP[k]
      if (rel) assets[k] = await loadFile(rel)
    }
    return { assets }
  })

  return { ...value, _cache: { hit } }
})
