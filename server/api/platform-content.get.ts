import { readFile } from 'node:fs/promises'
import { join } from 'node:path'

const CONTENT_DIR = join(process.cwd(), 'content')

const KEY_TO_FILE: Record<string, string> = {
  founder_story: 'founder_story.md',
  authenticity_mission: 'authenticity_mission.md',
  safety_overview: 'safety_overview.md',
  why_sell_on_tfs: 'why_sell_on_tfs.md',
  why_buy_on_tfs: 'why_buy_on_tfs.md',
  no_counterfeits: 'no_counterfeits.md',
  platform_reviews: 'platform_reviews.md',
  customer_service_quality: 'customer_service_quality.md',
  home_highlights: 'home_highlights.md',
  home_safety_banner: 'home_safety_banner.md',
  home_authenticity_banner: 'home_authenticity_banner.md',
}

async function loadBlock (key: string) {
  const file = KEY_TO_FILE[key]
  if (!file) return null
  try {
    const markdown = await readFile(join(CONTENT_DIR, file), 'utf8')
    return { key, markdown, path: `/content/${file}` }
  } catch {
    return null
  }
}

/** GET /api/platform-content?keys=founder_story,home_highlights */
export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const raw = String(query.keys ?? query.key ?? '').trim()
  if (!raw) {
    return {
      index: '/content/platform_content_index.json',
      keys: Object.keys(KEY_TO_FILE),
    }
  }

  const keys = raw.split(',').map((k) => k.trim()).filter(Boolean)
  const blocks: Record<string, { markdown: string; path: string }> = {}

  for (const key of keys) {
    const block = await loadBlock(key)
    if (block) {
      blocks[key] = { markdown: block.markdown, path: block.path }
    }
  }

  return { blocks }
})
