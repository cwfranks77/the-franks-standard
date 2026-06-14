const fs = require('node:fs')
const path = require('node:path')

const rootDir = path.resolve(__dirname, '..', '..')
const franksMiddlewareDir = path.join(rootDir, 'franks-standard', 'src', 'middleware')
const franksPluginsDir = path.join(rootDir, 'franks-standard', 'src', 'plugins')
const rootMiddlewareDir = path.join(rootDir, 'middleware')
const rootPluginsDir = path.join(rootDir, 'plugins')

fs.mkdirSync(franksMiddlewareDir, { recursive: true })
fs.mkdirSync(franksPluginsDir, { recursive: true })

if (fs.existsSync(rootMiddlewareDir)) {
  for (const entry of fs.readdirSync(rootMiddlewareDir, { withFileTypes: true })) {
    if (!entry.isFile() || /bc/i.test(entry.name)) {
      continue
    }

    const from = path.join(rootMiddlewareDir, entry.name)
    const to = path.join(franksMiddlewareDir, entry.name)
    fs.renameSync(from, to)
    console.log(`[move-franks-middleware-plugins] middleware/${entry.name}`)
  }
}

if (fs.existsSync(rootPluginsDir)) {
  for (const entry of fs.readdirSync(rootPluginsDir, { withFileTypes: true })) {
    if (!entry.isFile()) {
      continue
    }

    const from = path.join(rootPluginsDir, entry.name)
    const to = path.join(franksPluginsDir, entry.name)
    fs.renameSync(from, to)
    console.log(`[move-franks-middleware-plugins] plugins/${entry.name}`)
  }
}

console.log('[move-franks-middleware-plugins] done')
