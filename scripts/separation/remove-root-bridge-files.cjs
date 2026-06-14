const fs = require('node:fs')
const path = require('node:path')

const rootDir = path.resolve(__dirname, '..', '..')

function removePath (targetPath, label) {
  if (!fs.existsSync(targetPath)) {
    return
  }
  fs.rmSync(targetPath, { recursive: true, force: true })
  console.log(`[remove-root-bridge-files] removed ${label}`)
}

removePath(path.join(rootDir, 'pages', 'bc-audio'), 'pages/bc-audio')

for (const folder of ['middleware', 'plugins']) {
  const dir = path.join(rootDir, folder)
  if (!fs.existsSync(dir)) {
    continue
  }

  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (!entry.isFile()) {
      continue
    }
    fs.rmSync(path.join(dir, entry.name), { force: true })
    console.log(`[remove-root-bridge-files] removed ${folder}/${entry.name}`)
  }
}

console.log('[remove-root-bridge-files] done — B&C and Franks wired via nuxt.config.ts plugins')
