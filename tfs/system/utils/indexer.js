import fs from 'node:fs'
import path from 'node:path'

const CATEGORY_RULES = [
  { re: /ein|cp-575|resale|tax|w-9/i, category: 'tax-registration' },
  { re: /policy|terms|privacy|agreement|prohibited|enforcement/i, category: 'compliance-policy' },
  { re: /coa|authentic|counterfeit|fraud/i, category: 'authenticity' },
  { re: /seller|buyer|onboarding/i, category: 'marketplace-onboarding' },
  { re: /shipping|returns|warranty/i, category: 'fulfillment' },
  { re: /marketing|brand|story/i, category: 'marketing' },
  { re: /\.(pdf|png|jpg|jpeg)$/i, category: 'document-scan' },
]

function guessCategory (filename) {
  for (const rule of CATEGORY_RULES) {
    if (rule.re.test(filename)) return rule.category
  }
  const ext = path.extname(filename).toLowerCase()
  if (ext === '.md') return 'markdown'
  if (ext === '.json') return 'data'
  if (ext === '.js') return 'config'
  return 'general'
}

/**
 * Scan document cache and return index entries.
 * @param {string} [cacheDir]
 */
export function scanDocumentCache (cacheDir) {
  const root = cacheDir || path.join(process.cwd(), 'tfs/system/document-cache')
  if (!fs.existsSync(root)) {
    fs.mkdirSync(root, { recursive: true })
    return []
  }

  const entries = []
  function walk (dir, relPrefix = '') {
    for (const name of fs.readdirSync(dir, { withFileTypes: true })) {
      if (name.name.startsWith('.')) continue
      const abs = path.join(dir, name.name)
      const rel = relPrefix ? `${relPrefix}/${name.name}` : name.name
      if (name.isDirectory()) {
        walk(abs, rel)
      } else if (name.isFile()) {
        const st = fs.statSync(abs)
        entries.push({
          filename: rel.replace(/\\/g, '/'),
          size: st.size,
          type: path.extname(name.name).slice(1).toLowerCase() || 'unknown',
          category: guessCategory(name.name),
          lastModified: st.mtime.toISOString(),
        })
      }
    }
  }
  walk(root)
  entries.sort((a, b) => a.filename.localeCompare(b.filename))
  return entries
}

/**
 * Write index.json for the document cache.
 * @param {string} [cacheDir]
 * @param {string} [indexPath]
 */
export function writeDocumentIndex (cacheDir, indexPath) {
  const root = cacheDir || path.join(process.cwd(), 'tfs/system/document-cache')
  const out = indexPath || path.join(root, 'index.json')
  const documents = scanDocumentCache(root)
  const payload = {
    generatedAt: new Date().toISOString(),
    documentCount: documents.length,
    documents,
  }
  fs.mkdirSync(path.dirname(out), { recursive: true })
  fs.writeFileSync(out, JSON.stringify(payload, null, 2), 'utf8')
  return payload
}

export default { scanDocumentCache, writeDocumentIndex }
