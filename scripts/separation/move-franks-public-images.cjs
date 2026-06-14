const fs = require('node:fs')
const path = require('node:path')

const rootDir = path.resolve(__dirname, '..', '..')
const publicImgDir = path.join(rootDir, 'public', 'img')
const targetDir = path.join(rootDir, 'franks-standard', 'src', 'assets', 'img')

const bcNames = new Set([
  'bc-logo-primary.png',
  'hero-showcase-v2.svg',
  'hero-showcase.svg',
])

fs.mkdirSync(targetDir, { recursive: true })

function isBcPath (relativePath) {
  return bcNames.has(relativePath)
    || relativePath.startsWith('bc-catalog/')
    || relativePath.startsWith('pictures/B')
}

function moveTree (sourceDir, relativeBase = '') {
  if (!fs.existsSync(sourceDir)) {
    return
  }

  for (const entry of fs.readdirSync(sourceDir, { withFileTypes: true })) {
    const relativePath = relativeBase ? `${relativeBase}/${entry.name}` : entry.name
    const sourcePath = path.join(sourceDir, entry.name)

    if (entry.isDirectory()) {
      if (entry.name === 'bc-catalog') {
        continue
      }
      moveTree(sourcePath, relativePath)
      continue
    }

    if (isBcPath(relativePath.replace(/\\/g, '/'))) {
      continue
    }

    const targetPath = path.join(targetDir, relativePath)
    fs.mkdirSync(path.dirname(targetPath), { recursive: true })
    fs.renameSync(sourcePath, targetPath)
    console.log(`[move-franks-public-images] img/${relativePath.replace(/\\/g, '/')}`)
  }
}

moveTree(publicImgDir)

console.log('[move-franks-public-images] done')
