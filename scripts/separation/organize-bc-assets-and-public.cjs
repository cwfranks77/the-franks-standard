const fs = require('node:fs')
const path = require('node:path')

const rootDir = path.resolve(__dirname, '..', '..')
const bcAssetsDir = path.join(rootDir, 'bc-performance-audio', 'src', 'assets')
const bcImagesDir = path.join(bcAssetsDir, 'images')
const publicDir = path.join(rootDir, 'public')

fs.mkdirSync(bcImagesDir, { recursive: true })

function moveFile (from, to) {
  if (!fs.existsSync(from)) {
    return
  }
  fs.mkdirSync(path.dirname(to), { recursive: true })
  fs.renameSync(from, to)
  console.log(`[organize-bc-assets-and-public] ${path.relative(rootDir, from)} -> ${path.relative(rootDir, to)}`)
}

if (fs.existsSync(publicDir)) {
  for (const entry of fs.readdirSync(publicDir, { withFileTypes: true })) {
    if (!/bc/i.test(entry.name)) {
      continue
    }

    const from = path.join(publicDir, entry.name)
    const to = path.join(entry.isDirectory() ? bcAssetsDir : bcImagesDir, entry.name)
    moveFile(from, to)
  }
}

const legacyImgDir = path.join(bcAssetsDir, 'img')
if (fs.existsSync(legacyImgDir)) {
  for (const entry of fs.readdirSync(legacyImgDir, { withFileTypes: true })) {
    const from = path.join(legacyImgDir, entry.name)
    const to = path.join(bcImagesDir, entry.name)
    if (entry.isDirectory()) {
      fs.mkdirSync(to, { recursive: true })
      for (const file of fs.readdirSync(from, { withFileTypes: true })) {
        if (file.isFile()) {
          moveFile(path.join(from, file.name), path.join(to, file.name))
        }
      }
      continue
    }
    moveFile(from, to)
  }
  fs.rmSync(legacyImgDir, { recursive: true, force: true })
}

function walkDeleteCss (dir) {
  if (!fs.existsSync(dir)) {
    return
  }

  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      walkDeleteCss(fullPath)
      continue
    }
    if (entry.name.endsWith('.css') && entry.name !== 'bc-premium-theme.css') {
      fs.rmSync(fullPath, { force: true })
      console.log(`[organize-bc-assets-and-public] deleted ${path.relative(rootDir, fullPath)}`)
    }
  }
}

walkDeleteCss(bcAssetsDir)

function walkDeleteFranks (dir) {
  if (!fs.existsSync(dir)) {
    return
  }

  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      walkDeleteFranks(fullPath)
      continue
    }
    if (/franks/i.test(entry.name)) {
      fs.rmSync(fullPath, { force: true })
      console.log(`[organize-bc-assets-and-public] deleted ${path.relative(rootDir, fullPath)}`)
    }
  }
}

walkDeleteFranks(bcAssetsDir)
console.log('[organize-bc-assets-and-public] done')
