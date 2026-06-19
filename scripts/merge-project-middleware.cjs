const fs = require('node:fs')
const path = require('node:path')

const rootDir = path.resolve(__dirname, '..')
const targetDir = path.join(rootDir, 'middleware')
const sourceDirs = [
  path.join(rootDir, 'bc-performance-audio', 'src', 'middleware'),
  path.join(rootDir, 'franks-standard', 'src', 'middleware'),
]

if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true })
}

for (const sourceDir of sourceDirs) {
  if (!fs.existsSync(sourceDir)) continue
  for (const entry of fs.readdirSync(sourceDir, { withFileTypes: true })) {
    if (!entry.isFile()) continue
    fs.copyFileSync(
      path.join(sourceDir, entry.name),
      path.join(targetDir, entry.name),
    )
  }
}

console.log('[merge-project-middleware] synced middleware to', targetDir)
