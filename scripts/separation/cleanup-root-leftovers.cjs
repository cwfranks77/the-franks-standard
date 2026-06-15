const fs = require('node:fs')
const path = require('node:path')

const rootDir = path.resolve(__dirname, '..', '..')

function deleteMatchingFiles (dir, pattern) {
  if (!fs.existsSync(dir)) {
    return
  }

  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (!entry.isFile() || !pattern.test(entry.name)) {
      continue
    }

    fs.rmSync(path.join(dir, entry.name), { force: true })
    console.log(`[cleanup-root-leftovers] deleted ${path.relative(rootDir, path.join(dir, entry.name))}`)
  }
}

deleteMatchingFiles(path.join(rootDir, 'assets'), /bc|franks/i)
deleteMatchingFiles(path.join(rootDir, 'public'), /bc|franks/i)

for (const folder of ['pages', 'components', 'layouts', 'middleware', 'plugins', 'assets', 'public']) {
  const dir = path.join(rootDir, folder)
  if (!fs.existsSync(dir)) {
    continue
  }

  const entries = fs.readdirSync(dir, { withFileTypes: true })
  if (entries.length === 0) {
    fs.rmSync(dir, { recursive: true, force: true })
    console.log(`[cleanup-root-leftovers] removed empty ${folder}/`)
  }
}

console.log('[cleanup-root-leftovers] done')
