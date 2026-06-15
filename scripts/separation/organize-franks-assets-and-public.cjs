const fs = require('node:fs')
const path = require('node:path')

const rootDir = path.resolve(__dirname, '..', '..')
const franksImagesDir = path.join(rootDir, 'franks-standard', 'src', 'assets', 'images')
const franksAssetsDir = path.join(rootDir, 'franks-standard', 'src', 'assets')
const assetsDir = path.join(rootDir, 'assets')
const publicDir = path.join(rootDir, 'public')

fs.mkdirSync(franksImagesDir, { recursive: true })

function moveFile (from, to) {
  if (!fs.existsSync(from)) {
    return
  }
  fs.mkdirSync(path.dirname(to), { recursive: true })
  fs.renameSync(from, to)
  console.log(`[organize-franks-assets-and-public] ${path.relative(rootDir, from)} -> ${path.relative(rootDir, to)}`)
}

for (const sourceDir of [assetsDir, franksAssetsDir, publicDir]) {
  if (!fs.existsSync(sourceDir)) {
    continue
  }

  for (const entry of fs.readdirSync(sourceDir, { withFileTypes: true })) {
    if (!entry.isFile() || !/franks/i.test(entry.name)) {
      continue
    }

    moveFile(path.join(sourceDir, entry.name), path.join(franksImagesDir, entry.name))
  }
}

console.log('[organize-franks-assets-and-public] done')
