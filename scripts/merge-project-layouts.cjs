const fs = require('node:fs')
const path = require('node:path')

const rootDir = path.resolve(__dirname, '..')
const targetDir = path.join(rootDir, 'layouts')
const sourceDirs = [
  path.join(rootDir, 'franks-standard', 'src', 'layouts'),
  path.join(rootDir, 'bc-performance-audio', 'src', 'layouts'),
]

if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true })
}

for (const sourceDir of sourceDirs) {
  if (!fs.existsSync(sourceDir)) {
    continue
  }

  for (const entry of fs.readdirSync(sourceDir, { withFileTypes: true })) {
    if (!entry.isFile() || !entry.name.endsWith('.vue')) {
      continue
    }

    fs.copyFileSync(
      path.join(sourceDir, entry.name),
      path.join(targetDir, entry.name),
    )
  }
}
