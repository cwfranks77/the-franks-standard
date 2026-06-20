/**
 * Scan server/api routes and generate docs/api/index.json
 */

const fs = require('fs')
const path = require('path')

const API_DIR = path.join(__dirname, '../../server/api')
const OUT_FILE = path.join(__dirname, '../../docs/api/index.json')

const METHOD_MAP = {
  '.get.ts': 'GET',
  '.post.ts': 'POST',
  '.put.ts': 'PUT',
  '.patch.ts': 'PATCH',
  '.delete.ts': 'DELETE',
}

const DESCRIPTIONS = {
  '/api/ai/chat': 'AI support chat — FAQ and escalation logging',
  '/api/owner/status/platform': 'Owner platform health summary',
  '/api/owner/launch/readiness': 'Pre-launch readiness report',
  '/api/owner/export/audit': 'Export audit trail JSON bundle',
  '/api/search/query': 'Search listings and stores',
  '/api/platform-content': 'Load platform markdown content blocks',
  '/api/marketing-content': 'Load marketing content assets',
}

function walk (dir, base = '') {
  const entries = fs.readdirSync(dir, { withFileTypes: true })
  const routes = []

  for (const e of entries) {
    if (e.name.startsWith('_')) continue
    const full = path.join(dir, e.name)
    const rel = base ? `${base}/${e.name}` : e.name

    if (e.isDirectory()) {
      routes.push(...walk(full, rel))
      continue
    }

    if (e.name === 'index.ts') {
      const routePath = `/api/${base.replace(/\\/g, '/')}`
      routes.push({ file: rel, path: routePath, methods: ['GET', 'POST'] })
      continue
    }

    for (const [suffix, method] of Object.entries(METHOD_MAP)) {
      if (!e.name.endsWith(suffix)) continue
      const name = e.name.slice(0, -suffix.length)
      let routePath = `/api/${base.replace(/\\/g, '/')}`
      if (name !== 'index') {
        routePath = `${routePath}/${name}`.replace(/\/+/g, '/')
      }
      routePath = routePath.replace(/\[\.\.\.(\w+)\]/g, ':$1*').replace(/\[(\w+)\]/g, ':$1')
      routes.push({
        file: rel,
        path: routePath,
        method,
        description: DESCRIPTIONS[routePath] ?? '',
        owner_only: routePath.startsWith('/api/owner') || routePath.startsWith('/api/reports'),
      })
    }
  }

  return routes
}

function generateApiIndex () {
  const routes = walk(API_DIR)
  const byPath = {}

  for (const r of routes) {
    if (!byPath[r.path]) {
      byPath[r.path] = { path: r.path, methods: [], files: [], owner_only: !!r.owner_only, description: r.description || '' }
    }
    if (r.method && !byPath[r.path].methods.includes(r.method)) {
      byPath[r.path].methods.push(r.method)
    }
    byPath[r.path].files.push(r.file)
    if (r.description) byPath[r.path].description = r.description
    if (r.owner_only) byPath[r.path].owner_only = true
  }

  const endpoints = Object.values(byPath).sort((a, b) => a.path.localeCompare(b.path))

  const index = {
    generated_at: new Date().toISOString(),
    total_endpoints: endpoints.length,
    endpoints,
  }

  fs.mkdirSync(path.dirname(OUT_FILE), { recursive: true })
  fs.writeFileSync(OUT_FILE, JSON.stringify(index, null, 2), 'utf8')
  return index
}

if (require.main === module) {
  const index = generateApiIndex()
  console.log(`Wrote ${OUT_FILE} (${index.total_endpoints} endpoints)`)
}

module.exports = { generateApiIndex, walk }
