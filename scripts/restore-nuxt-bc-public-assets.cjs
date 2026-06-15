const fs = require('node:fs')
const path = require('node:path')

const rootDir = path.resolve(__dirname, '..')
const bcImagesDir = path.join(rootDir, 'bc-performance-audio', 'src', 'assets', 'images')
const legacyBcImgDir = path.join(rootDir, 'bc-performance-audio', 'src', 'assets', 'img')
const bcIconsDir = path.join(rootDir, 'bc-performance-audio', 'src', 'assets', 'icons')
const publicImgDir = path.join(rootDir, 'public', 'img')
const publicIconsDir = path.join(rootDir, 'public', 'icons')

function copyTree (sourceDir, targetDir) {
  if (!fs.existsSync(sourceDir)) {
    return 0
  }

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

const imgCount = copyTree(fs.existsSync(bcImagesDir) ? bcImagesDir : legacyBcImgDir, publicImgDir)
const iconCount = copyTree(bcIconsDir, publicIconsDir)

console.log(`[restore-nuxt-bc-public-assets] synced ${imgCount} image(s) and ${iconCount} icon(s) to public/`)
