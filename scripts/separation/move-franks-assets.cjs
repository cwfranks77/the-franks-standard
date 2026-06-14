const fs = require('node:fs')
const path = require('node:path')

const rootDir = path.resolve(__dirname, '..', '..')
const targetDir = path.join(rootDir, 'franks-standard', 'src', 'assets')

function copyTree (sourceDir, destDir) {
  if (!fs.existsSync(sourceDir)) {
    return
  }

  fs.mkdirSync(destDir, { recursive: true })

  for (const entry of fs.readdirSync(sourceDir, { withFileTypes: true })) {
    const sourcePath = path.join(sourceDir, entry.name)
    const destPath = path.join(destDir, entry.name)

    if (entry.isDirectory()) {
      copyTree(sourcePath, destPath)
      continue
    }

    fs.copyFileSync(sourcePath, destPath)
    console.log(`[move-franks-assets] ${path.relative(rootDir, sourcePath)}`)
  }
}

for (const sourceDir of [
  path.join(rootDir, 'assets'),
  path.join(rootDir, 'franks-standard', 'assets'),
]) {
  copyTree(sourceDir, targetDir)
  if (fs.existsSync(sourceDir)) {
    fs.rmSync(sourceDir, { recursive: true, force: true })
  }
}

console.log('[move-franks-assets] done')
