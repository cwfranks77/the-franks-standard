const fs = require('node:fs')
const path = require('node:path')

const rootDir = path.resolve(__dirname, '..')
const sourceDir = path.join(rootDir, 'franks-standard', 'src', 'assets', 'images')
const legacySourceDir = path.join(rootDir, 'franks-standard', 'src', 'assets', 'img')
const targetDir = path.join(rootDir, 'public', 'img')

function copyTree (source, target) {
  if (!fs.existsSync(source)) {
    return 0
  }

  fs.mkdirSync(target, { recursive: true })
  let copied = 0

  for (const entry of fs.readdirSync(source, { withFileTypes: true })) {
    const sourcePath = path.join(source, entry.name)
    const targetPath = path.join(target, entry.name)

    if (entry.isDirectory()) {
      copied += copyTree(sourcePath, targetPath)
      continue
    }

    fs.copyFileSync(sourcePath, targetPath)
    copied += 1
  }

  return copied
}

const count = copyTree(fs.existsSync(sourceDir) ? sourceDir : legacySourceDir, targetDir)
console.log(`[restore-nuxt-franks-public-assets] synced ${count} Franks image(s) to public/img/`)

const pavilionSource = path.join(
  fs.existsSync(sourceDir) ? sourceDir : legacySourceDir,
  'franks-pavilion.png',
)
const pavilionTarget = path.join(rootDir, 'public', 'franks-pavilion.png')
if (fs.existsSync(pavilionSource)) {
  fs.copyFileSync(pavilionSource, pavilionTarget)
  console.log('[restore-nuxt-franks-public-assets] synced franks-pavilion.png to public/')
}
