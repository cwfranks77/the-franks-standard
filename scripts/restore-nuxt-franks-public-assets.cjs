const fs = require('node:fs')
const path = require('node:path')

const rootDir = path.resolve(__dirname, '..')
const franksPublic = path.join(rootDir, 'franks-standard', 'public')
const targetPublic = path.join(rootDir, 'public')

if (!fs.existsSync(franksPublic)) {
  console.log('[restore-nuxt-franks-public-assets] skipped — franks-standard/public not in this build')
  process.exit(0)
}

function copyTree (sourceDir, targetDir) {
  fs.mkdirSync(targetDir, { recursive: true })
  let copied = 0
  for (const entry of fs.readdirSync(sourceDir, { withFileTypes: true })) {
    const sourcePath = path.join(sourceDir, entry.name)
    const targetPath = path.join(targetDir, entry.name)
    if (entry.isDirectory()) {
      copied += copyTree(sourcePath, targetPath)
      continue
    }
    fs.copyFileSync(sourcePath, targetPath)
    copied += 1
  }
  return copied
}

const count = copyTree(franksPublic, targetPublic)
console.log(`[restore-nuxt-franks-public-assets] synced ${count} file(s) to public/`)
